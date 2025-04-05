const express = require('express');
const router = express.Router();

router.use('/', require('./home'));
router.use('/', require('./events'));
router.use('/', require('./sports'));
router.use('/', require('./opinion'));
router.use('/', require('./podcast'));
router.use('/', require('./vacancies'));
router.use('/', require('./contact'));
router.use('/', require('./about'));
router.use('/', require('./auth'));
router.use('/', require('./add-story'));
router.use('/', require('./add-articles'));
router.use('/', require('./error'));

module.exports = router;