/**
 * HintSystem - Manages progressive hint reveals for problems
 * 
 * Features: Sequential hint reveal, tracking per user/problem, localStorage persistence
 */

import StorageManager from '../utils/StorageManager';

class HintSystem {
  constructor() {
    this.storageKey = 'learning_platform_hints';
  }

  /**
   * Get revealed hints for a problem
   * @param {string} userId
   * @param {string} problemId
   * @returns {Array<number>} Array of revealed hint levels
   */
  getRevealedHints(userId, problemId) {
    const key = `${this.storageKey}_${userId}_${problemId}`;
    const revealed = StorageManager.load(key);
    return revealed || [];
  }

  /**
   * Get count of revealed hints
   * @param {string} userId
   * @param {string} problemId
   * @returns {number}
   */
  getRevealedCount(userId, problemId) {
    return this.getRevealedHints(userId, problemId).length;
  }

  /**
   * Check if a hint can be revealed
   * @param {string} userId
   * @param {string} problemId
   * @param {number} level - Hint level (1, 2, or 3)
   * @param {number} totalHints - Total number of hints available
   * @returns {boolean}
   */
  canRevealHint(userId, problemId, level, totalHints) {
    // Can't reveal if level is invalid
    if (level < 1 || level > totalHints) {
      return false;
    }
    
    const revealed = this.getRevealedHints(userId, problemId);
    
    // Can't reveal if already revealed
    if (revealed.includes(level)) {
      return false;
    }
    
    // Must reveal hints sequentially (can't skip levels)
    if (level > 1) {
      const previousLevel = level - 1;
      if (!revealed.includes(previousLevel)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Reveal a hint
   * @param {string} userId
   * @param {string} problemId
   * @param {number} level - Hint level to reveal
   * @param {number} totalHints - Total number of hints available
   * @returns {boolean} Success status
   */
  revealHint(userId, problemId, level, totalHints) {
    if (!this.canRevealHint(userId, problemId, level, totalHints)) {
      return false;
    }
    
    const revealed = this.getRevealedHints(userId, problemId);
    revealed.push(level);
    revealed.sort((a, b) => a - b); // Keep sorted
    
    const key = `${this.storageKey}_${userId}_${problemId}`;
    StorageManager.save(key, revealed);
    
    return true;
  }

  /**
   * Reveal next hint in sequence
   * @param {string} userId
   * @param {string} problemId
   * @param {number} totalHints - Total number of hints available
   * @returns {number | null} Level of revealed hint, or null if none available
   */
  revealNextHint(userId, problemId, totalHints) {
    const revealed = this.getRevealedHints(userId, problemId);
    const nextLevel = revealed.length + 1;
    
    if (nextLevel > totalHints) {
      return null; // All hints already revealed
    }
    
    const success = this.revealHint(userId, problemId, nextLevel, totalHints);
    return success ? nextLevel : null;
  }

  /**
   * Check if hint is revealed
   * @param {string} userId
   * @param {string} problemId
   * @param {number} level
   * @returns {boolean}
   */
  isHintRevealed(userId, problemId, level) {
    const revealed = this.getRevealedHints(userId, problemId);
    return revealed.includes(level);
  }

  /**
   * Check if all hints are revealed
   * @param {string} userId
   * @param {string} problemId
   * @param {number} totalHints
   * @returns {boolean}
   */
  areAllHintsRevealed(userId, problemId, totalHints) {
    return this.getRevealedCount(userId, problemId) === totalHints;
  }

  /**
   * Reset hints for a problem
   * @param {string} userId
   * @param {string} problemId
   */
  resetHints(userId, problemId) {
    const key = `${this.storageKey}_${userId}_${problemId}`;
    StorageManager.remove(key);
  }

  /**
   * Get hint usage statistics for a user
   * @param {string} userId
   * @returns {Object}
   */
  getHintStatistics(userId) {
    const stats = {
      totalProblemsWithHints: 0,
      totalHintsRevealed: 0,
      problemsWithAllHintsRevealed: 0,
      hintsByLevel: {
        1: 0,
        2: 0,
        3: 0,
      },
    };
    
    // Scan localStorage for all hint entries for this user
    const prefix = `${this.storageKey}_${userId}_`;
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (key.startsWith(prefix)) {
        const revealed = StorageManager.load(key);
        if (revealed && revealed.length > 0) {
          stats.totalProblemsWithHints++;
          stats.totalHintsRevealed += revealed.length;
          
          // Count by level
          revealed.forEach(level => {
            if (stats.hintsByLevel[level] !== undefined) {
              stats.hintsByLevel[level]++;
            }
          });
          
          // Check if all 3 hints revealed (assuming 3 hints per problem)
          if (revealed.length === 3) {
            stats.problemsWithAllHintsRevealed++;
          }
        }
      }
    });
    
    return stats;
  }

  /**
   * Get next available hint level
   * @param {string} userId
   * @param {string} problemId
   * @param {number} totalHints
   * @returns {number | null} Next hint level, or null if all revealed
   */
  getNextHintLevel(userId, problemId, totalHints) {
    const revealed = this.getRevealedHints(userId, problemId);
    const nextLevel = revealed.length + 1;
    return nextLevel <= totalHints ? nextLevel : null;
  }

  /**
   * Get hint reveal progress
   * @param {string} userId
   * @param {string} problemId
   * @param {number} totalHints
   * @returns {Object} Progress information
   */
  getProgress(userId, problemId, totalHints) {
    const revealed = this.getRevealedCount(userId, problemId);
    return {
      revealed,
      total: totalHints,
      percentage: totalHints > 0 ? Math.round((revealed / totalHints) * 100) : 0,
      allRevealed: revealed === totalHints,
      nextLevel: this.getNextHintLevel(userId, problemId, totalHints),
    };
  }
}

// Export singleton instance
export default new HintSystem();
