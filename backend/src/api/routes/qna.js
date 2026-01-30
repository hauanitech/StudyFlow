import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, optionalAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import * as qnaService from '../../services/qnaService.js';

const router = Router();

// ============ Validation Schemas ============

const createQuestionSchema = z.object({
  body: z.object({
    title: z.string().min(10).max(200),
    body: z.string().min(20).max(10000),
    tags: z.array(z.string().max(30)).max(5).optional(),
  }),
});

const updateQuestionSchema = z.object({
  body: z.object({
    title: z.string().min(10).max(200).optional(),
    body: z.string().min(20).max(10000).optional(),
    tags: z.array(z.string().max(30)).max(5).optional(),
  }),
});

const searchQuestionsSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    tag: z.string().optional(),
    sortBy: z.enum(['newest', 'votes', 'unanswered', 'active']).optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

const createAnswerSchema = z.object({
  body: z.object({
    body: z.string().min(20).max(10000),
  }),
});

const voteSchema = z.object({
  body: z.object({
    value: z.number().refine((v) => v === 1 || v === -1, {
      message: 'Vote value must be 1 or -1',
    }),
  }),
});

const closeQuestionSchema = z.object({
  body: z.object({
    reason: z.enum(['duplicate', 'off-topic', 'unclear', 'resolved']),
  }),
});

// ============ Question Routes ============

// Search/list questions
router.get(
  '/questions',
  optionalAuth,
  validate(searchQuestionsSchema),
  async (req, res) => {
    try {
      const { q, tag, sortBy, page, limit } = req.query;
      const result = await qnaService.searchQuestions(
        q,
        {
          tag,
          sortBy,
          page: page ? parseInt(page) : 1,
          limit: limit ? Math.min(parseInt(limit), 50) : 20,
        },
        req.user?.id
      );
      res.json(result);
    } catch (error) {
      console.error('Error searching questions:', error);
      res.status(500).json({ error: 'Failed to search questions' });
    }
  }
);

// Get popular tags
router.get('/tags', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const tags = await qnaService.getPopularTags(limit);
    res.json({ data: tags });
  } catch (error) {
    console.error('Error getting tags:', error);
    res.status(500).json({ error: 'Failed to get tags' });
  }
});

// Create question
router.post(
  '/questions',
  requireAuth,
  validate(createQuestionSchema),
  async (req, res) => {
    try {
      const question = await qnaService.createQuestion(req.user.id, req.body);
      res.status(201).json({ data: question });
    } catch (error) {
      console.error('Error creating question:', error);
      res.status(500).json({ error: 'Failed to create question' });
    }
  }
);

// Get single question
router.get('/questions/:id', optionalAuth, async (req, res) => {
  try {
    const question = await qnaService.getQuestionById(
      req.params.id,
      req.user?.id
    );
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ data: question });
  } catch (error) {
    console.error('Error getting question:', error);
    res.status(500).json({ error: 'Failed to get question' });
  }
});

// Update question
router.patch(
  '/questions/:id',
  requireAuth,
  validate(updateQuestionSchema),
  async (req, res) => {
    try {
      const question = await qnaService.updateQuestion(
        req.params.id,
        req.user.id,
        req.body
      );
      res.json({ data: question });
    } catch (error) {
      if (error.message === 'Not authorized to edit this question') {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Question not found') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Error updating question:', error);
      res.status(500).json({ error: 'Failed to update question' });
    }
  }
);

