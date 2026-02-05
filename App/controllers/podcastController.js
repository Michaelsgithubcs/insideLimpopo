// controllers/podcastController.js
const Podcast = require('../models/Podcast');
const getPool = require('../config/db');

// CREATE - FIXED VERSION
exports.createPodcast = async (req, res) => {
  try {
    console.log('📥 CREATE PODCAST - Request body:', req.body);
    console.log('📥 CREATE PODCAST - User session:', req.session.user);

    const { title, description, episode_link, episode_date, episode_duration, category_id } = req.body;

    // Validate required fields
    if (!title || !episode_link || !episode_date || !episode_duration) {
      console.log('❌ Missing required fields:', { title, episode_link, episode_date, episode_duration });
      return res.status(400).json({ 
        error: 'Missing required fields: title, episode_link, episode_date, episode_duration are required',
        received: req.body
      });
    }

    const author_id = req.session.user?.id;
    if (!author_id) {
      console.log('❌ User not authenticated');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate and format data
    const podcastData = {
      title: title.trim(),
      description: (description || '').trim(),
      author_id,
      category_id: category_id ? parseInt(category_id, 10) : null,
      episode_link: episode_link.trim(), // This was the main issue - it was being set to null
      episode_date: episode_date,        // Make sure this is in 'YYYY-MM-DD' format
      episode_duration: episode_duration.trim()
    };

    console.log('🎯 Processed podcast data:', podcastData);

  // Validate that the input contains a proper <iframe> tag
try {
    const embedCode = podcastData.episode_link;

    // Throw an error if it does not contain a valid <iframe> with a src attribute
    if (!/<iframe.*src=["'].*["'].*><\/iframe>/i.test(embedCode)) {
        throw new Error('Invalid iframe');
    }
} catch (err) {
    console.log('❌ Invalid iframe embed code:', podcastData.episode_link);
    return res.status(400).json({ 
        error: 'Invalid episode embed code. Please paste the full YouTube iframe code.' 
    });
}


    // Validate date format
    if (!isValidDate(podcastData.episode_date)) {
      console.log('❌ Invalid date:', podcastData.episode_date);
      return res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    const podcastId = await Podcast.create(podcastData);

    console.log('✅ Podcast created successfully with ID:', podcastId);

    return res.status(201).json({
      success: true,
      podcastId,
      message: 'Podcast created successfully'
    });

  } catch (err) {
    console.error('❌ CREATE PODCAST ERROR:', err);
    return res.status(500).json({ 
      error: 'Failed to create podcast: ' + err.message,
      details: 'Check server logs for more information'
    });
  }
};

// Helper function to validate date format
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regex)) return false;
  
  const date = new Date(dateString);
  const timestamp = date.getTime();
  
  if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
    return false;
  }
  
  return date.toISOString().startsWith(dateString);
}

// READ (single)
exports.getPodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) return res.status(404).json({ error: 'Podcast not found' });
    return res.json({ podcast });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// UPDATE - FIXED VERSION
exports.updatePodcast = async (req, res) => {
  try {
    console.log('📥 UPDATE PODCAST - Request body:', req.body);
    
    const podcastId = req.params.id;
    const { title, description, category_id, episode_link, episode_date, episode_duration } = req.body;

    // Validate required fields for update
    if (!title || !episode_link || !episode_date || !episode_duration) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: req.body
      });
    }

    const updateData = {
      title: title.trim(),
      description: (description || '').trim(),
      category_id: category_id ? parseInt(category_id, 10) : null,
      episode_link: episode_link.trim(), // Fixed - was being set to null
      episode_date: episode_date,
      episode_duration: episode_duration.trim()
    };

    // Validate URL
    try {
      new URL(updateData.episode_link);
    } catch (err) {
      return res.status(400).json({ 
        error: 'Invalid episode link URL format' 
      });
    }

    // Validate date
    if (!isValidDate(updateData.episode_date)) {
      return res.status(400).json({ 
        error: 'Invalid date format' 
      });
    }

    await Podcast.update(podcastId, updateData);

    console.log('✅ Podcast updated successfully:', podcastId);

    // Return JSON response for API calls
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, message: 'Podcast updated successfully' });
    }

    // Redirect for form submissions
    return res.redirect(`/api/podcasts/edit/${podcastId}?success=Podcast updated successfully`);

  } catch (err) {
    console.error('❌ Error updating podcast:', err);
    
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ error: 'Error updating podcast: ' + err.message });
    }
    
    return res.redirect(`/api/podcasts/edit/${req.params.id}?error=Error updating podcast`);
  }
};

// DELETE
exports.deletePodcast = async (req, res) => {
  try {
    const podcastId = req.params.id;
    if (!podcastId) return res.status(400).json({ error: 'Podcast ID is required' });

    await Podcast.delete(podcastId);
    return res.json({ success: true, message: 'Podcast deleted successfully' });
  } catch (err) {
    console.error('Error deleting podcast:', err);
    return res.status(500).json({ error: 'Failed to delete podcast: ' + err.message });
  }
};

// READ (all)
exports.getAllPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.getAll();
    return res.json({ podcasts });
  } catch (err) {
    console.error('Error fetching podcasts:', err);
    return res.status(500).json({ error: 'Failed to fetch podcasts' });
  }
};

// READ by category name -> render a list page
exports.getPodcastByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;
    const pool = await getPool();

    const [rows] = await pool.query(
      'SELECT category_id FROM categories WHERE name = ?',
      [categoryName]
    );
    if (rows.length === 0) {
      return res.status(404).render('error', { message: `Category '${categoryName}' not found` });
    }

    const categoryId = rows[0].category_id;
    const podcasts = await Podcast.findByCategory(categoryId, 20);

    return res.render('main/showPodcasts', { categoryName, podcasts });
  } catch (err) {
    console.error('Error fetching podcasts by category:', err);
    return res.status(500).render('error', { message: 'Internal server error' });
  }
};

// SEARCH
exports.searchPodcasts = async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q) return res.status(400).render('error', { message: 'Search query cannot be empty' });

    const podcasts = await Podcast.search(q);
    return res.status(200).json({ podcasts, query: q });
  } catch (err) {
    console.error('Error searching podcasts:', err);
    return res.status(500).render('error', { message: 'Internal server error' });
  }
};

/**
 * OPTIONAL: If you want an edit page:
 * GET /api/podcasts/edit/:id
 */
exports.renderEdit = async (req, res) => {
  try {
    const pool = await getPool();
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) return res.status(404).render('error', { message: 'Podcast not found' });

    const [categories] = await pool.query('SELECT category_id, name FROM categories');
    return res.render('admin/editPodcast', { podcast, categories });
  } catch (err) {
    console.error('Render edit error:', err);
    return res.status(500).render('error', { message: 'Internal server error' });
  }
};
