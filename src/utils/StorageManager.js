/**
 * StorageManager - Handles all local storage operations with error handling
 */

class StorageManager {
  /**
   * Save data to local storage
   * @template T
   * @param {string} key
   * @param {T} value
   * @returns {boolean} Success status
   */
  save(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Local storage quota exceeded. Please clear some data.');
      } else {
        console.error('Error saving to local storage:', error);
      }
      return false;
    }
  }

  /**
   * Load data from local storage
   * @template T
   * @param {string} key
   * @returns {T|null}
   */
  load(key) {
    try {
      const serialized = localStorage.getItem(key);
      if (serialized === null) {
        return null;
      }
      return JSON.parse(serialized);
    } catch (error) {
      console.error('Error loading from local storage:', error);
      return null;
    }
  }

  /**
   * Remove data from local storage
   * @param {string} key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from local storage:', error);
    }
  }

  /**
   * Clear all data from local storage
   */
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing local storage:', error);
    }
  }
}

export default new StorageManager();
