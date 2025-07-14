const express = require('express');
const router = express.Router();

// 404 page
router.use((req, res) => {
    res.status(404).render('error', { message: 'Page not found' });
});

module.exports = router;