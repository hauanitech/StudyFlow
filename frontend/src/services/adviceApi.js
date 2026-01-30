/**
 * Study Advice API client
 */

import apiClient from './apiClient';

/**
 * Get all advice items
 */
export async function getAllAdvice(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await apiClient.get(`/api/advice${query ? '?' + query : ''}`);
  return response;
}

/**
 * Get advice by ID
 */
export async function getAdviceById(id) {
  const response = await apiClient.get(`/api/advice/${id}`);
  return response.advice;
}

/**
 * Get all categories
 */
export async function getCategories() {
  const response = await apiClient.get('/api/advice/categories');
  return response.categories;
}

/**
 * Get all tags
 */
export async function getTags() {
  const response = await apiClient.get('/api/advice/tags');
  return response.tags;
}

/**
 * Search advice
 */
export async function searchAdvice(query) {
  const response = await apiClient.get(`/api/advice?q=${encodeURIComponent(query)}`);
  return response;
}

/**
 * Get advice by category
 */
export async function getAdviceByCategory(category) {
  const response = await apiClient.get(`/api/advice?category=${encodeURIComponent(category)}`);
  return response;
}

/**
 * Get advice by tag
 */
export async function getAdviceByTag(tag) {
  const response = await apiClient.get(`/api/advice?tag=${encodeURIComponent(tag)}`);
  return response;
}

export default {
  getAllAdvice,
  getAdviceById,
  getCategories,
  getTags,
  searchAdvice,
  getAdviceByCategory,
  getAdviceByTag,
};
