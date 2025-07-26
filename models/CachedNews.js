const getPool = require('../config/db');

class CachedNews {
  static async create({ title, description, url, urlToImage, publishedAt, source, category = 'general' }) {
    const pool = await getPool();
    
    // Convert ISO datetime to MySQL datetime format
    let mysqlDateTime = null;
    if (publishedAt) {
      const date = new Date(publishedAt);
      if (!isNaN(date.getTime())) {
        mysqlDateTime = date.toISOString().slice(0, 19).replace('T', ' ');
      }
    }
    
    const [result] = await pool.query(
      `INSERT INTO cached_news 
       (title, description, url, url_to_image, published_at, source, category, cached_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [title, description, url, urlToImage, mysqlDateTime, JSON.stringify(source), category]
    );
    return result.insertId;
  }

  static async getByCategory(category = 'general', limit = 20) {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT * FROM cached_news 
       WHERE category = ? 
       ORDER BY published_at DESC 
       LIMIT ?`,
      [category, limit]
    );
    
    // Parse the source JSON back to object
    return rows.map(row => ({
      ...row,
      source: JSON.parse(row.source)
    }));
  }

  static async getAll(limit = 20) {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT * FROM cached_news 
       ORDER BY published_at DESC 
       LIMIT ?`,
      [limit]
    );
    
    // Parse the source JSON back to object
    return rows.map(row => ({
      ...row,
      source: JSON.parse(row.source)
    }));
  }

  static async search(query, limit = 20) {
    const pool = await getPool();
    const searchTerm = `%${query}%`;
    const [rows] = await pool.query(
      `SELECT * FROM cached_news 
       WHERE title LIKE ? OR description LIKE ? 
       ORDER BY published_at DESC 
       LIMIT ?`,
      [searchTerm, searchTerm, limit]
    );
    
    // Parse the source JSON back to object
    return rows.map(row => ({
      ...row,
      source: JSON.parse(row.source)
    }));
  }

  static async clearOldCache(category = null) {
    const pool = await getPool();
    if (category) {
      await pool.query('DELETE FROM cached_news WHERE category = ?', [category]);
    } else {
      await pool.query('DELETE FROM cached_news');
    }
  }

  static async getLastCacheTime(category = 'general') {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT MAX(cached_at) as last_cached FROM cached_news WHERE category = ?`,
      [category]
    );
    return rows[0]?.last_cached;
  }

  static async shouldRefreshCache(category = 'general', hoursThreshold = 2) {
    const lastCached = await this.getLastCacheTime(category);
    if (!lastCached) return true;
    
    const now = new Date();
    const lastCachedTime = new Date(lastCached);
    const hoursDiff = (now - lastCachedTime) / (1000 * 60 * 60);
    
    return hoursDiff >= hoursThreshold;
  }
}

module.exports = CachedNews;
