// models/Feedback.js
import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  feedback: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  type: {
    type: String,
    enum: ['bug', 'feature', 'general'],
    default: 'general',
  },
  media: [{
    type: String,
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
}, {
  timestamps: true,
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;