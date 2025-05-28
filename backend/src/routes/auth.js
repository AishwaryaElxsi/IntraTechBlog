import express from 'express';
const router = express.Router();

// PUBLIC_INTERFACE
// Auth and SSO routes go here
router.post('/login/sso', (req, res) => {
  // TODO: SSO login implementation
  res.send('SSO login endpoint');
});

router.post('/logout', (req, res) => {
  // TODO: Logout logic
  res.send('Logout endpoint');
});

export default router;
