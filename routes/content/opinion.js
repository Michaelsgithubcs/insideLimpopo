const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/opinion', (req, res) => {
    res.render('content/opinion', { title: 'Opinion'});
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