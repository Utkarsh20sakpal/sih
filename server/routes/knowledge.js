const express = require('express');
const { body, validationResult } = require('express-validator');
const KnowledgeArticle = require('../models/KnowledgeArticle');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// In-memory fallback store for development when DB is unavailable
const fallbackArticles = [
  {
    _id: 'kb1',
    title: 'How to Segregate Waste at Home',
    content: 'Separate wet and dry waste. Rinse recyclables, keep organics apart.',
    category: 'Waste Segregation',
    tags: ['segregation', 'home'],
    language: 'en',
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'kb2',
    title: 'घर पर कचर अलग कस कर',
    content: 'गल और सख कचर अलग रख रसयकल यगय वसतओ क धकर रख',
    category: 'Waste Segregation',
    tags: ['segregation', 'home'],
    language: 'hi',
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'kb3',
    title: 'Plastic Recycling Symbols Explained',
    content: 'PET (1) and HDPE (2) are widely recycled. Check local guidelines.',
    category: 'Recycling',
    tags: ['plastic', 'symbols'],
    language: 'en',
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

function applyFilters(list, { language, q, category }) {
  let out = list.filter(a => a.isPublished !== false);
  if (language) out = out.filter(a => a.language === language);
  if (category) out = out.filter(a => a.category.toLowerCase() === category.toLowerCase());
  if (q) {
    const query = q.toLowerCase();
    out = out.filter(a =>
      (a.title && a.title.toLowerCase().includes(query)) ||
      (a.content && a.content.toLowerCase().includes(query)) ||
      (Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase().includes(query)))
    );
  }
  return out;
}

// @desc    Get published articles (public)
// @route   GET /api/knowledge
router.get('/', async (req, res) => {
  try {
    const { language, q, category, page = 1, limit = 20 } = req.query;
    const filter = { isPublished: true };
    if (language) filter.language = language;
    if (category) filter.category = new RegExp(`^${category}$`, 'i');
    // text search across title/content/tags
    let queryBuilder = KnowledgeArticle.find(filter);
    if (q) {
      const regex = new RegExp(q, 'i');
      queryBuilder = KnowledgeArticle.find({
        ...filter,
        $or: [
          { title: regex },
          { content: regex },
          { tags: regex }
        ]
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const articles = await queryBuilder.sort({ updatedAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await KnowledgeArticle.countDocuments(filter);

    return res.json({ success: true, data: articles, meta: { total } });
  } catch (err) {
    // Fallback to in-memory
    const { language, q, category } = req.query;
    const filtered = applyFilters(fallbackArticles, { language, q, category });
    return res.json({ success: true, data: filtered, meta: { fallback: true } });
  }
});

// @desc    Get categories (public)
// @route   GET /api/knowledge/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await KnowledgeArticle.distinct('category', { isPublished: true });
    return res.json({ success: true, data: categories });
  } catch (err) {
    const categories = Array.from(new Set(fallbackArticles.filter(a => a.isPublished !== false).map(a => a.category)));
    return res.json({ success: true, data: categories, meta: { fallback: true } });
  }
});

// @desc    Create article (supervisor)
// @route   POST /api/knowledge
// @access  Private (supervisor)
router.post('/', protect, authorize('supervisor'), [
  body('title').trim().isLength({ min: 3 }),
  body('content').trim().isLength({ min: 10 }),
  body('category').trim().isLength({ min: 2 }),
  body('language').optional().isIn(['en', 'hi'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  try {
    const { title, content, category, tags = [], language = 'en', isPublished = true } = req.body;
    const article = await KnowledgeArticle.create({
      title, content, category, tags, language, isPublished, createdBy: req.user.id, updatedBy: req.user.id
    });
    return res.status(201).json({ success: true, data: article });
  } catch (err) {
    // Fallback: push to memory (dev only)
    const { title, content, category, tags = [], language = 'en', isPublished = true } = req.body;
    const item = { _id: Date.now().toString(), title, content, category, tags, language, isPublished, createdAt: new Date(), updatedAt: new Date() };
    fallbackArticles.push(item);
    return res.status(201).json({ success: true, data: item, meta: { fallback: true } });
  }
});

// @desc    Update article (supervisor)
// @route   PUT /api/knowledge/:id
// @access  Private (supervisor)
router.put('/:id', protect, authorize('supervisor'), async (req, res) => {
  try {
    const update = { ...req.body, updatedBy: req.user.id };
    const article = await KnowledgeArticle.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    return res.json({ success: true, data: article });
  } catch (err) {
    // Fallback
    const idx = fallbackArticles.findIndex(a => a._id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Article not found' });
    fallbackArticles[idx] = { ...fallbackArticles[idx], ...req.body, updatedAt: new Date() };
    return res.json({ success: true, data: fallbackArticles[idx], meta: { fallback: true } });
  }
});

// @desc    Delete article (supervisor)
// @route   DELETE /api/knowledge/:id
// @access  Private (supervisor)
router.delete('/:id', protect, authorize('supervisor'), async (req, res) => {
  try {
    const article = await KnowledgeArticle.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    return res.json({ success: true, message: 'Article deleted' });
  } catch (err) {
    const idx = fallbackArticles.findIndex(a => a._id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Article not found' });
    fallbackArticles.splice(idx, 1);
    return res.json({ success: true, message: 'Article deleted', meta: { fallback: true } });
  }
});

module.exports = router;
