const getPool = require('../config/db');

class Article {
  static async create({ title, content, author_id, category_id, featured_img = null }) {
    const pool = await getPool();
    const [result] = await pool.query(
      `INSERT INTO articles 
       (title, content, author_id, category_id, featured_img, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [title, content, author_id, category_id, featured_img]
    );
    return result.insertId;
  }

  static async findById(id) {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT articles.*, users.username, users.profile_picture, categories.name as category_name
       FROM articles
       JOIN users ON articles.author_id = users.email
       LEFT JOIN categories ON articles.category_id = categories.categoryid
       WHERE articles.article_id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByCategory(category_id, limit = 3, excludeId = null) {
    const pool = await getPool();
    let query = `SELECT article_id, title, featured_img FROM articles WHERE category_id = ?`;
    const params = [category_id];
    
    if (excludeId) {
      query += ` AND article_id != ?`;
      params.push(excludeId);
    }
    
    query += ` ORDER BY created_at DESC LIMIT ?`;
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
    await pool.query('DELETE FROM articles WHERE id = ?', [article_id]);
  }
}

module.exports = Article;