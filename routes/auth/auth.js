const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
// const bcrypt = require("bcrypt");
const argon2 = require("argon2");
const { isNotAuthenticated, isAuthenticated } = require("../../middlewares/auth");

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
  const { username, password } = req.body;

  try {
    // 1. Find user by username or email
    const [users] = await pool.query(
      "SELECT username, email, password, role FROM users WHERE username = ? OR email = ?",
      [username, username]
    );

    if (users.length === 0) {
      req.flash("error", "Invalid username or password");
      return res.redirect("/login");
    }

    const user = users[0];

    // 2. Compare hashed password
    // Verify password using argon2 helps with password
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return res.render("login", { 
        title: "Login", 
        error: "Incorrect email or password" 
      });
          }

    // 3. Create and save session
    req.session.regenerate((err) => {
      if (err) throw err;

      req.session.username = user.username;
      req.session.email = user.email;
      req.session.role = user.role;

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
  const { email, username, password, repeat_password } = req.body;

  try { 
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

    await pool.query(
      "INSERT INTO users (email, username, password) VALUES (?, ?, ?)",
      [email, username, hashedPassword]
    );

    // Auto-login after registration
    req.session.regenerate((err) => {
      if (err) throw err;

      req.session.username = username;
      req.session.email = email;
      req.session.role = "user";

      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.redirect("/login");
        }
        res.redirect("/landing");
      });
    });
  } catch (err) {
    console.error("Registration error:", err);
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
