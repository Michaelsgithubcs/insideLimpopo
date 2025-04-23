const express = require('express');
const router = express.Router();
const landingController = require('../controllers/landingController');
const { isAuthenticated } = require('../middlewares/auth');
const pool = require('../config/db');

// Consolidated landing(dashboard) route
router.get(['/landing', '/dashboard'], isAuthenticated, async (req, res) => {
  try {
    
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
      return res.redirect('/logout');
    }

    const userData = results[0];
    
    res.render('landing', {
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
      currentUrl: req.originalUrl
    });

  } catch (err) {
    console.error('Dashboard error:', err);
    req.flash('error', 'Error loading dashboard');
    res.redirect('/logout');
  }
});

// Profile routes (delegated to controller)
router.get('/profile', isAuthenticated, landingController.getProfile);
router.post('/profile', isAuthenticated, landingController.updateProfile);
router.post('/change-password', isAuthenticated, landingController.changePassword);

module.exports = router;