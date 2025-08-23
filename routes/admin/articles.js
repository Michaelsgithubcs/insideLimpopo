const express = require('express');
const router = express.Router();
const articleController = require('../../controllers/articleController');
const { upload, uploadAny } = require('../../middlewares/uploadMiddleware');
const { isAuthenticated } = require('../../middlewares/auth');
const getPool = require('../../config/db');
const { fixFeaturedImageUrl } = require('../../middlewares/formFixMiddleware');
const { sendNewsletter } = require('../../services/emailService');

// Create Article
router.post('/',
  isAuthenticated,
  upload.single('featured_img'),
  fixFeaturedImageUrl,
  async (req, res, next) => {
    try {
      // Create article (controller should set res.locals.articleId)
      await articleController.createArticle(req, res);
      const articleId = res.locals.articleId; // <-- FIX: Retrieve created article ID

      if (!articleId) {
        console.error('Article ID not found. Newsletter not sent.');
        return; // Do not send if article creation failed
      }

      // Get subscribers
      const pool = await getPool();
      const [subscribers] = await pool.query('SELECT email FROM newsletter_subscribers');

      if (subscribers.length > 0) {
        const emails = subscribers.map(s => s.email);

        // Newsletter HTML
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; background-color: #f4f6fa; padding: 20px; color: #333;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
              <div style="background: #003366; color: #ffffff; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">New Article Published!</h1>
              </div>
              <div style="padding: 20px;">
                <h2 style="color: #003366;">${req.body.title}</h2>
                <p style="color: #555555; font-size: 16px;">
                  ${req.body.content.substring(0, 200)}...
                </p>
                <a href="${req.protocol}://${req.get('host')}/articles/${articleId}" 
                   style="display: inline-block; margin-top: 15px; padding: 12px 20px; background: #cc0000; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Read More
                </a>
              </div>
              <div style="background: #003366; color: #ffffff; text-align: center; padding: 10px;">
                <p style="margin: 0; font-size: 14px;">Thank you for subscribing to our newsletter!</p>
              </div>
            </div>
          </div>`;

        // Send the newsletter
        await sendNewsletter(emails, `New Article: ${req.body.title}`, htmlContent);
      }
    } catch (err) {
      console.error('Error sending newsletter:', err);
      // Don't block article creation if email fails
    }
  }
);

//router.get('/search', articleController.searchArticles);

// Get Article
router.get('/:id',
  articleController.getArticle
);

// Update Article (support both PUT and POST methods)
router.put('/:id',
  upload.single('featured_img'),
  articleController.updateArticle
);

// Support POST for form submissions
router.post('/:id',
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

// Render Edit Article Form
router.get('/edit/:id', isAuthenticated, async (req, res) => {
  try {
    console.log('Edit article route hit for ID:', req.params.id);
    const pool = await getPool();
    
    // Log pool connection status
    console.log('Database pool status:', pool ? 'Connected' : 'Not connected');
    
    const [article] = await pool.query(
      'SELECT * FROM articles WHERE article_id = ?', 
      [req.params.id]
    );
    
    console.log('Article query result:', article);
    
    if (!article || !article.length) {
      console.error('Article not found with ID:', req.params.id);
      req.flash('error', 'Article not found');
      return res.redirect('/landing');
    }
    
    const [categories] = await pool.query('SELECT category_id, name FROM categories');
    console.log('Categories loaded:', categories.length);
    
    // Check for success/error messages in query params
    const success = req.query.success || null;
    const error = req.query.error || null;
    
    console.log('Rendering edit-article template with article ID:', article[0].article_id);
    
    res.render('admin/edit-article', { 
      article: article[0],
      categories,
      success,
      error,
      currentImage: article[0].featured_img,
      currentPath: req.path
    });
  } catch (err) {
    console.error('Error in edit article route:', {
      message: err.message,
      stack: err.stack,
      params: req.params,
      query: req.query
    });
    req.flash('error', `Error loading article: ${err.message}`);
    res.redirect('/landing');
  }
});

// Redirect legacy or hardcoded add-article route to the correct one
router.get('/admin/add-articles', (req, res) => {
  res.redirect('/api/articles/add');
});

module.exports = router;
