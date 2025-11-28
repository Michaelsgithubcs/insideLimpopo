const express = require("express");
const router = express.Router();
const podcastController = require("../../controllers/podcastController");
const { isAuthenticated, isAdmin } = require("../../middlewares/auth");
const { upload } = require("../../middlewares/uploadMiddleware");

// CREATE
router.post('/create', podcastController.createPodcast);

// READ all
router.get("/", podcastController.getAllPodcasts);

// READ one
router.get("/:id", podcastController.getPodcast);

// UPDATE
router.put("/:id", isAuthenticated, upload.single("featured_img"), podcastController.updatePodcast);

// DELETE (admin only)
router.delete("/:id", isAuthenticated, isAdmin, podcastController.deletePodcast);

// GET by category
router.get("/category/:categoryName", podcastController.getPodcastByCategory);

// Search
router.get("/search/query", podcastController.searchPodcasts);

module.exports = router;
