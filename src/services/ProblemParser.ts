/**
 * ProblemParser - Parses and validates module JSON files
 * 
 * Validates that modules contain exactly 16 problems with the correct
 * difficulty distribution (5 Easy, 8 Medium, 3 Hard) and all required fields.
 */

import type {
  Module,
  Problem,
  DifficultyLevel,
  ParseResult,
  ValidationResult
} from '../types/problem-based-learning';

import {
  PROBLEMS_PER_MODULE,
  EASY_PROBLEMS_PER_MODULE,
  MEDIUM_PROBLEMS_PER_MODULE,
  HARD_PROBLEMS_PER_MODULE
} from '../types/problem-based-learning';

export class ProblemParser {
  /**
   * Parse a module from JSON data
   */
  static parseModule(jsonData: string): ParseResult<Module> {
    const errors: string[] = [];
    
    try {
      const data = JSON.parse(jsonData);
      
      // Validate module structure
      if (!data.id) errors.push('Module missing required field: id');
      if (!data.title) errors.push('Module missing required field: title');
      if (!data.description) errors.push('Module missing required field: description');
      if (!Array.isArray(data.problems)) {
        errors.push('Module missing required field: problems (must be an array)');
        return { success: false, errors };
      }
      
      // Validate problem count
      if (data.problems.length !== PROBLEMS_PER_MODULE) {
        errors.push(
          `Module must contain exactly ${PROBLEMS_PER_MODULE} problems, found ${data.problems.length}`
        );
      }
      
      // Validate each problem
      const validProblems: Problem[] = [];
      data.problems.forEach((problem: any, index: number) => {
        const problemValidation = this.validateProblem(problem);
        if (!problemValidation.valid) {
          problemValidation.errors.forEach(error => {
            errors.push(`Problem ${index + 1} (${problem.id || 'unknown'}): ${error}`);
          });
        } else {
          validProblems.push(problem as Problem);
        }
      });
      
      // Validate difficulty distribution
      const distributionValidation = this.validateDifficultyDistribution(validProblems);
      if (!distributionValidation.valid) {
        errors.push(...distributionValidation.errors);
      }
      
      if (errors.length > 0) {
        return { success: false, errors };
      }
      
      const module: Module = {
        id: data.id,
        title: data.title,
        description: data.description,
        problems: validProblems,
        theoryContent: data.theoryContent,
        estimatedTheoryTime: data.estimatedTheoryTime || 90
      };
      
      return { success: true, data: module, errors: [] };
      
    } catch (error) {
      errors.push(`JSON parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, errors };
    }
  }
  
  /**
   * Validate a single problem has all required fields
   */
  static validateProblem(problem: any): ValidationResult {
    const errors: string[] = [];
    const requiredFields = [
      'id',
      'title',
      'description',
      'difficulty',
      'starterCode',
      'testCases',
      'hints',
      'solution'
    ];
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!(field in problem) || problem[field] === undefined || problem[field] === null) {
        errors.push(`Missing required field: ${field}`);
      }
    });
    
    // Validate difficulty level
    if (problem.difficulty) {
      const validDifficulties: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];
      if (!validDifficulties.includes(problem.difficulty)) {
        errors.push(
          `Invalid difficulty level: "${problem.difficulty}". Must be one of: ${validDifficulties.join(', ')}`
        );
      }
    }
    
    // Validate starterCode has all 4 languages
    if (problem.starterCode && typeof problem.starterCode === 'object') {
      const requiredLanguages = ['javascript', 'python', 'java', 'c'];
      requiredLanguages.forEach(lang => {
        if (!problem.starterCode[lang]) {
          errors.push(`Missing starter code for language: ${lang}`);
        }
      });
    }
    
    // Validate testCases (minimum 5)
    if (Array.isArray(problem.testCases)) {
      if (problem.testCases.length < 5) {
        errors.push(`Must have at least 5 test cases, found ${problem.testCases.length}`);
      }
    }
    
    // Validate hints (exactly 3)
    if (Array.isArray(problem.hints)) {
      if (problem.hints.length !== 3) {
        errors.push(`Must have exactly 3 hints, found ${problem.hints.length}`);
      }
    }
    
    // Validate solution has all 4 languages and explanation
    if (problem.solution && typeof problem.solution === 'object') {
      const requiredLanguages = ['javascript', 'python', 'java', 'c', 'explanation'];
      requiredLanguages.forEach(lang => {
        if (!problem.solution[lang]) {
          errors.push(`Missing solution for: ${lang}`);
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate difficulty distribution (5 Easy, 8 Medium, 3 Hard)
   */
  static validateDifficultyDistribution(problems: Problem[]): ValidationResult {
    const errors: string[] = [];
    
    const counts = {
      Easy: 0,
      Medium: 0,
      Hard: 0
    };
    
    problems.forEach(problem => {
      if (problem.difficulty in counts) {
        counts[problem.difficulty]++;
      }
    });
    
    if (counts.Easy !== EASY_PROBLEMS_PER_MODULE) {
      errors.push(
        `Expected ${EASY_PROBLEMS_PER_MODULE} Easy problems, found ${counts.Easy}`
      );
    }
    
    if (counts.Medium !== MEDIUM_PROBLEMS_PER_MODULE) {
      errors.push(
        `Expected ${MEDIUM_PROBLEMS_PER_MODULE} Medium problems, found ${counts.Medium}`
      );
    }
    
    if (counts.Hard !== HARD_PROBLEMS_PER_MODULE) {
      errors.push(
        `Expected ${HARD_PROBLEMS_PER_MODULE} Hard problems, found ${counts.Hard}`
      );
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Log validation errors to console
   */
  static logErrors(moduleId: string, errors: string[]): void {
    console.error(`[ProblemParser] Validation errors for module "${moduleId}":`);
    errors.forEach((error, index) => {
      console.error(`  ${index + 1}. ${error}`);
    });
  }
}
