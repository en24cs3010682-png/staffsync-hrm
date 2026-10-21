import express from 'express';
import Announcement from '../models/Announcement.js';
import { protect, authorize } from '../middleware/auth.js';
import { wrap } from '../utils/wrap.js';

const router = express.Router();
router.use(protect);

router.get(
  '/',
  wrap(async (req, res) => {
    res.json(await Announcement.find().populate('createdBy', 'name').sort('-createdAt'));
  })
);

router.post(
  '/',
  authorize('hr'),
  wrap(async (req, res) => {
    const { title, message } = req.body;
    const a = await Announcement.create({ title, message, createdBy: req.user._id });
    res.status(201).json(a);
  })
);

router.delete(
  '/:id',
  authorize('hr'),
  wrap(async (req, res) => {
    const a = await Announcement.findByIdAndDelete(req.params.id);
    if (!a) return res.status(404).json({ message: 'Announcement not found' });
    res.json({ message: 'Announcement deleted' });
  })
);

export default router;
