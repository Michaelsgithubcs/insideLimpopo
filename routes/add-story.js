const express = require('express');
const router = express.Router();

router.get('/add-story', (req, res) => {
    res.render('add-story', { title: 'Post '});
});

module.exports = router;