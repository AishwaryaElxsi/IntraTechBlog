import express from 'express';
const router = express.Router();

// PUBLIC_INTERFACE
// Admin endpoints (moderation, analytics)
router.get('/dashboard', (req, res) => {
  // TODO: Analytics dashboard
  res.send('Admin dashboard endpoint');
});

export default router;
