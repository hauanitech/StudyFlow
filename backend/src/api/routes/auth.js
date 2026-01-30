import { Router } from 'express';
import { z } from 'zod';
import User from '../../models/User.js';
import Profile from '../../models/Profile.js';
import { generateTokens, getAccessCookieOptions, getRefreshCookieOptions } from '../../auth/jwt.js';
import { validateBody } from '../../middleware/validate.js';
import { AppError } from '../../middleware/errorHandler.js';

const router = Router();

// Validation schemas
const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /auth/signup
 * Create a new user account
 */
router.post('/signup', validateBody(signupSchema), async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new AppError(409, 'Email already registered');
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new AppError(409, 'Username already taken');
    }

    // Create user
    const user = await User.create({ email, username, password });

    // Create default profile
    await Profile.create({ userId: user._id });

    // Generate tokens
    const tokens = generateTokens(user);

    // Set cookies
    res.cookie('accessToken', tokens.accessToken, getAccessCookieOptions());
    res.cookie('refreshToken', tokens.refreshToken, getRefreshCookieOptions());

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/login
 * Authenticate and login
 */
router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Verify password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Generate tokens
    const tokens = generateTokens(user);

    // Set cookies
    res.cookie('accessToken', tokens.accessToken, getAccessCookieOptions());
    res.cookie('refreshToken', tokens.refreshToken, getRefreshCookieOptions());

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/logout
 * Clear auth cookies
 */
router.post('/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.clearCookie('csrf-token');

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new AppError(401, 'No refresh token');
    }

    // Import here to avoid circular dependency
    const { verifyRefreshToken } = await import('../../auth/jwt.js');
    
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new AppError(401, 'User not found');
    }

    const tokens = generateTokens(user);
    res.cookie('accessToken', tokens.accessToken, getAccessCookieOptions());

    res.json({
      success: true,
      message: 'Token refreshed',
    });
  } catch (error) {
    // Clear invalid cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    next(error);
  }
});

/**
 * GET /auth/csrf
 * Get CSRF token - the token is set via the CSRF middleware
 * This endpoint just needs to exist to trigger a GET request
 */
router.get('/csrf', (req, res) => {
  res.json({ success: true });
});

export default router;