// Delete question
router.delete('/questions/:id', requireAuth, async (req, res) => {
  try {
    await qnaService.deleteQuestion(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    if (error.message === 'Not authorized to delete this question') {
      return res.status(403).json({ error: error.message });
    }
    if (error.message === 'Question not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// Close question
router.post(
  '/questions/:id/close',
  requireAuth,
  validate(closeQuestionSchema),
  async (req, res) => {
    try {
      const question = await qnaService.closeQuestion(
        req.params.id,
        req.user.id,
        req.body.reason
      );
      res.json({ data: question });
    } catch (error) {
      if (error.message.includes('Not authorized')) {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Question not found') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Error closing question:', error);
      res.status(500).json({ error: 'Failed to close question' });
    }
  }
);

// Vote on question
router.post(
  '/questions/:id/vote',
  requireAuth,
  validate(voteSchema),
  async (req, res) => {
    try {
      const result = await qnaService.voteOnQuestion(
        req.params.id,
        req.user.id,
        req.body.value
      );
      res.json({ data: result });
    } catch (error) {
      if (error.message === 'Cannot vote on your own question') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Question not found') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Error voting on question:', error);
      res.status(500).json({ error: 'Failed to vote' });
    }
  }
);

// ============ Answer Routes ============

// Get answers for a question
router.get('/questions/:questionId/answers', optionalAuth, async (req, res) => {
  try {
    const { sortBy } = req.query;
    const answers = await qnaService.getAnswersForQuestion(
      req.params.questionId,
      { sortBy },
      req.user?.id
    );
    res.json({ data: answers });
  } catch (error) {
    console.error('Error getting answers:', error);
    res.status(500).json({ error: 'Failed to get answers' });
  }
});

// Create answer
router.post(
  '/questions/:questionId/answers',
  requireAuth,
  validate(createAnswerSchema),
  async (req, res) => {
    try {
      const answer = await qnaService.createAnswer(
        req.params.questionId,
        req.user.id,
        req.body.body
      );
      res.status(201).json({ data: answer });
    } catch (error) {
      if (error.message === 'Question not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Cannot answer a closed question') {
        return res.status(400).json({ error: error.message });
      }
      console.error('Error creating answer:', error);
      res.status(500).json({ error: 'Failed to create answer' });
    }
  }
);

// Update answer
router.patch(
  '/answers/:id',
  requireAuth,
  validate(createAnswerSchema),
  async (req, res) => {
    try {
      const answer = await qnaService.updateAnswer(
        req.params.id,
        req.user.id,
        req.body.body
      );
      res.json({ data: answer });
    } catch (error) {
      if (error.message === 'Not authorized to edit this answer') {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Answer not found') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Error updating answer:', error);
      res.status(500).json({ error: 'Failed to update answer' });
    }
  }
);

// Delete answer
router.delete('/answers/:id', requireAuth, async (req, res) => {
  try {
    await qnaService.deleteAnswer(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    if (error.message === 'Not authorized to delete this answer') {
      return res.status(403).json({ error: error.message });
    }
    if (error.message === 'Answer not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Error deleting answer:', error);
    res.status(500).json({ error: 'Failed to delete answer' });
  }
});

// Vote on answer
router.post(
  '/answers/:id/vote',
  requireAuth,
  validate(voteSchema),
  async (req, res) => {
    try {
      const result = await qnaService.voteOnAnswer(
        req.params.id,
        req.user.id,
        req.body.value
      );
      res.json({ data: result });
    } catch (error) {
      if (error.message === 'Cannot vote on your own answer') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Answer not found') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Error voting on answer:', error);
      res.status(500).json({ error: 'Failed to vote' });
    }
  }
);

// Accept answer
router.post('/answers/:id/accept', requireAuth, async (req, res) => {
  try {
    await qnaService.acceptAnswer(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    if (error.message.includes('Only the question author')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message === 'Answer not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Error accepting answer:', error);
    res.status(500).json({ error: 'Failed to accept answer' });
  }
});

// Unaccept answer
router.delete('/questions/:id/accepted-answer', requireAuth, async (req, res) => {
  try {
    await qnaService.unacceptAnswer(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    if (error.message.includes('Only the question author')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message === 'Question not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Error unaccepting answer:', error);
    res.status(500).json({ error: 'Failed to unaccept answer' });
  }
});

export default router;
