/**
 * @typedef {Object} ContentModule
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} difficulty - 'beginner' | 'intermediate' | 'advanced'
 * @property {string[]} tags
 * @property {Documentation} documentation
 * @property {Video[]} videos
 * @property {Quiz} quiz
 * @property {PracticeProblem[]} problems
 */

/**
 * @typedef {Object} Documentation
 * @property {string} content - Markdown content
 */

/**
 * @typedef {Object} Video
 * @property {string} id
 * @property {string} youtubeId
 * @property {string} title
 * @property {number} duration
 * @property {string} language
 */

/**
 * @typedef {Object} Quiz
 * @property {QuizQuestion[]} questions
 */

/**
 * @typedef {Object} QuizQuestion
 * @property {string} id
 * @property {string} question
 * @property {string[]} options
 * @property {number} correctAnswer - Index of correct option
 * @property {string} explanation
 */

/**
 * @typedef {Object} PracticeProblem
 * @property {string} id
 * @property {string} title
 * @property {string} difficulty - 'easy' | 'medium' | 'hard'
 * @property {string} description
 * @property {string[]} constraints
 * @property {TestCase[]} exampleTestCases
 * @property {TestCase[]} hiddenTestCases
 * @property {StarterCode} starterCode
 * @property {Solution} solution
 */

/**
 * @typedef {Object} TestCase
 * @property {any} input
 * @property {any} expectedOutput
 * @property {string} description
 */

/**
 * @typedef {Object} StarterCode
 * @property {string} javascript
 * @property {string} python
 * @property {string} java
 * @property {string} c
 */

/**
 * @typedef {Object} Solution
 * @property {string} javascript
 * @property {string} python
 * @property {string} java
 * @property {string} c
 */

/**
 * @typedef {Object} ModuleProgress
 * @property {string} moduleId
 * @property {boolean} documentationComplete
 * @property {string[]} videosWatched
 * @property {number|null} quizScore
 * @property {string[]} problemsSolved
 * @property {number} completionPercentage
 */

export {};

// ============================================
// Phase 1 Enhancement Types
// ============================================

/**
 * @typedef {Object} EnhancedProblem
 * @extends PracticeProblem
 * @property {string} moduleId
 * @property {string[]} companyTags - e.g., ['Google', 'Amazon', 'Meta']
 * @property {string[]} topicTags - e.g., ['Array', 'Two Pointers']
 * @property {Hint[]} hints
 * @property {string[]} similarProblems - Problem IDs
 * @property {number} acceptanceRate - Percentage
 * @property {string} timeComplexity - Expected solution complexity
 * @property {string} spaceComplexity
 */

/**
 * @typedef {Object} Hint
 * @property {number} level - 1, 2, or 3
 * @property {string} text
 */

/**
 * @typedef {Object} ExecutionResult
 * @property {number} testCaseIndex
 * @property {string} testCaseDescription
 * @property {boolean} passed
 * @property {any} input
 * @property {any} expectedOutput
 * @property {any} actualOutput
 * @property {number} executionTime - milliseconds
 * @property {number} memoryUsage - MB
 * @property {ExecutionStatus} status
 * @property {string} [error]
 * @property {string} [stderr]
 * @property {string} [stdout]
 */

/**
 * @typedef {'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'runtime_error' | 'compilation_error' | 'internal_error'} ExecutionStatus
 */

/**
 * @typedef {Object} AlgorithmDefinition
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {'sorting' | 'tree' | 'graph' | 'array'} type
 * @property {string[]} pseudocode
 * @property {string} timeComplexity
 * @property {string} spaceComplexity
 * @property {any} initialState
 * @property {AlgorithmStep[]} steps
 */

/**
 * @typedef {Object} AlgorithmStep
 * @property {number} stepNumber
 * @property {string} description
 * @property {'compare' | 'swap' | 'assign' | 'insert' | 'delete' | 'traverse'} action
 * @property {number[]} affectedElements
 * @property {Record<string, any>} variables
 * @property {number} pseudocodeLine
 * @property {number} operationCount
 */

