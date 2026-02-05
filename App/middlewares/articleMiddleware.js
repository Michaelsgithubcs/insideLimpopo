const Article = require('../models/Article');

// const jwt = require('jsonwebtoken');

exports.validateArticle = (req, res, next) => {
  const { title, content, category_id } = req.body;
  
  if (!title || title.length < 5) {
    return res.status(400).json({ error: 'Title must be at least 5 characters' });
  }
  
  if (!content || content.length < 100) {
    return res.status(400).json({ error: 'Content must be at least 100 characters' });
  }
  
  if (!category_id) {
    return res.status(400).json({ error: 'Category is required' });
  }
  
  next();
};

exports.checkArticleExists = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.author_id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.locals.article = article;
    next();
  } catch (err) {
    next(err);
  }
};

exports.authorizeArticleEdit = (req, res, next) => {
  if (req.user.role !== 'admin' && res.locals.article.author_id !== req.user.email) {
    return res.status(403).json({ error: 'Not authorized to modify this article' });
  }
  next();
};

// const verifyToken = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1]; 

//   if (!token) {
//     return res.status(401).json({ error: 'No token provided' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (!decoded) {
//       return res.status(401).json({ error: 'Invalid token' });
//     }
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(403).json({ error: 'Invalid token' });
//   }
// };
