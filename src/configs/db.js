// db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/articulate';
let gridfsBucket; // Store single GridFSBucket instance

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return;
    }

    await mongoose.connect(dbURI);
    console.log('MongoDB connected successfully');

    // Initialize GridFSBucket
    gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads', // Match your bucket name
    });
    console.log('GridFS initialized');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Getter for gridfsBucket to ensure initialization
const getGridfsBucket = () => {
  if (!gridfsBucket) {
    throw new Error('GridFSBucket not initialized. Ensure connectDB is called.');
  }
  return gridfsBucket;
};

// Export mongoose and getGridfsBucket
export { mongoose, getGridfsBucket };
export default connectDB;