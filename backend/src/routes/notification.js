import express from 'express';
import Notification from '../models/Notification.js';
import jwt from 'jsonwebtoken';
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-super-secret';

// JWT authentication middleware (duplicated in user.js, comment.js, post.js)
// PUBLIC_INTERFACE
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

/**
 * GET /api/notifications
 * Fetch all notifications for the authenticated user, newest first.
 * PUBLIC_INTERFACE
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .populate('sender', 'name avatar email');
    res.json({
      notifications: notifications.map(n => ({
        id: n._id,
        type: n.type,
        message: n.message,
        unread: n.unread,
        createdAt: n.createdAt,
        sender: n.sender ? {
          id: n.sender._id,
          name: n.sender.name,
          avatar: n.sender.avatar,
          email: n.sender.email
        } : undefined
      }))
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * PATCH or POST /api/notifications/:id/read
 * Mark a notification as read (idempotent).
 * PUBLIC_INTERFACE
 */
router.patch('/:id/read', requireAuth, async (req, res) => {
  const notifId = req.params.id;
  try {
    const notif = await Notification.findOne({ _id: notifId, recipient: req.user.id });
    if (!notif) return res.status(404).json({ error: "Notification not found" });
    if (notif.unread) {
      notif.unread = false;
      await notif.save();
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});
router.post('/:id/read', requireAuth, async (req, res) => {
  // Allow POST for clients not supporting PATCH.
  const notifId = req.params.id;
  try {
    const notif = await Notification.findOne({ _id: notifId, recipient: req.user.id });
    if (!notif) return res.status(404).json({ error: "Notification not found" });
    if (notif.unread) {
      notif.unread = false;
      await notif.save();
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// PUBLIC_INTERFACE
// Notification/email endpoints
router.post('/email', (req, res) => {
  // TODO: Send notification email
  res.send('Email notification endpoint');
});

export default router;
