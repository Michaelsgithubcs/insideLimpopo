const Article = require('../models/Article');
const { upload } = require('../middlewares/uploadMiddleware');
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
    const { title, content, category_id } = req.body;
    let featured_img = res.locals.article.featured_img;
    
    if (req.file) {
      featured_img = `/uploads/${req.file.filename}`;
    }
    
    await Article.update(req.params.author_id, {
      title,
      content,
      category_id,
      featured_img
    });
    
    res.json({ success: true, message: 'Article updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    await Article.delete(req.params.author_id);
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};