import express from 'express';
const router = express.Router();

// PUBLIC_INTERFACE
// Notification/email endpoints
router.post('/email', (req, res) => {
  // TODO: Send notification email
  res.send('Email notification endpoint');
});

export default router;
