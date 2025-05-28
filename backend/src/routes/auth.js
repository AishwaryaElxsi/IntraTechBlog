import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme-super-secret'; // Production: set securely!

/**
 * Generate a JWT for an authenticated user.
 * PUBLIC_INTERFACE
 */
function generateToken(user) {
  // Payload includes id and basic info.
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// PUBLIC_INTERFACE
// POST /api/auth/register
// Register a local (non-SSO) user
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('name').not().isEmpty().withMessage('Name required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, name, password } = req.body;

    try {
      // Check if email already exists
      let user = await User.findOne({ email });
      if (user)
        return res
          .status(400)
          .json({ error: 'User with this email already exists' });

      // Create new user
      user = new User({ email, name, role: 'user' });
      await user.setPassword(password);

      // Persist user using file-based model
      await User.saveUser(user);

      // Issue JWT
      const token = generateToken(user);

      // Return user and JWT
      res.status(201).json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// PUBLIC_INTERFACE
// POST /api/auth/login
// Authenticate local (non-SSO) user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').not().isEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email, ssoId: { $exists: false } });
      if (!user || !user.passwordHash)
        return res.status(400).json({ error: 'Invalid credentials' });

      const isMatch = await user.validatePassword(password);
      if (!isMatch)
        return res.status(400).json({ error: 'Invalid credentials' });

      // Issue JWT
      const token = generateToken(user);

      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// PUBLIC_INTERFACE
// Auth and SSO routes go here

// SSO login endpoint for future organization SSO integration
router.post('/login/sso', (req, res) => {
  // TODO: SSO login implementation
  res.send('SSO login endpoint');
});

// PUBLIC_INTERFACE
// Logout endpoint (JWT on client side is just deleted)
//
// If you implement cookie-based session in future, invalidate the session here.
router.post('/logout', (req, res) => {
  // TODO: Add session/token blacklist if using stateful tokens
  res.send('Logout endpoint');
});

export default router;
