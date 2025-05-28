import express from 'express';
const router = express.Router();

// PUBLIC_INTERFACE
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-super-secret';

// Auth middleware for comments
function requireAuth(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// GET /api/comments?post=POST_ID
// List all comments for a post, oldest first.
router.get('/', async (req, res) => {
  try {
    const { post } = req.query;
    if (!post) return res.status(400).json({ error: "Missing post id" });
    // Fetch and populate author
    const comments = await Comment.find({ post })
      .sort({ createdAt: 1 })
      .populate('author', 'name avatar email');
    res.json({
      comments: comments.map(c => ({
        id: c._id,
        body: c.body,
        createdAt: c.createdAt,
        author: c.author,
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// POST /api/comments
// Add a new comment to a post
router.post('/', requireAuth, async (req, res) => {
  try {
    const { post, body } = req.body;
    if (!post || !body || !body.trim()) {
      return res.status(400).json({ error: "Invalid data" });
    }
    // Ensure post exists and published
    const TECH_TAGS = [
      "tech", "engineering", "development", "dev", "software", "backend", "frontend", "cloud", "security", "code", "architecture"
    ];
    const postDoc = await Post.findOne({ _id: post, published: true, tags: { $in: TECH_TAGS } });
    if (!postDoc) return res.status(404).json({ error: "Post not found or not a tech blog." });
    // Create comment
    const comment = new Comment({
      post,
      author: req.user.id,
      body,
    });
    await comment.save();
    await comment.populate('author', 'name avatar email');
    res.status(201).json({
      id: comment._id,
      body: comment.body,
      createdAt: comment.createdAt,
      author: comment.author,
    });
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

export default router;
