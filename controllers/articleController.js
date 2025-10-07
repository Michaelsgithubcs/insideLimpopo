const Article = require('../models/Article');
const { upload } = require('../middlewares/uploadMiddleware');
const CachedNews = require('../models/CachedNews');
exports.createArticle = async (req, res) => {
  try {
    console.log('FULL REQ.BODY:', req.body);
    console.log('REQ.FILE:', req.file);
    console.log('SESSION DEBUG:', JSON.stringify(req.session, null, 2));
    console.log('SESSION USER:', JSON.stringify(req.session.user, null, 2));
    let { title, content, category_id, image_url, image_type, episode_link, episode_date, episode_tag, episode_duration } = req.body;
    console.log('CATEGORY_ID RECEIVED:', category_id);
    console.log('IMAGE_URL RECEIVED:', image_url);
    console.log('IMAGE_TYPE RECEIVED:', image_type);
    console.log('REQ.FILE:', req.file);
    
    // Ensure category_id is an integer
    category_id = parseInt(category_id, 10);
    
    let featured_img;
    if (image_type === 'upload' && req.file) {
      featured_img = `/uploads/${req.file.filename}`;
    } else if (image_type === 'url' && image_url) {
      featured_img = image_url;
    } else {
      featured_img = null;
    }
    console.log('FINAL FEATURED_IMG TO SAVE:', featured_img);

    // Using session instead of token
    const author_id = req.session.user?.id;
    if (!author_id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const articleId = await Article.create({
      title,
      content,
      author_id,
      category_id,
      featured_img,
      episode_link: episode_link || null,
      episode_date: episode_date || null,
      episode_tag: episode_tag || null,
      episode_duration: episode_duration || null
    });

    // *** MISSING LINE ADDED HERE ***
    res.locals.articleId = articleId;

    // Debug: fetch and log the created article
    const pool = await require('../config/db')();
    const [createdArticle] = await pool.query('SELECT * FROM articles WHERE article_id = ?', [articleId]);
    console.log('CREATED ARTICLE:', createdArticle[0]);

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

    // ✅ fetch ALL cached news, not just this category
    const cachedNews = await CachedNews.getAll(20);
    console.log(`Fetched ${cachedNews.length} cached news (all categories)`);

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