// services/feedbackService.js
import feedbackRepo from './feedbackRepo.js';
import imagekit from '../../configs/imagekitConfig.js';
import createError from 'http-errors';

class FeedbackService {
  async createFeedback(userId, feedbackData, files = []) {
    const media = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const uploadResponse = await imagekit.upload({
          file: file.buffer,
          fileName: file.originalname,
          folder: `/feedback/${userId}`,
        });
        media.push(uploadResponse.url);
      }
    }

    const feedback = await feedbackRepo.createFeedback({
      ...feedbackData,
      userId,
      media,
    });

    return feedback;
  }

  async getFeedback(id, userId) {
    const feedback = await feedbackRepo.findFeedbackById(id);
    if (!feedback || feedback.userId.toString() !== userId.toString()) {
      throw createError(404, 'Feedback not found or unauthorized');
    }
    return feedback;
  }

  async getUserFeedbacks(userId, filters, page, limit) {
    return await feedbackRepo.findFeedbacksByUserId(userId, filters, page, limit);
  }

  async getArchivedFeedbacks(userId, filters, page, limit) {
    return await feedbackRepo.findArchivedFeedbacksByUserId(userId, filters, page, limit);
  }

  async updateFeedback(id, userId, updateData, files = [], removeMedia = []) {
    const existingFeedback = await feedbackRepo.findFeedbackById(id);
    if (!existingFeedback || existingFeedback.userId.toString() !== userId.toString()) {
      throw createError(404, 'Feedback not found or unauthorized');
    }

    let media = existingFeedback.media || [];

    if (removeMedia.length > 0) {
      for (const url of removeMedia) {
        if (url) {
          const filePath = new URL(url).pathname.slice(1);
          await imagekit.deleteFileByPath(filePath);
          media = media.filter((m) => m !== url);
        }
      }
    }

    if (files.length > 0) {
      for (const file of files) {
        const uploadResponse = await imagekit.upload({
          file: file.buffer,
          fileName: file.originalname,
          folder: `/feedback/${userId}`,
        });
        media.push(uploadResponse.url);
      }
    }

    const updatedFeedback = await feedbackRepo.updateFeedback(id, userId, {
      ...updateData,
      media,
    });

    return updatedFeedback;
  }

  async softDeleteFeedback(id, userId) {
    const feedback = await feedbackRepo.softDeleteFeedback(id, userId);
    return feedback;
  }

  async permanentDeleteFeedback(id, userId) {
    const feedback = await feedbackRepo.permanentDeleteFeedback(id, userId);
    // Optionally delete media
    // for (const url of feedback.media) {
    //   const filePath = new URL(url).pathname.slice(1);
    //   await imagekit.deleteFileByPath(filePath);
    // }
    return feedback;
  }

  async restoreFeedback(id, userId) {
    const feedback = await feedbackRepo.restoreFeedback(id, userId);
    return feedback;
  }

  async getFeedbackByMediaUrl(url, userId) {
    const feedback = await feedbackRepo.findFeedbackByMediaUrl(url, userId);
    if (!feedback || feedback.userId.toString() !== userId.toString()) {
      throw createError(404, 'Feedback not found or unauthorized');
    }
    return feedback;
  }
}

export default new FeedbackService();