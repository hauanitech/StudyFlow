import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validateBody, validateParams } from '../../middleware/validate.js';
import friendsService from '../../services/friendsService.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Validation schemas
const sendRequestSchema = z.object({
  toUserId: z.string().length(24, 'Invalid user ID'),
  message: z.string().max(200).optional(),
});

const requestIdSchema = z.object({
  requestId: z.string().length(24, 'Invalid request ID'),
});

const friendIdSchema = z.object({
  friendId: z.string().length(24, 'Invalid friend ID'),
});

const searchQuerySchema = z.object({
  q: z.string().min(1).max(50),
});

/**
 * GET /friends
 * Get current user's friends list
 */
router.get('/', async (req, res, next) => {
  try {
    const friends = await friendsService.getFriends(req.userId);
    res.json({
      success: true,
      friends,
      count: friends.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /friends/requests
 * Get pending friend requests (received and sent)
 */
router.get('/requests', async (req, res, next) => {
  try {
    const requests = await friendsService.getPendingRequests(req.userId);
    res.json({
      success: true,
      requests,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /friends/search
 * Search users to add as friends
 */
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 1) {
      return res.json({
        success: true,
        users: [],
      });
    }

    const users = await friendsService.searchUsers(q, req.userId);
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /friends/requests
 * Send a friend request
 */
router.post('/requests', validateBody(sendRequestSchema), async (req, res, next) => {
  try {
    const { toUserId, message } = req.body;
    const request = await friendsService.sendFriendRequest(req.userId, toUserId, message);
    res.status(201).json({
      success: true,
      request: {
        id: request._id,
        to: request.toUserId,
        message: request.message,
        createdAt: request.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /friends/requests/:requestId/accept
 * Accept a friend request
 */
router.post('/requests/:requestId/accept', validateParams(requestIdSchema), async (req, res, next) => {
  try {
    const { request, friendship } = await friendsService.acceptFriendRequest(
      req.params.requestId,
      req.userId
    );
    res.json({
      success: true,
      message: 'Friend request accepted',
      friendshipId: friendship._id,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /friends/requests/:requestId/decline
 * Decline a friend request
 */
router.post('/requests/:requestId/decline', validateParams(requestIdSchema), async (req, res, next) => {
  try {
    await friendsService.declineFriendRequest(req.params.requestId, req.userId);
    res.json({
      success: true,
      message: 'Friend request declined',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /friends/requests/:requestId
 * Cancel a sent friend request
 */
router.delete('/requests/:requestId', validateParams(requestIdSchema), async (req, res, next) => {
  try {
    await friendsService.cancelFriendRequest(req.params.requestId, req.userId);
    res.json({
      success: true,
      message: 'Friend request cancelled',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /friends/:friendId
 * Remove a friend
 */
router.delete('/:friendId', validateParams(friendIdSchema), async (req, res, next) => {
  try {
    await friendsService.removeFriend(req.userId, req.params.friendId);
    res.json({
      success: true,
      message: 'Friend removed',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
