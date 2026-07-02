import React from 'react';
import { ArrowLeft, CheckCircle, Clock, Code } from 'lucide-react';

const ProblemListView = ({ moduleId, problems, onBack, onSelectProblem }) => {
  const getProblemStatus = (problemId) => {
    return localStorage.getItem(`problem_${moduleId}_${problemId}`) || 'not-started';
  };

  const difficultyColors = {
    easy: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    hard: 'text-red-600 bg-red-100'
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Module</span>
        </button>

        <h1 className="text-4xl font-bold text-white mb-8">Problems</h1>

        <div className="space-y-4">
          {problems.map((problem, index) => {
            const status = getProblemStatus(problem.id);
            const isCompleted = status === 'completed';
            const isInProgress = status === 'in-progress';

            return (
              <div
                key={problem.id}
                onClick={() => onSelectProblem(problem.id)}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-slate-500 font-mono">#{index + 1}</span>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                        {problem.title}
                      </h3>
                      {isCompleted && (
                        <CheckCircle size={20} className="text-green-400" />
                      )}
                      {isInProgress && (
                        <Clock size={20} className="text-yellow-400" />
                      )}
                    </div>
                    
                    <p className="text-slate-400 mb-4 line-clamp-2">
                      {problem.description?.split('\n')[0]}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <span className={`px-3 py-1 rounded-full font-semibold ${difficultyColors[problem.difficulty] || 'text-slate-600 bg-slate-100'}`}>
                        {problem.difficulty}
                      </span>
                      
                      {problem.companyTags && problem.companyTags.length > 0 && (
                        <div className="flex gap-2">
                          {problem.companyTags.slice(0, 3).map((company) => (
                            <span key={company} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                              {company}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {problem.topicTags && problem.topicTags.length > 0 && (
                        <div className="flex gap-2">
                          {problem.topicTags.slice(0, 2).map((topic) => (
                            <span key={topic} className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs">
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Code size={24} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProblemListView;
