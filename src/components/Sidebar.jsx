import React from 'react';
import { Home, BookOpen, Trophy, BarChart3, Settings, LogOut, X } from 'lucide-react';

const Sidebar = ({ currentUser, onLogout, activeView, onNavigate, onClose }) => {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'learning-paths', icon: BookOpen, label: 'Learning Paths' },
    { id: 'modules', icon: Trophy, label: 'Modules' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'resources', icon: Settings, label: 'Resources' },
  ];

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-white">CodeFlux</h1>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>
        {currentUser && (
          <p className="text-sm text-slate-400 mt-2">{currentUser.email}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                if (onClose && window.innerWidth < 768) {
                  onClose();
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {currentUser && (
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
