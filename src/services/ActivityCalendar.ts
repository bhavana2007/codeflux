/**
 * ActivityCalendar - Generates activity heatmap data
 * 
 * Creates 90-day activity calendar showing daily problem-solving activity
 * with intensity levels for heatmap visualization.
 */

import type { ActivityDay, HeatmapData } from '../types/problem-based-learning';
import { ACTIVITY_CALENDAR_DAYS } from '../types/problem-based-learning';
import { ProgressStorage } from './ProgressStorage';

export class ActivityCalendar {
  /**
   * Get activity data for specified number of days
   */
  getActivityData(userId: string, days: number = ACTIVITY_CALENDAR_DAYS): ActivityDay[] {
    const state = ProgressStorage.load(userId);
    if (!state) {
      return this.initializeEmptyDays(days);
    }
    
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days + 1);
    
    // Initialize all days with 0 count
    const activityDays = this.initializeEmptyDays(days);
    
    // Count problems per day
    state.activityLog.forEach(entry => {
      if (entry.type === 'problem_solved' && entry.timestamp >= startDate) {
        const dayIndex = this.daysBetween(startDate, entry.timestamp);
        if (dayIndex >= 0 && dayIndex < days) {
          activityDays[dayIndex].problemCount++;
        }
      }
    });
    
    return activityDays;
  }
  
  /**
   * Get problem count for a specific date
   */
  getProblemCountForDate(userId: string, date: Date): number {
    const state = ProgressStorage.load(userId);
    if (!state) return 0;
    
    let count = 0;
    
    state.activityLog.forEach(entry => {
      if (entry.type === 'problem_solved' && this.isSameDay(entry.timestamp, date)) {
        count++;
      }
    });
    
    return count;
  }
  
  /**
   * Generate heatmap data with intensity calculation
   */
  generateHeatmap(userId: string): HeatmapData {
    const days = this.getActivityData(userId, ACTIVITY_CALENDAR_DAYS);
    
    // Find max problems in a day
    const maxProblems = Math.max(...days.map(d => d.problemCount), 1);
    
    // Calculate intensity (0-4 scale)
    days.forEach(day => {
      if (day.problemCount === 0) {
        day.intensity = 0;
      } else if (day.problemCount <= maxProblems * 0.25) {
        day.intensity = 1;
      } else if (day.problemCount <= maxProblems * 0.5) {
        day.intensity = 2;
      } else if (day.problemCount <= maxProblems * 0.75) {
        day.intensity = 3;
      } else {
        day.intensity = 4;
      }
    });
    
    return {
      days,
      maxProblems
    };
  }
  
  /**
   * Initialize empty days array
   */
  private initializeEmptyDays(days: number): ActivityDay[] {
    const result: ActivityDay[] = [];
    const endDate = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      
      result.push({
        date,
        problemCount: 0,
        intensity: 0
      });
    }
    
    return result;
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
  
  /**
   * Get weekly summary (problems per week for last N weeks)
   */
  getWeeklySummary(userId: string, weeks: number = 12): number[] {
    const state = ProgressStorage.load(userId);
    if (!state) return new Array(weeks).fill(0);
    
    const endDate = new Date();
    const summary: number[] = new Array(weeks).fill(0);
    
    state.activityLog.forEach(entry => {
      if (entry.type === 'problem_solved') {
        const weekIndex = Math.floor(this.daysBetween(entry.timestamp, endDate) / 7);
        if (weekIndex >= 0 && weekIndex < weeks) {
          summary[weeks - 1 - weekIndex]++;
        }
      }
    });
    
    return summary;
  }
}
