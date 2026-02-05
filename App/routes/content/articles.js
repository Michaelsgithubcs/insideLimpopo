const express = require('express');
const router = express.Router();
const Article = require('../../models/Article');
const newsCacheService = require('../../services/newsCacheService');

// Search articles
router.get('/search', async (req, res) => {
  try {
    const { q: query, page = 1, limit = 10 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Search query must be at least 2 characters long' 
      });
    }

    const searchResults = await newsCacheService.searchCachedNews(
      query.trim(),
      parseInt(limit),
      parseInt(page)
    );

    // If it's an AJAX request, return JSON
    if (req.xhr || req.get('Accept') === 'application/json') {
      return res.json({
        status: 'success',
        data: searchResults
      });
    }

    // Otherwise, render the articles page with search results
    res.render('content/articles', {
      title: `Search Results for "${query}"`,
      articles: searchResults.articles,
      currentPage: searchResults.page,
      totalPages: searchResults.totalPages,
      hasNextPage: searchResults.page < searchResults.totalPages,
      hasPreviousPage: searchResults.page > 1,
      nextPage: searchResults.page + 1,
      previousPage: searchResults.page - 1,
      searchQuery: query
    });

  } catch (error) {
    console.error('Search error:', error);
    
    if (req.xhr || req.get('Accept') === 'application/json') {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to perform search',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    res.status(500).render('error', {
      message: 'An error occurred while performing your search',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Get single article
const pool = require('../../config/db');
const articleController = require('../../controllers/articleController');
const Comment = require('../../models/Comment');

router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).render('error', { message: 'Article not found' });
    }

    // ✅ Parse social_links JSON if it exists
    if (article.social_links && typeof article.social_links === 'string') {
      try {
        article.social_links = JSON.parse(article.social_links);
      } catch (err) {
        console.warn('⚠️ Failed to parse social_links JSON:', err.message);
        article.social_links = null;
      }
    }

    // Get related articles and comments
    const relatedArticles = await Article.findByCategory(article.category_id, 3, article.article_id);
    const comments = await Comment.findByArticleId(req.params.id);
    const commentCount = await Comment.getCountByArticleId(req.params.id);

    // ✅ Send parsed social_links to the template
    res.render('templates/articles-display', { 
      article, 
      relatedArticles, 
      comments, 
      commentCount,
      socialLinks: article.social_links || {} // 👈 Added line
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Example Express route
router.get("/added/:categoryName", articleController.getArticleByCategory);



// Article search route
router.get('/search', articleController.searchArticles);




module.exports = router;