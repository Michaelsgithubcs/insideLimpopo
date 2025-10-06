// models/Article.js
const getPool = require('../config/db');

class Article {
  // CREATE
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

  // READ one
  static async findById(article_id) {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT a.*, u.username, u.profile_picture, c.name AS category_name
         FROM articles a
         LEFT JOIN users u ON a.author_id = u.id
         LEFT JOIN categories c ON a.category_id = c.category_id
       WHERE a.article_id = ?`,
      [article_id]
    );
    return rows[0];
  }

  // READ many
  static async getAll(limit = 50) {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT a.*, u.username, c.name AS category_name
         FROM articles a
         LEFT JOIN users u ON a.author_id = u.id
         LEFT JOIN categories c ON a.category_id = c.category_id
       ORDER BY a.created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  // READ by category
  static async findByCategory(category_id, limit = 20) {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT a.*, u.username, c.name AS category_name
         FROM articles a
         LEFT JOIN users u ON a.author_id = u.id
         LEFT JOIN categories c ON a.category_id = c.category_id
       WHERE a.category_id = ?
       ORDER BY a.created_at DESC
       LIMIT ?`,
      [category_id, limit]
    );
    return rows;
  }

  // UPDATE
  static async update(article_id, { title, content, category_id, featured_img }) {
    const pool = await getPool();
    await pool.query(
      `UPDATE articles 
          SET title = ?, content = ?, category_id = ?, featured_img = ?, updated_at = NOW()
        WHERE article_id = ?`,
      [title, content, category_id, featured_img, article_id]
    );
  }

  // DELETE
  static async delete(article_id) {
    const pool = await getPool();
    await pool.query(
      `DELETE FROM articles WHERE article_id = ?`,
      [article_id]
    );
  }

  // SEARCH
  static async search(query) {
    const pool = await getPool();
    const like = `%${query}%`;
    const [rows] = await pool.query(
      `SELECT a.article_id, a.title, a.content, a.featured_img, u.username AS author, a.created_at, c.name AS category_name
         FROM articles a
         LEFT JOIN users u ON a.author_id = u.id
         LEFT JOIN categories c ON a.category_id = c.category_id
       WHERE a.title LIKE ? OR a.content LIKE ?
       ORDER BY a.created_at DESC`,
      [like, like]
    );
    return rows;
  }
  // ✅ READ many (detailed for Admin)
  static async getAllWithAuthors(limit = 100) {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT a.article_id, a.title, a.content, a.featured_img, a.created_at, a.updated_at,
              u.id AS user_id, u.username, u.email, u.role, u.first_name, u.last_name, u.profile_picture,
              c.category_id, c.name AS category_name
         FROM articles a
         LEFT JOIN users u ON a.author_id = u.id
         LEFT JOIN categories c ON a.category_id = c.category_id
       ORDER BY a.created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }
}

module.exports = Article;
