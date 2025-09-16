// routes/api/comments.js
const express = require('express');
const router = express.Router();
const Comment = require('../../models/Comment');

// POST - Create a new comment or reply
router.post('/comments', async (req, res) => {
  try {
    const { article_id, parent_comment_id, name, email, comment } = req.body;

    // Validation
    if (!article_id || !name || !email || !comment) {
      return res.status(400).json({ 
        error: 'Missing required fields: article_id, name, email, and comment are required' 
      });
    }

    // Validate article_id is a number
    const articleId = parseInt(article_id, 10);
    if (isNaN(articleId)) {
      return res.status(400).json({ error: 'Invalid article_id' });
    }

    // Validate parent_comment_id if provided
    let parentCommentId = null;
    if (parent_comment_id) {
      parentCommentId = parseInt(parent_comment_id, 10);
      if (isNaN(parentCommentId)) {
        return res.status(400).json({ error: 'Invalid parent_comment_id' });
      }
      
      // Verify parent comment exists and belongs to the same article
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(400).json({ error: 'Parent comment not found' });
      }
      if (parentComment.article_id !== articleId) {
        return res.status(400).json({ error: 'Parent comment does not belong to this article' });
      }
      
      // Prevent replies to replies (keep it simple - only 1 level deep)
      if (parentComment.parent_comment_id !== null) {
        return res.status(400).json({ error: 'Cannot reply to a reply. Please reply to the original comment.' });
      }
    }

    // Validate name length (max 255 characters)
    if (name.trim().length > 255 || name.trim().length < 1) {
      return res.status(400).json({ error: 'Name must be between 1 and 255 characters' });
    }

    // Validate email format and length
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    if (email.trim().length > 255) {
      return res.status(400).json({ error: 'Email must be 255 characters or less' });
    }

    // Validate comment length (max 1000 characters, min 1)
    if (comment.trim().length > 1000 || comment.trim().length < 1) {
      return res.status(400).json({ error: 'Comment must be between 1 and 1000 characters' });
    }

    // Basic content filtering (optional - you can expand this)
    const sanitizedName = name.trim();
    const sanitizedEmail = email.trim();
    const sanitizedComment = comment.trim();

    // Create the comment or reply
    const commentId = await Comment.create({
      article_id: articleId,
      parent_comment_id: parentCommentId,
      name: sanitizedName,
      email: sanitizedEmail,
      comment: sanitizedComment
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment_id: commentId
    });

  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to add comment. Please try again.' });
  }
});

// GET - Get all comments for a specific article
router.get('/comments/:article_id', async (req, res) => {
  try {
    const { article_id } = req.params;

    // Validate article_id is a number
    const articleId = parseInt(article_id, 10);
    if (isNaN(articleId)) {
      return res.status(400).json({ error: 'Invalid article_id' });
    }

    // Get comments for the article
    const comments = await Comment.findByArticleId(articleId);
    const commentCount = await Comment.getCountByArticleId(articleId);

    res.json({
      success: true,
      comments,
      count: commentCount
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// DELETE - Delete a comment (for moderation)
router.delete('/comments/:comment_id', async (req, res) => {
  try {
    const { comment_id } = req.params;

    // Validate comment_id is a number
    const commentId = parseInt(comment_id, 10);
    if (isNaN(commentId)) {
      return res.status(400).json({ error: 'Invalid comment_id' });
    }

    // Check if comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Delete the comment
    await Comment.delete(commentId);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;