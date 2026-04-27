/**
 * ResumeGlow — js/utils.js
 * Shared utility functions: IDs, dates, debounce, local storage helpers
 */

/**
 * Generate a short unique ID
 * @returns {string}
 */
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

/**
 * Debounce a function call
 * @param {Function} fn
 * @param {number} delay ms
 * @returns {Function}
 */
function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Format a date as "Saved 2 min ago" or "Just now"
 * @param {Date} date
 * @returns {string}
 */
function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return 'Saved just now';
  if (seconds < 60) return `Saved ${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `Saved ${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `Saved ${hrs}h ago`;
}

/**
 * Deep clone an object via JSON
 * @param {any} obj
 * @returns {any}
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Escape HTML entities for safe rendering
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Convert a hex color to rgba
 * @param {string} hex
 * @param {number} alpha
 * @returns {string}
 */
function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Simple storage helpers wrapping localStorage
 */
const storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      console.warn('LocalStorage write failed', key);
      return false;
    }
  },
  remove(key) {
    localStorage.removeItem(key);
  }
};

/**
 * Format a date string for display
 * @param {number} ts - timestamp
 * @returns {string}
 */
function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
