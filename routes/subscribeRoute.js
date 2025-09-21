const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // ✅ Subscribe
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

  // ✅ Show unsubscribe page (GET form)
  router.get('/unsubscribe', (req, res) => {
    res.render('unsubscribe-form', { message: null, success: null });
  });

  // ✅ Handle unsubscribe form submission (POST)
  router.post('/unsubscribe', async (req, res) => {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.render('unsubscribe-form', { message: 'Valid email is required.', success: false });
    }

    try {
      const [result] = await pool.query(
        'DELETE FROM newsletter_subscribers WHERE email = ?',
        [email]
      );

      if (result.affectedRows === 0) {
        return res.render('unsubscribe-form', { message: 'Email not found in subscribers list.', success: false });
      }

      res.render('unsubscribe-form', { message: 'You have successfully unsubscribed.', success: true });
    } catch (err) {
      console.error('Error unsubscribing:', err);
      res.render('unsubscribe-form', { message: 'Something went wrong.', success: false });
    }
  });

  return router;
};
