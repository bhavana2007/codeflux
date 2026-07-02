/**
 * LearningPathManager - Manages learning path selection and tracking
 * 
 * Handles learning path selection, calculates progress, and provides
 * estimates for completion.
 */

import type { LearningPathType, LearningPathSelection } from '../types/problem-based-learning';
import { LEARNING_PATHS } from '../types/problem-based-learning';
import { ProgressStorage } from './ProgressStorage';

export class LearningPathManager {
  /**
   * Get available learning paths
   */
  static getAvailablePaths(): Array<{
    path: LearningPathType;
    targetProblems: number;
    targetDays: number;
    dailyTarget: number;
    description: string;
  }> {
    return [
      {
        path: 'Beginner',
        ...LEARNING_PATHS.Beginner,
        description: 'Perfect for those starting their DSA journey. Cover fundamental concepts with 160 problems in 30 days.'
      },
      {
        path: 'Intermediate',
        ...LEARNING_PATHS.Intermediate,
        description: 'Build on your foundation with 240 problems in 45 days. Ideal for interview preparation.'
      },
      {
        path: 'Advanced',
        ...LEARNING_PATHS.Advanced,
        description: 'Master advanced algorithms with 320 problems in 60 days. Comprehensive coverage of all topics.'
      }
    ];
  }
  
  /**
   * Select a learning path for a user
   */
  static selectPath(userId: string, pathType: LearningPathType): void {
    let state = ProgressStorage.load(userId);
    if (!state) {
      state = ProgressStorage.initializeDefaultState(userId);
    }
    
    const pathConfig = LEARNING_PATHS[pathType];
    
    state.learningPath = {
      path: pathType,
      startDate: new Date(),
      targetProblems: pathConfig.targetProblems,
      targetDays: pathConfig.targetDays,
      dailyTarget: pathConfig.dailyTarget
    };
    
    state.lastUpdated = new Date();
    ProgressStorage.save(userId, state);
  }
  
  /**
   * Get current learning path
   */
  static getCurrentPath(userId: string): LearningPathSelection | null {
    const state = ProgressStorage.load(userId);
    return state?.learningPath || null;
  }
  
  /**
   * Calculate remaining problems
   */
  static getRemainingProblems(userId: string, totalSolved: number): number {
    const path = this.getCurrentPath(userId);
    if (!path) return 0;
    
    return Math.max(0, path.targetProblems - totalSolved);
  }
  
  /**
   * Calculate estimated days to completion
   */
  static getEstimatedDaysToCompletion(
    userId: string,
    totalSolved: number,
    averagePerDay: number
  ): number {
    const remaining = this.getRemainingProblems(userId, totalSolved);
    
    if (averagePerDay === 0) {
      const path = this.getCurrentPath(userId);
      return path ? path.targetDays : 0;
    }
    
    return Math.ceil(remaining / averagePerDay);
  }
  
  /**
   * Get daily target
   */
  static getDailyTarget(userId: string): number {
    const path = this.getCurrentPath(userId);
    return path ? path.dailyTarget : 0;
  }
  
  /**
   * Get current daily average
   */
  static getCurrentDailyAverage(userId: string, totalSolved: number): number {
    const path = this.getCurrentPath(userId);
    if (!path) return 0;
    
    const now = new Date();
    const daysSinceStart = this.daysBetween(path.startDate, now);
    
    if (daysSinceStart === 0) return 0;
    
    return totalSolved / daysSinceStart;
  }
  
  /**
   * Calculate days between two dates
   */
  private static daysBetween(date1: Date, date2: Date): number {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    const diffMs = d2.getTime() - d1.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Get progress summary
   */
  static getProgressSummary(userId: string, totalSolved: number): {
    pathName: string;
    targetProblems: number;
    problemsSolved: number;
    remaining: number;
    percentComplete: number;
    dailyTarget: number;
    currentAverage: number;
    estimatedDaysRemaining: number;
  } | null {
    const path = this.getCurrentPath(userId);
    if (!path) return null;
    
    const remaining = this.getRemainingProblems(userId, totalSolved);
    const percentComplete = Math.round((totalSolved / path.targetProblems) * 100);
    const currentAverage = this.getCurrentDailyAverage(userId, totalSolved);
    const estimatedDaysRemaining = this.getEstimatedDaysToCompletion(
      userId,
      totalSolved,
      currentAverage
    );
    
    return {
      pathName: path.path,
      targetProblems: path.targetProblems,
      problemsSolved: totalSolved,
      remaining,
      percentComplete,
      dailyTarget: path.dailyTarget,
      currentAverage,
      estimatedDaysRemaining
    };
  }
}
