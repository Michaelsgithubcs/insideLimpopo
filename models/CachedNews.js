const getPool = require('../config/db');

class CachedNews {
  static async create({ title, description, url, urlToImage, publishedAt, source, category = 'general', sport = null, matchStatus = null, isExternal = false }) {
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
   
      (title, description, url, url_to_image, published_at, source, category, sport, match_status, is_external, cached_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [title, description, url, urlToImage, mysqlDateTime, JSON.stringify(source), category, sport, matchStatus, isExternal ? 1 : 0]
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
    
    // Parse the source JSON back to object and convert is_external to boolean
    return rows.map(row => ({
      ...row,
      source: JSON.parse(row.source || '{}'),
      isExternal: Boolean(row.is_external),
      match_status: row.match_status
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

  static async search(query, limit = 20, page = 1) {
    const pool = await getPool();
    const offset = (page - 1) * limit;
    
    // Clean and prepare search terms
    const cleanQuery = query.replace(/[^\w\s]/gi, '');
    const searchTerms = cleanQuery.split(/\s+/).filter(term => term.length > 2);
    
    if (searchTerms.length === 0) {
      return { articles: [], totalResults: 0, page, totalPages: 0 };
    }
    
    // Build the WHERE clause with full-text search
    const whereClause = searchTerms
      .map(term => `(MATCH(title, description) AGAINST(? IN BOOLEAN MODE))`)
      .join(' AND ');
      
    const searchValues = searchTerms.map(term => `+${term}*`);
    
    try {
      // Get total count for pagination
      const [countRows] = await pool.query(
        `SELECT COUNT(*) as total FROM cached_news WHERE ${whereClause}`,
        [...searchValues]
      );
      
      const totalResults = countRows[0].total;
      const totalPages = Math.ceil(totalResults / limit);
      
      // Get paginated results with relevance scoring
      const [rows] = await pool.query(
        `SELECT *, 
                MATCH(title, description) AGAINST(? IN BOOLEAN MODE) as relevance,
                (CASE 
                  WHEN title LIKE ? THEN 2 
                  WHEN description LIKE ? THEN 1 
                  ELSE 0 
                END) as title_boost
         FROM cached_news 
         WHERE ${whereClause}
         ORDER BY (relevance * 2) + title_boost DESC, published_at DESC
         LIMIT ? OFFSET ?`,
        [
          searchValues[0], // For the relevance calculation
          `%${searchTerms[0]}%`, // For title boost
          `%${searchTerms[0]}%`, // For description boost
          limit,
          offset
        ]
      );
      
      // Parse the source JSON back to object
      const articles = rows.map(row => ({
        ...row,
        source: row.source ? JSON.parse(row.source) : { name: 'Unknown' },
        // Remove the temporary fields we added for sorting
        relevance: undefined,
        title_boost: undefined
      }));
      
      return {
        articles,
        totalResults,
        page,
        totalPages,
        hasMore: page < totalPages
      };
      
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to simple LIKE search if full-text search fails
      const searchTerm = `%${query}%`;
      const [rows] = await pool.query(
        `SELECT * FROM cached_news 
         WHERE title LIKE ? OR description LIKE ? 
         ORDER BY published_at DESC 
         LIMIT ? OFFSET ?`,
        [searchTerm, searchTerm, limit, offset]
      );
      
      const articles = rows.map(row => ({
        ...row,
        source: row.source ? JSON.parse(row.source) : { name: 'Unknown' }
      }));
      
      return {
        articles,
        totalResults: articles.length,
        page,
        totalPages: 1,
        hasMore: false
      };
    }
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
