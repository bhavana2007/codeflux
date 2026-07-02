/**
 * ProgressAnalyzer - Analyzes progress and generates insights
 * 
 * Calculates progress metrics, determines if user is on track,
 * and generates recommendations based on learning path targets.
 */

import type {
  DifficultyBreakdown,
  ProgressStatus,
  DifficultyLevel
} from '../types/problem-based-learning';

import {
  PROGRESS_STATUS_THRESHOLD,
  DIFFICULTY_TIME_ESTIMATES
} from '../types/problem-based-learning';

import { ProgressStorage } from './ProgressStorage';

export class ProgressAnalyzer {
  /**
   * Get problems solved by difficulty level
   */
  getProblemsSolvedByDifficulty(userId: string): DifficultyBreakdown {
    const state = ProgressStorage.load(userId);
    if (!state) {
      return { easy: 0, medium: 0, hard: 0, total: 0 };
    }
    
    let easy = 0;
    let medium = 0;
    let hard = 0;
    
    state.problemAttempts.forEach(attempt => {
      if (attempt.solved) {
        if (attempt.difficulty === 'Easy') easy++;
        else if (attempt.difficulty === 'Medium') medium++;
        else if (attempt.difficulty === 'Hard') hard++;
      }
    });
    
    return {
      easy,
      medium,
      hard,
      total: easy + medium + hard
    };
  }
  
  /**
   * Get problems solved today
   */
  getProblemsToday(userId: string): number {
    const state = ProgressStorage.load(userId);
    if (!state) return 0;
    
    const today = new Date();
    let count = 0;
    
    state.activityLog.forEach(entry => {
      if (entry.type === 'problem_solved' && this.isSameDay(entry.timestamp, today)) {
        count++;
      }
    });
    
    return count;
  }
  
  /**
   * Get average problems per day over last N days
   */
  getAverageProblemsPerDay(userId: string, days: number): number {
    const state = ProgressStorage.load(userId);
    if (!state) return 0;
    
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    
    let count = 0;
    
    state.activityLog.forEach(entry => {
      if (entry.type === 'problem_solved' && entry.timestamp >= startDate) {
        count++;
      }
    });
    
    // Avoid division by zero
    if (days === 0) return 0;
    
    return count / days;
  }
  
  /**
   * Get progress status (on track, ahead, behind)
   */
  getProgressStatus(userId: string): ProgressStatus {
    const state = ProgressStorage.load(userId);
    
    if (!state || !state.learningPath) {
      return {
        status: 'no path selected',
        daysAheadOrBehind: 0,
        averageProblemsPerDay: 0,
        targetProblemsPerDay: 0
      };
    }
    
    const learningPath = state.learningPath;
    const now = new Date();
    const daysSinceStart = this.daysBetween(learningPath.startDate, now);
    
    const breakdown = this.getProblemsSolvedByDifficulty(userId);
    const totalProblemsSolved = breakdown.total;
    
    const expectedProblems = daysSinceStart * learningPath.dailyTarget;
    const difference = totalProblemsSolved - expectedProblems;
    
    const averageLast7Days = this.getAverageProblemsPerDay(userId, 7);
    
    if (difference >= PROGRESS_STATUS_THRESHOLD) {
      return {
        status: 'ahead',
        daysAheadOrBehind: Math.floor(difference / learningPath.dailyTarget),
        averageProblemsPerDay: averageLast7Days,
        targetProblemsPerDay: learningPath.dailyTarget
      };
    } else if (difference <= -PROGRESS_STATUS_THRESHOLD) {
      return {
        status: 'behind',
        daysAheadOrBehind: Math.ceil(difference / learningPath.dailyTarget),
        averageProblemsPerDay: averageLast7Days,
        targetProblemsPerDay: learningPath.dailyTarget
      };
    } else {
      return {
        status: 'on track',
        daysAheadOrBehind: 0,
        averageProblemsPerDay: averageLast7Days,
        targetProblemsPerDay: learningPath.dailyTarget
      };
    }
  }
  
  /**
   * Get days ahead or behind schedule
   */
  getDaysAheadOrBehind(userId: string): number {
    const status = this.getProgressStatus(userId);
    return status.daysAheadOrBehind;
  }
  
  /**
   * Generate recommendation based on progress
   */
  getRecommendation(userId: string): string {
    const status = this.getProgressStatus(userId);
    
    if (status.status === 'no path selected') {
      return 'Select a learning path to get personalized recommendations!';
    }
    
    const breakdown = this.getProblemsSolvedByDifficulty(userId);
    const problemsToday = this.getProblemsToday(userId);
    
    if (status.status === 'ahead') {
      return `Great job! You're ${Math.abs(status.daysAheadOrBehind)} days ahead of schedule. Keep up the excellent work! 🎉`;
    } else if (status.status === 'behind') {
      const additionalPerDay = Math.ceil(
        (Math.abs(status.daysAheadOrBehind) * status.targetProblemsPerDay) / 7
      );
      return `You're ${Math.abs(status.daysAheadOrBehind)} days behind. Try solving ${Math.ceil(status.targetProblemsPerDay + additionalPerDay)} problems per day this week to catch up.`;
    } else {
      const remaining = Math.ceil(status.targetProblemsPerDay - problemsToday);
      if (remaining > 0) {
        return `You're on track! Solve ${remaining} more problem${remaining > 1 ? 's' : ''} today to stay on schedule.`;
      } else {
        return `Excellent! You've met your daily target. Keep going or take a well-deserved break! ✨`;
      }
    }
  }
  
  /**
   * Get estimated time remaining for a module
   */
  getTimeRemaining(userId: string, moduleId: string, problems: any[]): number {
    const state = ProgressStorage.load(userId);
    if (!state) return 0;
    
    let totalEstimatedTime = 0;
    
    problems.forEach(problem => {
      const key = `${moduleId}:${problem.id}`;
      const attempt = state.problemAttempts.get(key);
      
      // If not solved, add estimated time
      if (!attempt || !attempt.solved) {
        const estimate = DIFFICULTY_TIME_ESTIMATES[problem.difficulty as DifficultyLevel];
        // Use average of min and max
        totalEstimatedTime += (estimate.min + estimate.max) / 2;
      }
    });
    
    return Math.ceil(totalEstimatedTime);
  }
  
  /**
   * Get attempt count for a problem
   */
  getAttemptCount(userId: string, moduleId: string, problemId: string): number {
    const state = ProgressStorage.load(userId);
    if (!state) return 0;
    
    const key = `${moduleId}:${problemId}`;
    const attempt = state.problemAttempts.get(key);
    
    return attempt ? attempt.attempts : 0;
  }
  
  /**
   * Check if two dates are the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
  
  /**
   * Calculate days between two dates
   */
  private daysBetween(date1: Date, date2: Date): number {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    const diffMs = d2.getTime() - d1.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
}
