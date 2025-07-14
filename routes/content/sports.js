const express = require('express');
const router = express.Router();
const pool = require("../../config/db");

router.get('/sports', async (req, res) => {
    try {
      const [sportsArticles] = await pool.query(`
        SELECT articles.*, categories.name AS category_name
        FROM articles
        JOIN categories ON articles.category_id = categories.category_id
        WHERE categories.name = 'sports'
        ORDER BY published_at DESC
      `);
  
      res.render('content/sports', { title: "Sports", sportsArticles });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  });  

module.exports = router;

