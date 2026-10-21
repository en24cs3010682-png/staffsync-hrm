import express from 'express';
import Training from '../models/Training.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { wrap } from '../utils/wrap.js';

const router = express.Router();
router.use(protect);

// HR: all | Manager: created by me | Employee: where I am a participant
router.get(
  '/',
  wrap(async (req, res) => {
    let filter = {};
    if (req.user.role === 'manager') filter = { createdBy: req.user._id };
    if (req.user.role === 'employee') filter = { participants: req.user._id };
    const list = await Training.find(filter)
      .populate('participants', 'name')
      .populate('createdBy', 'name')
      .sort('-startDate');
    res.json(list);
  })
);

router.post(
  '/',
  authorize('hr', 'manager'),
  wrap(async (req, res) => {
    const { title, description, startDate, endDate } = req.body;
    let participants = req.body.participants || [];
    if (req.user.role === 'manager') {
      // managers can only enrol their own team members
      participants = await User.find({ _id: { $in: participants }, manager: req.user._id }).distinct('_id');
    }
    const t = await Training.create({
      title,
      description,
      startDate,
      endDate,
      participants,
      createdBy: req.user._id,
    });
    res.status(201).json(t);
  })
);

router.delete(
  '/:id',
  authorize('hr', 'manager'),
  wrap(async (req, res) => {
    const t = await Training.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Training not found' });
    if (req.user.role !== 'hr' && String(t.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can delete only your own programs' });
    }
    await t.deleteOne();
    res.json({ message: 'Training deleted' });
  })
);

export default router;
