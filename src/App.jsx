import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, MessageSquare, ExternalLink, ChevronRight, X, StickyNote } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// ==================== CONFIGURATION ====================
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();
let genAIClient = null;
const getGenAI = () => {
  if (!API_KEY) {
    throw new Error("Missing VITE_GEMINI_API_KEY. Add it to your .env.local and restart the dev server.");
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenerativeAI(API_KEY);
  }
  return genAIClient;
};

// ==================== UTILITY FUNCTIONS ====================
const getPatternProgress = (id) => localStorage.getItem(`pattern_progress_${id}`) || 'yet-to-start';
const setPatternProgress = (id, status) => localStorage.setItem(`pattern_progress_${id}`, status);
const getPatternNote = (id) => localStorage.getItem(`pattern_notes_${id}`) || '';
const setPatternNote = (id, text) => localStorage.setItem(`pattern_notes_${id}`, text);
const difficultyBadge = (difficulty = "") => {
  const level = difficulty.toLowerCase();
  if (level === "easy") return { bg: "bg-green-100", text: "text-green-700" };
  if (level === "medium") return { bg: "bg-yellow-100", text: "text-yellow-800" };
  if (level === "hard") return { bg: "bg-red-100", text: "text-red-700" };
  return { bg: "bg-gray-100", text: "text-gray-700" };
};
const quizForPattern = (pattern = {}) => {
  const name = pattern.name || "This pattern";
  const basics = {
    question: `What is the key idea of ${name}?`,
    options: [
      "Use brute force over all possibilities",
      "Maintain a focused view (window/pointers/prefix) to optimize",
      "Sort and binary search only"
    ],
    correct: 1,
  };
  if ((pattern.id || "").includes("prefix")) {
    return {
      question: "Prefix Sum lets you compute range sums in:",
      options: ["O(n)", "O(log n)", "O(1) after O(n) prep"],
      correct: 2,
    };
  }
  if ((pattern.id || "").includes("two")) {
    return {
      question: "Two Pointers works best when data is:",
      options: ["Unsorted only", "Sorted or ordered to leverage direction", "Random strings only"],
      correct: 1,
    };
  }
  if ((pattern.id || "").includes("hash")) {
    return {
      question: "Hashing helps by providing:",
      options: ["O(n^2) lookups", "O(1) expected lookups for counts/membership", "Sorting for free"],
      correct: 1,
    };
  }
  if ((pattern.id || "").includes("kadane")) {
    return {
      question: "Kadane’s keeps track of:",
      options: ["Min prefix only", "Max prefix only", "Current best subarray sum as you scan"],
      correct: 2,
    };
  }
  if ((pattern.id || "").includes("fastslow")) {
    return {
      question: "Fast & Slow pointers detect cycles by:",
      options: ["Counting nodes", "Comparing values", "Letting fast lap slow until they meet"],
      correct: 2,
    };
  }
  return basics;
};

const FloatingNotepad = ({ patternId }) => {
  const [note, setNote] = useState("");
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 24, y: 120 });
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setNote(getPatternNote(patternId));
  }, [patternId]);

  useEffect(() => {
    setPatternNote(patternId, note);
  }, [note, patternId]);

  const onMouseDown = (e) => {
    setDragging(true);
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
  };

  const onMouseUp = () => setDragging(false);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  });

  return (
    <div
      style={{ left: pos.x, top: pos.y }}
      className="fixed z-40 w-72 shadow-2xl"
    >
      <div
        className="bg-gray-900 text-white px-3 py-2 rounded-t-lg cursor-move flex items-center gap-2"
        onMouseDown={onMouseDown}
      >
        <StickyNote size={16} /> Notes
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full h-40 p-3 border border-gray-200 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
        placeholder="Write notes for this pattern..."
      />
    </div>
  );
};

// ==================== COMPONENTS ====================

