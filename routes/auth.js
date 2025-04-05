const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const session = require('express-session');

// Create a connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "insidelimpopo",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Configure session middleware
router.use(session({
  secret: 'your_secret_key_here',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true } // Set secure:true in production (HTTPS)
}));

// Login Router
router.get('/login', (req, res) => {
  res.render('login_register', { title: 'Login', login: true });
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // 2. Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 3. Create session
    req.session.userId = user.id;
    req.session.username = user.username;

    // 4. Redirect to dashboard or home page
    res.redirect('/landing');

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Register Router
router.get('/register', (req, res) => {
  res.render('login_register', { title: 'Register', register: true });
});

// Register endpoint
router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // 1. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 2. Insert user into the database
    const sql = "INSERT INTO `users` (`email`, `username`, `password`) VALUES (?, ?, ?)";
    await pool.query(sql, [email, username, hashedPassword]);
    
    console.log("User registered successfully");
    res.redirect("/login");
  } catch (err) {
    console.error("Error processing registration:", err);
    res.status(500).send("An error occurred while processing your request.");
  }
});

// Landing page route
router.get('/add-story', async (req, res) => {
  try {
    // Check if the user is logged in
    if (!req.session.userId) {
      return res.redirect('/login'); // Redirect to login if no session
    }

    // Fetch user data from the database using the session userId
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.session.userId]);

    if (users.length === 0) {
      return res.redirect('/login'); // Redirect to login if user not found
    }

    const user = users[0];

    // Ensure default values for missing properties
    user.avatar = user.avatar || '/images/default-avatar.jpg';
    user.storiesCount = user.storiesCount || 0;
    user.articlesCount = user.articlesCount || 0;

    // Pass the user object to the landing.ejs file
    res.render('landing', { title: 'Dashboard', user });
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).send('An error occurred while loading the dashboard.');
  }
});

module.exports = router;