import { Server } from 'socket.io';
import { verifyAccessToken } from '../auth/jwt.js';
import env from '../config/env.js';

let io = null;

/**
 * Initialize Socket.IO server
 * @param {import('http').Server} server
 */
export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyAccessToken(token);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (user: ${socket.userId})`);

    // Join user's personal room for notifications
    socket.join(`user:${socket.userId}`);

    // Chat events
    socket.on('chat:join', (chatId) => {
      socket.join(`chat:${chatId}`);
      console.log(`User ${socket.userId} joined chat ${chatId}`);
    });

    socket.on('chat:leave', (chatId) => {
      socket.leave(`chat:${chatId}`);
      console.log(`User ${socket.userId} left chat ${chatId}`);
    });

    socket.on('chat:message', async (data) => {
      const { chatId, content } = data;
      
      // Emit to all members in the chat room
      io.to(`chat:${chatId}`).emit('chat:newMessage', {
        chatId,
        senderId: socket.userId,
        content,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('chat:typing', (data) => {
      const { chatId } = data;
      socket.to(`chat:${chatId}`).emit('chat:userTyping', {
        chatId,
        userId: socket.userId,
      });
    });

    socket.on('chat:stopTyping', (data) => {
      const { chatId } = data;
      socket.to(`chat:${chatId}`).emit('chat:userStoppedTyping', {
        chatId,
        userId: socket.userId,
      });
    });

    // Disconnect handling
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (reason: ${reason})`);
    });
  });

  return io;
}

/**
 * Get the Socket.IO server instance
 */
export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

/**
 * Emit event to a specific user
 */
export function emitToUser(userId, event, data) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

/**
 * Emit event to a chat room
 */
export function emitToChat(chatId, event, data) {
  if (io) {
    io.to(`chat:${chatId}`).emit(event, data);
  }
}

export default { initializeSocket, getIO, emitToUser, emitToChat };
