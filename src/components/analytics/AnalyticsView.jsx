import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Clock, Award } from 'lucide-react';

const AnalyticsView = () => {
  const [stats, setStats] = useState({
    problemsSolved: 0,
    totalTime: 0,
    currentStreak: 0,
    longestStreak: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    // Load stats from localStorage
    const problemsSolved = Object.keys(localStorage).filter(key => 
      key.startsWith('problem_') && localStorage.getItem(key) === 'completed'
    ).length;

    setStats({
      problemsSolved,
      totalTime: Math.floor(problemsSolved * 45), // Estimate 45 min per problem
      currentStreak: 5, // Mock data
      longestStreak: 12, // Mock data
    });
  };

  const statCards = [
    {
      title: 'Problems Solved',
      value: stats.problemsSolved,
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900 bg-opacity-20',
      borderColor: 'border-blue-700'
    },
    {
      title: 'Total Time (hours)',
      value: Math.floor(stats.totalTime / 60),
      icon: Clock,
      color: 'text-green-400',
      bgColor: 'bg-green-900 bg-opacity-20',
      borderColor: 'border-green-700'
    },
    {
      title: 'Current Streak',
      value: `${stats.currentStreak} days`,
      icon: TrendingUp,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900 bg-opacity-20',
      borderColor: 'border-yellow-700'
    },
    {
      title: 'Longest Streak',
      value: `${stats.longestStreak} days`,
      icon: Award,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900 bg-opacity-20',
      borderColor: 'border-purple-700'
    },
  ];

  return (
    <div className="bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-slate-400 mb-8">Track your progress and achievements</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            
            return (
              <div
                key={stat.title}
                className={`${stat.bgColor} border ${stat.borderColor} rounded-lg p-6`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon size={32} className={stat.color} />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">
                  {stat.title}
                </div>
              </div>
            );
          })}
        </div>

        {/* Activity Chart Placeholder */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-4">Activity Overview</h2>
          <div className="h-64 flex items-center justify-center text-slate-400">
            Activity chart coming soon...
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
