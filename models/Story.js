const { pool } = require('../config/db');

class Story {
  static async create({ title, description, content, author_id, category, image_url = null }) {
    const [result] = await pool.query(
      `INSERT INTO stories 
       (title, description, content, author_id, category, image_url, published_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [title, description, content, author_id, category, image_url]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT stories.*, users.username, users.avatar 
       FROM stories
       JOIN users ON stories.author_id = users.id
       WHERE stories.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByCategory(category, limit = 3, excludeId = null) {
    let query = `SELECT id, title, image_url FROM stories WHERE category = ?`;
    const params = [category];
    
    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }
    
    query += ` ORDER BY published_at DESC LIMIT ?`;
    params.push(limit);
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async update(id, { title, description, content, category, image_url }) {
    await pool.query(
      `UPDATE stories 
       SET title = ?, description = ?, content = ?, category = ?, image_url = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, description, content, category, image_url, id]
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM stories WHERE id = ?', [id]);
  }
}

module.exports = Story;