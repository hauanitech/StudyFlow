import { Router } from 'express';
import adviceService from '../../services/adviceService.js';

const router = Router();

/**
 * GET /advice
 * Get all advice items (summaries only)
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, tag, q } = req.query;

    let advice;
    if (q) {
      advice = await adviceService.searchAdvice(q);
    } else if (category) {
      advice = await adviceService.getAdviceByCategory(category);
    } else if (tag) {
      advice = await adviceService.getAdviceByTag(tag);
    } else {
      advice = await adviceService.getAllAdvice();
    }

    res.json({
      success: true,
      advice,
      count: advice.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /advice/categories
 * Get all categories
 */
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await adviceService.getCategories();
    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /advice/tags
 * Get all tags
 */
router.get('/tags', async (req, res, next) => {
  try {
    const tags = await adviceService.getTags();
    res.json({
      success: true,
      tags,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /advice/:id
 * Get full advice item by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const advice = await adviceService.getAdviceById(req.params.id);
    
    if (!advice) {
      return res.status(404).json({
        success: false,
        message: 'Advice not found',
      });
    }

    res.json({
      success: true,
      advice,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
