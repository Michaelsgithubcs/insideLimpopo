const express = require('express');
const router = express.Router();
const getPool = require("../../config/db");

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
    res.render('content/sports', { title: "Sports", sportsArticles });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});  

module.exports = router;

