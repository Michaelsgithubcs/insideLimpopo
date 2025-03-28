const express = require('express');
const router = express.Router();

// Login Router
router.get('/login', (req, res) => {
    res.render('login_register', { title : 'Login', login: true});
});

// Register Router
router.get('/register', (req, res) => {
    res.render('login_register', {title: 'Register', register: true});
});

module.exports = router;