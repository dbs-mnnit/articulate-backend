// routes/visitorRoutes.js
import express from 'express';
import visitorController from './visitorControllers.js'; // Adjust path as needed
import authenticateToken from '../../middlewares/authMiddleware.js'; // Adjust path as needed
import rateLimit from 'express-rate-limit';

const router = express.Router();

const visitorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { success: false, message: 'Too many visitor operations, please try again later' },
});

// POST /visitors - Log a visitor (no auth required, to allow anonymous tracking)
router.post('/', visitorLimiter, visitorController.createVisitor);

// GET /visitors - Get list of visitors with filters and pagination (auth required, assuming admin or user can view all)
router.get('/', authenticateToken, visitorController.getVisitors);

// GET /visitors/:id - Get a single visitor by ID (auth required)
router.get('/:id', authenticateToken, visitorController.getVisitor);

export default router;