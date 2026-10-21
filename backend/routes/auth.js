import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { wrap } from '../utils/wrap.js';

const router = express.Router();

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/login
router.post(
  '/login',
  wrap(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const safe = user.toObject();
    delete safe.password;
    res.json({ token: sign(user._id), user: safe });
  })
);

// GET /api/auth/me
router.get(
  '/me',
  protect,
  wrap(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password').populate('manager', 'name email');
    res.json(user);
  })
);

// PUT /api/auth/profile  (self-service: phone only)
router.put(
  '/profile',
  protect,
  wrap(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    await user.save();
    const safe = user.toObject();
    delete safe.password;
    res.json(safe);
  })
);

// PUT /api/auth/change-password
router.put(
  '/change-password',
  protect,
  wrap(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword || ''))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  })
);

export default router;
