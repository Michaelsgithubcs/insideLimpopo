const Article = require('../models/Article');
const { upload } = require('../middlewares/uploadMiddleware');
exports.createArticle = async (req, res) => {
  try {
    console.log('SESSION DEBUG:', JSON.stringify(req.session, null, 2));
    console.log('SESSION USER:', JSON.stringify(req.session.user, null, 2));
    const { title, content, category_id } = req.body;
    const featured_img = req.file ? `/uploads/${req.file.filename}` : null;

    // Using session instead of token
    const author_id = req.session.user?.email;
    if (!author_id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const articleId = await Article.create({
      title,
      content,
      author_id,
      category_id,
      featured_img
    });

    res.status(201).json({
      success: true,
      articleId,
      message: 'Article created successfully'
    });
  } catch (err) {
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