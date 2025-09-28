const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const warningSchema = new mongoose.Schema({
  collectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  importance: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  title: { type: String, default: '' },
  message: { type: String, required: true, maxlength: 2000 },
  status: { type: String, enum: ['open', 'resolved', 'dismissed'], default: 'open' },
  replies: [ReplySchema]
}, { timestamps: true });

warningSchema.index({ collectorId: 1, createdAt: -1 });
warningSchema.index({ supervisorId: 1, createdAt: -1 });
warningSchema.index({ importance: 1, status: 1 });

module.exports = mongoose.model('Warning', warningSchema);