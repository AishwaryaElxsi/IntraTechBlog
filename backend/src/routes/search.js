import express from 'express';
const router = express.Router();

// PUBLIC_INTERFACE
// Search endpoints
router.get('/', (req, res) => {
  // TODO: Search posts
  res.send('Search endpoint');
});

export default router;
