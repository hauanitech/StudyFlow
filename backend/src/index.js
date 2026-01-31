import { createServer } from 'http';
import app from './app.js';
import env from './config/env.js';
import connectDB from './db/mongoose.js';
import { initializeSocket } from './realtime/socket.js';
import logger from './utils/logger.js';

const PORT = env.PORT || 3001;

async function start() {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('✅ Connected to MongoDB');

    // Create HTTP server
    const server = createServer(app);

    // Initialize Socket.IO
    initializeSocket(server);
    logger.info('✅ Socket.IO initialized');

    // Start listening
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📚 API docs at http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
