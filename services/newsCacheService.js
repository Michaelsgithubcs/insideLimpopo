const axios = require('axios');
const CachedNews = require('../models/CachedNews');

class NewsCacheService {
  constructor() {
    this.apiKey = '94710bfc54a44f1a9796e81a0bd2e446';
    this.baseUrl = 'https://newsapi.org/v2';
    this.cacheRefreshHours = 2;
  }

  async fetchAndCacheNews(category = 'general', country = 'us', pageSize = 20) {
    try {
      console.log(`Fetching fresh news for category: ${category}`);
      
      let apiUrl;
      if (category === 'general') {
        apiUrl = `${this.baseUrl}/top-headlines?country=${country}&pageSize=${pageSize}&apiKey=${this.apiKey}`;
      } else {
        apiUrl = `${this.baseUrl}/top-headlines?country=${country}&category=${category}&pageSize=${pageSize}&apiKey=${this.apiKey}`;
      }

      const response = await axios.get(apiUrl);
      const articles = response.data.articles;

      if (!articles || articles.length === 0) {
        console.log(`No articles found for category: ${category}`);
        return [];
      }

      // Clear old cache for this category
      await CachedNews.clearOldCache(category);

      // Cache new articles
      const cachedArticles = [];
      for (const article of articles) {
        if (article.title && article.url) {
          try {
            await CachedNews.create({
              title: article.title,
              description: article.description,
              url: article.url,
              urlToImage: article.urlToImage,
              publishedAt: article.publishedAt,
              source: article.source,
              category: category
            });
            cachedArticles.push(article);
          } catch (error) {
            console.error('Error caching article:', error.message);
          }
        }
      }

      console.log(`Cached ${cachedArticles.length} articles for category: ${category}`);
      return cachedArticles;

    } catch (error) {
      console.error('Error fetching news from API:', error.message);
      throw error;
    }
  }

  async getCachedNews(category = 'general', limit = 20) {
    try {
      // Check if cache needs refresh
      const shouldRefresh = await CachedNews.shouldRefreshCache(category, this.cacheRefreshHours);
      
      if (shouldRefresh) {
        console.log(`Cache expired for category: ${category}, fetching fresh data`);
        await this.fetchAndCacheNews(category, 'us', limit);
      }

      // Return cached news
      const cachedNews = await CachedNews.getByCategory(category, limit);
      
      if (cachedNews.length === 0 && !shouldRefresh) {
        // If no cached news and we didn't just refresh, try fetching
        console.log(`No cached news found for category: ${category}, fetching fresh data`);
        await this.fetchAndCacheNews(category, 'us', limit);
        return await CachedNews.getByCategory(category, limit);
      }

      return cachedNews;
    } catch (error) {
      console.error('Error getting cached news:', error.message);
      throw error;
    }
  }

  async searchCachedNews(query, limit = 20) {
    try {
      return await CachedNews.search(query, limit);
    } catch (error) {
      console.error('Error searching cached news:', error.message);
      throw error;
    }
  }

  async getAllCachedNews(limit = 20) {
    try {
      // Check if general cache needs refresh
      const shouldRefresh = await CachedNews.shouldRefreshCache('general', this.cacheRefreshHours);
      
      if (shouldRefresh) {
        console.log('General cache expired, fetching fresh data');
        await this.fetchAndCacheNews('general', 'us', limit);
      }

      return await CachedNews.getAll(limit);
    } catch (error) {
      console.error('Error getting all cached news:', error.message);
      throw error;
    }
  }

  async refreshAllCategories() {
    const categories = ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology'];
    
    for (const category of categories) {
      try {
        await this.fetchAndCacheNews(category, 'us', 20);
        // Add small delay to avoid hitting API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error refreshing category ${category}:`, error.message);
      }
    }
  }

  async getCacheStatus() {
    const categories = ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology'];
    const status = {};

    for (const category of categories) {
      const lastCached = await CachedNews.getLastCacheTime(category);
      const shouldRefresh = await CachedNews.shouldRefreshCache(category, this.cacheRefreshHours);
      const count = (await CachedNews.getByCategory(category, 1000)).length;
      
      status[category] = {
        lastCached,
        shouldRefresh,
        articleCount: count
      };
    }

    return status;
  }
}

module.exports = new NewsCacheService();
