import { verifyAccessToken, verifyRefreshToken, generateTokens, getAccessCookieOptions } from '../auth/jwt.js';
import User from '../models/User.js';
import { AppError } from './errorHandler.js';

/**
 * Middleware to require authentication
 * Checks access token from cookies, refreshes if needed
 */
export async function requireAuth(req, res, next) {
  try {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken && !refreshToken) {
      throw new AppError(401, 'Authentication required');
    }

    let userId;
    let userFromRefresh = null; // Cache user if fetched during refresh

    // Try to verify access token
    if (accessToken) {
      try {
        const decoded = verifyAccessToken(accessToken);
        userId = decoded.userId;
      } catch (err) {
        // Access token invalid/expired, try refresh
        if (!refreshToken) {
          throw new AppError(401, 'Authentication required');
        }
      }
    }

    // If no userId yet, try refresh token
    if (!userId && refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        userId = decoded.userId;

        // Issue new access token
        userFromRefresh = await User.findById(userId);
        if (!userFromRefresh) {
          throw new AppError(401, 'User not found');
        }

        const tokens = generateTokens(userFromRefresh);
        res.cookie('accessToken', tokens.accessToken, getAccessCookieOptions());
      } catch (err) {
        throw new AppError(401, 'Invalid or expired session');
      }
    }

    // Fetch user (reuse from refresh if available)
    const user = userFromRefresh || await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError(401, 'User not found');
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id.toString();

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional auth middleware - attaches user if logged in, continues otherwise
 */
export async function optionalAuth(req, res, next) {
  try {
    const accessToken = req.cookies?.accessToken;

    if (accessToken) {
      try {
        const decoded = verifyAccessToken(accessToken);
        const user = await User.findById(decoded.userId).select('-password');
        if (user) {
          req.user = user;
          req.userId = user._id.toString();
        }
      } catch {
        // Token invalid, continue without auth
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

export default requireAuth;
