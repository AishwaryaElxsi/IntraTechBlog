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
    // File-based: oldest first and fake author populate
    let comments = await Comment.find({ post, $sortByCreatedAtAsc: true });
    // "populate" author field
    const authorIds = Array.from(new Set(comments.map(c => c.author)));
    const users = await Promise.all(authorIds.map(id => User.findById(id)));
    const userMap = {};
    users.forEach(u => { if (u) userMap[u.id] = { id: u.id, name: u.name, avatar: u.avatar, email: u.email }; });

    res.json({
      comments: comments.map(c => ({
        id: c._id,
        body: c.body,
        createdAt: c.createdAt,
        author: userMap[c.author] || null,
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

/* POST /api/comments
   Add a new comment to a post */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { post, body } = req.body;
    if (!post || !body || !body.trim()) {
      return res.status(400).json({ error: "Invalid data" });
    }
    // Ensure post exists and published + tech tag
    const TECH_TAGS = [
      "tech", "engineering", "development", "dev", "software", "backend", "frontend", "cloud", "security", "code", "architecture"
    ];
    const postDoc = await Post.findOne({ _id: post, published: true, tags: { $in: TECH_TAGS } });
    if (!postDoc) return res.status(404).json({ error: "Post not found or not a tech blog." });
    // Create and save comment
    const comment = new Comment({
      post,
      author: req.user.id,
      body,
    });
    await comment.save();
    // Simulate author "populate"
    const authorObj = await User.findById(comment.author);

    res.status(201).json({
      id: comment._id,
      body: comment.body,
      createdAt: comment.createdAt,
      author: (authorObj ? { id: authorObj.id, name: authorObj.name, avatar: authorObj.avatar, email: authorObj.email } : null),
    });
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

export default router;
