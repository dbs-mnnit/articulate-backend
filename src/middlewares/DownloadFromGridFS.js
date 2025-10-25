// DownloadFromGridFS.js
import { getGridfsBucket, mongoose } from '../configs/db.js'; // Import getter and mongoose
import createError from 'http-errors';

const downloadFromGridFS = async (fileId, userId) => {
  try {
    const gridfsBucket = getGridfsBucket(); // Use getter for safety
    const file = await gridfsBucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
    if (!file || file.length === 0) {
      throw createError(404, 'File not found');
    }

    if (file[0].metadata.userId.toString() !== userId.toString()) {
      throw createError(403, 'Unauthorized to access this file');
    }

    return {
      stream: gridfsBucket.openDownloadStream(new mongoose.Types.ObjectId(fileId)),
      contentType: file[0].contentType,
      filename: file[0].filename,
    };
  } catch (error) {
    throw createError(error.status || 500, error.message || 'Error downloading file from GridFS');
  }
};

export default downloadFromGridFS;