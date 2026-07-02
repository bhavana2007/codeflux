/**
 * DataMigration - Handles backward compatibility and data migration
 * 
 * Migrates legacy progress data (2-3 problems per module) to the new
 * format (16 problems per module) while preserving existing data.
 */

import type { ProgressState } from '../types/problem-based-learning';
import { STORAGE_VERSION, FREEZE_TOKENS_PER_MONTH } from '../types/problem-based-learning';
import { ProgressStorage } from './ProgressStorage';

export class DataMigration {
  /**
   * Detect if data needs migration
   */
  static needsMigration(data: any): boolean {
    // Check if version field exists
    if (!data.version) {
      return true;
    }
    
    // Check if version is older than current
    if (data.version < STORAGE_VERSION) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Migrate legacy data to current format
   */
  static migrate(userId: string, legacyData: any): ProgressState {
    console.log(`[DataMigration] Migrating data for user ${userId}`);
    
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    // Initialize with defaults
    const migratedState: ProgressState = {
      userId,
      problemAttempts: new Map(),
      moduleCompletions: new Map(),
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        freezeTokens: FREEZE_TOKENS_PER_MONTH,
        freezeTokensResetDate: nextMonth,
        milestonesReached: []
      },
      learningPath: null,
      activityLog: [],
      lastUpdated: now
    };
    
    // Migrate problem attempts if they exist
    if (legacyData.problemAttempts) {
      try {
        if (legacyData.problemAttempts instanceof Map) {
          migratedState.problemAttempts = legacyData.problemAttempts;
        } else if (typeof legacyData.problemAttempts === 'object') {
          // Convert object to Map
          Object.entries(legacyData.problemAttempts).forEach(([key, value]: [string, any]) => {
            migratedState.problemAttempts.set(key, {
              ...value,
              timestamps: value.timestamps?.map((t: any) => new Date(t)) || [],
              lastAttempt: value.lastAttempt ? new Date(value.lastAttempt) : now
            });
          });
        }
      } catch (error) {
        console.error('[DataMigration] Error migrating problem attempts:', error);
      }
    }
    
    // Migrate module completions if they exist
    if (legacyData.moduleCompletions) {
      try {
        if (legacyData.moduleCompletions instanceof Map) {
          migratedState.moduleCompletions = legacyData.moduleCompletions;
        } else if (typeof legacyData.moduleCompletions === 'object') {
          // Convert object to Map
          Object.entries(legacyData.moduleCompletions).forEach(([key, value]: [string, any]) => {
            migratedState.moduleCompletions.set(key, {
              ...value,
              completedAt: value.completedAt ? new Date(value.completedAt) : null
            });
          });
        }
      } catch (error) {
        console.error('[DataMigration] Error migrating module completions:', error);
      }
    }
    
    // Migrate streak data if it exists
    if (legacyData.streak) {
      try {
        migratedState.streak = {
          currentStreak: legacyData.streak.currentStreak || 0,
          longestStreak: legacyData.streak.longestStreak || 0,
          lastActivityDate: legacyData.streak.lastActivityDate 
            ? new Date(legacyData.streak.lastActivityDate) 
            : null,
          freezeTokens: legacyData.streak.freezeTokens ?? FREEZE_TOKENS_PER_MONTH,
          freezeTokensResetDate: legacyData.streak.freezeTokensResetDate
            ? new Date(legacyData.streak.freezeTokensResetDate)
            : nextMonth,
          milestonesReached: legacyData.streak.milestonesReached || []
        };
      } catch (error) {
        console.error('[DataMigration] Error migrating streak data:', error);
      }
    }
    
    // Migrate learning path if it exists
    if (legacyData.learningPath) {
      try {
        migratedState.learningPath = {
          ...legacyData.learningPath,
          startDate: new Date(legacyData.learningPath.startDate)
        };
      } catch (error) {
        console.error('[DataMigration] Error migrating learning path:', error);
      }
    }
    
    // Migrate activity log if it exists
    if (legacyData.activityLog && Array.isArray(legacyData.activityLog)) {
      try {
        migratedState.activityLog = legacyData.activityLog.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
      } catch (error) {
        console.error('[DataMigration] Error migrating activity log:', error);
      }
    }
    
    // Update last updated timestamp
    if (legacyData.lastUpdated) {
      try {
        migratedState.lastUpdated = new Date(legacyData.lastUpdated);
      } catch (error) {
        console.error('[DataMigration] Error migrating lastUpdated:', error);
      }
    }
    
    console.log('[DataMigration] Migration completed successfully');
    
    return migratedState;
  }
  
  /**
   * Attempt to load and migrate data if needed
   */
  static loadAndMigrate(userId: string): ProgressState | null {
    try {
      const rawData = localStorage.getItem(`codeflux_progress_${userId}`);
      if (!rawData) return null;
      
      const parsed = JSON.parse(rawData);
      
      if (this.needsMigration(parsed)) {
        console.log('[DataMigration] Legacy data detected, migrating...');
        const migrated = this.migrate(userId, parsed);
        
        // Save migrated data
        ProgressStorage.save(userId, migrated);
        
        return migrated;
      }
      
      // Data is current, use normal deserialization
      return ProgressStorage.load(userId);
      
    } catch (error) {
      console.error('[DataMigration] Migration failed:', error);
      return null;
    }
  }
  
  /**
   * Get migration log for debugging
   */
  static getMigrationLog(): string[] {
    const logs: string[] = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('codeflux_progress_')) {
          const data = JSON.parse(localStorage.getItem(key)!);
          const version = data.version || 0;
          logs.push(`${key}: version ${version} ${version < STORAGE_VERSION ? '(needs migration)' : '(current)'}`);
        }
      }
    } catch (error) {
      logs.push(`Error reading migration log: ${error}`);
    }
    
    return logs;
  }
}
