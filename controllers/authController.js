const bcrypt = require("bcrypt");
const { pool } = require("../config/db");
const { generateToken } = require("../middlewares/auth");

module.exports = {
  // Render login page
  getLogin: (req, res) => {
    res.render("/login", {
      title: "Login",
      error: req.flash("error"),
      success: req.flash("success"),
    });
  },

  // Handle login
  postLogin: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);

      if (users.length === 0) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/login");
      }

      const user = users[0];

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/login");
      }

      // Create session
      req.session.userEmail = user.email;
      req.session.user = {
        email: user.email,
        role: user.role,
      };

      // Save session before redirect
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.redirect("/login");
        }
        console.log("Session saved successfully:", req.session);
        res.redirect("/dashboard");
      });
    } catch (err) {
      console.error("Login error:", err);
      req.flash("error", "Server error during login");
      res.redirect("/login");
    }
  },

  // Render registration page
  getRegister: (req, res) => {
    res.render("/register", {
      title: "Register",
      error: req.flash("error"),
    });
  },

  // Handle registration
  postRegister: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Check if user exists
      const [existing] = await pool.query(
        "SELECT * FROM users WHERE email = ? OR username = ?",
        [email, username]
      );

      if (existing.length > 0) {
        req.flash("error", "User already exists");
        return res.redirect("/register");
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const [result] = await pool.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword]
      );

      req.flash("success", "Registration successful!");
      res.redirect("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      req.flash("error", "Registration failed");
      res.redirect("/register");
    }
  },

  // Handle logout
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.redirect("/dashboard");
      }
      res.clearCookie("connect.sid");
      res.redirect("/login");
    });
  },

  // Forgot password
  // forgotPassword: async (req, res) => {

  // }
};
