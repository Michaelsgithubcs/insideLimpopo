const express = require("express");
const router = express.Router();
// const bcrypt = require("bcrypt");
const argon2 = require("argon2");
const { isNotAuthenticated, isAuthenticated } = require("../../middlewares/auth");
const getPool = require("../../config/db");

// Login page
router.get("/login", isNotAuthenticated, (req, res) => {
  res.render("auth/login", {
    title: "Login",
    login: true,
    error: req.flash("error"),
    success: req.flash("success"),
  });
});

// Login handler
router.post("/login", isNotAuthenticated, async (req, res) => {
  console.log('--- LOGIN HANDLER ---');
  console.log('Login req.body:', req.body);
  const { email, password } = req.body;

  try {
    const pool = await getPool();
    // 1. Find user by email or username
    const [users] = await pool.query(
      "SELECT id, username, email, password, role FROM users WHERE email = ? OR username = ?",
      [email, email]
    );

    console.log('Users found:', users);

    if (users.length === 0) {
      console.log('No user found for:', email);
      req.flash("error", "Invalid username or password");
      return res.redirect("/login");
    }

    const user = users[0];
    console.log('User from DB:', user);
    console.log('Entered password:', password);
    console.log('Stored hash:', user.password);

    // 2. Compare hashed password
    const isPasswordValid = await argon2.verify(user.password, password);
    console.log('argon2.verify result:', isPasswordValid);
    if (!isPasswordValid) {
      return res.render("login", { 
        title: "Login", 
        error: "Incorrect email or password" 
      });
    }

    // 3. Create and save session
    req.session.regenerate(async (err) => {
      if (err) throw err;

      // Store the full user object in session, including id
      req.session.user = user;
      req.session.username = user.username;
      req.session.email = user.email;
      req.session.role = user.role;
      req.session.userId = user.id;

      // Debug log
      console.log('SESSION USER SET:', req.session.user);

      // Fallback: if id is missing, fetch it from DB
      if (!user.id) {
        try {
          const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [user.email]);
          if (rows.length > 0) {
            req.session.user.id = rows[0].id;
            req.session.userId = rows[0].id;
            console.log('Fetched user id from DB:', rows[0].id);
          }
        } catch (fetchErr) {
          console.error('Error fetching user id for session:', fetchErr);
        }
      }

      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.redirect("/login");
        }

        // Redirect to landing page
        return res.redirect("/landing");
      });
    });
  } catch (err) {
    console.error("Login error:", err);
    req.flash("error", "An error occurred during login");
    res.redirect("/login");
  }
});

// Register page
router.get("/register", isNotAuthenticated, (req, res) => {
  res.render("auth/register", {
    title: "Register",
    register: true,
    error: req.flash("error"),
  });
});

// Register handler
router.post("/register", isNotAuthenticated, async (req, res) => {
  console.log('--- TOP OF REGISTER HANDLER ---');
  const { email, username, password, repeat_password, role, first_name, last_name } = req.body;

  // Log the full request body for debugging
  console.log('Registration req.body:', req.body);

  // Server-side required validation
  if (!email || !username || !password || !repeat_password || !role || !first_name || !last_name) {
    req.flash("error", "All fields are required.");
    return res.redirect("/register");
  }

  try { 
    const pool = await getPool();
    console.log('Registering user:', { email, username, role, first_name, last_name });
    // Validate password match
    if (password !== repeat_password) {
      req.flash("error", "Passwords do not match");
      return res.redirect("/register");
    }

    // Check if user exists
    const [existing] = await pool.query(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [email, username]
    );

    if (existing.length > 0) {
      req.flash("error", "Email or username already exists");
      return res.redirect("/register");
    }

    // Hash password and create user
    const hashedPassword = await argon2.hash(password);

    // Insert user with role, first_name, last_name
    const [result] = await pool.query(
      "INSERT INTO users (email, username, password, role, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)",
      [email, username, hashedPassword, role || 'user', first_name, last_name]
    );
    console.log('User registered successfully, insert result:', result);

    // Log before session creation
    console.log('About to create session for new user');

    // Auto-login after registration
    const user = { id: result.insertId, email, username, role: role || 'user' };
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regenerate error:', err);
        return res.redirect('/login');
      }
      req.session.user = user;
      req.session.username = user.username;
      req.session.email = user.email;
      req.session.role = user.role;
      req.session.userId = user.id;
      console.log('Session after setting user:', req.session);
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.redirect('/login');
        }
        console.log('Session saved successfully, redirecting to /landing');
        // Redirect to landing page (dashboard)
        return res.redirect('/landing');
      });
    });
    console.log('This should not print unless session code is skipped');
  } catch (err) {
    console.error("Registration error (catch block):", err);
    req.flash("error", "Registration failed. Please try again.");
    res.redirect("/register");
  }
});


// Logout handler
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.redirect("/dashboard");
    }
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

// Dashboard route
router.get("/dashboard", isAuthenticated, async (req, res) => {
  try {
    const pool = await getPool();
    // Get user stats
    const [user] = await pool.query(
      "SELECT username, email, role FROM users WHERE email = ?",
      [req.session.email]
    );

    const [stories] = await pool.query(
      "SELECT COUNT(*) as count FROM stories WHERE email = ?",
      [req.session.email]
    );

    const [articles] = await pool.query(
      "SELECT COUNT(*) as count FROM articles WHERE email = ?",
      [req.session.email]
    );

    res.render("dashboard", {
      title: "Dashboard",
      user: {
        ...user[0],
        avatar: "/images/default-avatar.jpg",
        storyCount: stories[0].count,
        articleCount: articles[0].count,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.redirect("/login");
  }
});

module.exports = router;
