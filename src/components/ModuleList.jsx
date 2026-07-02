import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, Clock, Trophy } from 'lucide-react';

const ModuleList = ({ onSelectModule }) => {
  const [modules, setModules] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      // Load all module files
      const moduleFiles = [
        'two-pointers', 'hashing', 'sliding-window', 'prefix-sum',
        'linked-lists', 'stacks-queues', 'sorting-algorithms', 'binary-search',
        'fast-slow-pointer', 'tree-traversals', 'dfs-bfs', 'backtracking', 'recursion',
        'dynamic-programming', 'heaps', 'merge-intervals', 'monotonic-stack',
        'kadanes-algorithm', 'graph-algorithms', 'tries', 'union-find',
        'top-k-elements', 'bit-manipulation', 'greedy', 'math-number-theory'
      ];

      const loadedModules = await Promise.all(
        moduleFiles.map(async (file) => {
          try {
            const response = await fetch(`/src/data/modules/${file}.json`);
            return await response.json();
          } catch (error) {
            console.error(`Failed to load ${file}:`, error);
            return null;
          }
        })
      );

      setModules(loadedModules.filter(Boolean));
      setLoading(false);
    } catch (error) {
      console.error('Error loading modules:', error);
      setLoading(false);
    }
  };

  const getProgress = (moduleId) => {
    const progress = localStorage.getItem(`module_progress_${moduleId}`);
    return progress ? JSON.parse(progress) : { completed: 0, total: 0 };
  };

  const filteredModules = modules.filter((module) => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || module.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const difficultyColors = {
    beginner: 'text-green-600 bg-green-100',
    intermediate: 'text-yellow-600 bg-yellow-100',
    advanced: 'text-red-600 bg-red-100'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white text-xl">Loading modules...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">DSA Modules</h1>
          <p className="text-slate-400">Master data structures and algorithms through interactive learning</p>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Module Grid - Circular Display */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-items-center">
          {filteredModules.map((module) => {
            const progress = getProgress(module.id);
            const progressPercent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
            
            // Calculate circle properties
            const radius = 80;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (progressPercent / 100) * circumference;

            return (
              <div
                key={module.id}
                onClick={() => onSelectModule(module.id)}
                className="relative cursor-pointer group"
              >
                {/* Circular Progress */}
                <svg className="w-48 h-48 transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="96"
                    cy="96"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-700"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="96"
                    cy="96"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="text-blue-500 transition-all duration-500 ease-out"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))'
                    }}
                  />
                  {/* Inner circle background */}
                  <circle
                    cx="96"
                    cy="96"
                    r={radius - 8}
                    fill="currentColor"
                    className="text-slate-800 group-hover:text-slate-700 transition-colors"
                  />
                </svg>

                {/* Content inside circle */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  {/* Module Title */}
                  <h3 className="text-sm font-bold text-white mb-1 line-clamp-2 px-2">
                    {module.title}
                  </h3>
                  
                  {/* Difficulty Badge */}
                  <span className={`text-xs font-semibold mb-2 ${
                    module.difficulty === 'beginner' ? 'text-green-400' :
                    module.difficulty === 'intermediate' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {module.difficulty}
                  </span>
                  
                  {/* Progress Percentage */}
                  {progress.total > 0 && (
                    <div className="text-2xl font-bold text-blue-400">
                      {progressPercent}%
                    </div>
                  )}
                  
                  {/* Problem Count */}
                  <div className="text-xs text-slate-400 mt-1">
                    {module.problems?.length || 0} problems
                  </div>
                  
                  {/* Completion Badge */}
                  {progressPercent === 100 && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle size={24} className="text-green-400" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredModules.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No modules found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleList;
