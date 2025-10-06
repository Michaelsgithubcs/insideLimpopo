const express = require('express');
const router = express.Router();
const getPool = require('../../config/db');
const Podcast = require('../../models/Podcast');

router.get('/podcast', async (req, res) => {
  try {
    // Get all podcasts from the podcasts table
    const postedArticles = await Podcast.getAll();
    
    res.render('content/podcast', { title: 'Podcast', postedArticles });
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;