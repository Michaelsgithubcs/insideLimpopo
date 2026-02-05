const express = require('express');
const router = express.Router();

router.get('/privacy', (req, res) => {
    res.render('main/privacy', {
        title: 'Privacy Policy', 
        description: 'Learn more about our privacy policy.',
        keywords: 'privacy, policy, compliance',
    });
});

module.exports = router;