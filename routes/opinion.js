const express = require('express');
const router = express.Router();

router.get('/opinion', (req, res) => {
    res.render('opinion', { title: 'Opinion'});
});

module.exports = router;