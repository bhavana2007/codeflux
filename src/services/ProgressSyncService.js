class ProgressSyncService {
  /**
   * Save user progress to localStorage
   */
  async saveProgress(userId, progressData) {
    try {
      localStorage.setItem(`codeflux_progress_${userId}`, JSON.stringify({
        ...progressData,
        lastUpdated: new Date().toISOString()
      }));
      return { success: true };
    } catch (error) {
      console.error('Error saving progress:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load user progress from localStorage
   */
  async loadProgress(userId) {
    try {
      const progressData = localStorage.getItem(`codeflux_progress_${userId}`);
      if (progressData) {
        return { success: true, data: JSON.parse(progressData) };
      }
      return { success: true, data: null };
    } catch (error) {
      console.error('Error loading progress:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update specific module progress
   */
  async updateModuleProgress(userId, moduleId, progressData) {
    try {
      const existingProgress = await this.loadProgress(userId);
      const progress = existingProgress.data || {};
      
      if (!progress.modules) {
        progress.modules = {};
      }
      
      progress.modules[moduleId] = progressData;
      progress.lastUpdated = new Date().toISOString();
      
      await this.saveProgress(userId, progress);
      return { success: true };
    } catch (error) {
      console.error('Error updating module progress:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Migrate old localStorage progress to user-specific progress
   */
  async migrateLocalProgress(userId) {
    try {
      // Get all progress data from old localStorage keys
      const localProgress = {};
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Only migrate old keys that don't have user ID
        if (key.startsWith('codeflux_') && !key.includes('_user_') && !key.includes('_progress_')) {
          const value = localStorage.getItem(key);
          try {
            localProgress[key] = JSON.parse(value);
          } catch {
            localProgress[key] = value;
          }
        }
      }

      // Save to user-specific progress
      if (Object.keys(localProgress).length > 0) {
        await this.saveProgress(userId, localProgress);
        return { success: true, migrated: true };
      }

      return { success: true, migrated: false };
    } catch (error) {
      console.error('Error migrating progress:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new ProgressSyncService();
