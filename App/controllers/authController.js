const argon2 = require('argon2');
const { pool } = require("../config/db"); 
// const { generateToken } = require("../middlewares/auth");
const User = require('../models/User');

module.exports = {
  // Render login page
  getLogin: (req, res) => {
    res.render("login", {
      title: "Login",
      error: req.flash("error"),
      success: req.flash("success"),
    });
  },

  // Render the registration page
  getRegister: (req, res) => {
    res.render("register", {
      title: "Register",
      error: req.flash("error"),
    });
  },

  // Handle the logout
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

  // Forgot password later
  // forgotPassword: async (req, res) => {

  // }

  register: async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
      const hashedPassword = await argon2.hash(password);
      await User.create({ username, email, password: hashedPassword, role });
      res.redirect('/login');
    } catch (error) {
      console.error(error);
      res.render('auth/register', { title: 'Register', error: 'Error creating user' });
    }
  },
};
