import express from 'express';
import jwt from 'jsonwebtoken';
import Post from '../models/Post.js';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme-super-secret';


// JWT authentication middleware
// PUBLIC_INTERFACE
function requireAuth(req, res, next) {
  // Accept token either from Authorization: Bearer or cookie
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

// PUBLIC_INTERFACE
// GET /api/posts
// Returns feed of latest published tech articles, supports ?search=, ?tag=, ?page=, ?limit=
// Auth required
router.get('/', requireAuth, async (req, res) => {
  try {
    const { search, tag, page = 1, limit = 10 } = req.query;
    const query = {
      published: true,
      // Only posts tagged with at least one tech-related tag, if company has a "tech only" restriction
      // Optionally filter only tech blogs, otherwise all published
    };

    if (search) {
      // Case-insensitive search in title and body
      query.$or = [
        { title:   { $regex: search, $options: 'i' } },
        { body:    { $regex: search, $options: 'i' } }
      ];
    }
    if (tag) {
      query.tags = { $in: [tag] };
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'name avatar email');

    const feed = posts.map(post => ({
      id: post._id,
      title: post.title,
      snippet: post.body.length > 250 ? post.body.substr(0, 250) + '...' : post.body,
      tags: post.tags,
      featuredImage: post.featuredImage,
      createdAt: post.createdAt,
      author: {
        id: post.author?._id,
        name: post.author?.name,
        avatar: post.author?.avatar,
        email: post.author?.email
      }
    }));

    res.json({ posts: feed });
  } catch (err) {
    console.error('Feed fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});


// Leave the create post endpoint stub
router.post('/', requireAuth, (req, res) => {
  res.send('Create post endpoint');
});

export default router;
