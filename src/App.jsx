import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, RotateCcw, MessageSquare, ExternalLink, ChevronRight, X, StickyNote } from 'lucide-react';

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
  
  // Define question pools for each pattern
  const questionPools = {
    slidingWindow: [
      {
        question: "When should you shrink the sliding window?",
        options: ["Always", "When constraint is violated", "Never - only expand", "Only at the end"],
        correct: 1,
      },
      {
        question: "What does the window size represent in sliding window?",
        options: ["Current array length", "Maximum valid subarray found", "Number of elements being considered", "Index positions only"],
        correct: 2,
      },
      {
        question: "Sliding window is most useful for:",
        options: ["Sorting algorithms", "Finding subarrays with constraints", "Binary search problems", "Tree traversals"],
        correct: 1,
      },
      {
        question: "What maintains the window boundaries?",
        options: ["Single pointer", "Two pointers (left and right)", "Array indices only", "Hash map"],
        correct: 1,
      }
    ],
    twoPointers: [
      {
        question: "Two pointers work best when:",
        options: ["Data is unsorted", "Data is sorted or has order", "Data contains duplicates only", "Data is random"],
        correct: 1,
      },
      {
        question: "In two pointers for sorted arrays, when sum > target:",
        options: ["Move left pointer right", "Move right pointer left", "Move both pointers", "Do nothing"],
        correct: 1,
      },
      {
        question: "Two pointers can solve:",
        options: ["Only sum problems", "Pair finding, palindrome checks, etc.", "Only sorting", "Only searching"],
        correct: 1,
      },
      {
        question: "When should you stop moving pointers?",
        options: ["When pointers cross", "When sum equals target", "When one pointer reaches end", "Never stop"],
        correct: 0,
      }
    ],
    prefixSum: [
      {
        question: "Prefix sum allows range queries in:",
        options: ["O(n) time", "O(log n) time", "O(1) time after preprocessing", "O(n²) time"],
        correct: 2,
      },
      {
        question: "Prefix sum is most useful for:",
        options: ["Single element access", "Frequent range sum queries", "Sorting arrays", "Finding maximum element"],
        correct: 1,
      },
      {
        question: "What does prefix[i] store?",
        options: ["Element at index i", "Sum from 0 to i-1", "Sum from 0 to i", "Difference between elements"],
        correct: 2,
      },
      {
        question: "Prefix sum preprocessing takes:",
        options: ["O(1) time", "O(log n) time", "O(n) time", "O(n²) time"],
        correct: 2,
      }
    ],
    hashing: [
      {
        question: "Hashing provides average case:",
        options: ["O(n) lookups", "O(log n) lookups", "O(1) lookups", "O(n²) lookups"],
        correct: 2,
      },
      {
        question: "Hashing is ideal for:",
        options: ["Range queries", "Frequency counting", "Sorting", "Binary search"],
        correct: 1,
      },
      {
        question: "What happens in hash collisions?",
        options: ["Program crashes", "Wrong results", "Handled by chaining/open addressing", "Data is lost"],
        correct: 2,
      },
      {
        question: "Hash maps are good for:",
        options: ["Ordered data only", "Key-value lookups", "Sequential access", "Mathematical computations"],
        correct: 1,
      }
    ],
    kadanesAlgorithm: [
      {
        question: "Kadane's algorithm finds:",
        options: ["Minimum subarray sum", "Maximum subarray sum", "Median of array", "Sorted subarray"],
        correct: 1,
      },
      {
        question: "Kadane's handles negative numbers by:",
        options: ["Ignoring them", "Starting fresh when sum becomes negative", "Converting to positive", "Using absolute values"],
        correct: 1,
      },
      {
        question: "Kadane's time complexity is:",
        options: ["O(n²)", "O(n log n)", "O(n)", "O(1)"],
        correct: 2,
      },
      {
        question: "Kadane's space complexity is:",
        options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
        correct: 2,
      }
    ],
    fastSlowPointer: [
      {
        question: "Fast & slow pointers detect:",
        options: ["Duplicates", "Sorted order", "Cycles in linked lists", "Maximum element"],
        correct: 2,
      },
      {
        question: "In cycle detection, fast moves:",
        options: ["1 step at a time", "2 steps at a time", "3 steps at a time", "Same speed as slow"],
        correct: 1,
      },
      {
        question: "When fast and slow meet:",
        options: ["Cycle is confirmed", "No cycle exists", "Array is sorted", "Maximum is found"],
        correct: 0,
      },
      {
        question: "This pattern also finds:",
        options: ["Middle of linked list", "Duplicates in array", "Both A and B", "Neither"],
        correct: 2,
      }
    ],
    hashingFrequency: [
      {
        question: "Frequency counting is useful for:",
        options: ["Finding unique elements", "Top K frequent items", "Both A and B", "Neither"],
        correct: 2,
      },
      {
        question: "Most frequent element can be found in:",
        options: ["O(n²) time", "O(n log n) time", "O(n) time using hash map", "O(1) time"],
        correct: 2,
      },
      {
        question: "Frequency maps help with:",
        options: ["Sorting", "Anagram detection", "Duplicate finding", "All of the above"],
        correct: 3,
      },
      {
        question: "Space complexity for frequency counting:",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correct: 2,
      }
    ]
  };

  // Get the question pool for this pattern
  const patternQuestions = questionPools[pattern.id] || [
    {
      question: `What is the key idea of ${name}?`,
      options: [
        "Use brute force over all possibilities",
        "Maintain a focused view (window/pointers/prefix) to optimize",
        "Sort and binary search only"
      ],
      correct: 1,
    }
  ];

  // Return a random question from the pool
  const randomIndex = Math.floor(Math.random() * patternQuestions.length);
  return patternQuestions[randomIndex];
};

