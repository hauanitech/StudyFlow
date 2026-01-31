import mongoose from 'mongoose';
import env from '../config/env.js';
import logger from '../utils/logger.js';

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    logger.debug('MongoDB already connected');
    return;
  }

  try {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(env.MONGODB_URI, options);
    isConnected = true;

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
    });

    return mongoose.connection;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function disconnectDB() {
  if (!isConnected) return;
  
  await mongoose.disconnect();
  isConnected = false;
  logger.info('MongoDB disconnected');
}

export default connectDB;
