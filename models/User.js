const pool = require('../config/db');

class User {
  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async create(userData) {
    const { username, email, password } = userData;
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );
    return email;
  }

  static async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT username, email, password, role FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
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