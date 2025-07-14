const express = require('express');
const router = express.Router();

router.get('/about', (req, res) => {
    res.render('main/about', {
        title: 'About Us', 
        description: 'Learn more about our mission and values.',
        keywords: 'about, mission, values',
    });
});

module.exports = router;