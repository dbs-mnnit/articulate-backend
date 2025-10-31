// controllers/visitorControllers.js
import visitorService from './visitorServices.js'; // Adjust path as needed
import createError from 'http-errors';
import { body, query, param, validationResult } from 'express-validator';

class VisitorController {
  async createVisitor(req, res, next) {
    try {
      // Validate client-provided data (optional fields, but ensure basics)
      await Promise.all([
        body('visitId').optional().isString().withMessage('visitId must be a string').run(req),
        body('sessionId').optional().isString().withMessage('sessionId must be a string').run(req),
        body('userId').optional().isMongoId().withMessage('userId must be a valid MongoID').run(req), // Optional, but if provided, validate
        body('referrer').optional().isURL().withMessage('referrer must be a valid URL').run(req),
        body('pageUrl').trim().notEmpty().withMessage('pageUrl is required').isURL().withMessage('pageUrl must be a valid URL').run(req),
        body('pagePath').optional().isString().withMessage('pagePath must be a string').run(req),
        body('pageTitle').optional().isString().withMessage('pageTitle must be a string').run(req),
        body('utmSource').optional().isString().withMessage('utmSource must be a string').run(req),
        body('utmMedium').optional().isString().withMessage('utmMedium must be a string').run(req),
        body('utmCampaign').optional().isString().withMessage('utmCampaign must be a string').run(req),
        body('utmTerm').optional().isString().withMessage('utmTerm must be a string').run(req),
        body('utmContent').optional().isString().withMessage('utmContent must be a string').run(req),
        body('country').optional().isString().withMessage('country must be a string').run(req),
        body('region').optional().isString().withMessage('region must be a string').run(req),
        body('city').optional().isString().withMessage('city must be a string').run(req),
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      const visitorData = req.body;
      const result = await visitorService.createVisitor(visitorData, req);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVisitor(req, res, next) {
    try {
      await param('id').isMongoId().withMessage('Invalid visitor ID').run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      const { id } = req.params;
      const visitor = await visitorService.getVisitor(id);
      res.json({
        success: true,
        data: visitor,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVisitors(req, res, next) {
    try {
      await Promise.all([
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').run(req),
        query('limit').optional().isInt({ min: 1, max: 5000 }).withMessage('Limit must be between 1 and 5000').run(req),
        query('pagePath').optional().isString().withMessage('pagePath must be a string').run(req),
        query('utmSource').optional().isString().withMessage('utmSource must be a string').run(req),
        query('dateFrom').optional().isISO8601().withMessage('Invalid dateFrom format').run(req),
        query('dateTo').optional().isISO8601().withMessage('Invalid dateTo format').run(req),
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, errors.array()[0].msg);
      }

      let { page = 1, limit = 10, pagePath, utmSource, dateFrom, dateTo } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const filters = {
        pagePath,
        utmSource,
        dateFrom,
        dateTo,
      };

      const visitors = await visitorService.getVisitors(filters, page, limit);
      res.json({
        success: true,
        data: visitors,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new VisitorController();