/**
 * @typedef {Object} VisualizationState
 * @property {string} algorithmId
 * @property {'sorting' | 'tree' | 'graph' | 'array'} algorithmType
 * @property {number} currentStep
 * @property {number} totalSteps
 * @property {any} dataStructure
 * @property {Record<string, any>} variables
 * @property {HistoryEntry[]} history
 * @property {boolean} isPlaying
 * @property {number} speed
 * @property {number[]} highlightedElements
 * @property {number} currentPseudocodeLine
 */

/**
 * @typedef {Object} HistoryEntry
 * @property {number} step
 * @property {any} dataStructure
 * @property {Record<string, any>} variables
 * @property {number[]} highlightedElements
 * @property {number} pseudocodeLine
 */

/**
 * @typedef {Object} StudySession
 * @property {string} id
 * @property {string} userId
 * @property {string} moduleId
 * @property {Date} startTime
 * @property {Date|null} endTime
 * @property {number} duration - milliseconds
 * @property {Activity[]} activities
 * @property {string[]} problemsAttempted
 * @property {string[]} problemsSolved
 * @property {string[]} quizzesTaken
 * @property {boolean} paused
 */

/**
 * @typedef {Object} Activity
 * @property {'video' | 'documentation' | 'quiz' | 'problem' | 'visualization' | 'playground'} type
 * @property {string} resourceId
 * @property {Date} timestamp
 * @property {number} duration - milliseconds
 */

/**
 * @typedef {Object} UserAnalytics
 * @property {string} userId
 * @property {Record<string, ModuleProgress>} moduleProgress
 * @property {number} overallCompletion
 * @property {ProblemStatistics} problemStats
 * @property {TimeStatistics} timeStats
 * @property {QuizStatistics} quizStats
 * @property {StudySession[]} sessions
 * @property {WeakArea[]} weakAreas
 */

/**
 * @typedef {Object} ProblemStatistics
 * @property {number} totalAttempted
 * @property {number} totalSolved
 * @property {number} successRate
 * @property {number} averageAttempts
 * @property {DifficultyStats} solvedByDifficulty
 * @property {Record<string, number>} solvedByCategory
 * @property {number} hintsUsed
 */

/**
 * @typedef {Object} DifficultyStats
 * @property {number} easy
 * @property {number} medium
 * @property {number} hard
 */

/**
 * @typedef {Object} TimeStatistics
 * @property {number} totalMinutes
 * @property {number} averageDailyMinutes
 * @property {Record<string, number>} timeByModule
 * @property {number} studyStreak
 * @property {number} longestStreak
 */

/**
 * @typedef {Object} QuizStatistics
 * @property {number} totalQuizzes
 * @property {number} averageScore
 * @property {Record<string, number>} scoresByModule
 * @property {ScoreTrend[]} scoreTrend
 */

/**
 * @typedef {Object} ScoreTrend
 * @property {string} date
 * @property {number} score
 */

/**
 * @typedef {Object} WeakArea
 * @property {string} moduleId
 * @property {string} moduleName
 * @property {'low_completion' | 'low_quiz_score' | 'high_failure_rate'} reason
 * @property {number} metric
 * @property {string[]} recommendations
 * @property {'improving' | 'stable' | 'declining'} improvementTrend
 * @property {Date} lastUpdated
 */

/**
 * @typedef {Object} ThemeConfig
 * @property {'light' | 'dark'} name
 * @property {ColorScheme} colors
 * @property {string} monacoTheme
 * @property {ChartThemeConfig} chartTheme
 */

/**
 * @typedef {Object} ColorScheme
 * @property {string} bgPrimary
 * @property {string} bgSecondary
 * @property {string} bgTertiary
 * @property {string} textPrimary
 * @property {string} textSecondary
 * @property {string} textTertiary
 * @property {string} borderColor
 * @property {string} accentPrimary
 * @property {string} accentSecondary
 * @property {string} success
 * @property {string} warning
 * @property {string} error
 * @property {string} codeBg
 * @property {string} codeText
 */

/**
 * @typedef {Object} ChartThemeConfig
 * @property {string} backgroundColor
 * @property {string} textColor
 * @property {string} gridColor
 * @property {string[]} colors
 */
