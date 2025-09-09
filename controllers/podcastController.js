// controllers/podcastController.js
const Podcast = require('../models/Podcast');
const getPool = require('../config/db');

// CREATE
exports.createPodcast = async (req, res) => {
  try {
    const { title, description, episode_link, episode_date, episode_duration, category_id } = req.body;

    const author_id = req.session.user?.id;
    if (!author_id) return res.status(401).json({ error: 'User not authenticated' });

    // category is optional; if provided ensure integer
    const catId = category_id ? parseInt(category_id, 10) : null;

    const podcastId = await Podcast.create({
      title,
      description: description || '',
      author_id,
      category_id: Number.isInteger(catId) ? catId : null,
      episode_link: episode_link || null,
      episode_date: episode_date || null,        // expect 'YYYY-MM-DD'
      episode_duration: episode_duration || null // e.g. '42 min'
    });

    return res.status(201).json({
      success: true,
      podcastId,
      message: 'Podcast created successfully'
    });
  } catch (err) {
    console.error('CREATE PODCAST ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
};

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

// UPDATE
exports.updatePodcast = async (req, res) => {
  try {
    const podcastId = req.params.id;
    const { title, description, category_id, episode_link, episode_date, episode_duration } = req.body;

    await Podcast.update(podcastId, {
      title,
      description: description ?? '',
      category_id: category_id ? parseInt(category_id, 10) : null,
      episode_link: episode_link ?? null,
      episode_date: episode_date ?? null,
      episode_duration: episode_duration ?? null
    });

    // if you prefer JSON:
    // return res.json({ success: true, message: 'Podcast updated successfully' });

    // keep redirect semantics if you have an edit page:
    return res.redirect(`/api/podcasts/edit/${podcastId}?success=Podcast updated successfully`);
  } catch (err) {
    console.error('Error updating podcast:', err);
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
