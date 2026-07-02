import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, CheckCircle, Lightbulb, Eye, EyeOff } from 'lucide-react';
import CodeEditor from './CodeEditor';

const ProblemDetailView = ({ moduleId, problemId, onBack }) => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProblem();
  }, [moduleId, problemId]);

  useEffect(() => {
    if (problem && problem.starterCode) {
      setCode(problem.starterCode[selectedLanguage] || '');
    }
  }, [problem, selectedLanguage]);

  const loadProblem = async () => {
    try {
      const response = await fetch(`/src/data/modules/${moduleId}.json`);
      const moduleData = await response.json();
      const foundProblem = moduleData.problems?.find(p => p.id === problemId);
      setProblem(foundProblem);
      setLoading(false);
    } catch (error) {
      console.error('Error loading problem:', error);
      setLoading(false);
    }
  };

  const runTests = () => {
    // Simulate test execution
    const results = {
      passed: 2,
      total: problem.exampleTestCases?.length || 0,
      cases: problem.exampleTestCases?.map((tc, i) => ({
        passed: i < 2,
        input: tc.input,
        expected: tc.expectedOutput,
        actual: i < 2 ? tc.expectedOutput : 'Wrong answer'
      }))
    };
    setTestResults(results);
  };

  const submitSolution = () => {
    // Mark as completed
    localStorage.setItem(`problem_${moduleId}_${problemId}`, 'completed');
    alert('Solution submitted successfully!');
  };

  const difficultyColors = {
    easy: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    hard: 'text-red-600 bg-red-100'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white text-xl">Loading problem...</div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white text-xl">Problem not found</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${difficultyColors[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              <Lightbulb size={18} />
              <span>Hints</span>
            </button>
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              {showSolution ? <EyeOff size={18} /> : <Eye size={18} />}
              <span>{showSolution ? 'Hide' : 'Show'} Solution</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 border-r border-slate-700 overflow-y-auto">
          <div className="p-6">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-700">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'description'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('examples')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'examples'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Examples
              </button>
              <button
                onClick={() => setActiveTab('constraints')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'constraints'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Constraints
              </button>
            </div>

            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none">
                <div className="text-slate-300 whitespace-pre-wrap mb-6">
                  {problem.description}
                </div>
                
                {problem.companyTags && problem.companyTags.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-white font-semibold mb-2">Companies</h3>
                    <div className="flex flex-wrap gap-2">
                      {problem.companyTags.map((company) => (
                        <span key={company} className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-sm">
                          {company}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Examples Tab */}
            {activeTab === 'examples' && (
              <div className="space-y-4">
                {problem.exampleTestCases?.map((example, index) => (
                  <div key={index} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-white font-semibold mb-2">Example {index + 1}</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-slate-400">Input:</span>
                        <pre className="bg-slate-900 p-2 rounded mt-1 text-slate-300">
                          {JSON.stringify(example.input, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <span className="text-slate-400">Output:</span>
                        <pre className="bg-slate-900 p-2 rounded mt-1 text-slate-300">
                          {JSON.stringify(example.expectedOutput, null, 2)}
                        </pre>
                      </div>
                      {example.description && (
                        <p className="text-slate-400 mt-2">{example.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Constraints Tab */}
            {activeTab === 'constraints' && (
              <div className="space-y-4">
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <h4 className="text-white font-semibold mb-3">Constraints</h4>
                  <ul className="space-y-2 text-slate-300">
                    {problem.constraints?.map((constraint, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>{constraint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {problem.timeComplexity && (
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-white font-semibold mb-2">Expected Complexity</h4>
                    <p className="text-slate-300">Time: {problem.timeComplexity}</p>
                    <p className="text-slate-300">Space: {problem.spaceComplexity}</p>
                  </div>
                )}
              </div>
            )}

            {/* Hints Section */}
            {showHints && problem.hints && problem.hints.length > 0 && (
              <div className="mt-6 bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-lg p-4">
                <h4 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb size={18} />
                  Hints
                </h4>
                <div className="space-y-2">
                  {problem.hints.map((hint, index) => (
                    <div key={index} className="text-yellow-200 text-sm">
                      <span className="font-semibold">Hint {index + 1}:</span> {hint.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Solution Section */}
            {showSolution && problem.solution && (
              <div className="mt-6 bg-green-900 bg-opacity-20 border border-green-700 rounded-lg p-4">
                <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle size={18} />
                  Solution
                </h4>
                <pre className="bg-slate-900 p-4 rounded text-slate-300 text-sm overflow-x-auto">
                  {problem.solution[selectedLanguage]}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          {/* Language Selector */}
          <div className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="c">C</option>
            </select>
            
            <div className="flex gap-2">
              <button
                onClick={runTests}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
              >
                <Play size={18} />
                Run Tests
              </button>
              <button
                onClick={submitSolution}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Submit
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={selectedLanguage}
            />
          </div>

          {/* Test Results */}
          {testResults && (
            <div className="bg-slate-800 border-t border-slate-700 p-4 max-h-48 overflow-y-auto">
              <h4 className="text-white font-semibold mb-2">
                Test Results: {testResults.passed}/{testResults.total} passed
              </h4>
              <div className="space-y-2">
                {testResults.cases?.map((testCase, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded ${
                      testCase.passed ? 'bg-green-900 bg-opacity-30' : 'bg-red-900 bg-opacity-30'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      {testCase.passed ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : (
                        <X size={16} className="text-red-400" />
                      )}
                      <span className={testCase.passed ? 'text-green-300' : 'text-red-300'}>
                        Test Case {index + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetailView;
