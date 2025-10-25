// uploadToGridFS.js
import { getGridfsBucket } from '../configs/db.js'; // Import getter
import createError from 'http-errors';
import { Readable } from 'stream';

const uploadToGridFS = async (file, userId) => {
  if (!file) {
    throw createError(400, 'No file provided');
  }

  const { originalname, buffer, mimetype } = file;
  const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'audio/mpeg', 'application/pdf'];
  if (!allowedTypes.includes(mimetype)) {
    throw createError(400, 'Invalid file type');
  }

  try {
    const gridfsBucket = getGridfsBucket(); // Use getter for safety
    const metadata = { userId };
    const uploadStream = gridfsBucket.openUploadStream(originalname, {
      contentType: mimetype,
      metadata,
      chunkSizeBytes: 1024 * 1024, // 1MB chunks for efficiency
    });

    // Stream buffer to GridFS to reduce memory usage
    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);

    return new Promise((resolve, reject) => {
      uploadStream.on('finish', () => {
        resolve({
          fileId: uploadStream.id,
          type: mimetype.split('/')[0] === 'image' ? 'image' :
                mimetype.split('/')[0] === 'video' ? 'video' :
                mimetype.split('/')[0] === 'audio' ? 'audio' : 'pdf',
        });
      });
      uploadStream.on('error', (error) => {
        reject(createError(500, `Error uploading file to GridFS: ${error.message}`));
      });
    });
  } catch (error) {
    throw createError(500, error.message || 'Error initializing GridFS upload');
  }
};

export default uploadToGridFS;