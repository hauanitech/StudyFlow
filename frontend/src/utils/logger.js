/**
 * Frontend logger utility
 * Only logs debug messages in development
 */

const isDev = import.meta.env.DEV;

const logger = {
  /**
   * Debug logs - only in development
   */
  debug: (...args) => {
    if (isDev) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info logs - always shown
   */
  info: (...args) => {
    console.log('[INFO]', ...args);
  },

  /**
   * Warning logs - always shown
   */
  warn: (...args) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Error logs - always shown
   */
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },
};

export default logger;
