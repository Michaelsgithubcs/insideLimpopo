const axios = require('axios');
const CachedNews = require('../models/CachedNews');
const realSportsApiService = require('./realSportsApiService');

class NewsCacheService {
  constructor() {
    this.apiKey = '94710bfc54a44f1a9796e81a0bd2e446';
    this.baseUrl = 'https://newsapi.org/v2';
    this.cacheRefreshHours = 2;
  }

  async fetchAndCacheNews(category = 'general', country = 'us', pageSize = 20) {
    try {
      console.log(`Fetching fresh news for category: ${category}`);
      
      let articles;
      
      if (category === 'sports') {
        // Use real sports API service for sports category
        articles = await realSportsApiService.getAllSportsNews();
        console.log(`Fetched ${articles.length} real sports articles from NewsAPI`);
      } else {
        // Use regular NewsAPI for other categories
        let apiUrl;
        if (category === 'general') {
          apiUrl = `${this.baseUrl}/top-headlines?country=${country}&pageSize=${pageSize}&apiKey=${this.apiKey}`;
        } else {
          apiUrl = `${this.baseUrl}/top-headlines?country=${country}&category=${category}&pageSize=${pageSize}&apiKey=${this.apiKey}`;
        }

        const response = await axios.get(apiUrl);
        articles = response.data.articles;
      }

      if (!articles || articles.length === 0) {
        console.log(`No articles found for category: ${category}`);
        return [];
      }

      // Clear old cache for this category
      await CachedNews.clearOldCache(category);

      // Cache new articles
      const cachedArticles = [];
      for (const article of articles) {
        if (article.title && (article.url || category === 'sports')) {
          try {
            let articleData;
            
            if (category === 'sports') {
              // Handle sports articles (now marked as local)
              articleData = {
                title: article.title,
                description: article.description || article.content,
                url: article.url || '#',
                urlToImage: article.url_to_image,
                publishedAt: article.published_at || article.created_at,
                source: article.source,
                category: category,
                sport: article.sport,
                matchStatus: article.match_status,
                isExternal: false // All sports articles are now local
              };
            } else {
              // Handle regular NewsAPI articles
              articleData = {
                title: article.title,
                description: article.description,
                url: article.url,
                urlToImage: article.urlToImage,
                publishedAt: article.publishedAt,
                source: article.source,
                category: category
              };
            }
            
            await CachedNews.create(articleData);
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
      // Always try to return existing cached data first
      const existingCache = await CachedNews.getByCategory(category, limit);
      
      // Check if cache needs refresh
      const shouldRefresh = await CachedNews.shouldRefreshCache(category, this.cacheRefreshHours);
      
      if (shouldRefresh) {
        console.log(`Cache expired for category: ${category}, fetching fresh data`);
        try {
          await this.fetchAndCacheNews(category, 'us', limit);
          // Return fresh data if successful
          return await CachedNews.getByCategory(category, limit);
        } catch (apiError) {
          console.log(`API error (${apiError.message}), returning existing cache for ${category}`);
          // Return existing cache if API fails
          return existingCache;
        }
      }

      // If cache doesn't need refresh, return existing data
      if (existingCache.length > 0) {
        return existingCache;
      }
      
      // Only try API if no cache exists at all
      console.log(`No cached news found for category: ${category}, fetching fresh data`);
      try {
        await this.fetchAndCacheNews(category, 'us', limit);
        return await CachedNews.getByCategory(category, limit);
      } catch (apiError) {
        console.log(`API error (${apiError.message}), no cache available for ${category}`);
        return [];
      }
      
    } catch (error) {
      console.error('Error getting cached news:', error.message);
      return [];
    }
  }

  async searchCachedNews(query, limit = 20, page = 1) {
    try {
      if (!query || typeof query !== 'string' || query.trim().length < 2) {
        throw new Error('Search query must be at least 2 characters long');
      }
      
      const result = await CachedNews.search(query, limit, page);
      
      // If no results and we're not on the first page, try the first page
      if (result.articles.length === 0 && page > 1) {
        return this.searchCachedNews(query, limit, 1);
      }
      
      return result;
    } catch (error) {
      console.error('Error searching cached news:', error.message);
      // Return empty result set on error
      return {
        articles: [],
        totalResults: 0,
        page: parseInt(page) || 1,
        totalPages: 0,
        hasMore: false
      };
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
        // Add 10-minute delay between categories to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 10 * 60 * 1000)); // 10 minutes
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
