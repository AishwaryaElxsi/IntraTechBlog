import express from 'express';
const router = express.Router();

// PUBLIC_INTERFACE
// User management endpoints
router.get('/', (req, res) => {
  // TODO: List users (admin only)
  res.send('List users endpoint');
});

router.get('/profile', (req, res) => {
  // TODO: Get own user profile
  res.send('User profile endpoint');
});

export default router;
