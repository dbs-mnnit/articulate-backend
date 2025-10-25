// repositories/thoughtsRepo.js
import Thoughts from '../../models/Thoughts.js';
import createError from 'http-errors';

class ThoughtsRepository {
  async createThought(thoughtData) {
    return await Thoughts.create(thoughtData);
  }

  async findThoughtById(id) {
    return await Thoughts.findOne({
      _id: id,
      isDeleted: false,
      isPermanentlyDeleted: false,
    });
  }

  async findThoughtsByUserId(userId, filters = {}, page = 1, limit = 10) {
    const query = {
      userId,
      isDeleted: false,
      isPermanentlyDeleted: false,
    };
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }
    if (filters.mood && filters.mood.length > 0) {
      query.mood = { $in: filters.mood };
    }
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }

    return await Thoughts.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async findArchivedThoughtsByUserId(userId, filters = {}, page = 1, limit = 10) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Mark thoughts soft-deleted for more than 30 days as permanently deleted
    await Thoughts.updateMany(
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
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }
    if (filters.mood && filters.mood.length > 0) {
      query.mood = { $in: filters.mood };
    }
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }

    return await Thoughts.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async findThoughtByMediaUrl(url, userId) {
    return await Thoughts.findOne({
      userId,
      media: url,
      isDeleted: false,
      isPermanentlyDeleted: false,
    });
  }

  async updateThought(id, userId, updateData) {
    const thought = await Thoughts.findOneAndUpdate(
      { _id: id, userId, isDeleted: false, isPermanentlyDeleted: false },
      { $set: updateData },
      { new: true }
    );
    if (!thought) {
      throw createError(404, 'Thought not found or unauthorized');
    }
    return thought;
  }

  async softDeleteThought(id, userId) {
    const thought = await Thoughts.findOneAndUpdate(
      { _id: id, userId, isDeleted: false, isPermanentlyDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
    if (!thought) {
      throw createError(404, 'Thought not found or unauthorized');
    }
    return thought;
  }

  async permanentDeleteThought(id, userId) {
    const thought = await Thoughts.findOneAndUpdate(
      { _id: id, userId, isPermanentlyDeleted: false },
      { $set: { isPermanentlyDeleted: true } },
      { new: true }
    );
    if (!thought) {
      throw createError(404, 'Thought not found or unauthorized');
    }
    return thought;
  }

  async restoreThought(id, userId) {
    const thought = await Thoughts.findOneAndUpdate(
      { _id: id, userId, isDeleted: true, isPermanentlyDeleted: false },
      { $set: { isDeleted: false, deletedAt: null } },
      { new: true }
    );
    if (!thought) {
      throw createError(404, 'Thought not found or cannot be restored');
    }
    return thought;
  }

  async addFollowUp(id, userId, followUpData) {
    const thought = await Thoughts.findOneAndUpdate(
      { _id: id, userId, isDeleted: false, isPermanentlyDeleted: false },
      { $push: { followUps: followUpData } },
      { new: true }
    );
    if (!thought) {
      throw createError(404, 'Thought not found or unauthorized');
    }
    return thought;
  }

  async getFollowUps(id, userId) {
    const thought = await Thoughts.findOne(
      { _id: id, userId, isDeleted: false, isPermanentlyDeleted: false },
      { followUps: 1 }
    );
    if (!thought) {
      throw createError(404, 'Thought not found or unauthorized');
    }
    return thought.followUps;
  }
}

export default new ThoughtsRepository();