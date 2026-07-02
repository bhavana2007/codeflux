import StorageManager from './StorageManager';

/**
 * ProgressTracker - Manages user progress across all learning activities
 * Now supports per-user progress tracking
 */

const PROGRESS_KEY_PREFIX = 'learning_platform_progress_';

class ProgressTracker {
  constructor() {
    this.currentUser = null;
    this.progress = { modules: {} };
    this.ACTIVITY_KEY_PREFIX = 'learning_platform_activity_';
  }

  /**
   * Set the current user and load their progress
   * @param {string} username
   */
  setCurrentUser(username) {
    this.currentUser = username;
    this.progress = this._loadProgress();
  }

  /**
   * Get the storage key for the current user
   * @private
   */
  _getStorageKey() {
    if (!this.currentUser) {
      // Fallback to global key if no user is set (backward compatibility)
      return 'learning_platform_progress';
    }
    return `${PROGRESS_KEY_PREFIX}${this.currentUser}`;
  }

  /**
   * Get the activity storage key for daily tracking
   * @private
   */
  _getActivityStorageKey() {
    if (!this.currentUser) {
      return 'learning_platform_daily_activity';
    }
    return `${this.ACTIVITY_KEY_PREFIX}${this.currentUser}`;
  }

  _loadProgress() {
    const data = StorageManager.load(this._getStorageKey());
    return data || { modules: {} };
  }

  _saveProgress() {
    StorageManager.save(this._getStorageKey(), this.progress);
  }

  /**
   * Load daily activity data
   * @private
   */
  _loadDailyActivity() {
    const data = StorageManager.load(this._getActivityStorageKey());
    return data || {};
  }

  /**
   * Save daily activity data
   * @private
   */
  _saveDailyActivity(activityData) {
    StorageManager.save(this._getActivityStorageKey(), activityData);
  }

  /**
   * Track an activity for today
   * @private
   */
  _trackDailyActivity() {
    const today = new Date().toISOString().split('T')[0];
    const activityData = this._loadDailyActivity();
    
    if (!activityData[today]) {
      activityData[today] = 0;
    }
    activityData[today]++;
    
    this._saveDailyActivity(activityData);
  }

  _getModuleData(moduleId) {
    if (!this.progress.modules[moduleId]) {
      this.progress.modules[moduleId] = {
        documentationComplete: false,
        videosWatched: [],
        quizScore: null,
        problemsSolved: [],
        completionPercentage: 0
      };
    }
    return this.progress.modules[moduleId];
  }

  /**
   * Mark documentation as complete for a module
   * @param {string} moduleId
   */
  markDocumentationComplete(moduleId) {
    const moduleData = this._getModuleData(moduleId);
    moduleData.documentationComplete = true;
    this._updateCompletionPercentage(moduleId);
    this._trackDailyActivity(); // Track activity for the day
    this._saveProgress();
  }

  /**
   * Mark a video as watched
   * @param {string} moduleId
   * @param {string} videoId
   */
  markVideoComplete(moduleId, videoId) {
    const moduleData = this._getModuleData(moduleId);
    if (!moduleData.videosWatched.includes(videoId)) {
      moduleData.videosWatched.push(videoId);
    }
    this._updateCompletionPercentage(moduleId);
    this._trackDailyActivity(); // Track activity for the day
    this._saveProgress();
  }

  /**
   * Mark quiz as complete with score
   * @param {string} moduleId
   * @param {number} score - Score as percentage (0-100)
   */
  markQuizComplete(moduleId, score) {
    const moduleData = this._getModuleData(moduleId);
    moduleData.quizScore = score;
    this._updateCompletionPercentage(moduleId);
    this._trackDailyActivity(); // Track activity for the day
    this._saveProgress();
  }

  /**
   * Mark a problem as solved
   * @param {string} moduleId
   * @param {string} problemId
   */
  markProblemComplete(moduleId, problemId) {
    const moduleData = this._getModuleData(moduleId);
    if (!moduleData.problemsSolved.includes(problemId)) {
      moduleData.problemsSolved.push(problemId);
    }
    this._updateCompletionPercentage(moduleId);
    this._trackDailyActivity(); // Track activity for the day
    this._saveProgress();
  }

  /**
   * Get daily activity data for the last N days
   * @param {number} days - Number of days to retrieve (default: 90)
   * @returns {Object} Activity data keyed by date (YYYY-MM-DD)
   */
  getDailyActivityData(days = 90) {
    const activityData = this._loadDailyActivity();
    const result = {};
    
    // Initialize last N days with 0
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      result[dateStr] = activityData[dateStr] || 0;
    }
    
    return result;
  }

  /**
   * Calculate current streak
   * @returns {number} Number of consecutive days with activity
   */
  calculateStreak() {
    const activityData = this._loadDailyActivity();
    let streak = 0;
    const today = new Date();
    
    // Start from today and go back
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (activityData[dateStr] && activityData[dateStr] > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  /**
   * Get total active days in the last N days
   * @param {number} days - Number of days to check (default: 90)
   * @returns {number} Number of days with activity
   */
  getActiveDaysCount(days = 90) {
    const activityData = this.getDailyActivityData(days);
    return Object.values(activityData).filter(count => count > 0).length;
  }

  /**
   * Get progress for a specific module
   * @param {string} moduleId
   * @returns {import('../types').ModuleProgress}
   */
  getModuleProgress(moduleId) {
    return {
      moduleId,
      ...this._getModuleData(moduleId)
    };
  }

  /**
   * Calculate and update completion percentage for a module
   * @param {string} moduleId
   * @private
   */
  _updateCompletionPercentage(moduleId) {
    const moduleData = this._getModuleData(moduleId);
    
    // Calculate completion based on available activities
    // Each activity type counts as 25% of total completion
    let completed = 0;
    let total = 4; // documentation, videos, quiz, problems
    
    if (moduleData.documentationComplete) completed++;
    if (moduleData.videosWatched.length > 0) completed++;
    if (moduleData.quizScore !== null) completed++;
    if (moduleData.problemsSolved.length > 0) completed++;
    
    moduleData.completionPercentage = Math.round((completed / total) * 100);
  }

  /**
   * Get overall progress across all modules
   * @returns {number} Overall completion percentage
   */
  getOverallProgress() {
    const moduleIds = Object.keys(this.progress.modules);
    if (moduleIds.length === 0) return 0;
    
    const totalPercentage = moduleIds.reduce((sum, id) => {
      return sum + this.progress.modules[id].completionPercentage;
    }, 0);
    
    return Math.round(totalPercentage / moduleIds.length);
  }

  /**
   * Get all modules progress
   * @returns {Object.<string, import('../types').ModuleProgress>}
   */
  getAllProgress() {
    return this.progress.modules;
  }
}

export default new ProgressTracker();
