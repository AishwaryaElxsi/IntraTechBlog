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
    const { search, tag, author, page = 1, limit = 10 } = req.query;
    const query = {
      published: true,
    };

    if (author) {
      query.author = author;
    }
    if (search) {
      // Case-insensitive search
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } }
      ];
    }
    if (tag) {
      query.tags = { $in: [tag] };
    }

    let posts = await Post.find(query);
    // Sort by createdAt desc (newest first)
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    posts = posts.slice(skip, skip + parseInt(limit));
    // Get authors for populate
    const authorIds = Array.from(new Set(posts.map(p => p.author)));
    const userObjs = await Promise.all(authorIds.map(id => User.findById(id)));
    const userMap = {};
    userObjs.forEach(u => { if (u) userMap[u.id] = { id: u.id, name: u.name, avatar: u.avatar, email: u.email }; });

    const feed = posts.map(post => ({
      id: post._id,
      title: post.title,
      snippet: post.body.length > 250 ? post.body.substr(0, 250) + '...' : post.body,
      tags: post.tags,
      featuredImage: post.featuredImage,
      createdAt: post.createdAt,
      author: userMap[post.author] || null
    }));

    res.json({ posts: feed });
  } catch (err) {
    console.error('Feed fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

/**
 * GET /api/posts/tags
 * Returns a sorted list of all unique tags on published posts
 * Auth required (employee)
 * PUBLIC_INTERFACE
 */
router.get('/tags', requireAuth, async (req, res) => {
  try {
    // Aggregate unique tags from published posts
    const tags = await Post.aggregate([
      { $match: { published: true } },
      { $unwind: "$tags" },
      { $group: { _id: null, tagSet: { $addToSet: "$tags" } } },
      { $project: { _id: 0, tags: { $sortArray: { input: "$tagSet", sortBy: 1 } } } }
    ]);
    res.json({ tags: tags.length ? tags[0].tags : [] });
  } catch (err) {
    console.error('Tag list error:', err);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

/**
 * GET /api/posts/:id
 * Fetch a single, published, tech-tagged post with author info.
 * PUBLIC_INTERFACE
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    // Define a set of "tech" tags for enforcement
    const TECH_TAGS = [
      "tech", "engineering", "development", "dev", "software", "backend", "frontend", "cloud", "security", "code", "architecture"
    ];
    // Find the post, ensuring published and at least one "tech" tag
    const post = await Post.findOne({
      _id: id,
      published: true,
      tags: { $in: TECH_TAGS }
    });
    if (!post) return res.status(404).json({ error: "Post not found or not a tech blog." });

    const authorObj = post.author ? await User.findById(post.author) : null;
    // Prepare full post info
    res.json({
      id: post._id,
      title: post.title,
      body: post.body,
      tags: post.tags,
      featuredImage: post.featuredImage,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: (authorObj ? {
        id: authorObj.id, name: authorObj.name, avatar: authorObj.avatar, email: authorObj.email, role: authorObj.role
      } : null),
      likes: post.likes || [],
      reactions: post.reactions || [],
      published: post.published
    });
  } catch (err) {
    console.error("Single post fetch error:", err);
    res.status(500).json({ error: "Failed to fetch post." });
  }
});

/**
 * POST /api/posts/:id/clap
 * Toggle clap/like on a tech-only post by authenticated user.
 * PUBLIC_INTERFACE
 */
router.post('/:id/clap', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const TECH_TAGS = [
      "tech", "engineering", "development", "dev", "software", "backend", "frontend", "cloud", "security", "code", "architecture"
    ];
    let post = await Post.findOne({
      _id: id,
      published: true,
      tags: { $in: TECH_TAGS }
    });
    if (!post) return res.status(404).json({ error: "Post not found or not a tech blog." });

    // Toggle the like: if not liked, add, else remove
    const idx = post.likes.map(l => l.toString()).indexOf(userId);
    if (idx === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(idx, 1);
    }
    await post.save();
    res.json({ likes: post.likes.length, liked: idx === -1 });
  } catch (err) {
    console.error("Clap error:", err);
    res.status(500).json({ error: "Failed to clap/unclap." });
  }
});

/**
 * POST /api/posts/:id/bookmark
 * Toggle bookmark on a tech-only post by authenticated user.
 * PUBLIC_INTERFACE
 */
router.post('/:id/bookmark', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const TECH_TAGS = [
      "tech", "engineering", "development", "dev", "software", "backend", "frontend", "cloud", "security", "code", "architecture"
    ];
    let post = await Post.findOne({
      _id: id,
      published: true,
      tags: { $in: TECH_TAGS }
    });
    if (!post) return res.status(404).json({ error: "Post not found or not a tech blog." });

    // We'll store bookmarks on the user (preferred for scalability), but as a placeholder, add a reactions "bookmark" type in post
    const existing = (post.reactions || []).find(
      r => r.user && r.user.toString() === userId && r.type === "bookmark"
    );
    if (!existing) {
      post.reactions.push({ user: userId, type: "bookmark" });
    } else {
      // Remove
      post.reactions = post.reactions.filter(
        r => !(r.user && r.user.toString() === userId && r.type === "bookmark")
      );
    }
    await post.save();
    // Count bookmarks
    const count = (post.reactions || []).filter(r => r.type === "bookmark").length;
    res.json({ bookmarks: count, bookmarked: !existing });
  } catch (err) {
    console.error("Bookmark error:", err);
    res.status(500).json({ error: "Failed to bookmark/unbookmark." });
  }
});

// Leave the create post endpoint stub
router.post('/', requireAuth, (req, res) => {
  res.send('Create post endpoint');
});

export default router;
