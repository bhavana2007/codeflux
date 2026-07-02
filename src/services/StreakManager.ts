/**
 * StreakManager - Manages daily problem-solving streaks
 * 
 * Tracks consecutive days of problem-solving activity, manages freeze tokens,
 * and identifies streak milestones.
 */

import { STREAK_MILESTONES, FREEZE_TOKENS_PER_MONTH } from '../types/problem-based-learning';
import { ProgressStorage } from './ProgressStorage';

export class StreakManager {
  /**
   * Get current streak for a user
   */
  getCurrentStreak(userId: string): number {
    const state = ProgressStorage.load(userId);
    if (!state) return 0;
    
    return state.streak.currentStreak;
  }
  
  /**
   * Update streak based on activity date
   */
  updateStreak(userId: string, activityDate: Date): void {
    let state = ProgressStorage.load(userId);
    if (!state) {
      state = ProgressStorage.initializeDefaultState(userId);
    }
    
    const lastDate = state.streak.lastActivityDate;
    
    // First activity ever
    if (!lastDate) {
      state.streak.currentStreak = 1;
      state.streak.lastActivityDate = activityDate;
      state.lastUpdated = new Date();
      ProgressStorage.save(userId, state);
      return;
    }
    
    // Same day activity (no change)
    if (this.isSameDay(activityDate, lastDate)) {
      return;
    }
    
    // Consecutive day
    if (this.isConsecutiveDay(activityDate, lastDate)) {
      state.streak.currentStreak++;
      state.streak.lastActivityDate = activityDate;
      
      // Check for milestone
      this.checkMilestone(state.streak);
      
      state.lastUpdated = new Date();
      ProgressStorage.save(userId, state);
      return;
    }
    
    // Missed one day - check for freeze
    const daysBetween = this.daysBetween(lastDate, activityDate);
    if (daysBetween === 2 && state.streak.freezeTokens > 0) {
      // Apply freeze token
      state.streak.freezeTokens--;
      state.streak.currentStreak++;
      state.streak.lastActivityDate = activityDate;
      
      console.log(`[StreakManager] Freeze token applied. Tokens remaining: ${state.streak.freezeTokens}`);
      
      state.lastUpdated = new Date();
      ProgressStorage.save(userId, state);
      return;
    }
    
    // Streak broken
    if (state.streak.currentStreak > state.streak.longestStreak) {
      state.streak.longestStreak = state.streak.currentStreak;
    }
    
    state.streak.currentStreak = 1;
    state.streak.lastActivityDate = activityDate;
    state.lastUpdated = new Date();
    ProgressStorage.save(userId, state);
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
   * Check if date2 is the day after date1
   */
  private isConsecutiveDay(date2: Date, date1: Date): boolean {
    const nextDay = new Date(date1);
    nextDay.setDate(nextDay.getDate() + 1);
    return this.isSameDay(date2, nextDay);
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
  
  /**
   * Check and record milestone achievement
   */
  private checkMilestone(streak: any): void {
    const currentStreak = streak.currentStreak;
    
    STREAK_MILESTONES.forEach(milestone => {
      if (currentStreak === milestone && !streak.milestonesReached.includes(milestone)) {
        streak.milestonesReached.push(milestone);
        console.log(`[StreakManager] 🎉 Milestone reached: ${milestone} day streak!`);
      }
    });
  }
  
  /**
   * Get available freeze tokens
   */
  getFreezeTokens(userId: string): number {
    const state = ProgressStorage.load(userId);
    if (!state) return FREEZE_TOKENS_PER_MONTH;
    
    // Check if tokens need to be reset
    this.checkFreezeTokenReset(userId);
    
    return state.streak.freezeTokens;
  }
  
  /**
   * Manually apply a freeze token (for testing or manual intervention)
   */
  applyFreeze(userId: string): boolean {
    let state = ProgressStorage.load(userId);
    if (!state) return false;
    
    if (state.streak.freezeTokens <= 0) {
      return false;
    }
    
    state.streak.freezeTokens--;
    state.lastUpdated = new Date();
    ProgressStorage.save(userId, state);
    
    return true;
  }
  
  /**
   * Check if freeze tokens need to be reset (monthly)
   */
  private checkFreezeTokenReset(userId: string): void {
    let state = ProgressStorage.load(userId);
    if (!state) return;
    
    const now = new Date();
    const resetDate = state.streak.freezeTokensResetDate;
    
    if (now >= resetDate) {
      state.streak.freezeTokens = FREEZE_TOKENS_PER_MONTH;
      state.streak.freezeTokensResetDate = this.getFirstDayOfNextMonth(now);
      state.lastUpdated = new Date();
      ProgressStorage.save(userId, state);
      
      console.log(`[StreakManager] Freeze tokens reset to ${FREEZE_TOKENS_PER_MONTH}`);
    }
  }
  
  /**
   * Get first day of next month
   */
  private getFirstDayOfNextMonth(date: Date): Date {
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return nextMonth;
  }
  
  /**
   * Get streak milestones
   */
  getStreakMilestones(): number[] {
    return [...STREAK_MILESTONES];
  }
  
  /**
   * Check if user has reached a specific milestone
   */
  hasReachedMilestone(userId: string, milestone: number): boolean {
    const state = ProgressStorage.load(userId);
    if (!state) return false;
    
    return state.streak.milestonesReached.includes(milestone);
  }
  
  /**
   * Get longest streak
   */
  getLongestStreak(userId: string): number {
    const state = ProgressStorage.load(userId);
    if (!state) return 0;
    
    return state.streak.longestStreak;
  }
}
