import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate.js';
import chatsService from '../../services/chatsService.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Validation schemas
const createDirectChatSchema = z.object({
  userId: z.string().length(24, 'Invalid user ID'),
});

const createGroupChatSchema = z.object({
  name: z.string().min(1).max(100),
  memberIds: z.array(z.string().length(24)).min(1),
});

const chatIdSchema = z.object({
  chatId: z.string().length(24, 'Invalid chat ID'),
});

const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

const messagesQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional(),
  before: z.string().optional(),
  after: z.string().optional(),
});

const addMemberSchema = z.object({
  userId: z.string().length(24, 'Invalid user ID'),
});

/**
 * GET /chats
 * Get current user's chats
 */
router.get('/', async (req, res, next) => {
  try {
    const chats = await chatsService.getUserChats(req.userId);
    res.json({
      success: true,
      chats,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /chats/direct
 * Get or create a direct chat with another user
 */
router.post('/direct', validateBody(createDirectChatSchema), async (req, res, next) => {
  try {
    const chat = await chatsService.getOrCreateDirectChat(req.userId, req.body.userId);
    res.json({
      success: true,
      chat: {
        id: chat._id,
        type: chat.type,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /chats/group
 * Create a group chat
 */
router.post('/group', validateBody(createGroupChatSchema), async (req, res, next) => {
  try {
    const { name, memberIds } = req.body;
    const chat = await chatsService.createGroupChat(req.userId, name, memberIds);
    res.status(201).json({
      success: true,
      chat: {
        id: chat._id,
        type: chat.type,
        name: chat.name,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /chats/:chatId
 * Get chat details
 */
router.get('/:chatId', validateParams(chatIdSchema), async (req, res, next) => {
  try {
    const chat = await chatsService.getChat(req.params.chatId, req.userId);
    res.json({
      success: true,
      chat,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /chats/:chatId/messages
 * Get chat messages with pagination
 */
router.get('/:chatId/messages', validateParams(chatIdSchema), validateQuery(messagesQuerySchema), async (req, res, next) => {
  try {
    const { limit, before, after } = req.query;
    const messages = await chatsService.getChatMessages(
      req.params.chatId,
      req.userId,
      { limit: limit ? parseInt(limit) : 50, before, after }
    );
    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /chats/:chatId/messages
 * Send a message to a chat
 */
router.post('/:chatId/messages', validateParams(chatIdSchema), validateBody(sendMessageSchema), async (req, res, next) => {
  try {
    const message = await chatsService.sendMessage(
      req.params.chatId,
      req.userId,
      req.body.content
    );
    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /chats/:chatId/leave
 * Leave a group chat
 */
router.post('/:chatId/leave', validateParams(chatIdSchema), async (req, res, next) => {
  try {
    await chatsService.leaveChat(req.params.chatId, req.userId);
    res.json({
      success: true,
      message: 'Left the chat',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /chats/:chatId/members
 * Add a member to a group chat
 */
router.post('/:chatId/members', validateParams(chatIdSchema), validateBody(addMemberSchema), async (req, res, next) => {
  try {
    await chatsService.addMemberToChat(req.params.chatId, req.userId, req.body.userId);
    res.json({
      success: true,
      message: 'Member added',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
