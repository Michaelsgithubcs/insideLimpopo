const pool = require('../config/database'); // Make sure you have this file exporting your pool

class BreakingNews {
  static async create({ title, news_url, image }) {
    const [result] = await pool.query(
      `INSERT INTO breakingnews (title, news_url, image, created_at) 
       VALUES (?, ?, ?, NOW())`,
      [title, news_url, image]
    );
    return result.insertId;
  }

  static async delete(id) {
    await pool.query('DELETE FROM breakingnews WHERE id = ?', [id]);
  }

  static async update(id, { title, news_url, image }) {
    await pool.query(
      `UPDATE breakingnews 
       SET title = ?, news_url = ?, image = ? 
       WHERE id = ?`,
      [title, news_url, image, id]
    );
  }

  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM breakingnews ORDER BY created_at DESC');
    return rows;
  }
}

module.exports = BreakingNews;