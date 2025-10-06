const Story = require('../models/Story');
const { upload } = require('../middlewares/uploadMiddleware');

exports.createStory = async (req, res) => {
  try {
    const { title, description, content, category } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const storyId = await Story.create({
      title,
      description,
      content,
      author_id: req.user.id,
      category,
      image_url
    });
    
    res.status(201).json({ 
      success: true, 
      storyId,
      message: 'Story created successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStory = async (req, res) => {
  try {
    const story = res.locals.story;
    res.json({ story });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStory = async (req, res) => {
  try {
    const { title, description, content, category } = req.body;
    let image_url = res.locals.story.image_url;
    
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }
    
    await Story.update(req.params.id, {
      title,
      description,
      content,
      category,
      image_url
    });
    
    res.json({ success: true, message: 'Story updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    await Story.delete(req.params.id);
    res.json({ success: true, message: 'Story deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};