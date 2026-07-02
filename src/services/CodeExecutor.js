/**
 * CodeExecutor - Executes code in multiple languages using Judge0 API
 * 
 * Supports: JavaScript (Node.js), Python 3, Java, C (GCC)
 * Features: Test case validation, time/memory limits, error handling
 */

class CodeExecutor {
  constructor() {
    // Piston API endpoint (self-hosted, unlimited requests!)
    this.apiEndpoint = import.meta.env.VITE_PISTON_URL || 'http://localhost:2000';
    
    // Language names for Piston
    this.languageNames = {
      javascript: 'javascript',  // Node.js
      python: 'python',          // Python 3
      java: 'java',              // Java
      c: 'c',                    // C (GCC)
    };
    
    // Language versions for Piston
    this.languageVersions = {
      javascript: '18.15.0',  // Node.js 18
      python: '3.10.0',       // Python 3.10
      java: '15.0.2',         // Java 15
      c: '10.2.0',            // GCC 10.2
    };
    
    // Time and memory limits
    this.timeLimitSeconds = 2;
    this.memoryLimitKB = 256000; // 256 MB
    
    // No rate limiting needed for self-hosted Piston!
    this.maxRetries = 2;
    this.retryDelay = 1000;
  }

  /**
   * Execute code against multiple test cases
   * @param {string} code - Source code
   * @param {'javascript' | 'python' | 'java' | 'c'} language - Programming language
   * @param {Array<import('../types').TestCase>} testCases - Test cases to run
   * @returns {Promise<Array<import('../types').ExecutionResult>>}
   */
  async executeCode(code, language, testCases) {
    const results = [];
    
    // For JavaScript, execute all locally (no API needed, faster)
    if (language === 'javascript') {
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        try {
          const result = await this.executeJavaScriptLocally(code, testCase, i);
          results.push(result);
        } catch (error) {
          results.push(this.createErrorResult(testCase, i, error.message));
        }
      }
      return results;
    }
    
