const getPool = require('../config/db');

// Middleware to fetch visible categories for navigation and footer
async function fetchVisibleCategories(req, res, next) {
  try {
    const pool = await getPool();
    try {
      const [categories] = await pool.query(
        'SELECT category_id, name FROM categories WHERE visible = TRUE ORDER BY name'
      );
      res.locals.visibleCategories = categories;
    } catch (columnError) {
      // If visible column doesn't exist, show all categories
      const [categories] = await pool.query(
        'SELECT category_id, name FROM categories ORDER BY name'
      );
      res.locals.visibleCategories = categories;
    }
    
    // Detect current category based on URL
    const currentPath = req.path;
    let currentCategory = null;
    
    // Check for category routes
    if (currentPath.includes('/articles/category/')) {
      const categorySlug = currentPath.split('/articles/category/')[1];
      currentCategory = categorySlug;
    } else if (currentPath.includes('/articles/added/')) {
      const categoryName = currentPath.split('/articles/added/')[1];
      currentCategory = categoryName;
    } else if (currentPath === '/sports') {
      currentCategory = 'sports';
    } else if (currentPath === '/opinion') {
      currentCategory = 'opinion';
    } else if (currentPath === '/events') {
      currentCategory = 'events';
    } else if (currentPath === '/podcast') {
      currentCategory = 'podcast';
    } else if (currentPath === '/vacancies') {
      currentCategory = 'vacancies';
    } else if (currentPath === '/') {
      currentCategory = 'home';
    }
    
    res.locals.currentCategory = currentCategory;
    next();
  } catch (error) {
    console.error('Error fetching visible categories:', error);
    // Continue without categories if there's an error
    res.locals.visibleCategories = [];
    res.locals.currentCategory = null;
    next();
  }
}

module.exports = { fetchVisibleCategories };