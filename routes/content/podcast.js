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

    // Get all podcast articles with full details, ordered by newest first
    const [postedArticles] = await pool.query(
      `SELECT a.*, u.username 
       FROM articles a
       LEFT JOIN users u ON a.author_id = u.id
       WHERE a.category_id = ?
       ORDER BY a.created_at DESC`,
      [category[0].category_id]
    );
    res.render('content/podcast', { title: 'Podcast', postedArticles });
  } catch (error) {
    console.error('Error fetching podcast articles:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;