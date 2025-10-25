// routes/thoughtsRoutes.js
import express from 'express';
import thoughtsController from './thoughtsController.js';
import authenticateToken from '../../middlewares/authMiddleware.js';
import upload from '../../middlewares/uploadFile.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const thoughtLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many thought operations, please try again later' },
});

router.post('/', authenticateToken, thoughtLimiter, upload.array('files', 5), thoughtsController.createThought);
router.get('/dailyBlissScore', authenticateToken, thoughtsController.getDailyBlissScore);
router.get('/media/:fileId', authenticateToken, thoughtsController.downloadMedia);
router.get('/archive', authenticateToken, thoughtsController.getArchivedThoughts);
router.get('/:id', authenticateToken, thoughtsController.getThought);
router.get('/', authenticateToken, thoughtsController.getUserThoughts);

router.get('/:id/follow-ups', authenticateToken, thoughtsController.getFollowUps);
router.post('/:id/follow-up', authenticateToken, thoughtLimiter, thoughtsController.addFollowUp);
router.post('/:id/restore', authenticateToken, thoughtsController.restoreThought);
router.put('/:id', authenticateToken, thoughtLimiter, upload.array('files', 5), thoughtsController.updateThought);
router.delete('/:id', authenticateToken, thoughtsController.deleteThought);
router.delete('/:id/permanent', authenticateToken, thoughtsController.permanentDeleteThought);


export default router;