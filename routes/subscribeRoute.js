const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  router.post('/', async (req, res) => {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    try {
      await pool.query('INSERT INTO newsletter_subscribers (email) VALUES (?)', [email]);
      res.json({ message: 'Subscription successful!' });
    } catch (err) {
      console.error('Error inserting subscriber:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(409).json({ message: 'You are already subscribed!' });
      } else {
        res.status(500).json({ message: 'Something went wrong.' });
      }
    }
  });

  return router;
};
