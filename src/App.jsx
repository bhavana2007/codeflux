import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, MessageSquare, ExternalLink, ChevronRight, X } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";


// ==================== CONFIGURATION ====================
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);


// Ensure these IDs match your filenames in src/data/patterns/ (e.g., slidingWindow.json)
const ENABLED_PATTERN_IDS = ['slidingWindow']; 

// ==================== UTILITY FUNCTIONS ====================
const getPatternProgress = (id) => localStorage.getItem(`pattern_progress_${id}`) || 'yet-to-start';
const setPatternProgress = (id, status) => localStorage.setItem(`pattern_progress_${id}`, status);

// ==================== COMPONENTS ====================

const GeminiTutor = ({ currentStep, codeSnippet, patternName }) => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const askTutor = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Tutor for ${patternName}. Step ${currentStep}: ${codeSnippet}. Question: ${query}`;
      const result = await model.generateContent(prompt);
      setResponse(result.response.text());
    } catch (err) { setResponse("AI connection failed."); }
    finally { setLoading(false); }
  };

  return (
    <div className="mt-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-left">
      <div className="flex items-center gap-2 mb-3 text-indigo-700 font-bold"><MessageSquare size={18}/> Gemini Tutor</div>
      <div className="flex gap-2">
        <input value={query} onChange={(e)=>setQuery(e.target.value)} className="flex-1 p-2 rounded-lg border text-sm" placeholder="Ask a doubt..." />
        <button onClick={askTutor} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">{loading ? "..." : "Ask"}</button>
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
            <h3 className="text-xl font-bold text-gray-800 mb-2">{p.name}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{p.description}</p>
            <div className="flex justify-between items-center">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Standard</span>
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
      <h2 className="text-4xl font-bold text-gray-800">{pattern.name}</h2>
      <div className="space-y-4 text-gray-600">
        <p><strong>What:</strong> {pattern.overview?.what}</p>
        <p><strong>When:</strong> {pattern.overview?.when}</p>
        <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">{pattern.overview?.complexity}</div>
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
  const codeSteps = pattern.codeSteps || [];
  const vizSteps = pattern.steps || [];

  const arr = JSON.parse(inputs.array || "[]");
  const k = parseInt(inputs.k || "3");

  useEffect(() => {
    let interval;
    if (isPlaying && currentStep < codeSteps.length - 1) {
      interval = setInterval(() => setCurrentStep(prev => prev + 1), 1500);
    } else {
      setIsPlaying(false);
      if (currentStep === codeSteps.length - 1) setPatternProgress(pattern.id, 'completed');
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, codeSteps.length]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 text-left">
      <div className="max-w-7xl mx-auto">
        <button onClick={onBack} className="text-blue-600 font-semibold mb-6">← Back</button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-gray-900 rounded-xl p-6 text-white shadow-2xl overflow-x-auto">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Play size={18}/> Live Code</h3>
              <pre className="font-mono text-sm leading-relaxed">
                {codeSteps.map((step, idx) => (
                  <div key={idx} className={`p-1 rounded ${idx === currentStep ? 'bg-yellow-500 text-black' : ''}`}>
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
            <div className="flex gap-3 mb-8 overflow-x-auto p-2">
              {arr.map((val, idx) => (
                <div key={idx} className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-lg font-bold text-xl transition-all duration-300 ${
                  idx >= currentStep - k + 1 && idx <= currentStep ? 'bg-blue-600 text-white scale-110 shadow-lg' : 'bg-gray-100 text-gray-400'
                }`}>
                  {val}
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsPlaying(true)} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold">Start Animation</button>
              <button onClick={() => setCurrentStep(0)} className="bg-gray-200 px-6 py-3 rounded-lg"><RotateCcw /></button>
            </div>
          </div>
        </div>
      </div>
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
        const loaded = await Promise.all(
          ENABLED_PATTERN_IDS.map(async (id) => {
            const module = await import(`./data/patterns/${id}.json`);
            return { ...module.default, id };
          })
        );
        setPatterns(loaded);
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