const express = require('express');
const router = express.Router();
const axios = require('axios');
const getPool = require('../../config/db');
const newsCacheService = require('../../services/newsCacheService');

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

// Cached news route
router.get('/api/opinion-news', async (req, res) => {
  try {
    const cachedNews = await newsCacheService.getCachedNews('general', 20);
    
    // Format response to match NewsAPI structure
    const response = {
      status: 'ok',
      totalResults: cachedNews.length,
      articles: cachedNews.map(article => ({
        source: article.source,
        author: article.source?.name || null,
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.url_to_image,
        publishedAt: article.published_at,
        content: article.description
      }))
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching cached news:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

module.exports = router;