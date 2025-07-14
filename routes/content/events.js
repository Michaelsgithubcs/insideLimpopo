const express = require('express');
const router = express.Router();

router.get('/events', (req, res) => {
    res.render('content/events', { title: 'Events'});
});

module.exports = router;