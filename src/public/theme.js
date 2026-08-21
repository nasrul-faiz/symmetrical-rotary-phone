/**
 * Theme Management System
 * Supports: dark, light, black, white, glass-light, glass-dark
 */

class ThemeManager {
  constructor() {
    this.STORAGE_KEY = 'app-theme';
    this.THEMES = {
      dark: { label: 'Dark', icon: '🌙' },
      light: { label: 'Light', icon: '☀️' },
      black: { label: 'Pure Black', icon: '◼️' },
      white: { label: 'Pure White', icon: '◻️' },
      'glass-light': { label: 'Glass Light', icon: '✨' },
      'glass-dark': { label: 'Glass Dark', icon: '🌌' }
    };
    this.init();
  }

  /**
   * Initialize theme from storage or system preference
   */
  init() {
    const savedTheme = this.getSavedTheme();
    const systemTheme = this.getSystemTheme();
    const initialTheme = savedTheme || systemTheme || 'dark';
    this.setTheme(initialTheme);
    this.watchSystemTheme();
  }

  /**
   * Get saved theme from localStorage
   */
  getSavedTheme() {
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch (e) {
      console.warn('Theme storage not available:', e);
      return null;
    }
  }

  /**
   * Get system theme preference
   */
  getSystemTheme() {
    if (!window.matchMedia) return null;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  /**
   * Watch for system theme changes
   */
  watchSystemTheme() {
    if (!window.matchMedia) return;
    
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkQuery.addEventListener('change', (e) => {
      if (!this.getSavedTheme()) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /**
   * Set theme
   */
  setTheme(themeName) {
    if (!this.THEMES[themeName]) {
      console.warn(`Unknown theme: ${themeName}`);
      return false;
    }

    document.documentElement.setAttribute('data-theme', themeName);
    
    try {
      localStorage.setItem(this.STORAGE_KEY, themeName);
    } catch (e) {
      console.warn('Could not save theme preference:', e);
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('themechange', { 
      detail: { theme: themeName, label: this.THEMES[themeName].label } 
    }));

    return true;
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  /**
   * Toggle between two themes
   */
  toggleTheme(theme1 = 'dark', theme2 = 'light') {
    const current = this.getCurrentTheme();
    const next = current === theme1 ? theme2 : theme1;
    this.setTheme(next);
    return next;
  }

  /**
   * Get all available themes
   */
  getAvailableThemes() {
    return Object.entries(this.THEMES).map(([id, config]) => ({
      id,
      ...config
    }));
  }

  /**
   * Get theme info
   */
  getThemeInfo(themeName) {
    return {
      id: themeName,
      ...this.THEMES[themeName]
    };
  }

  /**
   * Check if current theme is dark
   */
  isDarkTheme() {
    const current = this.getCurrentTheme();
    return current === 'dark' || current === 'black' || current === 'glass-dark';
  }

  /**
   * Check if current theme is glass
   */
  isGlassTheme() {
    const current = this.getCurrentTheme();
    return current.includes('glass');
  }

  /**
   * Apply glass effect to elements
   */
  applyGlassEffect(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => el.classList.add('glass'));
  }

  /**
   * Remove glass effect from elements
   */
  removeGlassEffect(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => el.classList.remove('glass'));
  }
}

// Create global instance
window.themeManager = new ThemeManager();

// Utility functions
window.setTheme = (theme) => window.themeManager.setTheme(theme);
window.getTheme = () => window.themeManager.getCurrentTheme();
window.toggleTheme = () => window.themeManager.toggleTheme('dark', 'light');
window.getAvailableThemes = () => window.themeManager.getAvailableThemes();