    // For other languages, show message that they're not supported in free version
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      results.push({
        testCaseIndex: i,
        testCaseDescription: testCase.description || `Test Case ${i + 1}`,
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: null,
        executionTime: 0,
        memoryUsage: 0,
        status: 'internal_error',
        error: `${language.toUpperCase()} execution requires a code execution server. Currently only JavaScript is supported. Switch to JavaScript to test your code!`,
      });
    }
    
    return results;
  }

  /**
   * Execute test case with retry logic
   * @private
   */
  async executeTestCaseWithRetry(code, language, testCase, index) {
    let lastError = null;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.executeTestCase(code, language, testCase, index);
      } catch (error) {
        lastError = error;
        
        // Retry on network errors
        if (attempt < this.maxRetries) {
          console.log(`Request failed, retrying... (attempt ${attempt + 1}/${this.maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          continue;
        }
      }
    }
    
    // All retries exhausted
    throw lastError;
  }

  /**
   * Create error result object
   * @private
   */
  createErrorResult(testCase, index, errorMessage) {
    return {
      testCaseIndex: index,
      testCaseDescription: testCase.description || `Test Case ${index + 1}`,
      passed: false,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: null,
      executionTime: 0,
      memoryUsage: 0,
      status: 'internal_error',
      error: errorMessage,
    };
  }

  /**
   * Execute code for a single test case
   * @param {string} code
   * @param {string} language
   * @param {Object} testCase
   * @param {number} index
   * @returns {Promise<import('../types').ExecutionResult>}
   * @private
   */
  async executeTestCase(code, language, testCase, index) {
    const startTime = performance.now();
    
    // For JavaScript, execute locally (faster, no API needed)
    if (language === 'javascript') {
      return await this.executeJavaScriptLocally(code, testCase, index);
    }
    
    // For other languages, use Piston API
    try {
      // Prepare input/output
      const stdin = this.prepareInput(testCase.input);
      const expectedOutput = this.prepareOutput(testCase.expectedOutput);
      
      // Submit to Piston
      const result = await this.submitToPiston(code, language, stdin);
      
      const executionTime = Math.round(performance.now() - startTime);
      
      // Parse and return result
      return this.parsePistonResponse(result, testCase, index, executionTime, expectedOutput);
    } catch (error) {
      const executionTime = Math.round(performance.now() - startTime);
      
      return {
        testCaseIndex: index,
        testCaseDescription: testCase.description || `Test Case ${index + 1}`,
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: null,
        executionTime,
        memoryUsage: 0,
        status: 'internal_error',
        error: error.message,
      };
    }
  }

  /**
   * Submit code to Piston API
   * @param {string} code
   * @param {string} language
   * @param {string} stdin
   * @returns {Promise<Object>}
   * @private
   */
  async submitToPiston(code, language, stdin) {
    const languageName = this.languageNames[language];
    const languageVersion = this.languageVersions[language];
    
    if (!languageName) {
      throw new Error(`Unsupported language: ${language}`);
    }
    
    const payload = {
      language: languageName,
      version: languageVersion,
      files: [
        {
          name: this.getFileName(language),
          content: code
        }
      ],
      stdin: stdin,
      compile_timeout: 10000,  // 10 seconds
      run_timeout: this.timeLimitSeconds * 1000,  // Convert to ms
      compile_memory_limit: -1,  // Unlimited
      run_memory_limit: this.memoryLimitKB * 1024  // Convert to bytes
    };
    
    const response = await fetch(`${this.apiEndpoint}/api/v2/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Piston API not running. Please start Piston with: docker run -d -p 2000:2000 ghcr.io/engineer-man/piston');
      }
      throw new Error(`Piston API error: ${response.status}`);
    }
    
    return await response.json();
  }

  /**
   * Get appropriate filename for language
   * @private
   */
  getFileName(language) {
    const fileNames = {
      javascript: 'solution.js',
      python: 'solution.py',
      java: 'Solution.java',
      c: 'solution.c'
    };
    return fileNames[language] || 'solution.txt';
  }

  /**
   * Parse Piston API response into ExecutionResult
   * @param {Object} response
   * @param {Object} testCase
   * @param {number} index
   * @param {number} totalTime
   * @param {string} expectedOutput
   * @returns {import('../types').ExecutionResult}
   * @private
   */
  parsePistonResponse(response, testCase, index, totalTime, expectedOutput) {
    const stdout = response.run?.stdout || '';
    const stderr = response.run?.stderr || '';
    const compileOutput = response.compile?.stderr || '';
    
    // Check for compilation error
    if (response.compile && response.compile.code !== 0) {
      return {
        testCaseIndex: index,
        testCaseDescription: testCase.description || `Test Case ${index + 1}`,
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: null,
        executionTime: totalTime,
        memoryUsage: 0,
        status: 'compilation_error',
        error: compileOutput || 'Compilation failed',
      };
    }
    
    // Check for runtime error
    if (response.run && response.run.code !== 0 && response.run.signal !== null) {
      return {
        testCaseIndex: index,
        testCaseDescription: testCase.description || `Test Case ${index + 1}`,
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: stdout.trim(),
        executionTime: totalTime,
        memoryUsage: 0,
        status: 'runtime_error',
        error: stderr || `Process exited with code ${response.run.code}`,
        stderr: stderr || undefined,
      };
    }
    
    // Compare output
    const actualOutput = stdout.trim();
    const expected = expectedOutput.trim();
    const passed = actualOutput === expected;
    
    return {
      testCaseIndex: index,
      testCaseDescription: testCase.description || `Test Case ${index + 1}`,
      passed,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput,
      executionTime: totalTime,
      memoryUsage: 0,  // Piston doesn't provide memory usage
      status: passed ? 'accepted' : 'wrong_answer',
      stdout: stdout || undefined,
      stderr: stderr || undefined,
    };
  }

  /**
   * Execute JavaScript code locally (no API needed)
   * @param {string} code
   * @param {Object} testCase
   * @param {number} index
   * @returns {Promise<import('../types').ExecutionResult>}
   * @private
   */
  async executeJavaScriptLocally(code, testCase, index) {
    const startTime = performance.now();
    
    try {
      // Create a function from the code
      const func = new Function('input', `
        ${code}
        
        // Try to find the main function
        const functionNames = Object.keys(this).filter(key => typeof this[key] === 'function');
        if (functionNames.length === 0) {
          throw new Error('No function found in code');
        }
        
        const mainFunction = this[functionNames[0]];
        
        // Call with input parameters
        if (typeof input === 'object' && !Array.isArray(input)) {
          return mainFunction(...Object.values(input));
        } else {
          return mainFunction(input);
        }
      `);
      
      // Execute with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Time limit exceeded (2s)')), this.timeLimitSeconds * 1000);
      });
      
      const executionPromise = Promise.resolve(func.call({}, testCase.input));
      
      const actualOutput = await Promise.race([executionPromise, timeoutPromise]);
      
      const executionTime = Math.round(performance.now() - startTime);
      
      // Compare outputs
      const passed = JSON.stringify(actualOutput) === JSON.stringify(testCase.expectedOutput);
      
      return {
        testCaseIndex: index,
        testCaseDescription: testCase.description || `Test Case ${index + 1}`,
        passed,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput,
        executionTime,
        memoryUsage: 0, // Can't measure in browser
        status: passed ? 'accepted' : 'wrong_answer',
      };
    } catch (error) {
      const executionTime = Math.round(performance.now() - startTime);
      
      return {
        testCaseIndex: index,
        testCaseDescription: testCase.description || `Test Case ${index + 1}`,
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: null,
        executionTime,
        memoryUsage: 0,
        status: error.message.includes('Time limit') ? 'time_limit_exceeded' : 'runtime_error',
        error: error.message,
      };
    }
  }

  /**
   * Prepare input for Judge0 (convert to string)
   * @param {any} input
   * @returns {string}
   * @private
   */
  prepareInput(input) {
    if (typeof input === 'string') {
      return input;
    }
    if (typeof input === 'object') {
      return JSON.stringify(input);
    }
    return String(input);
  }

  /**
   * Prepare expected output for Judge0 (convert to string)
   * @param {any} output
   * @returns {string}
   * @private
   */
  prepareOutput(output) {
    if (typeof output === 'string') {
      return output;
    }
    if (typeof output === 'object') {
      return JSON.stringify(output);
    }
    return String(output);
  }

  /**
   * Format output for display
   * @param {string} stdout
   * @param {string} stderr
   * @returns {Object}
   */
  formatOutput(stdout, stderr) {
    return {
      stdout: stdout ? stdout.trim() : '',
      stderr: stderr ? stderr.trim() : '',
      hasOutput: !!(stdout || stderr),
    };
  }

  /**
   * Check if time limit was exceeded
   * @param {number} executionTime - in milliseconds
   * @param {number} limit - in seconds
   * @returns {boolean}
   */
  checkTimeLimit(executionTime, limit) {
    return executionTime > (limit * 1000);
  }

  /**
   * Check if memory limit was exceeded
   * @param {number} memoryUsage - in MB
   * @param {number} limit - in MB
   * @returns {boolean}
   */
  checkMemoryLimit(memoryUsage, limit) {
    return memoryUsage > limit;
  }
}

// Export singleton instance
export default new CodeExecutor();
