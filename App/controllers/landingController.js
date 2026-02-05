const { pool } = require('../config/db');
const argon2 = require('argon2');
const bcrypt = require('bcrypt');
const { format } = require('date-fns');

module.exports = {
  // Render the dashboard(landing) page
  getDashboard: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.redirect('/login');
      }

      // Geting the user stats
      const [stories] = await pool.query(
        'SELECT COUNT(*) as count FROM stories WHERE email = ?',
        [req.session.user.email]
      );

      const [articles] = await pool.query(
        'SELECT COUNT(*) as count FROM articles WHERE email = ?',
        [req.session.user.email]
      );

      // Get recent articles for management
      const [recentArticles] = await pool.query(
        `SELECT a.*, c.name as category_name 
         FROM articles a 
         LEFT JOIN categories c ON a.category_id = c.id 
         ORDER BY a.created_at DESC 
         LIMIT 20`
      );

      // Format dates for display
      const formattedArticles = recentArticles.map(article => ({
        ...article,
        formatted_date: format(new Date(article.created_at), 'MMM d, yyyy HH:mm'),
        excerpt: article.content.substring(0, 150) + '...'
      }));

      res.render('dashboard/index', {
        title: 'Dashboard',
        user: req.session.user,
        stats: {
          stories: stories[0].count,
          articles: articles[0].count
        },
        recentArticles: formattedArticles
      });

    } catch (err) {
      console.error('Dashboard error:', err);
      res.redirect('/login');
    }
  },

  // Render the profile page
  getProfile: async (req, res) => {
    try {
      const [user] = await pool.query(
        'SELECT * FROM users WHERE email = ?',
        [req.session.user.email]
      );

      res.render('dashboard/profile', {
        title: 'My Profile',
        user: user[0]
      });

    } catch (err) {
      console.error('Profile error:', err);
      req.flash('error', 'Error loading profile');
      res.redirect('/dashboard');
    }
  },

  // Updating profile
  updateProfile: async (req, res) => {
    try {
      const { username, email } = req.body;
      
      await pool.query(
        'UPDATE users SET username = ?, email = ? WHERE email = ?',
        [username, email, req.session.user.email]
      );

      // Update session
      req.session.user.email = email;
      
      req.flash('success', 'Profile updated successfully');
      res.redirect('/profile');

    } catch (err) {
      console.error('Update profile error:', err);
      req.flash('error', 'Error updating profile');
      res.redirect('/profile');
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Verify current password
      const [user] = await pool.query(
        'SELECT password FROM users WHERE email = ?',
        [req.session.user.email]
      );

      const storedHash = user[0].password;
      let isMatch;

      // Check if the hash is argon2 or bcrypt
      if (storedHash.startsWith('$argon2')) {
        isMatch = await argon2.verify(storedHash, currentPassword);
      } else {
        isMatch = await bcrypt.compare(currentPassword, storedHash);
        if (isMatch) {
          // Rehash and update the password to argon2
          const newHash = await argon2.hash(newPassword);
          await pool.query('UPDATE users SET password = ? WHERE id = ?', [newHash, req.session.user.id]);
        }
      }

      if (!isMatch) {
        req.flash('error', 'Current password is incorrect');
        return res.redirect('/profile');
      }

      req.flash('success', 'Password changed successfully');
      res.redirect('/profile');

    } catch (err) {
      console.error('Password change error:', err);
      req.flash('error', 'Error changing password');
      res.redirect('/profile');
    }
  }
};