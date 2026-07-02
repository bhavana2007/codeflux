/**
 * ProgressStorage - localStorage wrapper for progress persistence
 * 
 * Provides save/load/clear/exists methods with error handling for
 * localStorage operations. Falls back to in-memory storage if localStorage
 * is unavailable or quota is exceeded.
 */

import type { ProgressState } from '../types/problem-based-learning';
import { STORAGE_KEY_PREFIX, FREEZE_TOKENS_PER_MONTH } from '../types/problem-based-learning';
import { ProgressSerializer, ProgressDeserializer } from './ProgressSerializer';

export class ProgressStorage {
  private static inMemoryStorage: Map<string, string> = new Map();
  private static useInMemory = false;
  
  /**
   * Get storage key for a user
   */
  private static getKey(userId: string): string {
    return `${STORAGE_KEY_PREFIX}${userId}`;
  }
  
  /**
   * Check if localStorage is available
   */
  private static isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Save progress state to storage
   */
  static save(userId: string, progress: ProgressState): void {
    const key = this.getKey(userId);
    const serialized = ProgressSerializer.serialize(progress);
    
    if (this.useInMemory || !this.isLocalStorageAvailable()) {
      this.inMemoryStorage.set(key, serialized);
      if (!this.useInMemory) {
        console.warn('[ProgressStorage] localStorage unavailable, using in-memory storage');
        this.useInMemory = true;
      }
      return;
    }
    
    try {
      localStorage.setItem(key, serialized);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('[ProgressStorage] localStorage quota exceeded, attempting cleanup');
        this.attemptCleanup();
        
        try {
          localStorage.setItem(key, serialized);
        } catch (retryError) {
          console.error('[ProgressStorage] Cleanup failed, falling back to in-memory storage');
          this.useInMemory = true;
          this.inMemoryStorage.set(key, serialized);
        }
      } else {
        console.error('[ProgressStorage] Save failed:', error);
        this.useInMemory = true;
        this.inMemoryStorage.set(key, serialized);
      }
    }
  }
  
  /**
   * Load progress state from storage
   */
  static load(userId: string): ProgressState | null {
    const key = this.getKey(userId);
    
    if (this.useInMemory) {
      const data = this.inMemoryStorage.get(key);
      if (!data) return null;
      
      try {
        return ProgressDeserializer.deserialize(data);
      } catch (error) {
        console.error('[ProgressStorage] Deserialization failed:', error);
        return null;
      }
    }
    
    if (!this.isLocalStorageAvailable()) {
      return null;
    }
    
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      
      return ProgressDeserializer.deserialize(data);
    } catch (error) {
      console.error('[ProgressStorage] Load failed:', error);
      return null;
    }
  }
  
  /**
   * Clear progress state for a user
   */
  static clear(userId: string): void {
    const key = this.getKey(userId);
    
    if (this.useInMemory) {
      this.inMemoryStorage.delete(key);
      return;
    }
    
    if (!this.isLocalStorageAvailable()) {
      return;
    }
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('[ProgressStorage] Clear failed:', error);
    }
  }
  
  /**
   * Check if progress state exists for a user
   */
  static exists(userId: string): boolean {
    const key = this.getKey(userId);
    
    if (this.useInMemory) {
      return this.inMemoryStorage.has(key);
    }
    
    if (!this.isLocalStorageAvailable()) {
      return false;
    }
    
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error('[ProgressStorage] Exists check failed:', error);
      return false;
    }
  }
  
  /**
   * Attempt to clean up old data to free space
   */
  private static attemptCleanup(): void {
    try {
      // Remove any non-codeflux keys (be conservative)
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith(STORAGE_KEY_PREFIX)) {
          // Only remove keys that look like temporary data
          if (key.startsWith('temp_') || key.startsWith('cache_')) {
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      if (keysToRemove.length > 0) {
        console.log(`[ProgressStorage] Cleaned up ${keysToRemove.length} temporary items`);
      }
    } catch (error) {
      console.error('[ProgressStorage] Cleanup failed:', error);
    }
  }
  
  /**
   * Initialize default progress state for a new user
   */
  static initializeDefaultState(userId: string): ProgressState {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    return {
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
  }
}
