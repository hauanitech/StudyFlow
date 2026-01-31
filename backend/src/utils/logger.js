/**
 * Conditional logger utility
 * Only logs debug messages in development, always logs errors
 */

import env from '../config/env.js';

const logger = {
  /**
   * Debug logs - only in development
   */
  debug: (...args) => {
    if (!env.isProd) {
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

  /**
   * Socket.IO specific logs
   */
  socket: (...args) => {
    if (!env.isProd) {
      console.log('[SOCKET]', ...args);
    }
  },
};

export default logger;
