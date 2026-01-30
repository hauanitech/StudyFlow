import apiClient from './apiClient';

/**
 * Get all journal entries for current user
 * @param {Object} options - Query options
 */
export async function getEntries(options = {}) {
  const params = new URLSearchParams();
  if (options.limit) params.set('limit', options.limit);
  if (options.skip) params.set('skip', options.skip);
  if (options.startDate) params.set('startDate', options.startDate);
  if (options.endDate) params.set('endDate', options.endDate);
  
  const query = params.toString();
  return apiClient.get(`/api/journals${query ? `?${query}` : ''}`);
}

/**
 * Get journal entry for a specific date
 * @param {string} date - YYYY-MM-DD format
 */
export async function getEntry(date) {
  return apiClient.get(`/api/journals/${date}`);
}

/**
 * Create or update journal entry for a specific date
 * @param {string} date - YYYY-MM-DD format
 * @param {Object} data - Entry data
 */
export async function saveEntry(date, data) {
  return apiClient.put(`/api/journals/${date}`, data);
}

/**
 * Delete journal entry for a specific date
 * @param {string} date - YYYY-MM-DD format
 */
export async function deleteEntry(date) {
  return apiClient.delete(`/api/journals/${date}`);
}

/**
 * Get journal statistics
 */
export async function getStats() {
  return apiClient.get('/api/journals/stats');
}

export default {
  getEntries,
  getEntry,
  saveEntry,
  deleteEntry,
  getStats,
};
