// routes/feedbackRoutes.js
import express from 'express';
import feedbackController from './feedbackControllers.js';
import authenticateToken from '../../middlewares/authMiddleware.js';
import upload from '../../middlewares/uploadFile.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many feedback operations, please try again later' },
});

router.post('/', authenticateToken, feedbackLimiter, upload.array('files', 5), feedbackController.createFeedback);
router.get('/media/:fileId', authenticateToken, feedbackController.downloadMedia);
router.get('/archive', authenticateToken, feedbackController.getArchivedFeedbacks);
router.get('/:id', authenticateToken, feedbackController.getFeedback);
router.get('/', authenticateToken, feedbackController.getUserFeedbacks);
router.post('/:id/restore', authenticateToken, feedbackController.restoreFeedback);
router.put('/:id', authenticateToken, feedbackLimiter, upload.array('files', 5), feedbackController.updateFeedback);
router.delete('/:id', authenticateToken, feedbackController.deleteFeedback);
router.delete('/:id/permanent', authenticateToken, feedbackController.permanentDeleteFeedback);

export default router;