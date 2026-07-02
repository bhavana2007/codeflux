import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ModuleList from './components/ModuleList';
import ModuleView from './components/ModuleView';
import ProblemDetailView from './components/ProblemDetailView';
import LearningPaths from './components/LearningPaths';
import AnalyticsView from './components/analytics/AnalyticsView';
import ResourcesView from './components/ResourcesView';
import ChatBot from './components/ChatBot';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('home');
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showChatBot, setShowChatBot] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setActiveView('home');
    setSelectedModule(null);
    setSelectedProblem(null);
  };

  const handleSelectModule = (moduleId) => {
    setSelectedModule(moduleId);
    setSelectedProblem(null);
    setActiveView('modules'); // Ensure we're in modules view
  };

  const handleSelectProblem = (moduleId, problemId) => {
    setSelectedModule(moduleId);
    setSelectedProblem(problemId);
  };

  const handleBackToModules = () => {
    setSelectedModule(null);
    setSelectedProblem(null);
    setActiveView('modules'); // Ensure we go back to modules view
  };

  const handleBackToProblemList = () => {
    setSelectedProblem(null);
  };

  const handleNavigate = (view) => {
    setActiveView(view);
    // Clear module/problem selection when navigating to other views
    if (view !== 'modules') {
      setSelectedModule(null);
      setSelectedProblem(null);
    }
  };

  // Determine context for ChatBot
  const getChatBotContext = () => {
    if (selectedProblem && selectedModule) {
      return { currentView: 'problem', currentModule: selectedModule };
    }
    if (selectedModule) {
      return { currentView: 'module', currentModule: selectedModule };
    }
    if (activeView === 'learning-paths') {
      return { currentView: 'paths' };
    }
    if (activeView === 'home') {
      return { currentView: 'landing' };
    }
    return { currentView: activeView || 'modules' };
  };

  // If not logged in, show login page
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // If viewing a specific problem
  if (selectedProblem && selectedModule) {
    return (
      <>
        <ProblemDetailView
          moduleId={selectedModule}
          problemId={selectedProblem}
          onBack={handleBackToProblemList}
        />
        
        {/* Fluxy Chatbot */}
        {showChatBot && <ChatBot onClose={() => setShowChatBot(false)} context={getChatBotContext()} />}
        
        {/* Fluxy Button */}
        <button
          onClick={() => setShowChatBot(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50 group"
        >
          <MessageSquare size={20} />
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chat with Fluxy
          </div>
        </button>
      </>
    );
  }

  // If viewing a specific module
  if (selectedModule) {
    return (
      <>
        <ModuleView
          moduleId={selectedModule}
          onBack={handleBackToModules}
          onSelectProblem={handleSelectProblem}
        />
        
        {/* Fluxy Chatbot */}
        {showChatBot && <ChatBot onClose={() => setShowChatBot(false)} context={getChatBotContext()} />}
        
        {/* Fluxy Button */}
        <button
          onClick={() => setShowChatBot(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50 group"
        >
          <MessageSquare size={20} />
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chat with Fluxy
          </div>
        </button>
      </>
    );
  }

  // If viewing learning paths
  if (activeView === 'learning-paths') {
    return (
      <div className="flex h-screen bg-slate-900">
        {sidebarOpen && (
          <Sidebar
            currentUser={currentUser}
            onLogout={handleLogout}
            activeView={activeView}
            onNavigate={handleNavigate}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex-1 overflow-y-auto">
          {/* Menu button when sidebar is closed */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="fixed top-4 left-4 z-40 bg-slate-700 text-white p-3 rounded-lg shadow-lg hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <LearningPaths
            currentUser={currentUser}
            onLogout={handleLogout}
            onSelectModule={handleSelectModule}
          />
        </div>
        
        {/* Fluxy Chatbot */}
        {showChatBot && <ChatBot onClose={() => setShowChatBot(false)} context={getChatBotContext()} />}
        
        {/* Fluxy Button */}
        <button
          onClick={() => setShowChatBot(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50 group"
        >
          <MessageSquare size={20} />
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chat with Fluxy
          </div>
        </button>
      </div>
    );
  }

  // Home page - clean landing without sidebar
  if (activeView === 'home') {
    return (
      <>
        <div className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Welcome Video Background */}
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/assets/videos/welcome.mp4" type="video/mp4" />
          </video>
          
          <div className="absolute inset-0 bg-black/40"></div>
          
          {/* Content */}
          <div className="relative z-10 text-center max-w-2xl px-4">
            <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
              Welcome to <span className="text-blue-400">CodeFlux</span>
            </h1>
            <p className="text-2xl text-white mb-8 drop-shadow-lg">
              Master Data Structures and Algorithms through interactive learning
            </p>
            <button
              onClick={() => setActiveView('modules')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-500 shadow-lg transform hover:scale-105 transition-all border border-blue-400"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Fluxy Chatbot */}
        {showChatBot && <ChatBot onClose={() => setShowChatBot(false)} context={getChatBotContext()} />}
        
        {/* Fluxy Button */}
        <button
          onClick={() => setShowChatBot(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50 group"
        >
          <MessageSquare size={24} />
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chat with Fluxy
          </div>
        </button>
      </>
    );
  }

  // Main app layout with sidebar (for all other views)
  return (
    <div className="flex h-screen bg-slate-900">
      {sidebarOpen && (
        <Sidebar
          currentUser={currentUser}
          onLogout={handleLogout}
          activeView={activeView}
          onNavigate={handleNavigate}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 overflow-y-auto">
        {/* Menu button when sidebar is closed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 z-40 bg-slate-800 text-white p-3 rounded-lg shadow-lg hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {activeView === 'modules' && (
          <ModuleList onSelectModule={handleSelectModule} />
        )}

        {activeView === 'analytics' && (
          <AnalyticsView />
        )}

        {activeView === 'resources' && (
          <ResourcesView />
        )}
      </div>

      {/* Fluxy Chatbot */}
      {showChatBot && <ChatBot onClose={() => setShowChatBot(false)} context={getChatBotContext()} />}
      
      {/* Fluxy Button */}
      <button
        onClick={() => setShowChatBot(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50 group"
      >
        <MessageSquare size={20} />
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Chat with Fluxy
        </div>
      </button>
    </div>
  );
}

export default App;
