// repositories/feedbackRepo.js
import Feedback from '../../models/Feedback.js';
import createError from 'http-errors';

class FeedbackRepository {
  async createFeedback(feedbackData) {
    return await Feedback.create(feedbackData);
  }

  async findFeedbackById(id) {
    return await Feedback.findOne({
      _id: id,
      isDeleted: false,
      isPermanentlyDeleted: false,
    });
  }

  async findFeedbacksByUserId(userId, filters = {}, page = 1, limit = 10) {
    const query = {
      userId,
      isDeleted: false,
      isPermanentlyDeleted: false,
    };
    if (filters.type) {
      query.type = filters.type;
    }
    if (filters.rating) {
      query.rating = filters.rating;
    }
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }

    return await Feedback.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async findArchivedFeedbacksByUserId(userId, filters = {}, page = 1, limit = 10) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Mark feedbacks soft-deleted for more than 30 days as permanently deleted
    await Feedback.updateMany(
      {
        userId,
        isDeleted: true,
        isPermanentlyDeleted: false,
        deletedAt: { $lt: thirtyDaysAgo },
      },
      { $set: { isPermanentlyDeleted: true } }
    );

    const query = {
      userId,
      isDeleted: true,
      isPermanentlyDeleted: false,
      deletedAt: { $gte: thirtyDaysAgo },
    };
    if (filters.type) {
      query.type = filters.type;
    }
    if (filters.rating) {
      query.rating = filters.rating;
    }
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }

    return await Feedback.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async findFeedbackByMediaUrl(url, userId) {
    return await Feedback.findOne({
      userId,
      media: url,
      isDeleted: false,
      isPermanentlyDeleted: false,
    });
  }

  async updateFeedback(id, userId, updateData) {
    const feedback = await Feedback.findOneAndUpdate(
      { _id: id, userId, isDeleted: false, isPermanentlyDeleted: false },
      { $set: updateData },
      { new: true }
    );
    if (!feedback) {
      throw createError(404, 'Feedback not found or unauthorized');
    }
    return feedback;
  }

  async softDeleteFeedback(id, userId) {
    const feedback = await Feedback.findOneAndUpdate(
      { _id: id, userId, isDeleted: false, isPermanentlyDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
    if (!feedback) {
      throw createError(404, 'Feedback not found or unauthorized');
    }
    return feedback;
  }

  async permanentDeleteFeedback(id, userId) {
    const feedback = await Feedback.findOneAndUpdate(
      { _id: id, userId, isPermanentlyDeleted: false },
      { $set: { isPermanentlyDeleted: true } },
      { new: true }
    );
    if (!feedback) {
      throw createError(404, 'Feedback not found or unauthorized');
    }
    return feedback;
  }

  async restoreFeedback(id, userId) {
    const feedback = await Feedback.findOneAndUpdate(
      { _id: id, userId, isDeleted: true, isPermanentlyDeleted: false },
      { $set: { isDeleted: false, deletedAt: null } },
      { new: true }
    );
    if (!feedback) {
      throw createError(404, 'Feedback not found or cannot be restored');
    }
    return feedback;
  }
}

export default new FeedbackRepository();