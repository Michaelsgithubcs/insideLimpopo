const express = require('express');
const router = express.Router();

router.get('/opinion', (req, res) => {
    res.render('content/opinion', { title: 'Opinion'});
});

module.exports = router;