const GeminiTutor = ({ currentStep, codeSnippet, patternName }) => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResponse, setTestResponse] = useState("");

  const askTutor = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      // v1beta currently serves the -001 suffix; latest alias is 404 in your project
      const model = getGenAI().getGenerativeModel({ model: "gemini-1.5-flash-001" });
      const prompt = `Tutor for ${patternName}. Step ${currentStep}: ${codeSnippet}. Question: ${query}`;
      const result = await model.generateContent(prompt);
      setResponse(result.response.text());
    } catch (err) { 
      console.error("Gemini Tutor error:", err);
      const msg = err?.message?.includes("VITE_GEMINI_API_KEY")
        ? "Missing or invalid VITE_GEMINI_API_KEY. Update your .env.local and restart."
        : "AI connection failed.";
      setResponse(msg); 
    }
    finally { setLoading(false); }
  };

  const runHelloTest = async () => {
    setTestResponse("");
    setTestLoading(true);
    // Safe runtime visibility: log only presence, not the key
    console.info("Gemini key present:", Boolean(API_KEY));
    try {
      const model = getGenAI().getGenerativeModel({ model: "gemini-1.5-flash-001" });
      const result = await model.generateContent("Say HELLO from Gemini");
      console.info("Gemini test response object:", result?.response);
      setTestResponse(result?.response?.text?.() || "No text returned");
    } catch (err) {
      console.error("Gemini hello test failed:", err);
      setTestResponse("Test failed: " + (err?.message || "unknown error"));
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="mt-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-left">
      <div className="flex items-center gap-2 mb-3 text-indigo-700 font-bold"><MessageSquare size={18}/> Gemini Tutor</div>
      <div className="flex gap-2">
        <input value={query} onChange={(e)=>setQuery(e.target.value)} className="flex-1 p-2 rounded-lg border text-sm" placeholder="Ask a doubt..." />
        <button onClick={askTutor} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">{loading ? "..." : "Ask"}</button>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={runHelloTest} className="bg-gray-800 text-white px-3 py-2 rounded-lg text-xs">
          {testLoading ? "Testing..." : "Test Gemini Hello"}
        </button>
        {testResponse && <span className="text-sm text-gray-700 bg-white border border-gray-200 rounded px-3 py-2 flex-1">{testResponse}</span>}
      </div>
      {response && <div className="mt-4 p-3 bg-white rounded-lg text-sm border border-indigo-50"><strong>Tutor:</strong> {response}</div>}
    </div>
  );
};

