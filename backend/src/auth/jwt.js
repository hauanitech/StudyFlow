import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * Parse duration string to seconds
 * @param {string} duration - e.g., '15m', '7d', '1h'
 */
function parseDuration(duration) {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // Default 15 minutes
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 60 * 60 * 24;
    default: return 900;
  }
}

/**
 * Sign an access token
 * @param {Object} payload - Token payload (userId, etc.)
 */
export function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  });
}

/**
 * Sign a refresh token
 * @param {Object} payload - Token payload (userId, etc.)
 */
export function signRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES,
  });
}

/**
 * Verify an access token
 * @param {string} token
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

/**
 * Verify a refresh token
 * @param {string} token
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

/**
 * Generate both tokens for a user
 * @param {Object} user - User object with _id
 */
export function generateTokens(user) {
  const payload = { userId: user._id.toString() };
  
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

/**
 * Get cookie options for tokens
 */
export function getCookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'strict' : 'lax',
    maxAge,
  };
}

/**
 * Get access token cookie options
 */
export function getAccessCookieOptions() {
  return getCookieOptions(parseDuration(env.JWT_ACCESS_EXPIRES) * 1000);
}

/**
 * Get refresh token cookie options
 */
export function getRefreshCookieOptions() {
  return getCookieOptions(parseDuration(env.JWT_REFRESH_EXPIRES) * 1000);
}

export default {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokens,
  getCookieOptions,
  getAccessCookieOptions,
  getRefreshCookieOptions,
};
