const axios = require('axios');
const CachedNews = require('../models/CachedNews');

class LocalNewsCacheService {
  constructor() {
    this.apiKey = 'pub_86fdef20b0fe446bb3f74cf412ebe2ba';
    this.baseUrl = 'https://newsdata.io/api/1';
    this.cacheRefreshHours = 2;
    this.country = 'za'; // South Africa
    this.cacheCategoryPrefix = 'sa_'; // Prefix for local news to distinguish from world news
  }

  async fetchAndCacheNews(category = 'general', pageSize = 20) {
    try {
      console.log(`Fetching fresh Local news for category: ${category}`);
      
      // Map newsapi.org categories to newsdata.io categories
      let newsdataCategory;
      switch(category) {
        case 'general': newsdataCategory = 'top'; break;
        case 'business': newsdataCategory = 'business'; break;
        case 'entertainment': newsdataCategory = 'entertainment'; break;
        case 'health': newsdataCategory = 'health'; break;
        case 'science': newsdataCategory = 'science'; break;
        case 'sports': newsdataCategory = 'sports'; break;
        case 'technology': newsdataCategory = 'technology'; break;
        default: newsdataCategory = 'top';
      }
      
      // NOTE: newsdata.io expects the parameter to be named 'country', not 'countries'
      const apiUrl = `${this.baseUrl}/news?apikey=${this.apiKey}&country=${this.country}&category=${newsdataCategory}&language=en`;
      
      const response = await axios.get(apiUrl);
      const articles = response.data.results || [];

      if (!articles || articles.length === 0) {
        console.log(`No Local articles found for category: ${category}`);
        return [];
      }

      // Clear old cache for this category with local prefix
      const localCategory = `${this.cacheCategoryPrefix}${category}`;
      await CachedNews.clearOldCache(localCategory);

      // Cache new articles
      const cachedArticles = [];
      for (const article of articles) {
        if (article.title && article.link) {
          try {
            await CachedNews.create({
              title: article.title,
              description: article.description || article.content,
              url: article.link,
              urlToImage: article.image_url,
              publishedAt: article.pubDate,
              source: { name: article.source_id || article.source_name || 'Local News' },
              category: localCategory
            });
            cachedArticles.push(article);
          } catch (error) {
            console.error('Error caching Local article:', error.message);
          }
        }
      }

      console.log(`Cached ${cachedArticles.length} Local articles for category: ${category}`);
      return cachedArticles;

    } catch (error) {
      console.error('Error fetching Local news from API:', error.message);
      throw error;
    }
  }

  async getCachedNews(category = 'general', limit = 20) {
    try {
      const localCategory = `${this.cacheCategoryPrefix}${category}`;
      
      // Always try to return existing cached data first
      const existingCache = await CachedNews.getByCategory(localCategory, limit);
      
      // Check if cache needs refresh
      const shouldRefresh = await CachedNews.shouldRefreshCache(localCategory, this.cacheRefreshHours);
      
      if (shouldRefresh) {
        console.log(`Cache expired for Local category: ${category}, fetching fresh data`);
        try {
          await this.fetchAndCacheNews(category, limit);
          // Return fresh data if successful
          return await CachedNews.getByCategory(localCategory, limit);
        } catch (apiError) {
          console.log(`API error (${apiError.message}), returning existing cache for ${localCategory}`);
          // Return existing cache if API fails
          return existingCache;
        }
      }

      // If cache doesn't need refresh, return existing data
      if (existingCache.length > 0) {
        return existingCache;
      }
      
      // Only try API if no cache exists at all
      console.log(`No cached news found for Local category: ${category}, fetching fresh data`);
      try {
        await this.fetchAndCacheNews(category, limit);
        return await CachedNews.getByCategory(localCategory, limit);
      } catch (apiError) {
        console.log(`API error (${apiError.message}), no cache available for ${localCategory}`);
        return [];
      }
      
    } catch (error) {
      console.error('Error getting cached SA news:', error.message);
      return [];
    }
  }

  async getAllCachedNews(limit = 20) {
    try {
      const saCategory = `${this.cacheCategoryPrefix}general`;
      
      // Check if general cache needs refresh
      const shouldRefresh = await CachedNews.shouldRefreshCache(saCategory, this.cacheRefreshHours);
      
      if (shouldRefresh) {
        console.log('SA General cache expired, fetching fresh data');
        await this.fetchAndCacheNews('general', limit);
      }

      // Get all SA prefixed categories
      const pool = await require('../config/db')();
      const [rows] = await pool.query(
        `SELECT * FROM cached_news 
         WHERE category LIKE ? 
         ORDER BY published_at DESC 
         LIMIT ?`,
        [`${this.cacheCategoryPrefix}%`, limit]
      );
      
      return rows.map(row => ({
        ...row,
        source: JSON.parse(row.source)
      }));
    } catch (error) {
      console.error('Error getting all cached SA news:', error.message);
      throw error;
    }
  }

  async refreshAllCategories() {
    const categories = ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology'];
    
    for (const category of categories) {
      try {
        await this.fetchAndCacheNews(category, 20);
        // Add delay between categories to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 5 * 1000)); // 5 seconds
      } catch (error) {
        console.error(`Error refreshing SA category ${category}:`, error.message);
      }
    }
  }

  async getCacheStatus() {
    const categories = ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology'];
    const status = {};

    for (const category of categories) {
      const saCategory = `${this.cacheCategoryPrefix}${category}`;
      const lastCached = await CachedNews.getLastCacheTime(saCategory);
      const shouldRefresh = await CachedNews.shouldRefreshCache(saCategory, this.cacheRefreshHours);
      const pool = await require('../config/db')();
      const [countResult] = await pool.query(
        'SELECT COUNT(*) as count FROM cached_news WHERE category = ?', 
        [saCategory]
      );
      const count = countResult[0].count;
      
      status[category] = {
        lastCached,
        shouldRefresh,
        articleCount: count
      };
    }

    return status;
  }
}

module.exports = new LocalNewsCacheService();
