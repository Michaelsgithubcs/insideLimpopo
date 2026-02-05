const Article = require('../models/Article');

exports.getSportsPage = async (req, res) => {
  const sportsCategoryId = "sports"; 
  const sportsArticles = await Article.findByCategory(sportsCategoryId, 10);

  res.render('sports', { title: "Sports" , sportsArticles });
};
