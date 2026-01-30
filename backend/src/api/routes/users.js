import { Router } from 'express';
import { z } from 'zod';
import User from '../../models/User.js';
import Profile from '../../models/Profile.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validateBody } from '../../middleware/validate.js';
import { AppError } from '../../middleware/errorHandler.js';
import accountDeletionService from '../../services/accountDeletionService.js';
import { isFriend } from '../../services/friendsService.js';

const router = Router();

// Validation schemas
const updateUserSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  email: z.string().email().optional(),
});

const updateProfileSchema = z.object({
  displayName: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  visibility: z.enum(['public', 'friends', 'private']).optional(),
  studyGoals: z.string().max(200).optional(),
  timezone: z.string().optional(),
  pomodoroPreferences: z
    .object({
      workDuration: z.number().min(1).max(120).optional(),
      shortBreakDuration: z.number().min(1).max(30).optional(),
      longBreakDuration: z.number().min(1).max(60).optional(),
      sessionsBeforeLongBreak: z.number().min(1).max(10).optional(),
    })
    .optional(),
});

/**
 * GET /users/me
 * Get current user with profile
 */
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });

    res.json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        username: req.user.username,
        role: req.user.role,
        createdAt: req.user.createdAt,
      },
      profile: profile || null,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /users/me
 * Update current user
 */
router.patch('/me', requireAuth, validateBody(updateUserSchema), async (req, res, next) => {
  try {
    const { username, email } = req.body;

    // Check for conflicts
    if (username && username !== req.user.username) {
      const existing = await User.findOne({ username });
      if (existing) {
        throw new AppError(409, 'Username already taken');
      }
    }

    if (email && email !== req.user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        throw new AppError(409, 'Email already registered');
      }
    }

    // Update user
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true });

    res.json({
      success: true,
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
 * GET /users/me/profile
 * Get current user's profile
 */
router.get('/me/profile', requireAuth, async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ userId: req.userId });

    // Create profile if doesn't exist
    if (!profile) {
      profile = await Profile.create({ userId: req.userId });
    }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /users/me/profile
 * Update current user's profile
 */
router.patch('/me/profile', requireAuth, validateBody(updateProfileSchema), async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ userId: req.userId });

    if (!profile) {
      profile = await Profile.create({ userId: req.userId, ...req.body });
    } else {
      // Update nested pomodoroPreferences properly
      if (req.body.pomodoroPreferences) {
        profile.pomodoroPreferences = {
          ...profile.pomodoroPreferences.toObject(),
          ...req.body.pomodoroPreferences,
        };
        delete req.body.pomodoroPreferences;
      }

      Object.assign(profile, req.body);
      await profile.save();
    }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /users/:username
 * Get public profile by username
 */
router.get('/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const profile = await Profile.findOne({ userId: user._id });

    // Check visibility
    if (profile?.visibility === 'private') {
      throw new AppError(403, 'This profile is private');
    }

    // Check 'friends' visibility - requires authentication and friendship
    if (profile?.visibility === 'friends') {
      // Get requesting user if authenticated
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new AppError(403, 'This profile is only visible to friends');
      }
      
      // Check friendship (will need to be implemented)
      try {
        const areFriends = await isFriend(req.userId, user._id);
        if (!areFriends) {
          throw new AppError(403, 'This profile is only visible to friends');
        }
      } catch {
        throw new AppError(403, 'This profile is only visible to friends');
      }
    }

    res.json({
      success: true,
      user: {
        username: user.username,
        createdAt: user.createdAt,
      },
      profile: profile
        ? {
            displayName: profile.displayName,
            bio: profile.bio,
            avatarUrl: profile.avatarUrl,
            studyGoals: profile.studyGoals,
            stats: profile.visibility === 'public' ? profile.stats : undefined,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /users/me/deletion-preview
 * Get preview of what will be deleted when account is deleted
 */
router.get('/me/deletion-preview', requireAuth, async (req, res, next) => {
  try {
    const preview = await accountDeletionService.getDeletionPreview(req.userId);
    res.json({
      success: true,
      preview,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /users/me
 * Delete current user's account
 */
router.delete('/me', requireAuth, async (req, res, next) => {
  try {
    const result = await accountDeletionService.deleteAccount(req.userId);
    
    // Clear auth cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.clearCookie('csrf_token');
    
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
