const express = require('express');
const router = express.Router();
const landingController = require('../../controllers/landingController');
const { isAuthenticated } = require('../../middlewares/auth');
const getPool = require('../../config/db');

// Consolidated landing(dashboard) route
router.get(['/landing', '/dashboard'], isAuthenticated, async (req, res) => {
  try {
    const pool = await getPool();
    // Get user data with a single query using JOINs for better performance
    const [results] = await pool.query(`
      SELECT 
        u.*,
        (SELECT COUNT(*) FROM stories WHERE email = u.email) AS storyCount,
        (SELECT COUNT(*) FROM articles WHERE email = u.email) AS articleCount
      FROM users u
      WHERE u.email = ?
    `, [req.session.email]);

    if (results.length === 0) {
      req.flash('error', 'User not found');
      return res.redirect('/login');
    }

    const userData = results[0];
    // Fetch categories for the add-article form
    const [categories] = await pool.query('SELECT category_id, name FROM categories');
    res.render('admin/landing', {
      title: 'Dashboard',
      user: {
        username: userData.username,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        avatar: userData.avatar || '/images/default-avatar.jpg',
        storyCount: userData.storyCount || 0,
        articleCount: userData.articleCount || 0,
        role: userData.role,
        joinDate: userData.created_at
      },
      currentUrl: req.originalUrl,
      categories
    });

  } catch (err) {
    console.error('Dashboard error:', err);
    req.flash('error', 'Error loading dashboard');
    res.redirect('/login');
  }
});

// Profile routes
router.get('/profile', isAuthenticated, landingController.getProfile);
router.post('/profile', isAuthenticated, landingController.updateProfile);
router.post('/change-password', isAuthenticated, landingController.changePassword);

module.exports = router;