const express = require('express');
const router = express.Router();
const { sendCustomEmails } = require('../../services/emailService');  
const landingController = require('../../controllers/landingController');
const podcastController= require('../../controllers/podcastController');
const { isAuthenticated ,isAdmin} = require('../../middlewares/auth');
const getPool = require('../../config/db');
const { format } = require('date-fns'); // ✅ Make sure date-fns is installed


// Consolidated landing(dashboard) route
router.get(["/landing", "/dashboard"], isAuthenticated, async (req, res) => {
  try {
    const pool = await getPool();

    // 1. Fetch user info (count stories, articles, podcasts separately)
    const [results] = await pool.query(
      `SELECT 
        u.id, u.username, u.email, u.role, u.first_name, u.last_name, u.created_at,
        (SELECT COUNT(*) FROM stories s WHERE s.author_id = u.id) AS storyCount,
        (SELECT COUNT(*) FROM articles a WHERE a.author_id = u.id) AS articleCount,
        (SELECT COUNT(*) FROM podcasts p WHERE p.author_id = u.id) AS podcastCount
      FROM users u
      WHERE u.email = ?`,
      [req.session.email]
    );

    if (results.length === 0) {
      req.flash("error", "User not found");
      return res.redirect("/login");
    }

    const userData = results[0];

    // 2. Fetch categories
    const [categories] = await pool.query("SELECT category_id, name FROM categories");

    // 3. Fetch recent articles
    const [recentArticles] = await pool.query(
      `SELECT a.*, c.name as category_name 
       FROM articles a 
       LEFT JOIN categories c ON a.category_id = c.category_id 
       ORDER BY a.created_at DESC 
       LIMIT 20`
    );

    const formattedArticles = recentArticles.map(article => ({
      ...article,
      formatted_date: format(new Date(article.created_at), "MMM d, yyyy HH:mm"),
      excerpt: article.content.substring(0, 150) + "..."
    }));

    // 4. Fetch recent users (with article + podcast counts)
    const [recentUsers] = await pool.query(
      `SELECT u.id, u.username, u.email, u.role, u.created_at,
              (SELECT COUNT(*) FROM articles a WHERE a.author_id = u.id) AS articleCount,
              (SELECT COUNT(*) FROM podcasts p WHERE p.author_id = u.id) AS podcastCount
       FROM users u
       ORDER BY u.created_at DESC
       LIMIT 20`
    );

    const formattedUsers = recentUsers.map(u => ({
      ...u,
      joined: format(new Date(u.created_at), "MMM d, yyyy")
    }));

    // 5. Render page
    res.render("admin/landing", {
      title: "Dashboard",
      user: {
        username: userData.username,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        avatar: userData.avatar || "/images/default-avatar.jpg",
        storyCount: userData.storyCount || 0,
        articleCount: userData.articleCount || 0,
        podcastCount: userData.podcastCount || 0,
        role: userData.role,
        joinDate: userData.created_at
      },
      currentUrl: req.originalUrl,
      categories,
      recentArticles: formattedArticles,
      recentUsers: formattedUsers
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    req.flash("error", "Error loading dashboard");
    res.redirect("/login");
  }
});
router.post("/send-custom-email", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query("SELECT email FROM newsletter_subscribers");

    // Extract only valid email strings
    const subscribers = rows
      .map(r => r.email)
      .filter(email => typeof email === "string" && email.includes("@"));

    if (subscribers.length === 0) {
      console.warn("⚠️ No valid subscribers found.");
      return res.status(400).json({
        success: false,
        message: "No subscribers found to send emails."
      });
    }

    // ✅ send emails
    await sendCustomEmails(subscribers, req.body.subject, req.body.message);

    return res.json({
      success: true,
      message: `✅ Emails sent to ${subscribers.length} subscriber(s)`
    });

  } catch (err) {
    console.error("Custom email error:", err);
    return res.status(500).json({
      success: false,
      message: "❌ Failed to send custom emails"
    });
  }
});


// Profile routes
router.get('/profile', isAuthenticated, landingController.getProfile);
router.post('/profile', isAuthenticated, landingController.updateProfile);
router.post('/change-password', isAuthenticated, landingController.changePassword);

module.exports = router;
