/**
 * ContentLoader - Fetches and validates JSON content files
 */

class ContentLoader {
  /**
   * Load a single module from JSON file
   * @param {string} moduleId
   * @returns {Promise<import('../types').ContentModule|null>}
   */
  async loadModule(moduleId) {
    try {
      const response = await fetch(`/src/data/modules/${moduleId}.json`);
      
      if (!response.ok) {
        throw new Error(`Failed to load module: ${moduleId}`);
      }
      
      const data = await response.json();
      
      // Validate required fields
      if (!this._validateModule(data)) {
        throw new Error(`Invalid module data for: ${moduleId}`);
      }
      
      return data;
    } catch (error) {
      console.error(`Error loading module ${moduleId}:`, error);
      return null;
    }
  }

  /**
   * Load all available modules
   * @returns {Promise<import('../types').ContentModule[]>}
   */
  async loadAllModules() {
    try {
      // Use Vite's glob import to get all module files
      const modules = import.meta.glob('/src/data/modules/*.json', { eager: true });
      
      const loadedModules = Object.values(modules).map((module) => {
        try {
          const data = module.default || module;
          
          if (this._validateModule(data)) {
            return data;
          }
          return null;
        } catch (error) {
          console.error(`Error processing module:`, error);
          return null;
        }
      });
      
      // Filter out null values and sort by order (or title if no order)
      return loadedModules
        .filter(m => m !== null)
        .sort((a, b) => {
          // Sort by order field if both have it
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          // If only one has order, prioritize it
          if (a.order !== undefined) return -1;
          if (b.order !== undefined) return 1;
          // Fallback to alphabetical by title
          return a.title.localeCompare(b.title);
        });
    } catch (error) {
      console.error('Error loading modules:', error);
      return [];
    }
  }

  /**
   * Validate module data structure
   * @param {any} data
   * @returns {boolean}
   * @private
   */
  _validateModule(data) {
    if (!data || typeof data !== 'object') {
      console.error('Module data is not an object');
      return false;
    }
    
    const requiredFields = ['id', 'title'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      console.error(`Module missing required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    return true;
  }

  /**
   * Handle malformed JSON with user-friendly error
   * @param {Error} error
   * @returns {string}
   */
  getErrorMessage(error) {
    if (error instanceof SyntaxError) {
      return 'The content file is malformed. Please check the JSON syntax.';
    }
    if (error.message.includes('Failed to load')) {
      return 'Content file not found. Please check if the file exists.';
    }
    return 'An error occurred while loading content. Please try again.';
  }
}

export default new ContentLoader();
