import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import * as moderationService from '../../services/moderationService.js';

const router = Router();

// ============ Validation Schemas ============

const createReportSchema = z.object({
  body: z.object({
    targetType: z.enum(['question', 'answer', 'user', 'chat_message']),
    targetId: z.string().min(1),
    reason: z.enum([
      'spam',
      'harassment',
      'hate_speech',
      'inappropriate',
      'misinformation',
      'copyright',
      'other',
    ]),
    description: z.string().max(1000).optional(),
  }),
});

const resolveReportSchema = z.object({
  body: z.object({
    resolution: z.enum([
      'warning_issued',
      'content_removed',
      'user_banned',
      'no_action',
    ]),
    notes: z.string().max(1000).optional(),
  }),
});

const dismissReportSchema = z.object({
  body: z.object({
    notes: z.string().max(1000).optional(),
  }),
});

// ============ User Routes ============

// Create a report
router.post('/', requireAuth, validate(createReportSchema), async (req, res) => {
  try {
    const report = await moderationService.createReport(req.user.id, req.body);
    res.status(201).json({ data: report });
  } catch (error) {
    if (error.message === 'Target not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'You have already reported this content') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// ============ Moderator Routes ============

// Middleware to check moderator role
const requireModerator = (req, res, next) => {
  if (!req.user || req.user.role !== 'moderator') {
    return res.status(403).json({ error: 'Moderator access required' });
  }
  next();
};

// Get pending reports
router.get(
  '/pending',
  requireAuth,
  requireModerator,
  async (req, res) => {
    try {
      const { page, limit, targetType } = req.query;
      const result = await moderationService.getPendingReports({
        page: page ? parseInt(page) : 1,
        limit: limit ? Math.min(parseInt(limit), 50) : 20,
        targetType,
      });
      res.json(result);
    } catch (error) {
      console.error('Error getting pending reports:', error);
      res.status(500).json({ error: 'Failed to get reports' });
    }
  }
);

// Get report counts
router.get('/counts', requireAuth, requireModerator, async (req, res) => {
  try {
    const counts = await moderationService.getReportCounts();
    res.json({ data: counts });
  } catch (error) {
    console.error('Error getting report counts:', error);
    res.status(500).json({ error: 'Failed to get report counts' });
  }
});

// Get report history
router.get('/history', requireAuth, requireModerator, async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const result = await moderationService.getReportHistory({
      page: page ? parseInt(page) : 1,
      limit: limit ? Math.min(parseInt(limit), 50) : 20,
      status,
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting report history:', error);
    res.status(500).json({ error: 'Failed to get report history' });
  }
});

// Get single report
router.get('/:id', requireAuth, requireModerator, async (req, res) => {
  try {
    const report = await moderationService.getReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ data: report });
  } catch (error) {
    console.error('Error getting report:', error);
    res.status(500).json({ error: 'Failed to get report' });
  }
});

// Resolve report
router.post(
  '/:id/resolve',
  requireAuth,
  requireModerator,
  validate(resolveReportSchema),
  async (req, res) => {
    try {
      const report = await moderationService.resolveReport(
        req.params.id,
        req.user.id,
        req.body.resolution,
        req.body.notes
      );
      res.json({ data: report });
    } catch (error) {
      if (error.message === 'Report not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Report has already been processed') {
        return res.status(400).json({ error: error.message });
      }
      console.error('Error resolving report:', error);
      res.status(500).json({ error: 'Failed to resolve report' });
    }
  }
);

// Dismiss report
router.post(
  '/:id/dismiss',
  requireAuth,
  requireModerator,
  validate(dismissReportSchema),
  async (req, res) => {
    try {
      const report = await moderationService.dismissReport(
        req.params.id,
        req.user.id,
        req.body.notes
      );
      res.json({ data: report });
    } catch (error) {
      if (error.message === 'Report not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Report has already been processed') {
        return res.status(400).json({ error: error.message });
      }
      console.error('Error dismissing report:', error);
      res.status(500).json({ error: 'Failed to dismiss report' });
    }
  }
);

export default router;
