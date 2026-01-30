/**
 * Friends API client
 */

import apiClient from './apiClient';

/**
 * Get current user's friends list
 */
export async function getFriends() {
  const response = await apiClient.get('/api/friends');
  return response.friends;
}

/**
 * Get pending friend requests (received and sent)
 */
export async function getRequests() {
  const response = await apiClient.get('/api/friends/requests');
  return response.requests;
}

/**
 * Search users to add as friends
 */
export async function searchUsers(query) {
  const response = await apiClient.get(`/api/friends/search?q=${encodeURIComponent(query)}`);
  return response.users;
}

/**
 * Send a friend request
 */
export async function sendRequest(toUserId, message = '') {
  const response = await apiClient.post('/api/friends/requests', { toUserId, message });
  return response;
}

/**
 * Accept a friend request
 */
export async function acceptRequest(requestId) {
  const response = await apiClient.post(`/api/friends/requests/${requestId}/accept`);
  return response;
}

/**
 * Decline a friend request
 */
export async function declineRequest(requestId) {
  const response = await apiClient.post(`/api/friends/requests/${requestId}/decline`);
  return response;
}

/**
 * Cancel a sent friend request
 */
export async function cancelRequest(requestId) {
  const response = await apiClient.delete(`/api/friends/requests/${requestId}`);
  return response;
}

/**
 * Remove a friend
 */
export async function removeFriend(friendId) {
  const response = await apiClient.delete(`/api/friends/${friendId}`);
  return response;
}

export default {
  getFriends,
  getRequests,
  searchUsers,
  sendRequest,
  acceptRequest,
  declineRequest,
  cancelRequest,
  removeFriend,
};
