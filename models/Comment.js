// models/Comment.js
const getPool = require('../config/db');

class Comment {
  // CREATE - Add a new comment to an article
  static async create({ article_id, name, comment }) {
    const pool = await getPool();
    const [result] = await pool.query(
      `INSERT INTO comments (article_id, name, comment, created_at) 
       VALUES (?, ?, ?, NOW())`,
      [article_id, name.trim(), comment.trim()]
    );
    return result.insertId;
  }

  // READ - Get all comments for a specific article
  static async findByArticleId(article_id, limit = 50) {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT comment_id, article_id, name, comment, created_at
       FROM comments 
       WHERE article_id = ?
       ORDER BY created_at ASC
       LIMIT ?`,
      [article_id, limit]
    );
    return rows;
  }

  // READ - Get a single comment by ID
  static async findById(comment_id) {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT comment_id, article_id, name, comment, created_at
       FROM comments 
       WHERE comment_id = ?`,
      [comment_id]
    );
    return rows[0];
  }

  // DELETE - Remove a comment (for moderation purposes)
  static async delete(comment_id) {
    const pool = await getPool();
    await pool.query(`DELETE FROM comments WHERE comment_id = ?`, [comment_id]);
  }

  // GET RECENT - Get recent comments across all articles
  static async getRecent(limit = 10) {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT c.comment_id, c.article_id, c.name, c.comment, c.created_at, a.title as article_title
       FROM comments c
       LEFT JOIN articles a ON c.article_id = a.article_id
       ORDER BY c.created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  // COUNT - Get comment count for an article
  static async getCountByArticleId(article_id) {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count FROM comments WHERE article_id = ?`,
      [article_id]
    );
    return rows[0].count;
  }
}

module.exports = Comment;