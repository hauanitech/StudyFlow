/**
 * Profile API client
 */

import apiClient from './apiClient';

/**
 * Get current user's profile
 */
export async function getMyProfile() {
  const response = await apiClient.get('/api/users/me/profile');
  return response.profile;
}

/**
 * Update current user's profile
 */
export async function updateProfile(updates) {
  const response = await apiClient.patch('/api/users/me/profile', updates);
  return response.profile;
}

/**
 * Get current user with profile
 */
export async function getMe() {
  const response = await apiClient.get('/api/users/me');
  return response;
}

/**
 * Update current user (username, email)
 */
export async function updateUser(updates) {
  const response = await apiClient.patch('/api/users/me', updates);
  return response.user;
}

/**
 * Get public profile by username
 */
export async function getPublicProfile(username) {
  const response = await apiClient.get(`/api/users/${username}`);
  return response;
}

/**
 * Get deletion preview
 */
export async function getDeletionPreview() {
  const response = await apiClient.get('/api/users/me/deletion-preview');
  return response.preview;
}

/**
 * Delete account
 */
export async function deleteAccount() {
  const response = await apiClient.delete('/api/users/me');
  return response;
}

export default {
  getMyProfile,
  updateProfile,
  getMe,
  updateUser,
  getPublicProfile,
  getDeletionPreview,
  deleteAccount,
};
