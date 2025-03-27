const express = require('express');
const router = express.Router();

router.get('/podcast', (req, res) => {
    res.render('podcast', { title: 'Podcast'});
});

module.exports = router;