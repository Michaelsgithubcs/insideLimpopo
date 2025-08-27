const getPool = require('../config/db');

class Article {
  static async create({ title, content, author_id, category_id, featured_img = null, episode_link = null, episode_date = null, episode_tag = null, episode_duration = null }) {
    const pool = await getPool();
    const [result] = await pool.query(
      `INSERT INTO articles 
       (title, content, author_id, category_id, featured_img, episode_link, episode_date, episode_tag, episode_duration, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [title, content, author_id, category_id, featured_img, episode_link, episode_date, episode_tag, episode_duration]
    );
    return result.insertId;
  }

  static async findById(id) {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT a.*, u.username, u.profile_picture, c.name as category_name
       FROM articles a
       LEFT JOIN users u ON a.author_id = u.id
       LEFT JOIN categories c ON a.category_id = c.category_id
       WHERE a.article_id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByCategory(category_id, limit = 20, excludeId = null) {
    const pool = await getPool();
    let query = `
      SELECT 
        a.article_id, 
        a.title, 
        a.content,
        a.featured_img, 
        a.created_at,
        u.username,
        c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.category_id
      WHERE a.category_id = ?
    `;
    
    const params = [category_id];
    
    if (excludeId) {
      query += ` AND a.article_id != ?`;
      params.push(excludeId);
    }
    
    query += ` ORDER BY a.created_at DESC LIMIT ?`;
    params.push(limit);
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async update(article_id, { title, content, category_id, featured_img }) {
    const pool = await getPool();
    await pool.query(
      `UPDATE articles 
       SET title = ?, content = ?, category_id = ?, featured_img = ?, updated_at = NOW()
       WHERE article_id = ?`,
      [title, content, category_id, featured_img, article_id]
    );
  }

  static async delete(article_id) {
    const pool = await getPool();
    await pool.query('DELETE FROM articles WHERE article_id = ?', [article_id]);
  }
  static async getAll() {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM articles ORDER BY created_at DESC');
    return rows;
  }
    static async search(query) {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT a.article_id, a.title, a.content, a.featured_img, u.username as author, a.created_at, c.name as category_name
       FROM articles a
       LEFT JOIN users u ON a.author_id = u.id
       LEFT JOIN categories c ON a.category_id = c.category_id
       WHERE a.title LIKE ? OR a.content LIKE ? 
       ORDER BY a.created_at DESC`,
      [`%${query}%`, `%${query}%`]
    );
    return rows;
  }
}

module.exports = Article;