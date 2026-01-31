import crypto from 'crypto';
import env from '../config/env.js';
import { AppError } from './errorHandler.js';

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a CSRF token
 */
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * CSRF protection middleware
 * Sets CSRF token on GET requests, validates on state-changing requests
 */
export function csrfProtection(req, res, next) {
  // Skip CSRF for auth routes (cross-origin cookie issues with Vercel/Render)
  const isAuthRoute = req.path.startsWith('/auth/');
  if (isAuthRoute) {
    return next();
  }

  // Safe methods - set token
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    let token = req.cookies[CSRF_COOKIE_NAME];
    
    if (!token) {
      token = generateCsrfToken();
      res.cookie(CSRF_COOKIE_NAME, token, {
        httpOnly: false, // Must be readable by JS
        secure: true, // Always secure for SameSite=None
        sameSite: env.isProd ? 'none' : 'lax', // 'none' for cross-origin in production
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
    }
    
    // Expose token in response header for client to read
    res.setHeader(CSRF_HEADER_NAME, token);
    return next();
  }

  // State-changing methods - validate token
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const cookieToken = req.cookies[CSRF_COOKIE_NAME];
    const headerToken = req.headers[CSRF_HEADER_NAME];

    if (!cookieToken || !headerToken) {
      throw new AppError(403, 'CSRF token missing');
    }

    if (cookieToken !== headerToken) {
      throw new AppError(403, 'CSRF token mismatch');
    }
  }

  next();
}

export default csrfProtection;
