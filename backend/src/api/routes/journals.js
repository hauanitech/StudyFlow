import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validateBody, validateQuery, validateParams } from '../../middleware/validate.js';
import { AppError } from '../../middleware/errorHandler.js';
import journalsService from '../../services/journalsService.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Validation schemas
const dateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

const entrySchema = z.object({
  content: z.string().max(10000, 'Content cannot exceed 10000 characters').optional(),
  mood: z.enum(['great', 'good', 'okay', 'bad', 'terrible']).nullable().optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
});

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(30).optional(),
  skip: z.coerce.number().min(0).default(0).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

/**
 * GET /journals
 * Get all journal entries for current user
 */
router.get('/', validateQuery(querySchema), async (req, res, next) => {
  try {
    const result = await journalsService.getEntries(req.userId, req.query);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /journals/stats
 * Get journal statistics for current user
 */
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await journalsService.getStats(req.userId);
    
    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /journals/:date
 * Get journal entry for a specific date
 */
router.get('/:date', validateParams(dateSchema), async (req, res, next) => {
  try {
    const entry = await journalsService.getEntryByDate(req.userId, req.params.date);
    
    if (!entry) {
      // Return empty entry template for the date
      return res.json({
        success: true,
        entry: {
          date: req.params.date,
          content: '',
          mood: null,
          tags: [],
          isNew: true,
        },
      });
    }
    
    res.json({
      success: true,
      entry,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /journals/:date
 * Create or update journal entry for a specific date
 */
router.put('/:date', validateParams(dateSchema), validateBody(entrySchema), async (req, res, next) => {
  try {
    const entry = await journalsService.upsertEntry(req.userId, req.params.date, req.body);
    
    res.json({
      success: true,
      entry,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /journals/:date
 * Delete journal entry for a specific date
 */
router.delete('/:date', validateParams(dateSchema), async (req, res, next) => {
  try {
    const deleted = await journalsService.deleteEntry(req.userId, req.params.date);
    
    if (!deleted) {
      throw new AppError(404, 'Journal entry not found');
    }
    
    res.json({
      success: true,
      message: 'Journal entry deleted',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
