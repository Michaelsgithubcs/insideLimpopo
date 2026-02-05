const express = require('express');
const router = express.Router();
const storyController = require('../../controllers/storyController');
const { 
  validateStory, 
  checkStoryExists, 
  authorizeStoryEdit 
} = require('../../middlewares/storyMiddleware');
const { upload } = require('../../middlewares/uploadMiddleware');

// Create Story
router.post('/', 
  upload.single('image_url'), 
  validateStory, 
  storyController.createStory
);

// Get Story
router.get('/:id', 
  checkStoryExists, 
  storyController.getStory
);

// Update Story
router.put('/:id', 
  checkStoryExists, 
  authorizeStoryEdit,
  upload.single('image_url'), 
  validateStory,
  storyController.updateStory
);

// Delete Story
router.delete('/:id', 
  checkStoryExists, 
  authorizeStoryEdit,
  storyController.deleteStory
);

module.exports = router;