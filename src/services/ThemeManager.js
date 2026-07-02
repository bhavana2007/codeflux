/**
 * ThemeManager - Manages light and dark theme with persistence
 * 
 * Handles theme detection, storage, and application across the platform.
 * Supports system preference detection and user preference persistence.
 */

class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.storageKey = 'learning_platform_theme';
    this.listeners = new Set();
  }

  /**
   * Initialize theme manager
   * Loads saved preference or detects system preference
   */
  initialize() {
    const savedTheme = this.loadPreference();
    
    if (savedTheme) {
      this.currentTheme = savedTheme;
    } else {
      this.currentTheme = this.detectSystemPreference();
    }
    
    this.applyTheme(this.currentTheme);
    
    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only auto-switch if user hasn't set a preference
        if (!this.loadPreference()) {
          const newTheme = e.matches ? 'dark' : 'light';
          this.setTheme(newTheme);
        }
      });
    }
  }

  /**
   * Get current theme
   * @returns {'light' | 'dark'}
   */
  getTheme() {
    return this.currentTheme;
  }

  /**
   * Set theme
   * @param {'light' | 'dark'} theme
   */
  setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
      console.warn(`Invalid theme: ${theme}. Using 'light' as fallback.`);
      theme = 'light';
    }

    this.currentTheme = theme;
    this.applyTheme(theme);
    this.savePreference(theme);
    this.notifyListeners(theme);
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Detect system color scheme preference
   * @returns {'light' | 'dark'}
   */
  detectSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Apply theme to document
   * @param {'light' | 'dark'} theme
   */
  applyTheme(theme) {
    const startTime = performance.now();
    
    // Set data-theme attribute on document root
    document.documentElement.setAttribute('data-theme', theme);
    
    // Also set a class for easier CSS targeting
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Ensure theme applies within 100ms (requirement)
    if (duration > 100) {
      console.warn(`Theme application took ${duration.toFixed(2)}ms (should be < 100ms)`);
    }
  }

  /**
   * Save theme preference to localStorage
   * @param {'light' | 'dark'} theme
   */
  savePreference(theme) {
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }

  /**
   * Load theme preference from localStorage
   * @returns {'light' | 'dark' | null}
   */
  loadPreference() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
      return null;
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      return null;
    }
  }

  /**
   * Add theme change listener
   * @param {Function} callback - Called with new theme when it changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of theme change
   * @param {'light' | 'dark'} theme
   * @private
   */
  notifyListeners(theme) {
    this.listeners.forEach(callback => {
      try {
        callback(theme);
      } catch (error) {
        console.error('Error in theme change listener:', error);
      }
    });
  }

  /**
   * Get theme colors for current theme
   * @returns {Object} Color scheme object
   */
  getColors() {
    const colors = {
      light: {
        bgPrimary: '#ffffff',
        bgSecondary: '#f8fafc',
        bgTertiary: '#e2e8f0',
        textPrimary: '#1e293b',
        textSecondary: '#475569',
        textTertiary: '#64748b',
        borderColor: '#cbd5e1',
        accentPrimary: '#3b82f6',
        accentSecondary: '#60a5fa',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        codeBg: '#1e293b',
        codeText: '#e2e8f0',
      },
      dark: {
        bgPrimary: '#0f172a',
        bgSecondary: '#1e293b',
        bgTertiary: '#334155',
        textPrimary: '#f1f5f9',
        textSecondary: '#cbd5e1',
        textTertiary: '#94a3b8',
        borderColor: '#475569',
        accentPrimary: '#3b82f6',
        accentSecondary: '#60a5fa',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        codeBg: '#0f172a',
        codeText: '#e2e8f0',
      },
    };

    return colors[this.currentTheme];
  }

  /**
   * Get Monaco Editor theme name for current theme
   * @returns {string}
   */
  getMonacoTheme() {
    return this.currentTheme === 'dark' ? 'vs-dark' : 'vs';
  }

  /**
   * Get chart theme configuration for current theme
   * @returns {Object}
   */
  getChartTheme() {
    const themes = {
      light: {
        backgroundColor: '#ffffff',
        textColor: '#1e293b',
        gridColor: '#e2e8f0',
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      },
      dark: {
        backgroundColor: '#1e293b',
        textColor: '#f1f5f9',
        gridColor: '#475569',
        colors: ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa'],
      },
    };

    return themes[this.currentTheme];
  }
}

// Export singleton instance
export default new ThemeManager();
