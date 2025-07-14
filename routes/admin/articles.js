const express = require('express');
const router = express.Router();
const articleController = require('../../controllers/articleController');
// const { 
//   validateArticle, 
//   checkArticleExists, 
//   authorizeArticleEdit 
// } = require('../../middlewares/articleMiddleware');
const { upload } = require('../../middlewares/uploadMiddleware');
// const { authenticateToken } = require('../../middlewares/authMiddleware');

// Create Article
router.post('/', 
  // authenticateToken,
  upload.single('featured_img'), 
  // validateArticle, 
  articleController.createArticle
);
router.post('/api/articles', async (req, res) => {
  try {
    const newArticle = await createNewArticle(req.body);
    res.status(201).json(newArticle);
  } catch (error) {
    console.error('Error creating article:', error.message);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
  articleController.createArticle;
});

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