/**
 * Rate limiting middleware using a simple in-memory store.
 * For production, consider using Redis for distributed rate limiting.
 */

// In-memory store for rate limiting
const rateLimitStore = new Map();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Create a rate limiter middleware
 * @param {object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @param {string} options.message - Error message when rate limited
 * @param {function} options.keyGenerator - Function to generate unique key
 * @param {boolean} options.skipFailedRequests - Don't count failed requests
 * @param {function} options.skip - Function to skip rate limiting
 * @returns {function} - Express middleware
 */
export function rateLimit(options = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 100,
    message = 'Too many requests, please try again later.',
    keyGenerator = (req) => req.ip || 'unknown',
    skipFailedRequests = false,
    skip = () => false,
  } = options;

  return async (req, res, next) => {
    // Check if we should skip rate limiting
    if (await skip(req, res)) {
      return next();
    }

    const key = await keyGenerator(req);
    const now = Date.now();

    // Get or create rate limit data
    let data = rateLimitStore.get(key);

    if (!data || data.resetTime < now) {
      data = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, data);
    }

    // Check if rate limited
    if (data.count >= max) {
      const retryAfter = Math.ceil((data.resetTime - now) / 1000);

      res.set('Retry-After', retryAfter);
      res.set('X-RateLimit-Limit', max);
      res.set('X-RateLimit-Remaining', 0);
      res.set('X-RateLimit-Reset', Math.ceil(data.resetTime / 1000));

      return res.status(429).json({
        error: message,
        retryAfter,
      });
    }

    // Increment counter
    data.count++;

    // Set rate limit headers
    res.set('X-RateLimit-Limit', max);
    res.set('X-RateLimit-Remaining', Math.max(0, max - data.count));
    res.set('X-RateLimit-Reset', Math.ceil(data.resetTime / 1000));

    // Handle skipFailedRequests
    if (skipFailedRequests) {
      const originalEnd = res.end;
      res.end = function (...args) {
        if (res.statusCode >= 400) {
          data.count--;
        }
        return originalEnd.apply(res, args);
      };
    }

    next();
  };
}

// Pre-configured rate limiters for common use cases

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per minute, then 15 minute lockout
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts. Please try again in 15 minutes.',
  keyGenerator: (req) => {
    // Use IP + email/username for auth
    const identifier = req.body?.email || req.body?.username || '';
    return `auth:${req.ip}:${identifier}`;
  },
});

/**
 * Rate limiter for account creation
 * 3 accounts per IP per hour
 */
export const signupRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many accounts created. Please try again later.',
  keyGenerator: (req) => `signup:${req.ip}`,
});

/**
 * Rate limiter for password reset
 * 3 requests per email per hour
 */
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many password reset requests. Please try again later.',
  keyGenerator: (req) => `pwreset:${req.body?.email || req.ip}`,
});

/**
 * Rate limiter for posting content (questions, answers, messages)
 * 10 posts per minute
 */
export const postingRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'You are posting too quickly. Please slow down.',
  keyGenerator: (req) => `post:${req.user?.id || req.ip}`,
});

/**
 * Rate limiter for reporting content
 * 5 reports per hour per user to prevent spam
 */
export const reportRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'You have submitted too many reports. Please try again later.',
  keyGenerator: (req) => `report:${req.user?.id || req.ip}`,
});

/**
 * Rate limiter for voting
 * 30 votes per minute
 */
export const votingRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: 'You are voting too quickly. Please slow down.',
  keyGenerator: (req) => `vote:${req.user?.id || req.ip}`,
});

/**
 * Rate limiter for search/queries
 * 60 requests per minute
 */
export const searchRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: 'Too many search requests. Please try again.',
  keyGenerator: (req) => `search:${req.user?.id || req.ip}`,
});

/**
 * General API rate limiter
 * 100 requests per minute
 */
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many requests. Please try again.',
});

export default {
  rateLimit,
  authRateLimit,
  signupRateLimit,
  passwordResetRateLimit,
  postingRateLimit,
  reportRateLimit,
  votingRateLimit,
  searchRateLimit,
  apiRateLimit,
  reportRateLimit,
};
