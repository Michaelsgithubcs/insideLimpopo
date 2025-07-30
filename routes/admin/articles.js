const express = require('express');
const router = express.Router();
const articleController = require('../../controllers/articleController');
const { upload, uploadAny } = require('../../middlewares/uploadMiddleware');
const { isAuthenticated } = require('../../middlewares/auth');
const getPool = require('../../config/db');
const { fixFeaturedImageUrl } = require('../../middlewares/formFixMiddleware');
const { sendNewsletter } = require('../../services/emailService'); // <-- Added

// Create Article
router.post('/',
  isAuthenticated,
  upload.single('featured_img'),
  fixFeaturedImageUrl,
  // validateArticle,
  async (req, res, next) => {
    try {
      // Call your existing controller
      await articleController.createArticle(req, res);

      // Get subscribers
      const pool = await getPool();
      const [subscribers] = await pool.query('SELECT email FROM newsletter_subscribers');

   if (subscribers.length > 0) {
  const emails = subscribers.map(s => s.email); // Extract only emails
  const htmlContent = `
    <h2>New Article: ${req.body.title}</h2>
    <p>${req.body.content.substring(0, 200)}...</p>
    <a href="http://yourwebsite.com/articles/${req.body.slug || '#'}">Read more</a>
  `;
  await sendNewsletter(emails, `New Article: ${req.body.title}`, htmlContent);
}
    } catch (err) {
      console.error('Error sending newsletter:', err);
      // Don't block article creation if email fails
    }
  }
);

// Get Article
router.get('/:id',
  articleController.getArticle
);

// Update Article
router.put('/:id',
  upload.single('featured_img'),
  articleController.updateArticle
);

// Delete Article
router.delete('/:id',
  articleController.deleteArticle
);

// Render Add Article Form
router.get('/add', isAuthenticated, async (req, res) => {
  try {
    const pool = await getPool();
    const [categories] = await pool.query('SELECT category_id, name FROM categories');
    res.render('admin/add-articles', { categories });
  } catch (err) {
    console.error('Error loading categories:', err);
    req.flash('error', 'Could not load categories');
    res.redirect('/landing');
  }
});

// Redirect legacy or hardcoded add-article route to the correct one
router.get('/admin/add-articles', (req, res) => {
  res.redirect('/api/articles/add');
});

module.exports = router;
