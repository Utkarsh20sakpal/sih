const mongoose = require('mongoose');

const knowledgeArticleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  category: { type: String, required: true, trim: true },
  tags: { type: [String], default: [] },
  language: { type: String, enum: ['en', 'hi'], default: 'en' },
  isPublished: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.models.KnowledgeArticle || mongoose.model('KnowledgeArticle', knowledgeArticleSchema);
