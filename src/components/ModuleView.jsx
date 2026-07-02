import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, BookOpen, Code, CheckCircle } from 'lucide-react';

const renderMarkdownText = (text) => {
  if (!text) return text;
  
  // Handle bold text **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <span key={i} className="font-bold text-white">{part.slice(2, -2)}</span>;
    }
    return <span key={i}>{part}</span>;
  });
};

const ModuleView = ({ moduleId, onBack, onSelectProblem }) => {
  const [module, setModule] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [activeSubmoduleTab, setActiveSubmoduleTab] = useState({});

  useEffect(() => {
    loadModule();
  }, [moduleId]);

  const loadModule = async () => {
    try {
      const response = await fetch(`/src/data/modules/${moduleId}.json`);
      const data = await response.json();
      setModule(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading module:', error);
      setLoading(false);
    }
  };

  const getProblemStatus = (problemId) => {
    return localStorage.getItem(`problem_${moduleId}_${problemId}`) || 'not-started';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white text-xl">Loading module...</div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white text-xl">Module not found</div>
      </div>
    );
  }

  const difficultyColors = {
    beginner: 'text-green-600 bg-green-100',
    easy: 'text-green-600 bg-green-100',
    intermediate: 'text-yellow-600 bg-yellow-100',
    medium: 'text-yellow-600 bg-yellow-100',
    advanced: 'text-red-600 bg-red-100',
    hard: 'text-red-600 bg-red-100'
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Modules</span>
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{module.title}</h1>
              <p className="text-slate-400 text-lg">{module.description}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${difficultyColors[module.difficulty] || 'text-slate-600 bg-slate-100'}`}>
              {module.difficulty}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <BookOpen size={18} className="inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('problems')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'problems'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Code size={18} className="inline mr-2" />
              Problems ({module.problems?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'videos'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Play size={18} className="inline mr-2" />
              Videos ({module.videos?.length || 0})
            </button>
            {module.submodules && module.submodules.length > 0 && (
              <button
                onClick={() => setActiveTab('submodules')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'submodules'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <BookOpen size={18} className="inline mr-2" />
                Submodules ({module.submodules.length})
              </button>
            )}
            {module.quiz?.questions && (
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'quiz'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <CheckCircle size={18} className="inline mr-2" />
                Quiz ({module.quiz.questions.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === 'overview' && (
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
            <div className="max-w-none text-slate-300">
              {(() => {
                const lines = module.documentation?.content?.split('\n') || [];
                const elements = [];
                let currentList = [];
                let isOrderedList = false;
                
                lines.forEach((line, index) => {
                  const trimmed = line.trim();
                  
                  // Check if line is a list item
                  const isUnorderedItem = trimmed.startsWith('- ');
                  const isOrderedItem = /^\d+\.\s/.test(trimmed);
                  const isListItem = isUnorderedItem || isOrderedItem;
                  
                  // If we encounter a non-list item and have accumulated list items
                  if (!isListItem && currentList.length > 0) {
                    if (isOrderedList) {
                      elements.push(
                        <ol key={`list-${elements.length}`} className="list-decimal ml-6 space-y-1 my-4">
                          {currentList}
                        </ol>
                      );
                    } else {
                      elements.push(
                        <ul key={`list-${elements.length}`} className="list-disc ml-6 space-y-1 my-4">
                          {currentList}
                        </ul>
                      );
                    }
                    currentList = [];
                  }
                  
                  // Skip empty lines
                  if (!trimmed) {
                    if (currentList.length === 0) {
                      elements.push(<div key={`space-${index}`} className="h-3"></div>);
                    }
                    return;
                  }
                  
                  // Code block markers - skip
                  if (trimmed.startsWith('```')) {
                    return;
                  }
                  
                  // List items
                  if (isListItem) {
                    const listText = isUnorderedItem ? trimmed.replace(/^-\s/, '') : trimmed.replace(/^\d+\.\s/, '');
                    isOrderedList = isOrderedItem;
                    currentList.push(
                      <li key={`${isOrderedList ? 'ol' : 'ul'}-${currentList.length}`} className="text-slate-300">
                        {renderMarkdownText(listText)}
                      </li>
                    );
                    return;
                  }
                  
                  // Headings
                  if (trimmed.startsWith('# ')) {
                    elements.push(<h1 key={`h1-${elements.length}`} className="text-4xl font-bold text-white mt-8 mb-4">{trimmed.replace(/^#+\s/, '')}</h1>);
                  } else if (trimmed.startsWith('## ')) {
                    elements.push(<h2 key={`h2-${elements.length}`} className="text-2xl font-bold text-blue-400 mt-6 mb-3">{trimmed.replace(/^#+\s/, '')}</h2>);
                  } else if (trimmed.startsWith('### ')) {
                    elements.push(<h3 key={`h3-${elements.length}`} className="text-xl font-bold text-blue-300 mt-4 mb-2">{trimmed.replace(/^#+\s/, '')}</h3>);
                  } else if (trimmed.startsWith('#### ')) {
                    elements.push(<h4 key={`h4-${elements.length}`} className="text-lg font-semibold text-slate-200 mt-3 mb-2">{trimmed.replace(/^#+\s/, '')}</h4>);
                  }
                  // Table separators - skip
                  else if (trimmed.includes('---|')) {
                    return;
                  }
                  // Special callouts
                  else if (trimmed.startsWith('💡 ') || trimmed.startsWith('❌ ') || trimmed.startsWith('✓ ')) {
                    elements.push(
                      <div key={`callout-${elements.length}`} className="my-4 p-4 bg-slate-700/50 rounded-lg border-l-4 border-blue-500 text-slate-300">
                        {renderMarkdownText(trimmed)}
                      </div>
                    );
                  }
                  // Regular paragraphs
                  else if (trimmed.length > 0) {
                    elements.push(
                      <p key={`p-${elements.length}`} className="text-slate-300 leading-relaxed my-3">
                        {renderMarkdownText(trimmed)}
                      </p>
                    );
                  }
                });
                
                // Handle any remaining list items
                if (currentList.length > 0) {
                  if (isOrderedList) {
                    elements.push(
                      <ol key={`list-${elements.length}`} className="list-decimal ml-6 space-y-1 my-4">
                        {currentList}
                      </ol>
                    );
                  } else {
                    elements.push(
                      <ul key={`list-${elements.length}`} className="list-disc ml-6 space-y-1 my-4">
                        {currentList}
                      </ul>
                    );
                  }
                }
                
                return elements.length > 0 ? elements : 'No documentation available.';
              })()}
            </div>
          </div>
        )}

        {activeTab === 'problems' && (
          <div className="space-y-4">
            {module.problems?.map((problem, index) => {
              const status = getProblemStatus(problem.id);
              const isCompleted = status === 'completed';

              return (
                <div
                  key={problem.id}
                  onClick={() => onSelectProblem(moduleId, problem.id)}
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
                      </div>
                      <p className="text-slate-400 mb-4">{problem.description?.split('\n')[0]}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`px-3 py-1 rounded-full font-semibold ${difficultyColors[problem.difficulty] || 'text-slate-600 bg-slate-100'}`}>
                          {problem.difficulty}
                        </span>
                        {problem.companyTags && (
                          <div className="flex gap-2">
                            {problem.companyTags.slice(0, 3).map((company) => (
                              <span key={company} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                                {company}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {module.videos?.map((video) => (
              <div key={video.id} className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                <div className="aspect-video bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2">{video.title}</h3>
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>{video.language}</span>
                    <span>{Math.floor(video.duration / 60)} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'submodules' && (
          <div className="space-y-12">
            {module.submodules?.map((submodule) => {
              const subTabKey = `sub-${submodule.id}`;
              const activeSubTab = activeSubmoduleTab[subTabKey] || 'overview';
              
              return (
                <div key={submodule.id} className="bg-slate-800 rounded-lg border border-slate-700">
                  {/* Submodule Header */}
                  <div className="p-6 border-b border-slate-700">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{submodule.title}</h2>
                        <p className="text-slate-400">{submodule.description}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${difficultyColors[submodule.difficulty] || 'text-slate-600 bg-slate-100'}`}>
                        {submodule.difficulty}
                      </span>
                    </div>
                    
                    {/* Submodule Tabs */}
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setActiveSubmoduleTab({...activeSubmoduleTab, [subTabKey]: 'overview'})}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          activeSubTab === 'overview'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        📚 Overview
                      </button>
                      {submodule.videos?.length > 0 && (
                        <button
                          onClick={() => setActiveSubmoduleTab({...activeSubmoduleTab, [subTabKey]: 'videos'})}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            activeSubTab === 'videos'
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          🎥 Videos ({submodule.videos.length})
                        </button>
                      )}
                      {submodule.problems?.length > 0 && (
                        <button
                          onClick={() => setActiveSubmoduleTab({...activeSubmoduleTab, [subTabKey]: 'practice'})}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            activeSubTab === 'practice'
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          💻 Practice ({submodule.problems.length})
                        </button>
                      )}
                      {submodule.quiz?.questions?.length > 0 && (
                        <button
                          onClick={() => setActiveSubmoduleTab({...activeSubmoduleTab, [subTabKey]: 'quiz'})}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            activeSubTab === 'quiz'
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          ✅ Quiz ({submodule.quiz.questions.length})
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Submodule Content */}
                  <div className="p-6">
                    {activeSubTab === 'overview' && (
                      <div className="text-slate-300">
                        {submodule.documentation?.content ? (
                          <div className="whitespace-pre-wrap">{submodule.documentation.content}</div>
                        ) : (
                          <div className="text-slate-400 text-center py-12">
                            <p className="mb-4">📖 {submodule.description}</p>
                            <p className="text-sm">Explore the videos and practice problems to master this topic!</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {activeSubTab === 'videos' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {submodule.videos?.map((video, index) => (
                          <div key={index} className="bg-slate-700 rounded-lg overflow-hidden border border-slate-600 hover:border-blue-500 transition-all">
                            <div className="aspect-video bg-black">
                              <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${video.youtubeId}`}
                                title={video.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                              ></iframe>
                            </div>
                            <div className="p-3">
                              <h4 className="font-semibold text-white text-sm mb-2 line-clamp-2">{video.title}</h4>
                              <span className="text-xs text-slate-400">{video.language}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {activeSubTab === 'practice' && (
                      <div className="space-y-4">
                        {submodule.problems?.map((problem, index) => {
                          const status = getProblemStatus(problem.id);
                          const isCompleted = status === 'completed';

                          return (
                            <div
                              key={problem.id}
                              onClick={() => onSelectProblem(moduleId, problem.id)}
                              className="bg-slate-700 rounded-lg p-6 border border-slate-600 hover:border-blue-500 transition-all cursor-pointer group"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-slate-500 font-mono">#{index + 1}</span>
                                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                      {problem.title}
                                    </h3>
                                    {isCompleted && (
                                      <CheckCircle size={18} className="text-green-400" />
                                    )}
                                  </div>
                                  <p className="text-slate-400 text-sm mb-3">{problem.description?.split('\\n')[0]}</p>
                                  
                                  <div className="flex items-center gap-3 text-sm">
                                    <span className={`px-3 py-1 rounded-full font-semibold text-xs ${difficultyColors[problem.difficulty] || 'text-slate-600 bg-slate-100'}`}>
                                      {problem.difficulty}
                                    </span>
                                    {problem.companyTags && (
                                      <div className="flex gap-2">
                                        {problem.companyTags.slice(0, 2).map((company) => (
                                          <span key={company} className="px-2 py-1 bg-slate-600 text-slate-300 rounded text-xs">
                                            {company}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {activeSubTab === 'quiz' && submodule.quiz?.questions && (
                      <div className="space-y-6">
                        {submodule.quiz.questions.map((question, qIndex) => {
                          const questionKey = `${moduleId}-${submodule.id}-${question.id}`;
                          const selectedAnswer = quizAnswers[questionKey]?.selected;
                          const showExplanation = quizAnswers[questionKey]?.showExplanation;

                          const handleAnswerSelect = (answerIndex) => {
                            setQuizAnswers(prev => ({
                              ...prev,
                              [questionKey]: {
                                selected: answerIndex,
                                showExplanation: true
                              }
                            }));
                          };

                          return (
                            <div key={question.id} className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                              <h3 className="text-lg font-bold text-white mb-4">
                                Q{qIndex + 1}: {question.question}
                              </h3>
                              
                              <div className="space-y-3 mb-4">
                                {question.options.map((option, oIndex) => {
                                  const isSelected = selectedAnswer === oIndex;
                                  const isCorrect = oIndex === question.correctAnswer;
                                  const showResult = showExplanation;

                                  return (
                                    <button
                                      key={oIndex}
                                      onClick={() => handleAnswerSelect(oIndex)}
                                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                        showResult
                                          ? isCorrect
                                            ? 'border-green-500 bg-green-500/10'
                                            : isSelected
                                            ? 'border-red-500 bg-red-500/10'
                                            : 'border-slate-600 bg-slate-600/50'
                                          : isSelected
                                          ? 'border-blue-500 bg-blue-500/10'
                                          : 'border-slate-600 hover:border-slate-500 hover:bg-slate-600/50'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                          showResult && isCorrect
                                            ? 'bg-green-500 text-white'
                                            : showResult && isSelected
                                            ? 'bg-red-500 text-white'
                                            : 'bg-slate-600 text-slate-300'
                                        }`}>
                                          {String.fromCharCode(65 + oIndex)}
                                        </span>
                                        <span className="text-white text-sm">{option}</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>

                              {showExplanation && (
                                <div className={`p-4 rounded-lg ${
                                  selectedAnswer === question.correctAnswer
                                    ? 'bg-green-500/10 border border-green-500'
                                    : 'bg-blue-500/10 border border-blue-500'
                                }`}>
                                  <p className="text-white font-semibold mb-2 text-sm">
                                    {selectedAnswer === question.correctAnswer ? '✓ Correct!' : 'ℹ Explanation:'}
                                  </p>
                                  <p className="text-slate-300 text-sm">{question.explanation}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'quiz' && module.quiz?.questions && (
          <div className="space-y-6">
            {module.quiz.questions.map((question, qIndex) => {
              const questionKey = `${moduleId}-${question.id}`;
              const selectedAnswer = quizAnswers[questionKey]?.selected;
              const showExplanation = quizAnswers[questionKey]?.showExplanation;

              const handleAnswerSelect = (answerIndex) => {
                setQuizAnswers(prev => ({
                  ...prev,
                  [questionKey]: {
                    selected: answerIndex,
                    showExplanation: true
                  }
                }));
              };

              return (
                <div key={question.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Question {qIndex + 1}: {question.question}
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    {question.options.map((option, oIndex) => {
                      const isSelected = selectedAnswer === oIndex;
                      const isCorrect = oIndex === question.correctAnswer;
                      const showResult = showExplanation;

                      return (
                        <button
                          key={oIndex}
                          onClick={() => handleAnswerSelect(oIndex)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            showResult
                              ? isCorrect
                                ? 'border-green-500 bg-green-500/10'
                                : isSelected
                                ? 'border-red-500 bg-red-500/10'
                                : 'border-slate-700 bg-slate-700/50'
                              : isSelected
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              showResult && isCorrect
                                ? 'bg-green-500 text-white'
                                : showResult && isSelected
                                ? 'bg-red-500 text-white'
                                : 'bg-slate-700 text-slate-300'
                            }`}>
                              {String.fromCharCode(65 + oIndex)}
                            </span>
                            <span className="text-white">{option}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {showExplanation && (
                    <div className={`p-4 rounded-lg ${
                      selectedAnswer === question.correctAnswer
                        ? 'bg-green-500/10 border border-green-500'
                        : 'bg-blue-500/10 border border-blue-500'
                    }`}>
                      <p className="text-white font-semibold mb-2">
                        {selectedAnswer === question.correctAnswer ? '✓ Correct!' : 'ℹ Explanation:'}
                      </p>
                      <p className="text-slate-300">{question.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleView;
