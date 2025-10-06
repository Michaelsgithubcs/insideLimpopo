const pool = require('../config/db');

class User {
  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT username, email, password, role FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async findAll(limit = 50) {
    const [rows] = await pool.query(
      `SELECT id, username, email, role, first_name, last_name, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  static async create(userData) {
    const { username, email, password, role = 'user', first_name, last_name } = userData;
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, password, role, first_name, last_name]
    );
    return result.insertId;
  }

  static async update(id, updateData) {
    const { username, email, role, first_name, last_name } = updateData;
    await pool.query(
      'UPDATE users SET username = ?, email = ?, role = ?, first_name = ?, last_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [username, email, role, first_name, last_name, id]
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
  }

  static async updateProfile(email, updateData) {
    const { first_name, last_name, profile_picture } = updateData;
    await pool.query(
      'UPDATE users SET first_name = ?, last_name = ?, profile_picture = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
      [first_name, last_name, profile_picture, email]
    );
  }
}

module.exports = User;
