const Story = require('../models/Story');

exports.validateStory = (req, res, next) => {
  const { title, description, content, category } = req.body;
  
  if (!title || title.length < 5) {
    return res.status(400).json({ error: 'Title must be at least 5 characters' });
  }
  
  if (!description || description.length < 20) {
    return res.status(400).json({ error: 'Description must be at least 20 characters' });
  }
  
  if (!content || content.length < 100) {
    return res.status(400).json({ error: 'Content must be at least 100 characters' });
  }
  
  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }
  
  next();
};

exports.checkStoryExists = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.locals.story = story;
    next();
  } catch (err) {
    next(err);
  }
};

exports.authorizeStoryEdit = (req, res, next) => {
  if (req.user.role !== 'admin' && res.locals.story.author_id !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to modify this story' });
  }
  next();
};