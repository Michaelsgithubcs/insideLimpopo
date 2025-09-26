// routes/admin.js
const express = require("express");
const router = express.Router();
const getPool = require("../../config/db");
const { isAdmin } = require("../../middlewares/auth");

// Admin dashboard
router.get("/landing", isAdmin, async (req, res) => {
  try {
    const pool = await getPool();
    const [users] = await pool.query("SELECT COUNT(*) as userCount FROM users");
    const [stories] = await pool.query("SELECT COUNT(*) as storyCount FROM stories");
    const [articles] = await pool.query("SELECT COUNT(*) as articleCount FROM articles");

    res.render("admin/landing", {
      title: "Admin Dashboard",
      stats: {
        users: users[0].userCount,
        stories: stories[0].storyCount,
        articles: articles[0].articleCount
      }
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    req.flash("error", "Error loading admin dashboard");
    res.redirect("/login");
  }
});

module.exports = router;