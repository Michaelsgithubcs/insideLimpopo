const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const getPool = require('../../config/db');
const { isAuthenticated, isAdmin } = require('../../middlewares/auth');

// Get all users - Admin only
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const pool = await getPool();
    const [users] = await pool.query(
      `SELECT id, username, email, role, first_name, last_name, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create new user - Admin only
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { first_name, last_name, username, email, role, password } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !username || !email || !role || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const pool = await getPool();

    // Check if username or email already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const [result] = await pool.query(
      `INSERT INTO users (first_name, last_name, username, email, password, role, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [first_name, last_name, username, email, hashedPassword, role]
    );

    res.status(201).json({ 
      message: 'User created successfully',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user - Admin only
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;

    // Validate required fields
    if (!username || !email || !role) {
      return res.status(400).json({ error: 'Username, email, and role are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const pool = await getPool();

    // Check if username or email already exists for other users
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
      [username, email, id]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Update user
    const [result] = await pool.query(
      'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?',
      [username, email, role, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user - Admin only
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    // Check if user exists
    const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deletion of current user
    if (parseInt(id) === req.session.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Delete user (this will cascade delete related articles/podcasts if foreign keys are set up)
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
