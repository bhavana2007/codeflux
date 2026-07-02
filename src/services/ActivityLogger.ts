/**
 * ActivityLogger - Logs user activities with ISO 8601 timestamps
 * 
 * Records problem solving, video watching, and module completion activities
 * with proper timestamp formatting for streak calculation and analytics.
 */

import type { ActivityType, DifficultyLevel } from '../types/problem-based-learning';
import { ProgressStorage } from './ProgressStorage';
import { StreakManager } from './StreakManager';

export class ActivityLogger {
  private streakManager: StreakManager;
  
  constructor() {
    this.streakManager = new StreakManager();
  }
  
  /**
   * Log a problem solved activity
   */
  logProblemSolved(
    userId: string,
    moduleId: string,
    problemId: string,
    difficulty: DifficultyLevel
  ): void {
    const timestamp = new Date();
    
    let state = ProgressStorage.load(userId);
    if (!state) {
      state = ProgressStorage.initializeDefaultState(userId);
    }
    
    // Add activity entry
    state.activityLog.push({
      type: 'problem_solved',
      timestamp,
      moduleId,
      problemId,
      difficulty
    });
    
    // Update streak
    this.streakManager.updateStreak(userId, timestamp);
    
    // Update last updated
    state.lastUpdated = timestamp;
    
    // Save to storage
    ProgressStorage.save(userId, state);
  }
  
  /**
   * Log a video watched activity
   */
  logVideoWatched(userId: string, moduleId: string, videoId: string): void {
    const timestamp = new Date();
    
    let state = ProgressStorage.load(userId);
    if (!state) {
      state = ProgressStorage.initializeDefaultState(userId);
    }
    
    // Add activity entry
    state.activityLog.push({
      type: 'video_watched',
      timestamp,
      moduleId
    });
    
    // Update last updated
    state.lastUpdated = timestamp;
    
    // Save to storage
    ProgressStorage.save(userId, state);
  }
  
  /**
   * Log a module completed activity
   */
  logModuleCompleted(userId: string, moduleId: string): void {
    const timestamp = new Date();
    
    let state = ProgressStorage.load(userId);
    if (!state) {
      state = ProgressStorage.initializeDefaultState(userId);
    }
    
    // Add activity entry
    state.activityLog.push({
      type: 'module_completed',
      timestamp,
      moduleId
    });
    
    // Update last updated
    state.lastUpdated = timestamp;
    
    // Save to storage
    ProgressStorage.save(userId, state);
  }
  
  /**
   * Get all activities for a user
   */
  getActivities(userId: string): Array<{
    type: ActivityType;
    timestamp: Date;
    moduleId?: string;
    problemId?: string;
    difficulty?: DifficultyLevel;
  }> {
    const state = ProgressStorage.load(userId);
    if (!state) return [];
    
    return state.activityLog;
  }
  
  /**
   * Get activities filtered by type
   */
  getActivitiesByType(userId: string, type: ActivityType): Array<{
    type: ActivityType;
    timestamp: Date;
    moduleId?: string;
    problemId?: string;
    difficulty?: DifficultyLevel;
  }> {
    const state = ProgressStorage.load(userId);
    if (!state) return [];
    
    return state.activityLog.filter(entry => entry.type === type);
  }
  
  /**
   * Get activities for a date range
   */
  getActivitiesInRange(userId: string, startDate: Date, endDate: Date): Array<{
    type: ActivityType;
    timestamp: Date;
    moduleId?: string;
    problemId?: string;
    difficulty?: DifficultyLevel;
  }> {
    const state = ProgressStorage.load(userId);
    if (!state) return [];
    
    return state.activityLog.filter(
      entry => entry.timestamp >= startDate && entry.timestamp <= endDate
    );
  }
  
  /**
   * Get recent activities (last N)
   */
  getRecentActivities(userId: string, count: number = 10): Array<{
    type: ActivityType;
    timestamp: Date;
    moduleId?: string;
    problemId?: string;
    difficulty?: DifficultyLevel;
  }> {
    const state = ProgressStorage.load(userId);
    if (!state) return [];
    
    // Sort by timestamp descending and take first N
    return [...state.activityLog]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, count);
  }
  
  /**
   * Format timestamp as ISO 8601 string
   */
  static formatTimestamp(date: Date): string {
    return date.toISOString();
  }
  
  /**
   * Parse ISO 8601 string to Date
   */
  static parseTimestamp(isoString: string): Date {
    return new Date(isoString);
  }
  
  /**
   * Validate timestamp format
   */
  static isValidTimestamp(timestamp: any): boolean {
    if (!(timestamp instanceof Date)) {
      return false;
    }
    
    return !isNaN(timestamp.getTime());
  }
}
