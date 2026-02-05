const express = require('express');
const router = express.Router();

router.get('/contacts', (req, res) => {
    res.render('main/contact', {
        title: 'Contact Us', 
        description: 'Get in touch with us for any inquiries or support.',
        keywords: 'contact, inquiries, support',
    })
});

module.exports = router;