const axios = require('axios');

class RealSportsApiService {
  constructor() {
    // Use NewsAPI for reliable sports content
    this.newsApiKey = '94710bfc54a44f1a9796e81a0bd2e446';
    this.newsBaseUrl = 'https://newsapi.org/v2';
  }

  async fetchRealSportsNews() {
    try {
      console.log('Fetching real sports news from NewsAPI...');
      
      // Get sports news from NewsAPI
      const response = await axios.get(`${this.newsBaseUrl}/everything`, {
        params: {
          q: 'sports OR football OR soccer OR rugby OR cricket OR basketball OR tennis',
          sources: 'bbc-sport,espn,fox-sports,the-sport-bible,cnn,bbc-news',
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 20,
          apiKey: this.newsApiKey
        },
        timeout: 15000
      });

      if (response.data && response.data.articles && response.data.articles.length > 0) {
        console.log(`Found ${response.data.articles.length} real sports articles`);
        
        const sportsNews = response.data.articles
          .filter(article => 
            article.title && 
            article.description && 
            article.url && 
            !article.title.toLowerCase().includes('[removed]') &&
            article.urlToImage
          )
          .slice(0, 15)
          .map(article => {
            // Determine sport type based on content
            const content = (article.title + ' ' + article.description).toLowerCase();
            let sport = 'Sports';
            if (content.includes('football') || content.includes('soccer') || content.includes('premier league') || content.includes('fifa')) sport = 'Football';
            else if (content.includes('rugby')) sport = 'Rugby';
            else if (content.includes('cricket')) sport = 'Cricket';
            else if (content.includes('basketball') || content.includes('nba')) sport = 'Basketball';
            else if (content.includes('tennis')) sport = 'Tennis';
            else if (content.includes('golf')) sport = 'Golf';
            else if (content.includes('boxing') || content.includes('mma')) sport = 'Boxing';
            else if (content.includes('olympics') || content.includes('athletics')) sport = 'Athletics';
            
            return {
              title: article.title,
              description: article.description,
              content: article.content || article.description + ' Click to read the full article from ' + article.source.name,
              published_at: article.publishedAt,
              created_at: article.publishedAt,
              url_to_image: article.urlToImage,
              url: article.url,
              source: article.source,
              category: 'sports',
              sport: sport,
              isExternal: false,
              match_status: 'Published'
            };
          });

        console.log(`Processed ${sportsNews.length} sports articles with real content and images`);
        return sportsNews;
      }

      console.log('No articles from NewsAPI, trying fallback');
      return await this.getFallbackSportsNews();

    } catch (error) {
      console.error('Error fetching sports news from NewsAPI:', error.message);
      return await this.getFallbackSportsNews();
    }
  }

  async getFallbackSportsNews() {
    try {
      console.log('Trying fallback sports headlines...');
      
      const response = await axios.get(`${this.newsBaseUrl}/top-headlines`, {
        params: {
          category: 'sports',
          language: 'en',
          pageSize: 15,
          apiKey: this.newsApiKey
        },
        timeout: 10000
      });

      if (response.data && response.data.articles && response.data.articles.length > 0) {
        const sportsNews = response.data.articles
          .filter(article => 
            article.title && 
            article.description && 
            article.url &&
            !article.title.toLowerCase().includes('[removed]')
          )
          .slice(0, 15)
          .map(article => {
            const content = (article.title + ' ' + article.description).toLowerCase();
            let sport = 'Sports';
            if (content.includes('football') || content.includes('soccer')) sport = 'Football';
            else if (content.includes('basketball')) sport = 'Basketball';
            else if (content.includes('baseball')) sport = 'Baseball';
            else if (content.includes('tennis')) sport = 'Tennis';
            
            return {
              title: article.title,
              description: article.description,
              content: article.content || article.description + ' Read more at ' + article.source.name,
              published_at: article.publishedAt,
              created_at: article.publishedAt,
              url_to_image: article.urlToImage || '/assets/sportsimages/logo.jpg',
              url: article.url,
              source: article.source,
              category: 'sports',
              sport: sport,
              isExternal: false,
              match_status: 'Published'
            };
          });

        console.log(`Found ${sportsNews.length} fallback sports articles`);
        return sportsNews;
      }

      return [];
    } catch (error) {
      console.error('Error in fallback sports fetch:', error.message);
      return [];
    }
  }

  async getAllSportsNews() {
    try {
      console.log('Getting all real sports news...');
      
      // Get the latest real sports content
      const allSportsNews = await this.fetchRealSportsNews();
      
      if (allSportsNews.length === 0) {
        console.log('No real sports news found');
        return [];
      }

      // Sort by date (newest first)
      allSportsNews.sort((a, b) => {
        const dateA = new Date(a.published_at);
        const dateB = new Date(b.published_at);
        return dateB - dateA;
      });

      console.log(`Returning ${allSportsNews.length} real sports articles`);
      return allSportsNews.slice(0, 15); // Limit to 15 items
    } catch (error) {
      console.error('Error in getAllSportsNews:', error);
      return [];
    }
  }
}

module.exports = new RealSportsApiService();