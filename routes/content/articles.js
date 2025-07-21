const express = require('express');
const router = express.Router();
const Article = require('../../models/Article');

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

module.exports = router; 