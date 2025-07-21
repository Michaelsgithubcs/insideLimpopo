const express = require('express');
const router = express.Router();
const getPool = require('../../config/db');
const Article = require('../../models/Article');

router.get('/podcast', async (req, res) => {
  try {
    const pool = await getPool();
    const [category] = await pool.query('SELECT category_id FROM categories WHERE name = ?', ['podcast']);
    
    if (category.length === 0) {
      return res.render('content/podcast', { title: 'Podcast', postedArticles: [] });
    }

    const postedArticles = await Article.findByCategory(category[0].category_id);
    res.render('content/podcast', { title: 'Podcast', postedArticles });
  } catch (error) {
    console.error('Error fetching podcast articles:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;