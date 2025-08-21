const express = require('express');
const router = express.Router();
const Article = require('../../models/Article');
const pool = require('../../config/db');
const articleController = require('../../controllers/articleController');

router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).render('error', { message: 'Article not found' });
    }
    const relatedArticles = await Article.findByCategory(article.category_id, 3, article.article_id);
    res.render('templates/articles-display', { article, relatedArticles });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


// Article search route
router.get('/search', articleController.searchArticles);




module.exports = router; 