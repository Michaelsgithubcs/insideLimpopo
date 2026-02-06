const Article = require('../models/Article');
const { upload } = require('../middlewares/uploadMiddleware');
const CachedNews = require('../models/CachedNews');
const sportsApiService = require('../services/sportsApiService');
exports.createArticle = async (req, res) => {
  try {
    console.log('FULL REQ.BODY:', req.body);
    console.log('REQ.FILE:', req.file);

    let { 
      title, 
      content, 
      category_id, 
      image_url, 
      image_type, 
      facebook_link, 
      twitter_link, 
      instagram_link, 
      linkedin_link,
      location 
    } = req.body;

    // Ensure category_id is integer
    category_id = parseInt(category_id, 10);

    // Handle image logic
    let featured_img;
    if (image_type === 'upload' && req.file) {
      featured_img = `/uploads/${req.file.filename}`;
    } else if (image_type === 'url' && image_url) {
      featured_img = image_url;
    } else {
      featured_img = null;
    }

    const author_id = req.session.user?.id;
    if (!author_id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // ✅ Construct JSON object for social links
    const social_links = {
      facebook: facebook_link || null,
      twitter: twitter_link || null,
      instagram: instagram_link || null,
      linkedin: linkedin_link || null
    };

    // ✅ Save article with JSON
    const articleId = await Article.create({
      title,
      content,
      author_id,
      category_id,
      featured_img,
      social_links,
      location
    });

    res.status(201).json({
      success: true,
      articleId,
      message: 'Article created successfully'
    });
  } catch (err) {
    console.error('CREATE ARTICLE ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};
exports.getAllArticles = async (req, res) => {
  try {
    // ✅ Use the admin-friendly query with authors
    const articles = await Article.getAllWithAuthors();
    res.json({ articles });
  } catch (err) {
    console.error('Error fetching articles:', err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
};

exports.getArticle = async (req, res) => {
  try {
    const article = res.locals.article;
    res.json({ article });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const { title, content, category_id, image_type, image_url } = req.body;
    const articleId = req.params.id;
    
    // Handle featured image based on the selected type
    let featured_img = req.body.current_image; // Keep existing image by default
    
    if (image_type === 'url' && image_url) {
      featured_img = image_url;
    } else if (req.file) {
      // If a new file was uploaded
      featured_img = `/uploads/${req.file.filename}`;
    } else if (image_type === 'upload' && !req.file) {
      // If upload was selected but no file was provided
      return res.redirect(`/api/articles/edit/${articleId}?error=Please upload an image`);
    }
    
    await Article.update(articleId, {
      title,
      content,
      category_id,
      featured_img
    });
    
    // Redirect back to edit page with success message
    res.redirect(`/api/articles/edit/${articleId}?success=Article updated successfully`);
  } catch (err) {
    console.error('Error updating article:', err);
    res.redirect(`/api/articles/edit/${req.params.id}?error=Error updating article`);
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const articleId = req.params.id;
    if (!articleId) {
      return res.status(400).json({ error: 'Article ID is required' });
    }
    await Article.delete(articleId);
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (err) {
    console.error('Error deleting article:', err);
    res.status(500).json({ error: 'Failed to delete article: ' + err.message });
  }
};

exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.getAll();
    res.json({ articles });
  } catch (err) {
    console.error('Error fetching articles:', err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
};

exports.getArticleByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;

    // fetch category id from DB
    const pool = await require('../config/db')();
    const [rows] = await pool.query(
      "SELECT category_id FROM categories WHERE name = ?",
      [categoryName]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .render("error", { message: `Category '${categoryName}' not found` });
    }

    const categoryId = rows[0].category_id;

    // fetch articles in that category
    const articles = await Article.findByCategory(categoryId, 20);
    console.log(`Fetched ${articles.length} articles for category '${categoryName}'`);

    // ✅ fetch cached news filtered by category OR sports API data
    let cachedNews = [];
    
    if (categoryName.toLowerCase() === 'sports') {
      // Use cached sports data from newsCacheService
      try {
        console.log('Fetching cached sports data...');
        cachedNews = await CachedNews.getByCategory('sports', 15);
        console.log(`Fetched ${cachedNews.length} cached sports news`);
      } catch (error) {
        console.error('Error fetching cached sports data:', error);
        cachedNews = []; // Ensure we have an empty array on error
      }
    } else {
      // ONLY business and technology get cached news - all other categories get no cached news
      const categoryMapping = {
        'business': 'business',
        'technology': 'technology',
        'tech': 'technology'
      };
      
      const cacheCategory = categoryMapping[categoryName.toLowerCase()];
      
      // Only proceed if this category is in our allowed list
      if (cacheCategory) {
        try {
          cachedNews = await CachedNews.getByCategory(cacheCategory, 20);
          console.log(`Fetched ${cachedNews.length} cached news for category '${cacheCategory}' (from '${categoryName}')`);
          
          if (cachedNews.length === 0) {
            console.log(`No cached news found for category '${cacheCategory}'`);
          }
        } catch (error) {
          console.error(`Error fetching cached news for category '${cacheCategory}':`, error);
          cachedNews = []; // Ensure we have an empty array on error
        }
      } else {
        console.log(`Category '${categoryName}' does not get cached news - showing only regular articles`);
      }
    }

    // Combine and mix articles with cached news
    const combinedNews = [...articles, ...cachedNews];
    
    // Sort by date (newest first) - handle both article and cached news date formats
    combinedNews.sort((a, b) => {
      const dateA = new Date(a.created_at || a.published_at);
      const dateB = new Date(b.created_at || b.published_at);
      return dateB - dateA;
    });

    console.log(`Combined ${combinedNews.length} total items (${articles.length} articles + ${cachedNews.length} cached news)`);

    // render category page with combined news
    res.render("main/show", { categoryName, articles: combinedNews, cachedNews: [] });
  } catch (err) {
    console.error("Error fetching articles by category:", err);
    res.status(500).render("error", { message: "Internal server error" });
  }
};




exports.searchArticles = async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q) {
      return res.status(400).render('error', { message: 'Search query cannot be empty' });
    }

    const articles = await Article.search(q);

    // Render search results page
    res.status(200).json( { articles, query: q });
  } catch (err) {
    console.error('Error searching articles:', err);
    res.status(500).render('error', { message: 'Internal server error' });
  };
};