const FloatingNotepad = ({ patternId, onClose, isOpen }) => {
  const [note, setNote] = useState("");

  useEffect(() => {
    setNote(getPatternNote(patternId));
  }, [patternId]);

  useEffect(() => {
    // Auto-save notes
    const timeoutId = setTimeout(() => {
      setPatternNote(patternId, note);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [note, patternId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="bg-gradient-to-r from-slate-700/80 to-slate-600/80 px-6 py-4 rounded-t-2xl flex items-center justify-between border-b border-slate-600/50">
          <div className="flex items-center gap-3 text-white">
            <StickyNote size={20} className="text-blue-400" />
            <span className="font-bold text-lg">Pattern Notes</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-full p-6 bg-transparent border-0 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-0 resize-none text-base leading-relaxed"
            placeholder="Write your notes for this pattern here..."
          />
        </div>
      </div>
    </div>
  );
};

// ==================== FLUXY CHAT PLACEHOLDER ====================

const FluxyChat = () => {
  return (
    <div className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50 cursor-pointer">
      <MessageSquare size={20} />
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Chat with Fluxy (Coming Soon)
      </div>
    </div>
  );
};

// ==================== COMPONENTS ====================

const LandingPage = ({ onGetStarted }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = ['Learn DSA by visualizing code', "Don't memorize, visualize", 'Master algorithms step by step'];

  useEffect(() => {
    const interval = setInterval(() => setMessageIndex((prev) => (prev + 1) % messages.length), 3000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 text-center overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/assets/videos/welcome.mp4" type="video/mp4" />
      </video>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl">
        <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">Welcome to <span className="text-blue-400">CodeFlux</span></h1>
        <div className="h-20 flex items-center justify-center">
          <p className="text-2xl text-white transition-opacity duration-500 drop-shadow-lg">{messages[messageIndex]}</p>
        </div>
        <button onClick={onGetStarted} className="mt-8 bg-blue-600/90 backdrop-blur-sm text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-500/90 shadow-lg transform hover:scale-105 transition-all border border-blue-400/50">
          Get Started
        </button>
      </div>
    </div>
  );
};

const VideoPreview = ({ patternId }) => {
  const [videoExists, setVideoExists] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleError = () => {
    setVideoExists(false);
  };

  return (
    <div className="mb-4 bg-slate-700 rounded-lg border-2 border-dashed border-slate-600 relative overflow-hidden" style={{ minHeight: '120px' }}>
      {videoExists ? (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-cover rounded-lg"
            muted
            loop
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onError={handleError}
          >
            <source src={`/assets/videos/${patternId}.mp4`} type="video/mp4" />
          </video>
          {!isHovered && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Play size={24} className="text-slate-400" />
            </div>
          )}
        </>
      ) : (
        <div className="p-4 flex items-center justify-center">
          <div className="text-center">
            <Play size={24} className="text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Preview Animation</p>
          </div>
        </div>
      )}
    </div>
  );
};

const PatternCardsPage = ({ patterns, onPatternSelect, onBack }) => {
  const [openNoteFor, setOpenNoteFor] = useState(null);
  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 text-left">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold text-white">DSA Patterns</h2>
          <button onClick={onBack} className="text-blue-400 font-semibold hover:text-blue-300">← Home</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patterns.map((p) => (
            <div key={p.id} onClick={() => onPatternSelect(p)} className="bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-all p-6 cursor-pointer border border-slate-700 hover:border-blue-400 relative">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">{p.name}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenNoteFor(p.id); }}
                    aria-label={`Open notes for ${p.name}`}
                    className="p-1 rounded hover:bg-slate-700"
                  >
                    <StickyNote size={16} className="text-slate-400" />
                  </button>
                  <span className={`${difficultyBadge(p.difficulty).bg} ${difficultyBadge(p.difficulty).text} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide`}>
                    {p.difficulty || 'N/A'}
                  </span>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-4 line-clamp-2">{p.description}</p>

              <VideoPreview patternId={p.id} />

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-bold uppercase">{getPatternProgress(p.id).replace('-', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
        {openNoteFor && <FloatingNotepad patternId={openNoteFor} onClose={() => setOpenNoteFor(null)} />}
      </div>
    </div>
  );
};

const PatternOverview = ({ pattern, onContinue, onBack }) => (
  <div className="min-h-screen bg-slate-900 py-10 px-4 text-left">
    <div className="max-w-4xl mx-auto bg-slate-800 rounded-2xl shadow-xl p-8 space-y-6">
      <button onClick={onBack} className="text-blue-400 font-semibold hover:text-blue-300">← Back</button>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h2 className="text-4xl font-bold text-white flex items-center gap-3"><StickyNote size={20} className="text-slate-400" />{pattern.name}</h2>
        <span className={`${difficultyBadge(pattern.difficulty).bg} ${difficultyBadge(pattern.difficulty).text} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide`}>
          {pattern.difficulty || 'N/A'}
        </span>
      </div>

      {/* Intro animation/video */}
      <div className="mb-6">
        <video
          className="w-full max-w-md mx-auto rounded-lg shadow-lg border border-slate-600"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={`/assets/videos/${pattern.id}.mp4`} type="video/mp4" />
          {/* Fallback */}
          <div className="w-full h-48 bg-slate-700 rounded-lg flex items-center justify-center">
            <div className="text-center text-slate-400">
              <Play size={48} className="mx-auto mb-2" />
              <p>Pattern Introduction</p>
            </div>
          </div>
        </video>
      </div>

      <div className="space-y-4 text-slate-200">
        <p><strong className="text-blue-400">What:</strong> {pattern.overview?.what}</p>
        <p><strong className="text-green-400">When:</strong> {pattern.overview?.when}</p>
        <div className="bg-slate-700 p-4 rounded-lg font-mono text-sm text-slate-200 border border-slate-600">{pattern.overview?.complexity}</div>
      </div>

      <button onClick={onContinue} className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-500 transition-colors">
        Continue to Theory →
      </button>
    </div>
  </div>
);

// Utility function to generate random examples based on pattern
const generateRandomExamples = (pattern) => {
  const examples = [];
  
  if (pattern.id === 'slidingWindow') {
    // Generate different arrays and window sizes
    examples.push({
      label: "Example 1: Small window",
      array: "[1, 3, 2, 6, -1, 4, 1, 8, 2]",
      k: "3"
    });
    examples.push({
      label: "Example 2: Larger window", 
      array: "[2, 1, 5, 1, 3, 2, 4, 1, 2, 1]",
      k: "4"
    });
    examples.push({
      label: "Example 3: Edge case",
      array: "[4, 2, 1, 7, 8, 1, 2, 8, 1, 0]",
      k: "2"
    });
  } else if (pattern.id === 'twoPointers') {
    // Generate sorted arrays with different targets
    examples.push({
      label: "Example 1: Simple case",
      array: "[2, 7, 11, 15]",
      target: "9"
    });
    examples.push({
      label: "Example 2: Multiple pairs",
      array: "[1, 2, 3, 4, 5, 6, 7]",
      target: "8"
    });
    examples.push({
      label: "Example 3: Larger numbers",
      array: "[10, 20, 30, 40, 50, 60]",
      target: "70"
    });
  } else if (pattern.id === 'kadanesAlgorithm') {
    // Generate arrays with different patterns
    examples.push({
      label: "Example 1: Mixed positive/negative",
      array: "[-2, 1, -3, 4, -1, 2, 1, -5, 4]"
    });
    examples.push({
      label: "Example 2: All negative",
      array: "[-8, -3, -6, -2, -5, -4]"
    });
    examples.push({
      label: "Example 3: All positive",
      array: "[1, 2, 3, 4, 5, 6, 7, 8, 9]"
    });
  } else if (pattern.id === 'fastSlowPointer') {
    // Generate arrays with cycles or linked list representations
    examples.push({
      label: "Example 1: Simple cycle",
      array: "[3, 2, 0, -4]",
      cycleStart: "1"
    });
    examples.push({
      label: "Example 2: Longer cycle",
      array: "[1, 2, 3, 4, 5, 6, 7, 8]",
      cycleStart: "3"
    });
    examples.push({
      label: "Example 3: No cycle",
      array: "[1, 2, 3, 4, 5]",
      cycleStart: "-1"
    });
  } else if (pattern.id === 'prefixSum') {
    // Generate arrays for range sum queries
    examples.push({
      label: "Example 1: Range queries",
      array: "[1, 3, 5, 7, 9, 11]",
      queries: "[[1, 3], [2, 5], [0, 2]]"
    });
    examples.push({
      label: "Example 2: Subarray sums",
      array: "[-1, 2, -3, 4, -5, 6]",
      queries: "[[0, 2], [3, 5], [1, 4]]"
    });
    examples.push({
      label: "Example 3: Large range",
      array: "[10, 20, 30, 40, 50, 60, 70]",
      queries: "[[0, 6], [2, 4], [1, 3]]"
    });
  } else if (pattern.id === 'hashing') {
    // Generate arrays/strings for frequency/hash problems
    examples.push({
      label: "Example 1: Frequency count",
      array: "[1, 2, 2, 3, 3, 3, 4]"
    });
    examples.push({
      label: "Example 2: String characters",
      string: "hello world"
    });
    examples.push({
      label: "Example 3: Mixed data",
      array: "[5, 1, 5, 2, 1, 5, 3, 2]"
    });
  } else if (pattern.id === 'hashingFrequency') {
    // Similar to hashing but focused on frequency
    examples.push({
      label: "Example 1: Top K frequent",
      array: "[1, 1, 1, 2, 2, 3]",
      k: "2"
    });
    examples.push({
      label: "Example 2: Frequency sort",
      array: "[4, 4, 4, 2, 2, 1, 1, 1, 1]"
    });
    examples.push({
      label: "Example 3: Unique elements",
      array: "[1, 2, 3, 4, 5, 6, 7]"
    });
  } else {
    // Fallback to default examples
    examples.push({ label: "Example 1", ...pattern.defaultInputs });
    examples.push({ label: "Example 2", ...pattern.defaultInputs });
    examples.push({ label: "Example 3", ...pattern.defaultInputs });
  }
  
  return examples;
};

const InputConfiguration = ({ pattern, onProceed, onBack }) => {
  const [inputs, setInputs] = useState(pattern.defaultInputs);

  const exampleInputs = generateRandomExamples(pattern);

  const applyExample = (example) => {
    setInputs({ ...example });
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 text-left">
      <div className="max-w-2xl mx-auto bg-slate-800 p-8 rounded-xl shadow-lg">
        <button onClick={onBack} className="mb-4 text-blue-400 hover:text-blue-300">← Back to Theory</button>
        <h2 className="text-3xl font-bold mb-6 text-white">Setup Inputs</h2>

        {/* Example input chips */}
        <div className="mb-6">
          <h3 className="text-slate-300 mb-3">Quick Examples:</h3>
          <div className="flex flex-wrap gap-2">
            {exampleInputs.map((example, idx) => (
              <button
                key={idx}
                onClick={() => applyExample(example)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg text-sm border border-slate-600 transition-colors"
              >
                {example.label || `Example ${idx + 1}`}
              </button>
            ))}
          </div>
        </div>

        {Object.keys(inputs).map(key => (
          <div key={key} className="mb-4">
            <label className="block font-bold mb-2 text-slate-200 capitalize">{key}</label>
            <input
              className="w-full p-2 border border-slate-600 rounded focus:ring-2 focus:ring-blue-400 outline-none bg-slate-700 text-white placeholder-slate-400"
              value={inputs[key]}
              onChange={(e) => setInputs({...inputs, [key]: e.target.value})}
            />
          </div>
        ))}
        <button onClick={() => onProceed(inputs)} className="w-full bg-blue-600 text-white py-3 rounded-lg mt-4 font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-colors">
          Next: Visualization <ChevronRight size={18}/>
        </button>
      </div>
    </div>
  );
};

const TheoryPage = ({ pattern, onProceed, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-900 py-10 px-4 text-left">
      <div className="max-w-4xl mx-auto bg-slate-800 rounded-2xl shadow-xl p-8 space-y-6">
        <button onClick={onBack} className="text-blue-400 font-semibold hover:text-blue-300">← Back</button>
        <h2 className="text-4xl font-bold text-white">Theory & Algorithm</h2>
        <div className="prose text-slate-200 max-w-none">
          <div className="bg-slate-700 p-6 rounded-lg mb-6">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">What is {pattern.name}?</h3>
            <p className="text-lg leading-relaxed">{pattern.overview?.what}</p>
          </div>

          <div className="bg-slate-700 p-6 rounded-lg mb-6">
            <h3 className="text-2xl font-bold text-green-400 mb-4">When to Use It</h3>
            <p className="text-lg leading-relaxed">{pattern.overview?.when}</p>
          </div>

          <div className="bg-slate-700 p-6 rounded-lg mb-6">
            <h3 className="text-2xl font-bold text-yellow-400 mb-4">Algorithm Story</h3>
            <div className="space-y-4">
              {pattern.steps && pattern.steps.length > 0 ? (
                pattern.steps.map((step, i) => (
                  <div key={i} className="border-l-4 border-blue-400 pl-6 py-4 bg-slate-600 rounded-r-lg">
                    <h4 className="text-xl font-semibold text-blue-300 mb-2">Step {i + 1}: {step.popup}</h4>
                    <p className="text-slate-200 leading-relaxed">{step.reason}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-300">Algorithm steps will be visualized in the next section.</p>
              )}
            </div>
          </div>

          <div className="bg-slate-700 p-6 rounded-lg">
            <h3 className="text-2xl font-bold text-purple-400 mb-4">Complexity</h3>
            <pre className="bg-slate-600 p-4 rounded text-slate-200 font-mono text-sm border border-slate-500">{pattern.overview?.complexity}</pre>
          </div>

          {pattern.tips && (
            <div className="bg-slate-700 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-orange-400 mb-4">Pro Tips</h3>
              <p className="text-lg leading-relaxed text-slate-200">{pattern.tips}</p>
            </div>
          )}
        </div>

        <button onClick={onProceed} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-colors">
          Setup Inputs <ChevronRight size={18}/>
        </button>
      </div>
    </div>
  );
};

const QuizPage = ({ pattern, onBack }) => {
  const quiz = useMemo(() => pattern.postQuestion ? [pattern.postQuestion] : (pattern.quiz || [quizForPattern(pattern)]), [pattern]);
  const [selections, setSelections] = useState(() => Array(quiz.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');

  const submit = () => {
    if (selections.some((s) => s === null)) {
      setFeedback('Please answer all questions before submitting.');
      return;
    }
    const score = selections.reduce((acc, sel, idx) => acc + (sel === quiz[idx].correct ? 1 : 0), 0);
    setSubmitted(true);
    const percentage = Math.round((score / quiz.length) * 100);
    setFeedback(`You scored ${score}/${quiz.length} (${percentage}%) ${score === quiz.length ? '🎉 Perfect!' : score >= quiz.length * 0.7 ? '👍 Good job!' : '📚 Keep practicing!'}`);
  };

  const retakeQuiz = () => {
    setSelections(Array(quiz.length).fill(null));
    setSubmitted(false);
    setFeedback('');
  };

  return (
    <div className="min-h-screen bg-slate-900 py-10 px-4 text-left">
      <div className="max-w-3xl mx-auto bg-slate-800 rounded-2xl shadow-xl p-8 space-y-6 border border-slate-700">
        <button onClick={onBack} className="text-blue-400 font-semibold hover:text-blue-300">← Back</button>
        <h2 className="text-2xl font-bold text-white">Quick Check</h2>
        <div className="space-y-4">
          {quiz.map((q, qi) => (
            <div key={qi} className="border border-slate-600 p-4 rounded-lg bg-slate-700">
              <div className="font-semibold mb-3 text-slate-200">{q.question}</div>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const selected = selections[qi] === oi;
                  const correct = q.correct === oi;
                  const showResult = submitted;
                  const base = "w-full text-left px-4 py-3 rounded-lg border transition-all duration-200";
                  const stateClass = showResult
                    ? correct
                      ? "border-green-400 bg-green-900 text-green-300"
                      : selected
                        ? "border-red-400 bg-red-900 text-red-300"
                        : "border-slate-600 bg-slate-600 text-slate-400"
                    : selected
                      ? "border-blue-400 bg-blue-900 text-blue-300"
                      : "border-slate-600 bg-slate-600 text-slate-200 hover:border-slate-500 hover:bg-slate-500";
                  return (
                    <button
                      key={oi}
                      onClick={() => {
                        if (submitted) return;
                        const next = [...selections];
                        next[qi] = oi;
                        setSelections(next);
                      }}
                      className={`${base} ${stateClass}`}
                      disabled={submitted}
                    >
                      {opt}
                      {showResult && correct && <span className="ml-2 text-green-400">✓</span>}
                      {showResult && selected && !correct && <span className="ml-2 text-red-400">✗</span>}
                    </button>
                  );
                })}
              </div>
              {submitted && q.explanation && (
                <div className="mt-3 text-sm text-slate-400 bg-slate-800 p-3 rounded border border-slate-600">{q.explanation}</div>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {!submitted ? (
            <button onClick={submit} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Submit Quiz
            </button>
          ) : (
            <button onClick={retakeQuiz} className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Retake Quiz
            </button>
          )}
          {feedback && (
            <div className={`text-sm font-semibold px-4 py-3 rounded-lg border transition-all duration-300 ${
              feedback.includes('Perfect') ? 'text-green-300 bg-green-900 border-green-600' :
              feedback.includes('Good job') ? 'text-blue-300 bg-blue-900 border-blue-600' :
              'text-slate-300 bg-slate-700 border-slate-600'
            }`}>
              {feedback}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PostVisualizationPage = ({ pattern, onProceed, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-900 py-10 px-4 text-left">
      <div className="max-w-4xl mx-auto bg-slate-800 rounded-2xl shadow-xl p-8 space-y-6 border border-slate-700">
        <button onClick={onBack} className="text-blue-400 font-semibold hover:text-blue-300">← Back</button>
        <h2 className="text-4xl font-bold text-white">Pattern Insights & Practice</h2>

        <div className="space-y-6">
          {pattern.detect && (
            <div className="bg-slate-700 border border-slate-600 text-slate-200 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-blue-400">
                <MessageSquare size={20} className="text-blue-500" />
                How to recognize this pattern
              </h3>
              <div className="text-slate-300">{pattern.detect}</div>
            </div>
          )}

          {pattern.tips && (
            <div className="bg-slate-700 border border-slate-600 text-slate-200 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-green-400">
                <StickyNote size={20} className="text-green-500" />
                Quick tips
              </h3>
              <div className="text-slate-300">{pattern.tips}</div>
            </div>
          )}

          {pattern.mistakes && pattern.mistakes.length > 0 && (
            <div className="bg-slate-700 border border-slate-600 text-slate-200 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-red-400">
                <X size={20} className="text-red-500" />
                Common mistakes to avoid
              </h3>
              <ul className="list-disc list-inside space-y-2 mt-3 text-slate-300">
                {pattern.mistakes.map((m, idx) => <li key={idx}>{m}</li>)}
              </ul>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {pattern.problems && (
              <div className="bg-slate-700 border border-slate-600 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-orange-400">
                  <ExternalLink size={18} className="text-orange-500" />
                  Practice Problems
                </h3>
                <div className="space-y-2">
                  {pattern.problems.slice(0,5).map((p, idx) => {
                    const href = (typeof p === 'string' && p.startsWith('http'))
                      ? p
                      : p.link || `https://leetcode.com/problemset/all/?search=${encodeURIComponent(p.title || p)}`;
                    const label = p.title || (typeof p === 'string' ? p : JSON.stringify(p));
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-600 rounded border border-slate-500 hover:shadow-sm transition">
                        <a className="text-blue-400 hover:text-blue-300 font-medium flex-1 truncate flex items-center gap-2" href={href} target="_blank" rel="noreferrer">
                          <ExternalLink size={14} className="text-slate-400 flex-shrink-0" />
                          {label}
                        </a>
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-500 text-slate-200 ml-2 flex-shrink-0">{p.difficulty || pattern.difficulty || 'Varies'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {pattern.video && (
              <div className="bg-slate-700 border border-slate-600 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-400">
                  <Play size={18} className="text-red-500" />
                  Recommended Video
                </h3>
                <a className="text-blue-400 hover:text-blue-300 underline flex items-center gap-2 p-3 bg-slate-600 rounded border border-slate-500 hover:shadow-sm transition" href={pattern.video} target="_blank" rel="noreferrer">
                  <Play size={16} className="text-red-500" />
                  Watch on YouTube
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        </div>

        <button onClick={onProceed} className="w-full mt-8 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
          Take Quiz
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

const VisualizationPage = ({ pattern, inputs, onBack, onComplete }) => {
  const codeByLanguage = useMemo(() => pattern.codeByLanguage || {}, [pattern.codeByLanguage]);
  const languages = useMemo(() => Object.keys(codeByLanguage).length ? Object.keys(codeByLanguage) : ["javascript"], [codeByLanguage]);
  
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState("explain"); // "explain" | "apply"
  const [autoVisualize, setAutoVisualize] = useState(false);
  const [showNotepad, setShowNotepad] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizSelections, setQuizSelections] = useState([null]);
  const [quizFeedback, setQuizFeedback] = useState("");
  const [selectedLang, setSelectedLang] = useState(languages[0] || "javascript");
  const codeSteps = useMemo(() => codeByLanguage[selectedLang] || pattern.codeSteps || [], [codeByLanguage, selectedLang, pattern.codeSteps]);
  const initialCodeLines = useMemo(() => codeSteps.map((c) => c.code || String(c)), [codeSteps]);
  const [runtimeCodeLines, setRuntimeCodeLines] = useState(initialCodeLines);
  const [scratchCode, setScratchCode] = useState(() => initialCodeLines.join('\n'));
  const vizSteps = pattern.steps || [];

  const arrInput = inputs?.array;
  const arr = arrInput ? JSON.parse(arrInput || "[]") : [];
  const k = Number(inputs?.k || 1) || 1;

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const newCodeSteps = codeByLanguage[selectedLang] || pattern.codeSteps || [];
    const newCodeLines = newCodeSteps.map((c) => c.code || String(c));
    setRuntimeCodeLines(newCodeLines);
    setScratchCode(newCodeLines.join('\n'));
    setCurrentStep(0);
    setPhase("explain");
    setIsPlaying(false);
    setAutoVisualize(false);
  }, [selectedLang, codeByLanguage, pattern.codeSteps]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Generate random quiz when quiz modal opens
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (showQuiz && !currentQuiz) {
      const quizPool = pattern.quiz || [pattern.postQuestion].filter(Boolean) || [quizForPattern(pattern)];
      if (quizPool.length > 0) {
        const randomIndex = Math.floor(Math.random() * quizPool.length);
        setCurrentQuiz(quizPool[randomIndex]);
        setQuizSelections([null]);
        setQuizSubmitted(false);
        setQuizFeedback("");
      }
    } else if (!showQuiz && currentQuiz) {
      // Reset quiz when modal closes
      setCurrentQuiz(null);
    }
  }, [showQuiz, currentQuiz, pattern]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!isPlaying) return;
    const delay = autoVisualize ? 2000 : 1200; // Faster progression in auto-visualize mode
    const timer = setTimeout(() => {
      if (phase === "explain") {
        setPhase("apply");
        return;
      }
      // phase === apply
      if (currentStep < vizSteps.length - 1) {
        setCurrentStep((prev) => prev + 1);
        setPhase(autoVisualize ? "apply" : "explain"); // Skip explanation in auto-visualize mode
      } else {
        setPatternProgress(pattern.id, 'completed');
        setIsPlaying(false);
        setAutoVisualize(false);
        // navigate to post-visualization summary if provided
        if (onComplete) onComplete();
        else setShowQuiz(true);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [isPlaying, phase, currentStep, vizSteps.length, pattern.id, onComplete, autoVisualize]);

  const revealStep = () => setPhase("apply");
  const nextStep = () => {
    if (currentStep < vizSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setPhase("explain");
    } else {
      setPhase("apply");
      setIsPlaying(false);
      setPatternProgress(pattern.id, 'completed');
      if (onComplete) onComplete();
      else setShowQuiz(true);
    }
  };

  const restart = () => {
    setCurrentStep(0);
    setPhase("explain");
    setIsPlaying(false);
    setAutoVisualize(false);
    setShowQuiz(false);
    setQuizSubmitted(false);
    setQuizSelections([null]);
    setQuizFeedback("");
    // Re-randomize quiz
    const quizPool = pattern.quiz || [pattern.postQuestion].filter(Boolean) || [quizForPattern(pattern)];
    if (quizPool.length > 0) {
      const randomIndex = Math.floor(Math.random() * quizPool.length);
      setCurrentQuiz(quizPool[randomIndex]);
    }
  };

  const startAutoVisualize = () => {
    setAutoVisualize(true);
    setIsPlaying(true);
    setPhase("apply");
    setCurrentStep(0);
  };

  const submitQuiz = () => {
    const unanswered = quizSelections.some((s) => s === null);
    if (unanswered) {
      setQuizFeedback("Answer the question to submit.");
      return;
    }
    const score = quizSelections[0] === currentQuiz.correct ? 1 : 0;
    setQuizSubmitted(true);
    setQuizFeedback(score === 1 ? "Correct! 🎉" : `Incorrect. ${currentQuiz.explanation || "Review the pattern and try again."}`);
    setPatternProgress(pattern.id, 'completed');
    localStorage.setItem(`pattern_quiz_score_${pattern.id}`, `${score}/1`);
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 text-left">
      <div className="max-w-7xl mx-auto">
        <button onClick={onBack} className="text-blue-400 font-semibold mb-6 hover:text-blue-300">← Back</button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-slate-800/90 backdrop-blur-md rounded-2xl p-8 text-white shadow-2xl overflow-x-auto border border-slate-700/50">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h3 className="text-2xl font-bold flex items-center gap-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"><Play size={20}/> Live Code</h3>
                <div className="flex gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-300 shadow-lg ${
                        selectedLang === lang
                          ? "border-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-400 text-black shadow-yellow-400/50"
                          : "border-slate-600 bg-gradient-to-r from-slate-700 to-slate-600 text-slate-200 hover:border-slate-500 hover:from-slate-600 hover:to-slate-500 shadow-slate-700/50"
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm text-slate-300 mb-3 font-semibold">Scratch pad (edit code here)</label>
                <textarea
                  value={scratchCode}
                  onChange={(e) => setScratchCode(e.target.value)}
                  className="w-full h-32 p-4 rounded-xl bg-gradient-to-br from-slate-700/80 to-slate-600/80 backdrop-blur-md border border-slate-600/50 text-slate-100 placeholder-slate-400 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 shadow-inner"
                />
                <div className="flex gap-3 mt-4">
                  <button onClick={() => {
                    const lines = scratchCode.split('\n').filter(Boolean);
                    setRuntimeCodeLines(lines);
                    setCurrentStep(0);
                    setPhase('explain');
                    setIsPlaying(false);
                  }} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-blue-400/50">Re-run visualization</button>
                  <button onClick={() => { setScratchCode(runtimeCodeLines.join('\n')); }} className="bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-slate-500/50">Reset Scratch</button>
                </div>
              </div>
              <pre className="font-mono text-sm leading-relaxed bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-md p-6 rounded-xl border border-slate-600/30 shadow-inner">
                {(runtimeCodeLines || []).map((line, idx) => (
                  <div key={idx} className={`p-2 rounded-lg transition-all duration-300 ${phase === "apply" && idx <= currentStep ? 'bg-gradient-to-r from-yellow-600/80 to-orange-600/80 text-yellow-100 shadow-lg border border-yellow-400/50' : 'hover:bg-slate-600/30'}`}>
                    {line}
                  </div>
                ))}
              </pre>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700/50 backdrop-blur-sm min-h-[600px]">
            <h3 className="text-2xl font-bold mb-8 text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Story Mode Visualization</h3>

            {/* Story explanation first - only show when not in auto-visualize mode */}
            {vizSteps[currentStep] && phase === "explain" && !autoVisualize && (
              <div className="mb-8 bg-gradient-to-br from-blue-900/80 via-indigo-900/80 to-purple-900/80 backdrop-blur-md border border-blue-500/30 p-8 rounded-2xl shadow-2xl animate-fade-in">
                <h4 className="text-2xl font-bold text-blue-200 mb-4">Step {currentStep + 1}: {vizSteps[currentStep].popup}</h4>
                <p className="text-slate-200 leading-relaxed text-lg mb-6">{vizSteps[currentStep].reason}</p>
                <button
                  onClick={revealStep}
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 border border-blue-400/50"
                >
                  Watch Animation →
                </button>
              </div>
            )}

            {/* Animation phase */}
            {phase === "apply" && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-slate-700/80 to-slate-600/80 backdrop-blur-md p-6 rounded-xl mb-6 border border-slate-600/50 shadow-lg">
                  <p className="text-slate-300 text-sm">Watching animation for: <span className="text-blue-400 font-semibold">{vizSteps[currentStep]?.popup}</span></p>
                </div>

                {arr.length > 0 && (
                  <div className="mb-8">
                    {/* Pointer arrows for different patterns */}
                    {pattern.id === 'twoPointers' && phase === "apply" && (
                      <div className="flex gap-4 mb-4 overflow-x-auto px-6">
                        {arr.map((val, idx) => {
                          const stepData = vizSteps[currentStep];
                          const leftPos = stepData?.left !== undefined ? stepData.left : null;
                          const rightPos = stepData?.right !== undefined ? stepData.right : null;
                          const showLeftArrow = leftPos === idx;
                          const showRightArrow = rightPos === idx;
                          
                          return (
                            <div key={`arrow-${idx}`} className="w-20 flex-shrink-0 flex flex-col items-center">
                              {showLeftArrow && (
                                <div className="text-blue-400 text-3xl mb-1 animate-bounce">⬅️</div>
                              )}
                              {showRightArrow && (
                                <div className="text-red-400 text-3xl mb-1 animate-bounce">➡️</div>
                              )}
                              {(showLeftArrow || showRightArrow) && (
                                <div className="text-xs text-slate-300 font-semibold">
                                  {showLeftArrow && showRightArrow ? 'Both' : showLeftArrow ? 'Left' : 'Right'}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {pattern.id === 'slidingWindow' && phase === "apply" && (
                      <div className="flex gap-4 mb-4 overflow-x-auto px-6">
                        {arr.map((val, idx) => {
                          // For sliding window, highlight the current window
                          const windowStart = Math.max(0, currentStep - k + 1);
                          const windowEnd = currentStep;
                          const showLeftArrow = idx === windowStart && windowStart >= 0;
                          const showRightArrow = idx === windowEnd && windowEnd < arr.length;
                          
                          return (
                            <div key={`arrow-${idx}`} className="w-20 flex-shrink-0 flex flex-col items-center">
                              {showLeftArrow && (
                                <div className="text-green-400 text-3xl mb-1 animate-bounce">⬅️</div>
                              )}
                              {showRightArrow && (
                                <div className="text-orange-400 text-3xl mb-1 animate-bounce">➡️</div>
                              )}
                              {(showLeftArrow || showRightArrow) && (
                                <div className="text-xs text-slate-300 font-semibold">
                                  {showLeftArrow && showRightArrow ? 'Window' : showLeftArrow ? 'Start' : 'End'}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {pattern.id === 'fastSlowPointer' && phase === "apply" && (
                      <div className="flex gap-4 mb-4 overflow-x-auto px-6">
                        {arr.map((val, idx) => {
                          // For fast slow pointer, show slow and fast pointers
                          const slowPos = Math.floor(currentStep / 2); // Slow moves 1 step per 2 steps
                          const fastPos = currentStep; // Fast moves 1 step per step
                          const showSlowArrow = idx === slowPos && slowPos < arr.length;
                          const showFastArrow = idx === fastPos && fastPos < arr.length;
                          
                          return (
                            <div key={`arrow-${idx}`} className="w-20 flex-shrink-0 flex flex-col items-center">
                              {showSlowArrow && (
                                <div className="text-purple-400 text-3xl mb-1 animate-bounce">🐢</div>
                              )}
                              {showFastArrow && (
                                <div className="text-yellow-400 text-3xl mb-1 animate-bounce">🐇</div>
                              )}
                              {(showSlowArrow || showFastArrow) && (
                                <div className="text-xs text-slate-300 font-semibold">
                                  {showSlowArrow && showFastArrow ? 'Both' : showSlowArrow ? 'Slow' : 'Fast'}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex gap-4 overflow-x-auto p-6 bg-gradient-to-br from-slate-700/60 to-slate-600/60 backdrop-blur-md rounded-2xl border border-slate-600/30 shadow-inner min-h-[120px] items-center">
                      {arr.map((val, idx) => (
                        <div key={idx} className={`w-20 h-20 flex-shrink-0 flex items-center justify-center rounded-2xl font-bold text-2xl transition-all duration-500 shadow-xl border ${
                          idx >= currentStep - k + 1 && idx <= currentStep
                            ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white scale-110 shadow-blue-500/50 border-blue-400/50'
                            : 'bg-gradient-to-br from-slate-600 to-slate-500 text-slate-400 hover:from-slate-500 hover:to-slate-400 border-slate-500/50'
                        }`}>
                          {val}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-4">
                  {!autoVisualize && currentStep < vizSteps.length - 1 ? (
                    <button
                      onClick={nextStep}
                      className="bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 hover:from-green-500 hover:via-emerald-500 hover:to-cyan-500 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 border border-green-400/50"
                    >
                      Next Story Step →
                    </button>
                  ) : !autoVisualize && (
                    <button
                      onClick={() => { setPatternProgress(pattern.id, 'completed'); if (onComplete) onComplete(); else setShowQuiz(true); }}
                      className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 border border-purple-400/50"
                    >
                      Complete Pattern! 🎉
                    </button>
                  )}
                  {autoVisualize && (
                    <div className="text-slate-300 text-lg font-semibold bg-gradient-to-r from-slate-700/80 to-slate-600/80 backdrop-blur-md px-6 py-3 rounded-xl border border-slate-600/50">
                      Auto-visualizing... Step {currentStep + 1} of {vizSteps.length}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Control buttons - only essential ones */}
            <div className="flex flex-wrap gap-4 mt-8">
              <button 
                onClick={startAutoVisualize}
                disabled={isPlaying && autoVisualize}
                className={`bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 hover:from-green-500 hover:via-emerald-500 hover:to-cyan-500 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 border border-green-400/50 ${isPlaying && autoVisualize ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isPlaying && autoVisualize ? 'Visualizing...' : 'Visualize All'}
              </button>
              <button onClick={() => setIsPlaying(false)} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black py-3 px-6 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-yellow-400/50">Pause</button>
              <button onClick={restart} className="bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105 border border-slate-500/50"><RotateCcw size={18} /></button>
              <button onClick={() => setShowNotepad((s) => !s)} className="bg-gradient-to-r from-slate-700/80 to-slate-600/80 backdrop-blur-md hover:from-slate-600/80 hover:to-slate-500/80 border border-slate-600/50 px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                <StickyNote size={18} /> Notes
              </button>
            </div>
          </div>
        </div>
      </div>
        {showQuiz && currentQuiz && (
        <div className="max-w-3xl mx-auto mt-8 bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-slate-800/90 backdrop-blur-md shadow-2xl border border-slate-700/50 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6 text-white font-bold text-xl">
            <MessageSquare size={20} className="text-blue-400" /> Quick Check
          </div>
          <div className="space-y-6">
            <div className="border border-slate-600/50 rounded-xl p-6 bg-gradient-to-br from-slate-700/80 to-slate-600/80 backdrop-blur-sm">
              <p className="text-white font-semibold mb-4 text-lg">{currentQuiz.question}</p>
              <div className="space-y-3">
                {currentQuiz.options.map((opt, optIdx) => {
                  const selected = quizSelections[0] === optIdx;
                  const correct = currentQuiz.correct === optIdx;
                  const showResult = quizSubmitted;
                  const base = "w-full text-left px-6 py-4 rounded-xl border transition-all duration-300 text-base font-medium";
                  const stateClass = showResult
                    ? correct
                      ? "border-green-400 bg-green-900/80 text-green-300 shadow-lg shadow-green-500/20"
                      : selected
                        ? "border-red-400 bg-red-900/80 text-red-300 shadow-lg shadow-red-500/20"
                        : "border-slate-600/50 bg-slate-600/50 text-slate-300"
                    : selected
                      ? "border-blue-400 bg-blue-900/80 text-blue-300 shadow-lg shadow-blue-500/20"
                      : "border-slate-600/50 bg-slate-600/50 text-slate-200 hover:border-slate-500/70 hover:bg-slate-500/30 hover:shadow-md";
                  return (
                    <button
                      key={optIdx}
                      onClick={() => {
                        if (quizSubmitted) return;
                        setQuizSelections([optIdx]);
                      }}
                      className={`${base} ${stateClass}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {quizSubmitted && currentQuiz.explanation && (
                <div className="mt-4 text-sm text-slate-400 bg-slate-800/50 p-4 rounded-lg border border-slate-600/30 backdrop-blur-sm">
                  <strong className="text-slate-300">Explanation:</strong> {currentQuiz.explanation}
                </div>
              )}
            </div>
          </div>
          <div className="mt-8 flex items-center gap-4">
            <button onClick={submitQuiz} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-blue-400/50">
              Submit Answer
            </button>
            {quizFeedback && (
              <div className="text-sm font-semibold text-white bg-gradient-to-r from-slate-700/80 to-slate-600/80 px-6 py-3 rounded-xl border border-slate-600/50 backdrop-blur-sm shadow-lg">{quizFeedback}</div>
            )}
          </div>
        </div>
        )}
        {showNotepad && <FloatingNotepad patternId={pattern.id} onClose={() => setShowNotepad(false)} isOpen={showNotepad} />}
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

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-blue-400">Loading CodeFlux...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
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
          onContinue={() => setView('theory')} 
          onBack={() => setView('patterns')} 
        />
      )}
      
      {view === 'theory' && (
        <TheoryPage pattern={selected} inputs={inputs} onProceed={() => setView('input')} onBack={() => setView('overview')} />
      )}

      {view === 'input' && (
        <InputConfiguration 
          pattern={selected} 
          onProceed={(i) => { setInputs(i); setPatternProgress(selected.id, 'in-progress'); setView('visualization'); }} 
          onBack={() => setView('theory')} 
        />
      )}

      {view === 'visualization' && (
        <VisualizationPage 
          key={selected.id}
          pattern={selected} 
          inputs={inputs} 
          onBack={() => setView('input')} 
          onComplete={() => setView('post')}
        />
      )}

      {view === 'post' && (
        <PostVisualizationPage key={selected.id} pattern={selected} onProceed={() => setView('quiz')} onBack={() => setView('visualization')} />
      )}

      {view === 'quiz' && (
        <QuizPage key={selected.id} pattern={selected} onBack={() => setView('post')} />
      )}
      <FluxyChat />
    </div>
  );
}