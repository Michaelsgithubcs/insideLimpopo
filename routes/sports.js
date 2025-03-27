const express = require('express');
const router = express.Router();

router.get('/sports', (req, res) => {
    res.render('sports', { title: 'Sports'});
});

module.exports = router;