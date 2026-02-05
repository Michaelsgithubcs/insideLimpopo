const express = require('express');
const router = express.Router();
const localNewsCacheService = require('../../services/saNewsCacheService');

// Get Local news (cached)
router.get('/headlines', async (req, res) => {
  try {
    const { category = 'general', limit = 20 } = req.query;
    const cachedNews = await localNewsCacheService.getCachedNews(category, parseInt(limit));
    
    // Format response to match NewsAPI structure for frontend compatibility
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
    console.error('Error fetching cached SA headlines:', error.message);
    res.status(500).json({ error: 'Failed to fetch Local news headlines' });
  }
});

// Search South African cached news with pagination
router.get('/search', async (req, res) => {
  try {
    const { q: query, limit = 20, page = 1 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        status: 'error',
        code: 'missing_query',
        message: 'Search query is required and must be at least 2 characters long' 
      });
    }
    
    // Implement search for SA news categories
    const pool = await require('../../config/db')();
    const searchTerm = `%${query}%`;
    const saPrefix = 'sa_%';
    const [rows] = await pool.query(
      `SELECT * FROM cached_news 
       WHERE (title LIKE ? OR description LIKE ?) AND category LIKE ?
       ORDER BY published_at DESC 
       LIMIT ? OFFSET ?`,
      [searchTerm, searchTerm, saPrefix, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)]
    );
    
    const articles = rows.map(row => ({
      ...row,
      source: row.source ? JSON.parse(row.source) : { name: 'Unknown' }
    }));
    
    // Format response to match NewsAPI structure
    const response = {
      status: 'ok',
      totalResults: articles.length,
      articles: articles.map(article => ({
        source: article.source,
        author: article.source?.name || null,
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.url_to_image,
        publishedAt: article.published_at,
        content: article.description,
        category: article.category?.replace('sa_', '') || 'general'
      })),
      page: parseInt(page) || 1,
      totalPages: 1,
      hasMore: false
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error searching cached SA news:', error.message);
    res.status(500).json({ 
      status: 'error',
      code: 'search_error',
      message: 'Failed to search Local news',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Force refresh Local news cache (admin endpoint)
router.post('/refresh', async (req, res) => {
  try {
    const { category } = req.body;
    
    if (category) {
      await localNewsCacheService.fetchAndCacheNews(category);
      res.json({ message: `SA news cache refreshed for category: ${category}` });
    } else {
      await localNewsCacheService.refreshAllCategories();
      res.json({ message: 'SA news cache refreshed for all categories' });
    }
  } catch (error) {
    console.error('Error refreshing SA news cache:', error.message);
    res.status(500).json({ error: 'Failed to refresh Local news cache' });
  }
});

// Get SA cache status (admin endpoint)
router.get('/cache-status', async (req, res) => {
  try {
    const status = await localNewsCacheService.getCacheStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting SA cache status:', error.message);
    res.status(500).json({ error: 'Failed to get Local news cache status' });
  }
});

module.exports = router;
