const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['website', 'app', 'service', 'hardware', 'other'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    maxlength: [100, 'Subject cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'closed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  response: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  tags: [String],
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, priority: 1 });
feedbackSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
