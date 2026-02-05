const pool = require('../config/db');

module.exports = {
  /**
   * Middleware to check if user is authenticated
   * And also to checks for email in session
   */
  isAuthenticated: (req, res, next) => {
    console.log('AUTH MIDDLEWARE SESSION:', req.session);
    if (req.session.user && req.session.user.email) {
      return next();
    }
    req.flash('error', 'Please login to access this page');
    res.redirect('/login');
  },

  /**
   * Middleware to check if user is not authenticated
   */
  isNotAuthenticated: (req, res, next) => {
    if (!req.session.email) { 
      return next();
    }
    res.redirect('/landing');  
  },

  /**
   * Middleware to check admin role
   */
  isAdmin: (req, res, next) => {
    if (req.session.role === 'admin') {
      return next();
    }
    req.flash('error', 'Unauthorized - Admin access required');
    res.redirect('/landing');
  },

  /**
   * It check both authentication and role
   * @param {string} role - Required role to access
   */
  hasRole: (role) => {
    return (req, res, next) => {
      if (!req.session.email) {
        req.flash('error', 'Please login to access this page');
        return res.redirect('/login');
      }
      
      if (req.session.role === role) {
        return next();
      }
      
      req.flash('error', `Unauthorized - ${role} access required`);
      res.redirect('/landing');
    }
  }
};