// controllers/feedbackController.js
import feedbackService from './feedbackServices.js';
import createError from 'http-errors';
import { body, query, param, validationResult } from 'express-validator';

class FeedbackController {
  async createFeedback(req, res, next) {
    try {
      await Promise.all([
        body('feedback').trim().notEmpty().withMessage('Feedback content is required').isString().withMessage('Feedback must be a string').run(req),
        body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5').run(req),
        body('type').optional().isIn(['bug', 'feature', 'general']).withMessage('Invalid feedback type').run(req),
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      const { feedback, rating, type } = req.body;
      const feedbackData = {
        feedback,
        rating,
        type,
      };

      const files = Array.isArray(req.files) ? req.files : [];
      const result = await feedbackService.createFeedback(req.user.id, feedbackData, files);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeedback(req, res, next) {
    try {
      await param('id').isMongoId().withMessage('Invalid feedback ID').run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      const { id } = req.params;
      const feedback = await feedbackService.getFeedback(id, req.user.id);
      res.json({
        success: true,
        data: feedback,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserFeedbacks(req, res, next) {
    try {
      await Promise.all([
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').run(req),
        query('limit').optional().isInt({ min: 1, max: 5000 }).withMessage('Limit must be between 1 and 5000').run(req),
        query('type').optional().isString().withMessage('Type must be a string').run(req),
        query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5').run(req),
        query('dateFrom').optional().isISO8601().withMessage('Invalid dateFrom format').run(req),
        query('dateTo').optional().isISO8601().withMessage('Invalid dateTo format').run(req),
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      let { page = 1, limit = 10, type, rating, dateFrom, dateTo } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const filters = {
        type,
        rating: rating ? parseInt(rating) : undefined,
        dateFrom,
        dateTo,
      };

      const feedbacks = await feedbackService.getUserFeedbacks(req.user.id, filters, page, limit);
      res.json({
        success: true,
        data: feedbacks,
      });
    } catch (error) {
      next(error);
    }
  }

  async getArchivedFeedbacks(req, res, next) {
    try {
      await Promise.all([
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').run(req),
        query('limit').optional().isInt({ min: 1, max: 5000 }).withMessage('Limit must be between 1 and 5000').run(req),
        query('type').optional().isString().withMessage('Type must be a string').run(req),
        query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5').run(req),
        query('dateFrom').optional().isISO8601().withMessage('Invalid dateFrom format').run(req),
        query('dateTo').optional().isISO8601().withMessage('Invalid dateTo format').run(req),
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      let { page = 1, limit = 10, type, rating, dateFrom, dateTo } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const filters = {
        type,
        rating: rating ? parseInt(rating) : undefined,
        dateFrom,
        dateTo,
      };

      const feedbacks = await feedbackService.getArchivedFeedbacks(req.user.id, filters, page, limit);
      res.json({
        success: true,
        data: feedbacks,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateFeedback(req, res, next) {
    try {
      await Promise.all([
        param('id').isMongoId().withMessage('Invalid feedback ID').run(req),
        body('feedback').optional().trim().notEmpty().withMessage('Feedback content cannot be empty').isString().withMessage('Feedback must be a string').run(req),
        body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5').run(req),
        body('type').optional().isIn(['bug', 'feature', 'general']).withMessage('Invalid feedback type').run(req),
        body('removeMedia').optional().customSanitizer(value => {
          if (!value) return [];
          return typeof value === 'string' ? value.split(',').map(item => item.trim()) : Array.isArray(value) ? value : [value];
        }).isArray().withMessage('removeMedia must be an array or comma-separated string').run(req),
        body('removeMedia.*').optional().isURL().withMessage('Invalid media URL').run(req),
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      const { id } = req.params;
      const { feedback, rating, type, removeMedia } = req.body;
      const updateData = {
        feedback,
        rating,
        type,
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      const files = Array.isArray(req.files) ? req.files : [];
      const updatedFeedback = await feedbackService.updateFeedback(id, req.user.id, updateData, files, removeMedia || []);

      res.json({
        success: true,
        data: updatedFeedback,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteFeedback(req, res, next) {
    try {
      await param('id').isMongoId().withMessage('Invalid feedback ID').run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      const { id } = req.params;
      await feedbackService.softDeleteFeedback(id, req.user.id);
      res.json({
        success: true,
        message: 'Feedback soft deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async permanentDeleteFeedback(req, res, next) {
    try {
      await param('id').isMongoId().withMessage('Invalid feedback ID').run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      const { id } = req.params;
      await feedbackService.permanentDeleteFeedback(id, req.user.id);
      res.json({
        success: true,
        message: 'Feedback permanently deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async restoreFeedback(req, res, next) {
    try {
      await param('id').isMongoId().withMessage('Invalid feedback ID').run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      const { id } = req.params;
      const feedback = await feedbackService.restoreFeedback(id, req.user.id);
      res.json({
        success: true,
        message: 'Feedback restored successfully',
        data: feedback,
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
      const feedback = await feedbackService.getFeedbackByMediaUrl(url, req.user.id);
      if (!feedback) {
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
}

export default new FeedbackController();