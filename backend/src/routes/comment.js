import express from 'express';
const router = express.Router();

// PUBLIC_INTERFACE
// Comment endpoints
router.post('/', (req, res) => {
  // TODO: Add comment
  res.send('Add comment endpoint');
});

export default router;
