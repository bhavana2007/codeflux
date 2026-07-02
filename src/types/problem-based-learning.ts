/**
 * Core type definitions for the Problem-Based Learning System
 * 
 * This module defines all TypeScript interfaces and types for the enhanced
 * CodeFlux problem-based learning system with 16 problems per module,
 * realistic time tracking, daily streaks, and comprehensive progress analytics.
 */

// ============================================================================
// Core Problem and Module Types
// ============================================================================

export type DifficultyLevel = "Easy" | "Medium" | "Hard";

export interface StarterCode {
  javascript: string;
  python: string;
  java: string;
  c: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
}

export interface Solution {
  javascript: string;
  python: string;
  java: string;
  c: string;
  explanation: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  starterCode: StarterCode;
  testCases: TestCase[];
  hints: string[]; // exactly 3
  solution: Solution;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  problems: Problem[]; // exactly 16
  theoryContent?: string;
  estimatedTheoryTime: number; // minutes (90)
}

// ============================================================================
// Progress State Types
// ============================================================================

export interface ProblemAttempt {
  problemId: string;
  moduleId: string;
  difficulty: DifficultyLevel;
  solved: boolean;
  attempts: number;
  timeSpent: number; // minutes
  timestamps: Date[];
  lastAttempt: Date;
}

export interface ModuleCompletion {
  moduleId: string;
  completed: boolean;
  problemsSolved: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  totalTimeSpent: number;
  completedAt: Date | null;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  freezeTokens: number;
  freezeTokensResetDate: Date; // first day of next month
  milestonesReached: number[];
}

export type LearningPathType = "Beginner" | "Intermediate" | "Advanced";

export interface LearningPathSelection {
  path: LearningPathType;
  startDate: Date;
  targetProblems: number;
  targetDays: number;
  dailyTarget: number;
}

export type ActivityType = "problem_solved" | "video_watched" | "module_completed";

export interface ActivityEntry {
  type: ActivityType;
  timestamp: Date;
  moduleId?: string;
  problemId?: string;
  difficulty?: DifficultyLevel;
}

export interface ProgressState {
  userId: string;
  problemAttempts: Map<string, ProblemAttempt>; // key: "moduleId:problemId"
  moduleCompletions: Map<string, ModuleCompletion>; // key: moduleId
  streak: StreakData;
  learningPath: LearningPathSelection | null;
  activityLog: ActivityEntry[];
  lastUpdated: Date;
}

// ============================================================================
// Supporting Types
// ============================================================================

export interface ModuleProgress {
  total: 16;
  solved: number;
  easy: { solved: number; total: 5 };
  medium: { solved: number; total: 8 };
  hard: { solved: number; total: 3 };
  completionMet: boolean;
}

export interface TimeRange {
  min: number;
  max: number;
}

export interface DifficultyBreakdown {
  easy: number;
  medium: number;
  hard: number;
  total: number;
}

export type ProgressStatusType = "on track" | "ahead" | "behind" | "no path selected";

export interface ProgressStatus {
  status: ProgressStatusType;
  daysAheadOrBehind: number;
  averageProblemsPerDay: number;
  targetProblemsPerDay: number;
}

export interface ActivityDay {
  date: Date;
  problemCount: number;
  intensity: number; // 0-4 for heatmap coloring
}

export interface HeatmapData {
  days: ActivityDay[];
  maxProblems: number;
}

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ============================================================================
// Serialized Types (for localStorage)
// ============================================================================

export interface SerializedProblemAttempt {
  problemId: string;
  moduleId: string;
  difficulty: DifficultyLevel;
  solved: boolean;
  attempts: number;
  timeSpent: number;
  timestamps: string[]; // ISO 8601 strings
  lastAttempt: string; // ISO 8601 string
}

export interface SerializedStreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null; // ISO 8601 string
  freezeTokens: number;
  freezeTokensResetDate: string; // ISO 8601 string
  milestonesReached: number[];
}

export interface SerializedLearningPathSelection {
  path: LearningPathType;
  startDate: string; // ISO 8601 string
  targetProblems: number;
  targetDays: number;
  dailyTarget: number;
}

export interface SerializedActivityEntry {
  type: ActivityType;
  timestamp: string; // ISO 8601 string
  moduleId?: string;
  problemId?: string;
  difficulty?: DifficultyLevel;
}

export interface SerializedProgressState {
  userId: string;
  problemAttempts: Record<string, SerializedProblemAttempt>;
  moduleCompletions: Record<string, ModuleCompletion>;
  streak: SerializedStreakData;
  learningPath: SerializedLearningPathSelection | null;
  activityLog: SerializedActivityEntry[];
  lastUpdated: string; // ISO 8601 string
  version: number; // for data migration
}

// ============================================================================
// Constants
// ============================================================================

export const DIFFICULTY_TIME_ESTIMATES: Record<DifficultyLevel, TimeRange> = {
  Easy: { min: 15, max: 20 },
  Medium: { min: 25, max: 35 },
  Hard: { min: 40, max: 60 }
};

export const MODULE_THEORY_TIME = 90; // minutes
export const MODULE_ESTIMATED_TIME_RANGE = { min: 360, max: 480 }; // 6-8 hours

export const PROBLEMS_PER_MODULE = 16;
export const EASY_PROBLEMS_PER_MODULE = 5;
export const MEDIUM_PROBLEMS_PER_MODULE = 8;
export const HARD_PROBLEMS_PER_MODULE = 3;

export const MODULE_COMPLETION_THRESHOLD = 12;
export const MIN_EASY_FOR_COMPLETION = 4;
export const MIN_MEDIUM_FOR_COMPLETION = 6;
export const MIN_HARD_FOR_COMPLETION = 2;

export const STREAK_MILESTONES = [7, 14, 30, 60, 100, 365];
export const FREEZE_TOKENS_PER_MONTH = 2;

export const LEARNING_PATHS = {
  Beginner: { targetProblems: 160, targetDays: 30, dailyTarget: 5.33 },
  Intermediate: { targetProblems: 240, targetDays: 45, dailyTarget: 5.33 },
  Advanced: { targetProblems: 320, targetDays: 60, dailyTarget: 5.33 }
};

export const PROGRESS_STATUS_THRESHOLD = 5; // problems ahead/behind threshold

export const ACTIVITY_CALENDAR_DAYS = 90;

export const STORAGE_KEY_PREFIX = "codeflux_progress_";
export const STORAGE_VERSION = 1;
