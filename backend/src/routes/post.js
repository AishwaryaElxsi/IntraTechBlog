import express from 'express';
const router = express.Router();

// PUBLIC_INTERFACE
// Post management endpoints
router.get('/', (req, res) => {
  // TODO: List posts
  res.send('List posts endpoint');
});

router.post('/', (req, res) => {
  // TODO: Create post
  res.send('Create post endpoint');
});

export default router;
