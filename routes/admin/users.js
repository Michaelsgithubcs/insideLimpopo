const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const getPool = require('../../config/db');
const { isAuthenticated, isAdmin } = require('../../middlewares/auth');

// =========================
// GET all users (Admin only)
// =========================
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const pool = await getPool();

    const [users] = await pool.query(`
      SELECT 
        id, username, email, role, first_name, last_name, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json(users);
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


// =========================
// CREATE USER
// =========================
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { first_name, last_name, username, email, role, password } = req.body;

    if (!first_name || !last_name || !username || !email || !role || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const pool = await getPool();
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    const hashed = await argon2.hash(password);

    const [result] = await pool.query(
      `INSERT INTO users (first_name, last_name, username, email, password, role, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [first_name, last_name, username, email, hashed, role]
    );

    res.status(201).json({
      message: "User created successfully",
      userId: result.insertId
    });

  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});


// =========================
// UPDATE USER
// =========================
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, role } = req.body;

    if (!username || !email || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const pool = await getPool();

    // Check duplicates
    const [check] = await pool.query(
      "SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?",
      [username, email, userId]
    );

    if (check.length > 0) {
      return res.status(400).json({ error: "Username or email already used" });
    }

    const [result] = await pool.query(
      "UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?",
      [username, email, role, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User does not exist" });
    }

    res.json({ message: "User updated successfully" });

  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});


// =========================
// DELETE USER
// =========================
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const userToDelete = parseInt(req.params.id);

    // Prevent deleting yourself
    if (userToDelete === req.session.user.id) {
      return res.status(400).json({ error: "You cannot delete your own account" });
    }

    const pool = await getPool();

    const [exists] = await pool.query("SELECT id FROM users WHERE id = ?", [userToDelete]);

    if (exists.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    await pool.query("DELETE FROM users WHERE id = ?", [userToDelete]);

    res.json({ message: "User deleted successfully" });

  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
