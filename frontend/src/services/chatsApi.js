/**
 * Chats API client
 */

import apiClient from './apiClient';

/**
 * Get current user's chats
 */
export async function getChats() {
  const response = await apiClient.get('/api/chats');
  return response.chats;
}

/**
 * Get or create a direct chat with another user
 */
export async function getOrCreateDirectChat(userId) {
  const response = await apiClient.post('/api/chats/direct', { userId });
  return response.chat;
}

/**
 * Create a group chat
 */
export async function createGroupChat(name, memberIds) {
  const response = await apiClient.post('/api/chats/group', { name, memberIds });
  return response.chat;
}

/**
 * Get chat details
 */
export async function getChat(chatId) {
  const response = await apiClient.get(`/api/chats/${chatId}`);
  return response.chat;
}

/**
 * Get chat messages
 */
export async function getMessages(chatId, options = {}) {
  const params = new URLSearchParams(options).toString();
  const response = await apiClient.get(`/api/chats/${chatId}/messages${params ? '?' + params : ''}`);
  return response.messages;
}

/**
 * Send a message
 */
export async function sendMessage(chatId, content) {
  const response = await apiClient.post(`/api/chats/${chatId}/messages`, { content });
  return response.message;
}

/**
 * Leave a group chat
 */
export async function leaveChat(chatId) {
  const response = await apiClient.post(`/api/chats/${chatId}/leave`);
  return response;
}

/**
 * Add a member to a group chat
 */
export async function addMember(chatId, userId) {
  const response = await apiClient.post(`/api/chats/${chatId}/members`, { userId });
  return response;
}

export default {
  getChats,
  getOrCreateDirectChat,
  createGroupChat,
  getChat,
  getMessages,
  sendMessage,
  leaveChat,
  addMember,
};
