// services/thoughtsService.js
import thoughtsRepo from './thoughtsRepo.js';
import { generateTags } from '../../utils/tags.js';
import imagekit from '../../configs/imagekitConfig.js';
import createError from 'http-errors';

class ThoughtsService {
  async createThought(userId, thoughtData, files = []) {
    if (!thoughtData.tags || thoughtData.tags.length === 0) {
      thoughtData.tags = generateTags(thoughtData.thought);
    }

    thoughtData.mood = Array.isArray(thoughtData.mood) ? thoughtData.mood : thoughtData.mood ? [thoughtData.mood] : [];
    thoughtData.tags = Array.isArray(thoughtData.tags) ? thoughtData.tags : thoughtData.tags ? [thoughtData.tags] : [];

    const media = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const uploadResponse = await imagekit.upload({
          file: file.buffer,
          fileName: file.originalname,
          folder: `/thoughts/${userId}`,
        });
        media.push(uploadResponse.url);
      }
    }

    const thought = await thoughtsRepo.createThought({
      ...thoughtData,
      userId,
      media,
    });

    return thought;
  }

  async getThought(id, userId) {
    const thought = await thoughtsRepo.findThoughtById(id);
    if (!thought || thought.userId.toString() !== userId.toString()) {
      throw createError(404, 'Thought not found or unauthorized');
    }
    return thought;
  }

  async getUserThoughts(userId, filters, page, limit) {
    return await thoughtsRepo.findThoughtsByUserId(userId, filters, page, limit);
  }

  async getArchivedThoughts(userId, filters, page, limit) {
    return await thoughtsRepo.findArchivedThoughtsByUserId(userId, filters, page, limit);
  }

  async updateThought(id, userId, updateData, files = [], removeMedia = []) {
    const existingThought = await thoughtsRepo.findThoughtById(id);
    if (!existingThought || existingThought.userId.toString() !== userId.toString()) {
      throw createError(404, 'Thought not found or unauthorized');
    }

    let media = existingThought.media || [];

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
          folder: `/thoughts/${userId}`,
        });
        media.push(uploadResponse.url);
      }
    }

    if (!updateData.tags || updateData.tags.length === 0) {
      updateData.tags = generateTags(updateData.thought || existingThought.thought);
    }

    if (updateData.mood === undefined) {
      updateData.mood = existingThought.mood;
    } else {
      updateData.mood = Array.isArray(updateData.mood) ? updateData.mood : updateData.mood ? [updateData.mood] : [];
    }

    if (updateData.tags === undefined) {
      updateData.tags = existingThought.tags;
    } else {
      updateData.tags = Array.isArray(updateData.tags) ? updateData.tags : updateData.tags ? [updateData.tags] : [];
    }

    const updatedThought = await thoughtsRepo.updateThought(id, userId, {
      ...updateData,
      media,
    });

    return updatedThought;
  }

  async softDeleteThought(id, userId) {
    const thought = await thoughtsRepo.softDeleteThought(id, userId);
    return thought;
  }

  async permanentDeleteThought(id, userId) {
    const thought = await thoughtsRepo.permanentDeleteThought(id, userId);
    // for (const url of thought.media) {
    //   const filePath = new URL(url).pathname.slice(1);
    //   await imagekit.deleteFileByPath(filePath);
    // }
    return thought;
  }

  async restoreThought(id, userId) {
    const thought = await thoughtsRepo.restoreThought(id, userId);
    return thought;
  }

  async addFollowUp(id, userId, content) {
    const followUpData = { content, createdAt: new Date() };
    const thought = await thoughtsRepo.addFollowUp(id, userId, followUpData);
    return thought;
  }

  async getFollowUps(id, userId) {
    const followUps = await thoughtsRepo.getFollowUps(id, userId);
    return followUps;
  }

  async getThoughtByMediaUrl(url, userId) {
    const thought = await thoughtsRepo.findThoughtByMediaUrl(url, userId);
    if (!thought || thought.userId.toString() !== userId.toString()) {
      throw createError(404, 'Thought not found or unauthorized');
    }
    return thought;
  }
}

export default new ThoughtsService();