const { pool } = require('../config/db');

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

      res.render('dashboard/index', {
        title: 'Dashboard',
        user: req.session.user,
        stats: {
          stories: stories[0].count,
          articles: articles[0].count
        }
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

      const isMatch = await bcrypt.compare(currentPassword, user[0].password);
      if (!isMatch) {
        req.flash('error', 'Current password is incorrect');
        return res.redirect('/profile');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      await pool.query(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, req.session.user.email]
      );

      req.flash('success', 'Password changed successfully');
      res.redirect('/profile');

    } catch (err) {
      console.error('Password change error:', err);
      req.flash('error', 'Error changing password');
      res.redirect('/profile');
    }
  }
};