const express = require('express');
const router = express.Router();

router.get('/vacancies', (req, res) => {
    res.render('vacancies', { title: 'Vacancies'});
});

module.exports = router;