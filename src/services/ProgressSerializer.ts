/**
 * ProgressSerializer and ProgressDeserializer
 * 
 * Handles serialization and deserialization of progress state to/from JSON
 * for localStorage persistence. Converts Date objects to ISO 8601 strings
 * and Maps to plain objects.
 */

import type {
  ProgressState,
  SerializedProgressState,
  ProblemAttempt,
  SerializedProblemAttempt,
  StreakData,
  SerializedStreakData,
  LearningPathSelection,
  SerializedLearningPathSelection,
  ActivityEntry,
  SerializedActivityEntry,
  ModuleCompletion
} from '../types/problem-based-learning';

import { STORAGE_VERSION } from '../types/problem-based-learning';

export class ProgressSerializer {
  /**
   * Serialize ProgressState to JSON-compatible format
   */
  static serialize(state: ProgressState): string {
    const serialized: SerializedProgressState = {
      userId: state.userId,
      problemAttempts: this.serializeProblemAttempts(state.problemAttempts),
      moduleCompletions: this.serializeModuleCompletions(state.moduleCompletions),
      streak: this.serializeStreakData(state.streak),
      learningPath: state.learningPath ? this.serializeLearningPath(state.learningPath) : null,
      activityLog: state.activityLog.map(entry => this.serializeActivityEntry(entry)),
      lastUpdated: state.lastUpdated.toISOString(),
      version: STORAGE_VERSION
    };
    
    return JSON.stringify(serialized);
  }
  
  private static serializeProblemAttempts(
    attempts: Map<string, ProblemAttempt>
  ): Record<string, SerializedProblemAttempt> {
    const result: Record<string, SerializedProblemAttempt> = {};
    
    attempts.forEach((attempt, key) => {
      result[key] = {
        problemId: attempt.problemId,
        moduleId: attempt.moduleId,
        difficulty: attempt.difficulty,
        solved: attempt.solved,
        attempts: attempt.attempts,
        timeSpent: attempt.timeSpent,
        timestamps: attempt.timestamps.map(date => date.toISOString()),
        lastAttempt: attempt.lastAttempt.toISOString()
      };
    });
    
    return result;
  }
  
  private static serializeModuleCompletions(
    completions: Map<string, ModuleCompletion>
  ): Record<string, ModuleCompletion> {
    const result: Record<string, ModuleCompletion> = {};
    
    completions.forEach((completion, key) => {
      result[key] = {
        ...completion,
        completedAt: completion.completedAt ? completion.completedAt.toISOString() as any : null
      };
    });
    
    return result;
  }
  
  private static serializeStreakData(streak: StreakData): SerializedStreakData {
    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActivityDate: streak.lastActivityDate ? streak.lastActivityDate.toISOString() : null,
      freezeTokens: streak.freezeTokens,
      freezeTokensResetDate: streak.freezeTokensResetDate.toISOString(),
      milestonesReached: streak.milestonesReached
    };
  }
  
  private static serializeLearningPath(
    path: LearningPathSelection
  ): SerializedLearningPathSelection {
    return {
      path: path.path,
      startDate: path.startDate.toISOString(),
      targetProblems: path.targetProblems,
      targetDays: path.targetDays,
      dailyTarget: path.dailyTarget
    };
  }
  
  private static serializeActivityEntry(entry: ActivityEntry): SerializedActivityEntry {
    return {
      type: entry.type,
      timestamp: entry.timestamp.toISOString(),
      moduleId: entry.moduleId,
      problemId: entry.problemId,
      difficulty: entry.difficulty
    };
  }
}

export class ProgressDeserializer {
  /**
   * Deserialize JSON string to ProgressState
   */
  static deserialize(json: string): ProgressState {
    const data: SerializedProgressState = JSON.parse(json);
    
    return {
      userId: data.userId,
      problemAttempts: this.deserializeProblemAttempts(data.problemAttempts),
      moduleCompletions: this.deserializeModuleCompletions(data.moduleCompletions),
      streak: this.deserializeStreakData(data.streak),
      learningPath: data.learningPath ? this.deserializeLearningPath(data.learningPath) : null,
      activityLog: data.activityLog.map(entry => this.deserializeActivityEntry(entry)),
      lastUpdated: new Date(data.lastUpdated)
    };
  }
  
  private static deserializeProblemAttempts(
    attempts: Record<string, SerializedProblemAttempt>
  ): Map<string, ProblemAttempt> {
    const result = new Map<string, ProblemAttempt>();
    
    Object.entries(attempts).forEach(([key, attempt]) => {
      result.set(key, {
        problemId: attempt.problemId,
        moduleId: attempt.moduleId,
        difficulty: attempt.difficulty,
        solved: attempt.solved,
        attempts: attempt.attempts,
        timeSpent: attempt.timeSpent,
        timestamps: attempt.timestamps.map(str => new Date(str)),
        lastAttempt: new Date(attempt.lastAttempt)
      });
    });
    
    return result;
  }
  
  private static deserializeModuleCompletions(
    completions: Record<string, ModuleCompletion>
  ): Map<string, ModuleCompletion> {
    const result = new Map<string, ModuleCompletion>();
    
    Object.entries(completions).forEach(([key, completion]) => {
      result.set(key, {
        ...completion,
        completedAt: completion.completedAt ? new Date(completion.completedAt as any) : null
      });
    });
    
    return result;
  }
  
  private static deserializeStreakData(streak: SerializedStreakData): StreakData {
    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActivityDate: streak.lastActivityDate ? new Date(streak.lastActivityDate) : null,
      freezeTokens: streak.freezeTokens,
      freezeTokensResetDate: new Date(streak.freezeTokensResetDate),
      milestonesReached: streak.milestonesReached
    };
  }
  
  private static deserializeLearningPath(
    path: SerializedLearningPathSelection
  ): LearningPathSelection {
    return {
      path: path.path,
      startDate: new Date(path.startDate),
      targetProblems: path.targetProblems,
      targetDays: path.targetDays,
      dailyTarget: path.dailyTarget
    };
  }
  
  private static deserializeActivityEntry(entry: SerializedActivityEntry): ActivityEntry {
    return {
      type: entry.type,
      timestamp: new Date(entry.timestamp),
      moduleId: entry.moduleId,
      problemId: entry.problemId,
      difficulty: entry.difficulty
    };
  }
}
