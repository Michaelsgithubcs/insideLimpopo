const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');

// Define routes
router.use('/', require('./main/home'));
router.use('/', require('./content/events'));
router.use('/', require('./content/sports'));
router.use('/', require('./content/opinion'));
router.use('/', require('./content/podcast'));
router.use('/', require('./content/vacancies'));
router.use('/', require('./main/contact'));
router.use('/', require('./main/about'));
router.use('/', require('./main/privacy'));
router.use('/', require('./auth/auth'));
router.use('/', require('./admin/landing'));
router.use('/api/articles', require('./admin/articles'));
router.use('/api/podcasts',require('./admin/podcastRoute'))
router.use('/added', require('./content/articles'));
router.use('/', require('./error'));

module.exports = router;