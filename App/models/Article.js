// models/Article.js
const getPool = require('../config/db');

class Article {
  // CREATE
  static async create({ title, content, author_id, category_id, featured_img = null, social_links = null, location = null }) {
    const pool = await getPool();
    const [result] = await pool.query(
      `INSERT INTO articles 
         (title, content, author_id, category_id, featured_img, social_links, location, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        title,
        content,
        author_id,
        category_id,
        featured_img,
        social_links ? JSON.stringify(social_links) : null,
        location
      ]
    );
    return result.insertId;
  }

  // READ ONE
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

    const article = rows[0];
    if (article && article.social_links) {
      try {
        article.social_links = JSON.parse(article.social_links);
      } catch {
        article.social_links = null;
      }
    }
    return article;
  }

  // READ MANY (basic)
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

    // Parse JSON safely
    return rows.map(row => {
      if (row.social_links) {
        try {
          row.social_links = JSON.parse(row.social_links);
        } catch {
          row.social_links = null;
        }
      }
      return row;
    });
  }

  // READ BY CATEGORY
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

    return rows.map(row => {
      if (row.social_links) {
        try {
          row.social_links = JSON.parse(row.social_links);
        } catch {
          row.social_links = null;
        }
      }
      return row;
    });
  }

  // UPDATE
  static async update(article_id, { title, content, category_id, featured_img, social_links = null }) {
    const pool = await getPool();
    await pool.query(
      `UPDATE articles 
          SET title = ?, content = ?, category_id = ?, featured_img = ?, social_links = ?, updated_at = NOW()
        WHERE article_id = ?`,
      [
        title,
        content,
        category_id,
        featured_img,
        social_links ? JSON.stringify(social_links) : null,
        article_id
      ]
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
      `SELECT a.article_id, a.title, a.content, a.featured_img, a.social_links,
              u.username AS author, a.created_at, c.name AS category_name
         FROM articles a
         LEFT JOIN users u ON a.author_id = u.id
         LEFT JOIN categories c ON a.category_id = c.category_id
       WHERE a.title LIKE ? OR a.content LIKE ?
       ORDER BY a.created_at DESC`,
      [like, like]
    );

    return rows.map(row => {
      if (row.social_links) {
        try {
          row.social_links = JSON.parse(row.social_links);
        } catch {
          row.social_links = null;
        }
      }
      return row;
    });
  }

  // READ MANY (Detailed for Admin)
  static async getAllWithAuthors(limit = 100) {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT a.article_id, a.title, a.content, a.featured_img, a.social_links,
              a.created_at, a.updated_at,
              u.id AS user_id, u.username, u.email, u.role, u.first_name, u.last_name, u.profile_picture,
              c.category_id, c.name AS category_name
         FROM articles a
         LEFT JOIN users u ON a.author_id = u.id
         LEFT JOIN categories c ON a.category_id = c.category_id
       ORDER BY a.created_at DESC
       LIMIT ?`,
      [limit]
    );

    return rows.map(row => {
      if (row.social_links) {
        try {
          row.social_links = JSON.parse(row.social_links);
        } catch {
          row.social_links = null;
        }
      }
      return row;
    });
  }
}

module.exports = Article;
