const express = require('express');
const router = express.Router();
const articleController = require('../../controllers/articleController');
// const { 
//   validateArticle, 
//   checkArticleExists, 
//   authorizeArticleEdit 
// } = require('../../middlewares/articleMiddleware');
const { upload } = require('../../middlewares/uploadMiddleware');
const { isAuthenticated } = require('../../middlewares/auth');
// const { authenticateToken } = require('../../middlewares/authMiddleware');

// Create Article
router.post('/', 
  isAuthenticated,
  upload.single('featured_img'), 
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


module.exports = router;