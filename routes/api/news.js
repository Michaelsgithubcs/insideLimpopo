const express = require('express');
const router = express.Router();
const newsCacheService = require('../../services/newsCacheService');

// Get general news (cached)
router.get('/headlines', async (req, res) => {
  try {
    const { category = 'general', limit = 20 } = req.query;
    const cachedNews = await newsCacheService.getCachedNews(category, parseInt(limit));
    
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
    console.error('Error fetching cached headlines:', error.message);
    res.status(500).json({ error: 'Failed to fetch news headlines' });
  }
});

// Search cached news with pagination
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
    
    const searchResults = await newsCacheService.searchCachedNews(
      query.trim(), 
      parseInt(limit), 
      Math.max(1, parseInt(page))
    );
    
    // Format response to match NewsAPI structure
    const response = {
      status: 'ok',
      totalResults: searchResults.totalResults,
      articles: searchResults.articles.map(article => ({
        source: article.source,
        author: article.source?.name || null,
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.url_to_image,
        publishedAt: article.published_at,
        content: article.description,
        category: article.category
      })),
      page: searchResults.page,
      totalPages: searchResults.totalPages,
      hasMore: searchResults.hasMore
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error searching cached news:', error.message);
    res.status(500).json({ 
      status: 'error',
      code: 'search_error',
      message: 'Failed to search news',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all cached news
router.get('/all', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const allNews = await newsCacheService.getAllCachedNews(parseInt(limit));
    
    // Format response to match NewsAPI structure
    const response = {
      status: 'ok',
      totalResults: allNews.length,
      articles: allNews.map(article => ({
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
    console.error('Error fetching all cached news:', error.message);
    res.status(500).json({ error: 'Failed to fetch all news' });
  }
});

// Force refresh cache (admin endpoint)
router.post('/refresh', async (req, res) => {
  try {
    const { category } = req.body;
    
    if (category) {
      await newsCacheService.fetchAndCacheNews(category);
      res.json({ message: `Cache refreshed for category: ${category}` });
    } else {
      await newsCacheService.refreshAllCategories();
      res.json({ message: 'Cache refreshed for all categories' });
    }
  } catch (error) {
    console.error('Error refreshing cache:', error.message);
    res.status(500).json({ error: 'Failed to refresh cache' });
  }
});

// Get cache status (admin endpoint)
router.get('/cache-status', async (req, res) => {
  try {
    const status = await newsCacheService.getCacheStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting cache status:', error.message);
    res.status(500).json({ error: 'Failed to get cache status' });
  }
});

module.exports = router;
