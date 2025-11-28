const express = require('express');
const router = express.Router();
const getPool = require('../../config/db');
const { isAuthenticated } = require('../../middlewares/auth');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const [categories] = await pool.query('SELECT category_id, name, visible FROM categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Update category visibility
router.put('/visibility', isAuthenticated, async (req, res) => {
  try {
    const { categories } = req.body;
    const pool = await getPool();
    
    for (const category of categories) {
      await pool.query(
        'UPDATE categories SET visible = ? WHERE category_id = ?',
        [category.visible, category.category_id]
      );
    }
    
    res.json({ success: true, message: 'Category visibility updated successfully' });
  } catch (error) {
    console.error('Error updating category visibility:', error);
    res.status(500).json({ error: 'Failed to update category visibility' });
  }
});

// Add new category
// Add new category
router.post('/', async (req, res) => {
  try {
    const { name, visible } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const pool = await getPool();

    // Insert category
    const [result] = await pool.query(
      'INSERT INTO categories (name, visible) VALUES (?, ?)',
      [name.trim(), visible ? 1 : 0]
    );
    console.log('Inserted category ID:', result.insertId);
    res.status(201).json({ 
      success: true, 
      message: 'Category added successfully', 
      category: { category_id: result.insertId, name: name.trim(), visible: !!visible }
    });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ error: 'Failed to add category' });
  }
});



module.exports = router;