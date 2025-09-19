// routes/admin.js
const express = require("express");
const router = express.Router();
const getPool = require("../../config/db");
const { isAdmin,isAuthenticated } = require("../../middlewares/auth");
const { sendCustomEmails } = require("../../services/emailService");

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
router.post("/send-custom-email", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query("SELECT email FROM newsletter_subscribers");
    if (!rows || rows.length === 0) {
      return res.status(400).json({ success: false, message: "No subscribers found" });
    }

    await sendCustomEmails(rows.map(r => r.email), req.body.subject, req.body.message);

    return res.json({ success: true, message: `Emails sent to ${rows.length} subscriber(s)` });
  } catch (err) {
    console.error("Custom email error:", err);
    return res.status(500).json({ success: false, message: "Failed to send custom emails" });
  }
});


module.exports = router;