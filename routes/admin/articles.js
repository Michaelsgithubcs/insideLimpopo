const express = require('express');
const router = express.Router();
const articleController = require('../../controllers/articleController');
// const { 
//   validateArticle, 
//   checkArticleExists, 
//   authorizeArticleEdit 
// } = require('../../middlewares/articleMiddleware');
const { upload, uploadAny } = require('../../middlewares/uploadMiddleware');
const { isAuthenticated } = require('../../middlewares/auth');
// const { authenticateToken } = require('../../middlewares/authMiddleware');
const getPool = require('../../config/db');
const { fixFeaturedImageUrl } = require('../../middlewares/formFixMiddleware');

// Create Article
router.post('/', 
  isAuthenticated,
  uploadAny,
  fixFeaturedImageUrl,
  // validateArticle, 
  articleController.createArticle
);

// Get Article
router.get('/:id', 
  // checkArticleExists, 
  articleController.getArticle
);

// Update Article
router.put('/:id', 
  // authenticateToken,
  // checkArticleExists, 
  // authorizeArticleEdit,
  upload.single('featured_img'), 
  // validateArticle,
  articleController.updateArticle
);

// Delete Article
router.delete('/:id', 
  // authenticateToken,
  // checkArticleExists, 
  // authorizeArticleEdit,
  articleController.deleteArticle
);

// Render Add Article Form
router.get('/add', isAuthenticated, async (req, res) => {
  try {
    const pool = await getPool();
    const [categories] = await pool.query('SELECT category_id, name FROM categories');
    res.render('admin/add-articles', { categories });
  } catch (err) {
    console.error('Error loading categories:', err);
    req.flash('error', 'Could not load categories');
    res.redirect('/landing');
  }
});

// Redirect legacy or hardcoded add-article route to the correct one
router.get('/admin/add-articles', (req, res) => {
  res.redirect('/api/articles/add');
});

module.exports = router;