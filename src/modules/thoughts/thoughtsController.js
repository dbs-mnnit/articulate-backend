// controllers/thoughtsController.js
import thoughtsService from './thoughtsService.js';
import createError from 'http-errors';
import { body, query, param, validationResult } from 'express-validator';
import { dailyBlissScore } from '../../utils/emotion.js';

class ThoughtsController {
  async createThought(req, res, next) {
    try {
      await Promise.all([
        body('thought').trim().notEmpty().withMessage('Thought content is required').isString().withMessage('Thought must be a string').run(req),
        body('mood').optional().customSanitizer(value => {
          if (!value) return [];
          return typeof value === 'string' ? value.split(',').map(item => item.trim()) : Array.isArray(value) ? value : [value];
        }).isArray().withMessage('Mood must be an array or comma-separated string').run(req),
        body('mood.*').optional().isString().withMessage('Mood items must be strings').run(req),
        body('context').optional().isString().withMessage('Context must be a string').run(req),
        body('additionalNotes').optional().isString().withMessage('Additional notes must be a string').run(req),
        body('tags').optional().customSanitizer(value => {
          if (!value) return [];
          return typeof value === 'string' ? value.split(',').map(item => item.trim()) : Array.isArray(value) ? value : [value];
        }).isArray().withMessage('Tags must be an array or comma-separated string').run(req),
        body('tags.*').optional().isString().withMessage('Tags items must be strings').run(req),
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      const { thought, mood, context, additionalNotes, tags } = req.body;
      const thoughtData = {
        thought,
        mood,
        context,
        additionalNotes,
        tags,
      };

      const files = Array.isArray(req.files) ? req.files : [];
      const result = await thoughtsService.createThought(req.user.id, thoughtData, files);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getThought(req, res, next) {
    try {
      await param('id').isMongoId().withMessage('Invalid thought ID').run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      const { id } = req.params;
      const thought = await thoughtsService.getThought(id, req.user.id);
      res.json({
        success: true,
        data: thought,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserThoughts(req, res, next) {
    try {
      await Promise.all([
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').run(req),
        query('limit').optional().isInt({ min: 1, max: 50000 }).withMessage('Limit must be between 1 and 5000').run(req),
        query('tags').optional().isString().withMessage('Tags must be a comma-separated string').run(req),
        query('mood').optional().isString().withMessage('Mood must be a comma-separated string').run(req),
        query('dateFrom').optional().isISO8601().withMessage('Invalid dateFrom format').run(req),
        query('dateTo').optional().isISO8601().withMessage('Invalid dateTo format').run(req),
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      let { page = 1, limit = 10, tags, mood, dateFrom, dateTo } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const filters = {
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        mood: mood ? mood.split(',').map(m => m.trim()) : [],
        dateFrom,
        dateTo,
      };

      const thoughts = await thoughtsService.getUserThoughts(req.user.id, filters, page, limit);
      res.json({
        success: true,
        data: thoughts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getArchivedThoughts(req, res, next) {
    try {
      await Promise.all([
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').run(req),
        query('limit').optional().isInt({ min: 1, max: 5000 }).withMessage('Limit must be between 1 and 5000').run(req),
        query('tags').optional().isString().withMessage('Tags must be a comma-separated string').run(req),
        query('mood').optional().isString().withMessage('Mood must be a comma-separated string').run(req),
        query('dateFrom').optional().isISO8601().withMessage('Invalid dateFrom format').run(req),
        query('dateTo').optional().isISO8601().withMessage('Invalid dateTo format').run(req),
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      let { page = 1, limit = 10, tags, mood, dateFrom, dateTo } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const filters = {
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        mood: mood ? mood.split(',').map(m => m.trim()) : [],
        dateFrom,
        dateTo,
      };

      const thoughts = await thoughtsService.getArchivedThoughts(req.user.id, filters, page, limit);
      res.json({
        success: true,
        data: thoughts,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateThought(req, res, next) {
    try {
      await Promise.all([
        param('id').isMongoId().withMessage('Invalid thought ID').run(req),
        body('thought').optional().trim().notEmpty().withMessage('Thought content cannot be empty').isString().withMessage('Thought must be a string').run(req),
        body('mood').optional().customSanitizer(value => {
          if (!value) return [];
          return typeof value === 'string' ? value.split(',').map(item => item.trim()) : Array.isArray(value) ? value : [value];
        }).isArray().withMessage('Mood must be an array or comma-separated string').run(req),
        body('mood.*').optional().isString().withMessage('Mood items must be strings').run(req),
        body('context').optional().isString().withMessage('Context must be a string').run(req),
        body('additionalNotes').optional().isString().withMessage('Additional notes must be a string').run(req),
        body('tags').optional().customSanitizer(value => {
          if (!value) return [];
          return typeof value === 'string' ? value.split(',').map(item => item.trim()) : Array.isArray(value) ? value : [value];
        }).isArray().withMessage('Tags must be an array or comma-separated string').run(req),
        body('tags.*').optional().isString().withMessage('Tags items must be strings').run(req),
        body('removeMedia').optional().customSanitizer(value => {
          if (!value) return [];
          return typeof value === 'string' ? value.split(',').map(item => item.trim()) : Array.isArray(value) ? value : [value];
        }).isArray().withMessage('removeMedia must be an array or comma-separated string').run(req),
        body('removeMedia.*').optional().isURL().withMessage('Invalid media URL in removeMedia').run(req),
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      const { id } = req.params;
      const { thought, mood, context, additionalNotes, tags, removeMedia } = req.body;

      const updateData = {};
      if (thought !== undefined) updateData.thought = thought;
      if (mood !== undefined) updateData.mood = mood;
      if (context !== undefined) updateData.context = context;
      if (additionalNotes !== undefined) updateData.additionalNotes = additionalNotes;
      if (tags !== undefined) updateData.tags = tags;

      const files = Array.isArray(req.files) ? req.files : [];
      const updatedThought = await thoughtsService.updateThought(id, req.user.id, updateData, files, removeMedia || []);

      res.json({
        success: true,
        data: updatedThought,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteThought(req, res, next) {
    try {
      await param('id').isMongoId().withMessage('Invalid thought ID').run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      const { id } = req.params;
      await thoughtsService.softDeleteThought(id, req.user.id);
      res.json({
        success: true,
        message: 'Thought soft deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async permanentDeleteThought(req, res, next) {
    try {
      await param('id').isMongoId().withMessage('Invalid thought ID').run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      const { id } = req.params;
      await thoughtsService.permanentDeleteThought(id, req.user.id);
      res.json({
        success: true,
        message: 'Thought permanently deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async restoreThought(req, res, next) {
    try {
      await param('id').isMongoId().withMessage('Invalid thought ID').run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      const { id } = req.params;
      const thought = await thoughtsService.restoreThought(id, req.user.id);
      res.json({
        success: true,
        message: 'Thought restored successfully',
        data: thought,
      });
    } catch (error) {
      next(error);
    }
  }

  async addFollowUp(req, res, next) {
    try {
      await Promise.all([
        param('id').isMongoId().withMessage('Invalid thought ID').run(req),
        body('content').trim().notEmpty().withMessage('Follow-up content is required').isString().withMessage('Follow-up content must be a string').run(req),
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      const { id } = req.params;
      const { content } = req.body;
      const thought = await thoughtsService.addFollowUp(id, req.user.id, content);
      res.status(201).json({
        success: true,
        data: thought,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFollowUps(req, res, next) {
    try {
      await param('id').isMongoId().withMessage('Invalid thought ID').run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      const { id } = req.params;
      const followUps = await thoughtsService.getFollowUps(id, req.user.id);
      res.json({
        success: true,
        data: followUps,
      });
    } catch (error) {
      next(error);
    }
  }

  async downloadMedia(req, res, next) {
    try {
      await param('fileId').isURL().withMessage('Invalid media URL').run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      const { fileId: url } = req.params;
      const thought = await thoughtsService.getThoughtByMediaUrl(url, req.user.id);
      if (!thought) {
        throw createError(404, 'Media not found or unauthorized');
      }

      res.json({
        success: true,
        data: { url },
      });
    } catch (error) {
      next(error);
    }
  }

  async getDailyBlissScore(req, res, next) {
    try {
      await Promise.all([
        query('dateFrom').optional().isISO8601().withMessage('Invalid dateFrom format').run(req),
        query('dateTo').optional().isISO8601().withMessage('Invalid dateTo format').run(req),
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      const { dateFrom, dateTo } = req.query;

      const startDate = dateFrom ? new Date(dateFrom) : new Date(new Date().setDate(new Date().getDate() - 30));
      const endDate = dateTo ? new Date(dateTo) : new Date();
      endDate.setHours(23, 59, 59, 999);

      if (startDate > endDate) {
        throw createError(400, 'dateFrom must be before dateTo');
      }

      const thoughts = await thoughtsService.getUserThoughts(req.user.id, { dateFrom, dateTo }, 1, 5000);

      const thoughtsByDate = thoughts.reduce((acc, thought) => {
        const date = thought.createdAt.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(thought);
        return acc;
      }, {});

      const dateArray = [];
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        dateArray.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const blissScores = dateArray.map(date => {
        const thoughtsForDate = thoughtsByDate[date] || [];
        const blissScore = dailyBlissScore(thoughtsForDate);
        return {
          date,
          blissScore,
        };
      });

      res.json({
        success: true,
        data: blissScores,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ThoughtsController();