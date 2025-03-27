const express = require('express');
const router = express.Router();

// Login Router
router.get('/login', (req, res) => {
    res.render('login_register', { Login: true});
});

// Register Router
router.get('/register', (req, res) => {
    res.render('login_register', { register: true});
});

module.exports = router;