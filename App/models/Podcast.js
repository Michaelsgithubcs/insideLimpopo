// models/Podcast.js
const getPool = require('../config/db');

class Podcast {
  static async create({ title, description, author_id, category_id, episode_link, episode_date }) {
    const pool = await getPool();
    const [result] = await pool.query(
      `
      INSERT INTO podcasts
        (title, description, author_id, category_id, episode_link, episode_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        (title || '').trim(),
        (description || '').trim(),
        author_id,
        category_id || null,
        (episode_link || '').trim(),
        episode_date || null
      ]
    );
    return result.insertId;
  }

  static async findById(podcast_id) {
    const pool = await getPool();
    const [rows] = await pool.query(
      `
      SELECT p.*, u.username, c.name AS category_name
      FROM podcasts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.podcast_id = ?
      `,
      [podcast_id]
    );
    return rows[0];
  }

  static async getAll(limit = 50) {
    const pool = await getPool();
    const [rows] = await pool.query(
      `
      SELECT p.*, u.username, c.name AS category_name
      FROM podcasts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.category_id
      ORDER BY p.created_at DESC
      LIMIT ?
      `,
      [limit]
    );
    return rows;
  }

  static async update(podcast_id, { title, description, category_id, episode_link, episode_date }) {
    const pool = await getPool();
    await pool.query(
      `
      UPDATE podcasts
      SET title = ?, description = ?, category_id = ?,
          episode_link = ?, episode_date = ?,
          updated_at = NOW()
      WHERE podcast_id = ?
      `,
      [
        (title || '').trim(),
        (description || '').trim(),
        category_id || null,
        (episode_link || '').trim(),
        episode_date || null,
        podcast_id
      ]
    );
  }

  static async delete(podcast_id) {
    const pool = await getPool();
    await pool.query(`DELETE FROM podcasts WHERE podcast_id = ?`, [podcast_id]);
  }

  static async findByCategory(category_id, limit = 20) {
    const pool = await getPool();
    const [rows] = await pool.query(
      `
      SELECT p.*, u.username, c.name AS category_name
      FROM podcasts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.category_id = ?
      ORDER BY p.created_at DESC
      LIMIT ?
      `,
      [category_id, limit]
    );
    return rows;
  }

  static async search(query) {
    const pool = await getPool();
    const like = `%${query}%`;
    const [rows] = await pool.query(
      `
      SELECT p.podcast_id, p.title, p.description, p.episode_link, p.episode_date,
             u.username AS author, p.created_at, c.name AS category_name
      FROM podcasts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.title LIKE ? OR p.description LIKE ?
      ORDER BY p.created_at DESC
      `,
      [like, like]
    );
    return rows;
  }
}

module.exports = Podcast;
