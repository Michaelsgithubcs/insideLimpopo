const express = require('express');
const router = express.Router();
const axios = require('axios');
const getPool = require('../../config/db');

// Helper: get all opinion articles
async function getOpinionArticles() {
  const pool = await getPool();
  // Find the category_id for 'opinion'
  const [categories] = await pool.query("SELECT category_id FROM categories WHERE name = 'opinion'");
  if (!categories.length) return [];
  const categoryId = categories[0].category_id;
  const [articles] = await pool.query("SELECT * FROM articles WHERE category_id = ? ORDER BY created_at DESC", [categoryId]);
  return articles;
}

router.get('/opinion', async (req, res) => {
  const postedArticles = await getOpinionArticles();
  res.render('content/opinion', { title: 'Opinion', postedArticles });
});

// Proxy route for NewsAPI
router.get('/api/opinion-news', async (req, res) => {
  try {
    const apiKey = '94710bfc54a44f1a9796e81a0bd2e446';
    const apiUrl = `https://newsapi.org/v2/top-headlines?country=us&pageSize=20&apiKey=${apiKey}`;
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching news from NewsAPI:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

module.exports = router;