import cors from 'cors';
import env from '../config/env.js';

// Support multiple origins from comma-separated env variable
const allowedOrigins = env.CORS_ORIGIN.split(',').map(origin => origin.trim());

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    // SECURITY NOTE: This allows non-browser clients to bypass CORS.
    // For stricter security, remove this check and require all requests
    // to have a valid origin header. However, this breaks mobile apps
    // and server-to-server requests.
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token'],
  maxAge: 86400, // 24 hours
};

export const corsMiddleware = cors(corsOptions);
export default corsMiddleware;
