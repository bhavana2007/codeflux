import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Trophy } from 'lucide-react';

const LearningPaths = ({ currentUser, onLogout, onSelectModule }) => {
  const [paths, setPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaths();
  }, []);

  const loadPaths = async () => {
    try {
      const response = await fetch('/src/data/learning-paths.json');
      const data = await response.json();
      setPaths(data.paths || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading learning paths:', error);
      setLoading(false);
    }
  };

  const getPathProgress = (pathId) => {
    const progress = localStorage.getItem(`path_progress_${pathId}`);
    if (!progress) return { completedModules: 0, totalModules: 0, percentage: 0 };
    return JSON.parse(progress);
  };

  const markModuleComplete = (pathId, moduleId) => {
    const progress = getPathProgress(pathId);
    const path = paths.find(p => p.id === pathId);
    if (!path) return;

    const completedModules = progress.completedModules + 1;
    const totalModules = path.modules.length;
    const percentage = Math.round((completedModules / totalModules) * 100);

    localStorage.setItem(`path_progress_${pathId}`, JSON.stringify({
      completedModules,
      totalModules,
      percentage
    }));
    
    // Reload to update UI
    loadPaths();
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'text-green-400',
      Medium: 'text-yellow-400',
      'Medium-Hard': 'text-orange-400',
      Hard: 'text-red-400'
    };
    return colors[difficulty] || 'text-slate-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white text-xl">Loading learning paths...</div>
      </div>
    );
  }

  if (selectedPath) {
    const path = paths.find(p => p.id === selectedPath);
    if (!path) return null;

    const progress = getPathProgress(selectedPath);

    return (
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <button
              onClick={() => setSelectedPath(null)}
              className="mb-4 text-blue-400 hover:text-blue-300 flex items-center gap-2"
            >
              ← Back to all paths
            </button>
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {path.title}
                </h1>
                <p className="text-lg text-slate-400 mt-1">
                  {path.subtitle}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-400">
                  {progress.percentage}%
                </div>
                <div className="text-sm text-slate-400">
                  {progress.completedModules}/{progress.totalModules} modules
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4 bg-slate-700 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Path Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">Duration</div>
              <div className="text-2xl font-bold text-white">{path.duration}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">Estimated Time</div>
              <div className="text-2xl font-bold text-white">{path.estimatedHours}h</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">Difficulty</div>
              <div className={`text-2xl font-bold ${getDifficultyColor(path.difficulty)}`}>
                {path.difficulty}
              </div>
            </div>
          </div>

          {/* Modules Timeline */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Learning Timeline</h2>
            
            <div className="space-y-6">
              {path.modules.map((module, index) => {
                const isCompleted = index < progress.completedModules;
                const isCurrent = index === progress.completedModules;

                return (
                  <div
                    key={index}
                    className={`border-l-4 pl-6 py-4 rounded-r-lg ${
                      isCompleted
                        ? 'border-green-500 bg-green-900 bg-opacity-10'
                        : isCurrent
                        ? 'border-blue-500 bg-blue-900 bg-opacity-10'
                        : 'border-slate-700 bg-slate-900 bg-opacity-30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm text-slate-400">
                          Week {module.week} • Day {module.day}
                        </div>
                        <h3 className="text-lg font-semibold text-white capitalize">
                          {module.moduleId.replace(/-/g, ' ')}
                        </h3>
                      </div>
                      {isCompleted && (
                        <CheckCircle size={24} className="text-green-400" />
                      )}
                      {isCurrent && (
                        <Clock size={24} className="text-blue-400 animate-pulse" />
                      )}
                    </div>
                    
                    <p className="text-slate-300 mb-3">{module.focus}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                      <span>📝 {module.problems} problems</span>
                      <span>⏱️ {module.estimatedTime}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onSelectModule(module.moduleId)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium"
                      >
                        Start Module
                      </button>
                      {!isCompleted && (
                        <button
                          onClick={() => markModuleComplete(selectedPath, module.moduleId)}
                          className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Milestones</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {path.milestones.map((milestone, index) => {
                const isReached = progress.completedModules >= milestone.day;

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isReached
                        ? 'border-green-500 bg-green-900 bg-opacity-20'
                        : 'border-slate-700 bg-slate-900 bg-opacity-30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isReached ? (
                        <Trophy size={24} className="text-green-400 flex-shrink-0" />
                      ) : (
                        <Trophy size={24} className="text-slate-600 flex-shrink-0" />
                      )}
                      <div>
                        <h4 className={`font-semibold ${isReached ? 'text-green-300' : 'text-slate-400'}`}>
                          Day {milestone.day}: {milestone.title}
                        </h4>
                        <p className={`text-sm mt-1 ${isReached ? 'text-green-200' : 'text-slate-500'}`}>
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Learning Paths</h1>
        <p className="text-slate-400 mb-8">Choose a structured path to master DSA</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paths.map((path) => {
            const progress = getPathProgress(path.id);

            return (
              <div
                key={path.id}
                onClick={() => setSelectedPath(path.id)}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-all cursor-pointer group"
              >
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {path.title}
                </h2>
                <p className="text-slate-400 mb-4">{path.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                  <span>📅 {path.duration}</span>
                  <span>⏱️ {path.estimatedHours}h</span>
                  <span className={getDifficultyColor(path.difficulty)}>{path.difficulty}</span>
                </div>

                {progress.totalModules > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-blue-400 font-semibold">{progress.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LearningPaths;
