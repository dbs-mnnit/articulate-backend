// models/Thoughts.js
import mongoose from 'mongoose';

const thoughtSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  thought: {
    type: String,
    required: true,
  },
  mood: {
    type: [String],
    default: [],
  },
  context: {
    type: String,
    default: '',
  },
  additionalNotes: {
    type: String,
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
  media: [{
    type: String, // Store ImageKit URLs
    default: '',
  }],
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isPermanentlyDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  followUps: [{
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

thoughtSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

thoughtSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export default mongoose.model('Thought', thoughtSchema);