const LandingPage = ({ onGetStarted }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = ['Learn DSA by visualizing code', "Don't memorize, visualize", 'Master algorithms step by step'];

  useEffect(() => {
    const interval = setInterval(() => setMessageIndex((prev) => (prev + 1) % messages.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 text-center">
      <div className="max-w-2xl">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">Welcome to <span className="text-blue-600">CodeFlux</span></h1>
        <div className="h-20 flex items-center justify-center">
          <p className="text-2xl text-gray-600 transition-opacity duration-500">{messages[messageIndex]}</p>
        </div>
        <button onClick={onGetStarted} className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 shadow-lg transform hover:scale-105 transition-all">
          Get Started
        </button>
      </div>
    </div>
  );
};

const PatternCardsPage = ({ patterns, onPatternSelect, onBack }) => (
  <div className="min-h-screen bg-gray-50 py-8 px-4 text-left">
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold text-gray-800">DSA Patterns</h2>
        <button onClick={onBack} className="text-blue-600 font-semibold">← Home</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patterns.map((p) => (
          <div key={p.id} onClick={() => onPatternSelect(p)} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 cursor-pointer border border-gray-200 hover:border-blue-400">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><StickyNote size={16} className="text-gray-400" />{p.name}</h3>
              <span className={`${difficultyBadge(p.difficulty).bg} ${difficultyBadge(p.difficulty).text} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide`}>
                {p.difficulty || 'N/A'}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{p.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400 font-bold uppercase">{getPatternProgress(p.id).replace('-', ' ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PatternOverview = ({ pattern, onContinue, onBack }) => (
  <div className="min-h-screen bg-gray-50 py-10 px-4 text-left">
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6">
      <button onClick={onBack} className="text-blue-600 font-semibold">← Back</button>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h2 className="text-4xl font-bold text-gray-800 flex items-center gap-3"><StickyNote size={20} className="text-gray-400" />{pattern.name}</h2>
        <span className={`${difficultyBadge(pattern.difficulty).bg} ${difficultyBadge(pattern.difficulty).text} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide`}>
          {pattern.difficulty || 'N/A'}
        </span>
      </div>
      <div className="space-y-4 text-gray-600">
        <p><strong>What:</strong> {pattern.overview?.what}</p>
        <p><strong>When:</strong> {pattern.overview?.when}</p>
        <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">{pattern.overview?.complexity}</div>
        {pattern.detect && (
          <div className="bg-blue-50 border border-blue-100 text-blue-900 p-4 rounded-lg text-sm">
            <strong>How to detect:</strong> {pattern.detect}
          </div>
        )}
        {pattern.mistakes && pattern.mistakes.length > 0 && (
          <div className="bg-red-50 border border-red-100 text-red-900 p-4 rounded-lg text-sm space-y-2">
            <strong>Common mistakes:</strong>
            <ul className="list-disc list-inside space-y-1">
              {pattern.mistakes.map((m, idx) => <li key={idx}>{m}</li>)}
            </ul>
          </div>
        )}
        {pattern.tips && (
          <div className="bg-green-50 border border-green-100 text-green-900 p-4 rounded-lg text-sm">
            <strong>Tips:</strong> {pattern.tips}
          </div>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          {pattern.problems && (
            <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg text-sm">
              <div className="font-semibold mb-1">Suggested LeetCode</div>
              <ul className="list-disc list-inside space-y-1">
                {pattern.problems.map((p, idx) => <li key={idx}>{p}</li>)}
              </ul>
            </div>
          )}
          {pattern.video && (
            <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg text-sm">
              <div className="font-semibold mb-1">Recommended Video</div>
              <a className="text-blue-600 underline" href={pattern.video} target="_blank" rel="noreferrer">{pattern.video}</a>
            </div>
          )}
        </div>
      </div>
      <button onClick={onContinue} className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
        Continue to Inputs →
      </button>
    </div>
  </div>
);

const InputConfiguration = ({ pattern, onProceed, onBack }) => {
  const [inputs, setInputs] = useState(pattern.defaultInputs);
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 text-left">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <button onClick={onBack} className="mb-4 text-blue-600">← Back</button>
        <h2 className="text-3xl font-bold mb-6">Setup Inputs</h2>
        {Object.keys(inputs).map(key => (
          <div key={key} className="mb-4">
            <label className="block font-bold mb-2 capitalize">{key}</label>
            <input 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none" 
              value={inputs[key]} 
              onChange={(e) => setInputs({...inputs, [key]: e.target.value})}
            />
          </div>
        ))}
        <button onClick={() => onProceed(inputs)} className="w-full bg-blue-600 text-white py-3 rounded-lg mt-4 font-bold flex items-center justify-center gap-2">
          Start Visualization <ChevronRight size={18}/>
        </button>
      </div>
    </div>
  );
};

const VisualizationPage = ({ pattern, inputs, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState("explain"); // "explain" | "apply"
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizSelections, setQuizSelections] = useState([]);
  const [quizFeedback, setQuizFeedback] = useState("");
  const [selectedLang, setSelectedLang] = useState("javascript");
  const codeByLanguage = pattern.codeByLanguage || {};
  const languages = Object.keys(codeByLanguage).length ? Object.keys(codeByLanguage) : ["javascript"];
  const codeSteps = codeByLanguage[selectedLang] || pattern.codeSteps || [];
  const vizSteps = pattern.steps || [];
  const quiz = pattern.quiz || [quizForPattern(pattern)];

  const arrInput = inputs?.array;
  const arr = arrInput ? JSON.parse(arrInput || "[]") : [];
  const k = Number(inputs?.k || 1) || 1;

  useEffect(() => {
    setQuizSelections(Array(quiz.length).fill(null));
  }, [quiz.length]);

  useEffect(() => {
    const first = languages[0];
    setSelectedLang(first || "javascript");
  }, [pattern.id]);

  useEffect(() => {
    if (!isPlaying) return;
    const delay = 1200;
    const timer = setTimeout(() => {
      if (phase === "explain") {
        setPhase("apply");
        return;
      }
      // phase === apply
      if (currentStep < codeSteps.length - 1) {
        setCurrentStep((prev) => prev + 1);
        setPhase("explain");
      } else {
        setPatternProgress(pattern.id, 'completed');
        setIsPlaying(false);
        setShowQuiz(true);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [isPlaying, phase, currentStep, codeSteps.length, pattern.id]);

  const revealStep = () => setPhase("apply");
  const nextStep = () => {
    if (currentStep < codeSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setPhase("explain");
    } else {
      setPhase("apply");
      setIsPlaying(false);
      setPatternProgress(pattern.id, 'completed');
      setShowQuiz(true);
    }
  };

  const restart = () => {
    setCurrentStep(0);
    setPhase("explain");
    setIsPlaying(false);
    setShowQuiz(false);
    setQuizSubmitted(false);
    setQuizSelections(Array(quiz.length).fill(null));
    setQuizFeedback("");
  };

  const startAnimation = () => {
    setIsPlaying(true);
    setPhase("explain");
  };

  const submitQuiz = () => {
    const unanswered = quizSelections.some((s) => s === null);
    if (unanswered) {
      setQuizFeedback("Answer all questions to submit.");
      return;
    }
    const score = quizSelections.reduce((acc, sel, idx) => acc + (sel === quiz[idx].correct ? 1 : 0), 0);
    setQuizSubmitted(true);
    setQuizFeedback(`You scored ${score}/${quiz.length}. ${score === quiz.length ? "Great job!" : "Review and retry if needed."}`);
    setPatternProgress(pattern.id, 'completed');
    localStorage.setItem(`pattern_quiz_score_${pattern.id}`, `${score}/${quiz.length}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 text-left">
      <div className="max-w-7xl mx-auto">
        <button onClick={onBack} className="text-blue-600 font-semibold mb-6">← Back</button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-gray-900 rounded-xl p-6 text-white shadow-2xl overflow-x-auto">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h3 className="text-xl font-bold flex items-center gap-2"><Play size={18}/> Live Code</h3>
                <div className="flex gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                        selectedLang === lang ? "border-yellow-400 bg-yellow-500 text-black" : "border-gray-700 bg-gray-800 text-gray-200"
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs text-gray-300 mb-1">Scratch pad (edit code here)</label>
                <textarea
                  className="w-full h-28 p-3 rounded-lg bg-gray-800 border border-gray-700 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                  defaultValue={codeSteps.map((c) => c.code).join('\n')}
                  readOnly
                />
                <button className="mt-2 bg-gray-700 text-white px-3 py-2 rounded-lg text-xs opacity-70 cursor-not-allowed">
                  TODO: Re-run visualization from edited code
                </button>
              </div>
              <pre className="font-mono text-sm leading-relaxed">
                {codeSteps.map((step, idx) => (
                  <div key={idx} className={`p-1 rounded ${phase === "apply" && idx === currentStep ? 'bg-yellow-500 text-black' : ''}`}>
                    {step.code}
                  </div>
                ))}
              </pre>
            </div>
            <GeminiTutor currentStep={currentStep} patternName={pattern.name} codeSnippet={codeSteps[currentStep]?.code} />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-2xl font-bold mb-6">Visualization</h3>
            {vizSteps[currentStep] && (
              <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded animate-fade-in">
                <p className="font-bold text-blue-800">{vizSteps[currentStep].popup}</p>
                <p className="text-sm text-gray-600 mt-1">{vizSteps[currentStep].reason}</p>
              </div>
            )}
            {phase === "apply" && arr.length > 0 && (
              <div className="flex gap-3 mb-8 overflow-x-auto p-2">
                {arr.map((val, idx) => (
                  <div key={idx} className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-lg font-bold text-xl transition-all duration-300 ${
                    idx >= currentStep - k + 1 && idx <= currentStep ? 'bg-blue-600 text-white scale-110 shadow-lg' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {val}
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <button onClick={startAnimation} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold">Start Animation</button>
              <button onClick={restart} className="bg-gray-200 px-6 py-3 rounded-lg"><RotateCcw /></button>
              {phase === "explain" && (
                <button onClick={revealStep} className="bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold">
                  Reveal code & state
                </button>
              )}
              {phase === "apply" && (
                <button onClick={nextStep} className="bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold">
                  Next step
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {showQuiz && (
        <div className="max-w-3xl mx-auto mt-8 bg-white shadow-lg border border-gray-100 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3 text-gray-800 font-bold text-lg">
            <MessageSquare size={18} /> Quick Check
          </div>
          <div className="space-y-4">
            {quiz.map((q, qIdx) => (
              <div key={qIdx} className="border border-gray-100 rounded-lg p-3">
                <p className="text-gray-800 font-semibold mb-2">{q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const selected = quizSelections[qIdx] === optIdx;
                    const correct = q.correct === optIdx;
                    const showResult = quizSubmitted;
                    const base = "w-full text-left px-4 py-2 rounded-lg border transition";
                    const stateClass = showResult
                      ? correct
                        ? "border-green-400 bg-green-50"
                        : selected
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200"
                      : selected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300";
                    return (
                      <button
                        key={optIdx}
                        onClick={() => {
                          if (quizSubmitted) return;
                          const next = [...quizSelections];
                          next[qIdx] = optIdx;
                          setQuizSelections(next);
                        }}
                        className={`${base} ${stateClass}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {quizSubmitted && q.explanation && (
                  <div className="mt-2 text-xs text-gray-600">Note: {q.explanation}</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button onClick={submitQuiz} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold">
              Submit Quiz
            </button>
            {quizFeedback && (
              <div className="text-sm font-semibold text-gray-800">{quizFeedback}</div>
            )}
          </div>
        </div>
      )}
      <FloatingNotepad patternId={pattern.id} />
    </div>
  );
};

// ==================== MAIN APP ====================

export default function App() {
  const [view, setView] = useState('landing');
  const [patterns, setPatterns] = useState([]);
  const [selected, setSelected] = useState(null);
  const [inputs, setInputs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPatterns = async () => {
      try {
        const patternModules = import.meta.glob('./data/patterns/*.json');
        const loaded = await Promise.all(
          Object.entries(patternModules).map(async ([path, loader]) => {
            const mod = await loader();
            const idFromFile = path.split('/').pop().replace('.json', '');
            return { id: mod.default?.id || idFromFile, ...mod.default };
          })
        );
        setPatterns(loaded.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) { console.error("File loading error:", err); }
      finally { setLoading(false); }
    };
    loadPatterns();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-blue-600">Loading CodeFlux...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {view === 'landing' && <LandingPage onGetStarted={() => setView('patterns')} />}
      
      {view === 'patterns' && (
        <PatternCardsPage 
          patterns={patterns} 
          onPatternSelect={(p) => { setSelected(p); setView('overview'); }} 
          onBack={() => setView('landing')} 
        />
      )}
      
      {view === 'overview' && (
        <PatternOverview 
          pattern={selected} 
          onContinue={() => setView('input')} 
          onBack={() => setView('patterns')} 
        />
      )}
      
      {view === 'input' && (
        <InputConfiguration 
          pattern={selected} 
          onProceed={(i) => { setInputs(i); setPatternProgress(selected.id, 'in-progress'); setView('visualization'); }} 
          onBack={() => setView('overview')} 
        />
      )}
      
      {view === 'visualization' && (
        <VisualizationPage 
          pattern={selected} 
          inputs={inputs} 
          onBack={() => setView('input')} 
        />
      )}
    </div>
  );
}