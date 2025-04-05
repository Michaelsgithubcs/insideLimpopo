const express = require('express');
const router = express.Router();

router.get('/add-articles', (req, res) => {
    res.render('add-articles', { title: 'Articles'})
});

module.exports = router;