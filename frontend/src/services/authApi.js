import apiClient from './apiClient';

export async function login(email, password) {
  return apiClient.post('/api/auth/login', { email, password });
}

export async function signup(email, username, password) {
  return apiClient.post('/api/auth/signup', { email, username, password });
}

export async function logout() {
  return apiClient.post('/api/auth/logout');
}

export async function refreshToken() {
  return apiClient.post('/api/auth/refresh');
}

export async function getCurrentUser() {
  return apiClient.get('/api/users/me');
}

export default {
  login,
  signup,
  logout,
  refreshToken,
  getCurrentUser,
};
