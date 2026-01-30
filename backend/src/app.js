import express from 'express';
import cookieParser from 'cookie-parser';
import corsMiddleware from './middleware/cors.js';
import requestLogger from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import csrfProtection from './middleware/csrf.js';
import apiRoutes from './api/index.js';
import openapiRoutes from './api/openapi.js';

const app = express();

// Trust proxy for secure cookies behind reverse proxy
app.set('trust proxy', 1);

// Core middleware
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// CSRF protection (after cookie parser)
app.use('/api', csrfProtection);

// API documentation
app.use('/api', openapiRoutes);

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
