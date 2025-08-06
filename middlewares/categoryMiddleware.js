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
    next();
  } catch (error) {
    console.error('Error fetching visible categories:', error);
    // Continue without categories if there's an error
    res.locals.visibleCategories = [];
    next();
  }
}

module.exports = { fetchVisibleCategories };