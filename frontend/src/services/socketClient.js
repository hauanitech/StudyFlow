/**
 * Socket.IO client wrapper
 */

import { io } from 'socket.io-client';

let socket = null;
const listeners = new Map();

/**
 * Initialize socket connection
 */
export function connect(token) {
  if (socket?.connected) {
    return socket;
  }

  socket = io(import.meta.env.VITE_API_URL || '', {
    auth: { token },
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
}

/**
 * Disconnect socket
 */
export function disconnect() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  listeners.clear();
}

/**
 * Get socket instance
 */
export function getSocket() {
  return socket;
}

/**
 * Check if connected
 */
export function isConnected() {
  return socket?.connected ?? false;
}

/**
 * Join a chat room
 */
export function joinChat(chatId) {
  if (socket?.connected) {
    socket.emit('chat:join', chatId);
  }
}

/**
 * Leave a chat room
 */
export function leaveChat(chatId) {
  if (socket?.connected) {
    socket.emit('chat:leave', chatId);
  }
}

/**
 * Send a message via socket (for real-time updates)
 */
export function emitMessage(chatId, content) {
  if (socket?.connected) {
    socket.emit('chat:message', { chatId, content });
  }
}

/**
 * Emit typing indicator
 */
export function emitTyping(chatId) {
  if (socket?.connected) {
    socket.emit('chat:typing', { chatId });
  }
}

/**
 * Emit stopped typing
 */
export function emitStopTyping(chatId) {
  if (socket?.connected) {
    socket.emit('chat:stopTyping', { chatId });
  }
}

/**
 * Subscribe to an event
 */
export function on(event, callback) {
  if (socket) {
    socket.on(event, callback);
    
    // Track listener for cleanup
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event).add(callback);
  }
}

/**
 * Unsubscribe from an event
 */
export function off(event, callback) {
  if (socket) {
    if (callback) {
      socket.off(event, callback);
      listeners.get(event)?.delete(callback);
    } else {
      socket.off(event);
      listeners.delete(event);
    }
  }
}

/**
 * Subscribe to new messages in a chat
 */
export function onNewMessage(callback) {
  on('chat:newMessage', callback);
  return () => off('chat:newMessage', callback);
}

/**
 * Subscribe to typing indicator
 */
export function onUserTyping(callback) {
  on('chat:userTyping', callback);
  return () => off('chat:userTyping', callback);
}

/**
 * Subscribe to stopped typing
 */
export function onUserStoppedTyping(callback) {
  on('chat:userStoppedTyping', callback);
  return () => off('chat:userStoppedTyping', callback);
}

export default {
  connect,
  disconnect,
  getSocket,
  isConnected,
  joinChat,
  leaveChat,
  emitMessage,
  emitTyping,
  emitStopTyping,
  on,
  off,
  onNewMessage,
  onUserTyping,
  onUserStoppedTyping,
};
