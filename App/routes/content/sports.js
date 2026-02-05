const express = require('express');
const router = express.Router();
const getPool = require("../../config/db");
const CachedNews = require('../../models/CachedNews');

router.get('/sports', async (req, res) => {
  try {
    const pool = await getPool();
    const [sportsArticles] = await pool.query(`
      SELECT articles.*, categories.name AS category_name
      FROM articles
      JOIN categories ON articles.category_id = categories.category_id
      WHERE categories.name = 'sports'
      ORDER BY articles.created_at DESC
    `);

    // Fetch cached sports data instead of making API calls
    let cachedSportsData = [];
    try {
      console.log('Fetching cached sports data for /sports route...');
      cachedSportsData = await CachedNews.getByCategory('sports', 15);
      console.log(`Fetched ${cachedSportsData.length} cached sports news`);
    } catch (error) {
      console.error('Error fetching cached sports data:', error);
      cachedSportsData = [];
    }

    // Combine regular articles with cached API data
    const combinedSportsContent = [...sportsArticles, ...cachedSportsData];
    
    // Sort by date (newest first)
    combinedSportsContent.sort((a, b) => {
      const dateA = new Date(a.created_at || a.published_at);
      const dateB = new Date(b.created_at || b.published_at);
      return dateB - dateA;
    });

    res.render('content/sports', { 
      title: "Sports", 
      sportsArticles: combinedSportsContent,
      apiDataCount: cachedSportsData.length,
      manualArticlesCount: sportsArticles.length
    });
  } catch (error) {
    console.error('Error in sports route:', error);
    res.status(500).send('Server Error');
  }
});  

module.exports = router;

