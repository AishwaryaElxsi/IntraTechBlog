import express from 'express';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-super-secret';

// JWT authentication middleware (same logic as in post.js/comment.js)
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

// PUBLIC_INTERFACE
// User management endpoints
router.get('/', async (req, res) => {
  // TODO: List users (admin only)
  res.send('List users endpoint');
});

// PUBLIC_INTERFACE
// Get the current user's profile (private)
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        followers: user.followers ? user.followers.length : 0,
        following: user.following ? user.following.length : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load profile" });
  }
});

// PUBLIC_INTERFACE
// Follow another employee (by user id)
router.post('/:id/follow', requireAuth, async (req, res) => {
  const toFollowId = req.params.id;
  const myId = req.user.id;

  if (toFollowId === myId)
    return res.status(400).json({ error: "Cannot follow yourself" });

  try {
    const me = await User.findById(myId);
    const toFollow = await User.findById(toFollowId);
    if (!me || !toFollow)
      return res.status(404).json({ error: "User not found" });

    let followedNow = false;
    if (!me.following.includes(toFollowId)) {
      me.following.push(toFollowId);
      await User.saveUser(me);
      followedNow = true;
    }
    if (!toFollow.followers.includes(myId)) {
      toFollow.followers.push(myId);
      await User.saveUser(toFollow);
      followedNow = true;
    }
    // Create notification for followed user if just followed
    if (followedNow) {
      const notif = new Notification({
        sender: myId,
        recipient: toFollowId,
        type: 'new_follower',
        message: 'You have a new follower!',
        unread: true,
        createdAt: new Date()
      });
      await notif.save();
    }
    res.json({ success: true, message: 'Followed', myFollowing: me.following.length, theirFollowers: toFollow.followers.length });
  } catch(e) {
    res.status(500).json({ error: "Failed to follow" });
  }
});

// PUBLIC_INTERFACE
// Unfollow another employee (by user id)
router.post('/:id/unfollow', requireAuth, async (req, res) => {
  const toUnfollowId = req.params.id;
  const myId = req.user.id;

  if (toUnfollowId === myId)
    return res.status(400).json({ error: "Cannot unfollow yourself" });

  try {
    const me = await User.findById(myId);
    const toUnfollow = await User.findById(toUnfollowId);
    if (!me || !toUnfollow)
      return res.status(404).json({ error: "User not found" });

    me.following = me.following.filter(fid => fid.toString() !== toUnfollowId);
    await User.saveUser(me);

    toUnfollow.followers = toUnfollow.followers.filter(fid => fid.toString() !== myId);
    await User.saveUser(toUnfollow);

    res.json({ success: true, message: 'Unfollowed', myFollowing: me.following.length, theirFollowers: toUnfollow.followers.length });
  } catch (e) {
    res.status(500).json({ error: "Failed to unfollow" });
  }
});

// PUBLIC_INTERFACE
// Get followers of a user (by user id)
router.get('/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Populate followers
    const allUsers = await User.getAll();
    const followerObjs = user.followers.map(fid =>
      allUsers.find(u => u.id === fid)
    ).filter(Boolean);

    res.json({ 
      count: followerObjs.length,
      followers: followerObjs.map(u => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        email: u.email
      }))
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to load followers" });
  }
});

// PUBLIC_INTERFACE
// Get users this user is following (by user id)
router.get('/:id/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Populate following
    const allUsers = await User.getAll();
    const followingObjs = user.following.map(fid =>
      allUsers.find(u => u.id === fid)
    ).filter(Boolean);

    res.json({ 
      count: followingObjs.length,
      following: followingObjs.map(u => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        email: u.email
      }))
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to load following" });
  }
});

export default router;
