import { createServer } from 'http';
import app from './app.js';
import env from './config/env.js';
import connectDB from './db/mongoose.js';
import { initializeSocket } from './realtime/socket.js';

const PORT = env.PORT || 3001;

async function start() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Create HTTP server
    const server = createServer(app);

    // Initialize Socket.IO
    initializeSocket(server);
    console.log('✅ Socket.IO initialized');

    // Start listening
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API docs at http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
