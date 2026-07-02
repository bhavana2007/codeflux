/**
 * TimeTracker - Tracks time spent on problems and modules
 * 
 * Records start/end timestamps for problem-solving sessions,
 * calculates elapsed time, and aggregates time spent per problem,
 * module, and overall.
 */

import type { DifficultyLevel, TimeRange } from '../types/problem-based-learning';
import { DIFFICULTY_TIME_ESTIMATES } from '../types/problem-based-learning';
import { ProgressStorage } from './ProgressStorage';

interface ActiveTimer {
  startTime: Date;
  moduleId: string;
  problemId: string;
}

export class TimeTracker {
  private activeTimers: Map<string, ActiveTimer> = new Map();
  
  /**
   * Get timer key for a user/module/problem combination
   */
  private getTimerKey(userId: string, moduleId: string, problemId: string): string {
    return `${userId}:${moduleId}:${problemId}`;
  }
  
  /**
   * Start tracking time for a problem
   */
  startProblem(userId: string, moduleId: string, problemId: string): void {
    const key = this.getTimerKey(userId, moduleId, problemId);
    
    this.activeTimers.set(key, {
      startTime: new Date(),
      moduleId,
      problemId
    });
  }
  
  /**
   * End tracking time for a problem and return elapsed minutes
   */
  endProblem(userId: string, moduleId: string, problemId: string): number {
    const key = this.getTimerKey(userId, moduleId, problemId);
    const timer = this.activeTimers.get(key);
    
    if (!timer) {
      console.warn(`[TimeTracker] Timer not started for ${key}`);
      return 0;
    }
    
    const now = new Date();
    const elapsedMs = now.getTime() - timer.startTime.getTime();
    
    // Handle negative elapsed time (clock skew)
    if (elapsedMs < 0) {
      console.error(`[TimeTracker] Negative elapsed time for ${key}`);
      this.activeTimers.delete(key);
      return 0;
    }
    
    // Cap at 24 hours to handle timer overflow
    const MAX_TIME_MS = 24 * 60 * 60 * 1000;
    const cappedMs = Math.min(elapsedMs, MAX_TIME_MS);
    
    if (elapsedMs > MAX_TIME_MS) {
      console.warn(`[TimeTracker] Timer overflow for ${key}, capping at 24 hours`);
    }
    
    const elapsedMinutes = Math.ceil(cappedMs / 60000);
    
    // Update problem attempt with time spent
    this.updateTimeSpent(userId, moduleId, problemId, elapsedMinutes);
    
    // Remove timer
    this.activeTimers.delete(key);
    
    return elapsedMinutes;
  }
  
  /**
   * Update time spent in storage
   */
  private updateTimeSpent(
    userId: string,
    moduleId: string,
    problemId: string,
    minutes: number
  ): void {
    let state = ProgressStorage.load(userId);
    if (!state) {
      state = ProgressStorage.initializeDefaultState(userId);
    }
    
    const key = `${moduleId}:${problemId}`;
    const attempt = state.problemAttempts.get(key);
    
    if (attempt) {
      attempt.timeSpent += minutes;
      attempt.timestamps.push(new Date());
      attempt.lastAttempt = new Date();
    }
    
    state.lastUpdated = new Date();
    ProgressStorage.save(userId, state);
  }
  
  /**
   * Get time spent on a specific problem
   */
  getTimeSpent(userId: string, moduleId: string, problemId: string): number {
    const state = ProgressStorage.load(userId);
    if (!state) return 0;
    
    const key = `${moduleId}:${problemId}`;
    const attempt = state.problemAttempts.get(key);
    
    return attempt ? attempt.timeSpent : 0;
  }
  
  /**
   * Get total time spent on a module
   */
  getModuleTimeSpent(userId: string, moduleId: string): number {
    const state = ProgressStorage.load(userId);
    if (!state) return 0;
    
    let totalTime = 0;
    
    state.problemAttempts.forEach((attempt, key) => {
      if (key.startsWith(`${moduleId}:`)) {
        totalTime += attempt.timeSpent;
      }
    });
    
    return totalTime;
  }
  
  /**
   * Get total time spent across all modules
   */
  getTotalTimeSpent(userId: string): number {
    const state = ProgressStorage.load(userId);
    if (!state) return 0;
    
    let totalTime = 0;
    
    state.problemAttempts.forEach(attempt => {
      totalTime += attempt.timeSpent;
    });
    
    return totalTime;
  }
  
  /**
   * Get estimated time range for a difficulty level
   */
  getEstimatedTime(difficulty: DifficultyLevel): TimeRange {
    return DIFFICULTY_TIME_ESTIMATES[difficulty];
  }
  
  /**
   * Format time in human-readable format
   */
  formatTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${mins}m`;
  }
  
  /**
   * Format time range
   */
  formatTimeRange(range: TimeRange): string {
    return `${range.min}-${range.max} minutes`;
  }
}
