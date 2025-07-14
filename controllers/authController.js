const bcrypt = require("bcrypt");
const { pool } = require("../config/db");
// const { generateToken } = require("../middlewares/auth");

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
};
