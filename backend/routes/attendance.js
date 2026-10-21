import express from 'express';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { wrap, today } from '../utils/wrap.js';

const router = express.Router();
router.use(protect);

router.post(
  '/check-in',
  wrap(async (req, res) => {
    const date = today();
    if (await Attendance.findOne({ employee: req.user._id, date })) {
      return res.status(400).json({ message: 'Already checked in today' });
    }
    const rec = await Attendance.create({
      employee: req.user._id,
      date,
      checkIn: new Date(),
      status: 'Present',
    });
    res.status(201).json(rec);
  })
);

router.post(
  '/check-out',
  wrap(async (req, res) => {
    const rec = await Attendance.findOne({ employee: req.user._id, date: today() });
    if (!rec) return res.status(400).json({ message: 'Please check in first' });
    if (rec.checkOut) return res.status(400).json({ message: 'Already checked out today' });
    rec.checkOut = new Date();
    const hours = (rec.checkOut - rec.checkIn) / 36e5;
    rec.status = hours < 4 ? 'Half Day' : 'Present';
    await rec.save();
    res.json(rec);
  })
);

router.get(
  '/mine',
  wrap(async (req, res) => {
    res.json(await Attendance.find({ employee: req.user._id }).sort('-date').limit(60));
  })
);

// HR: everyone | Manager: team  (?date=YYYY-MM-DD, default today)
router.get(
  '/',
  authorize('hr', 'manager'),
  wrap(async (req, res) => {
    const filter = { date: req.query.date || today() };
    if (req.user.role === 'manager') {
      filter.employee = { $in: await User.find({ manager: req.user._id }).distinct('_id') };
    }
    res.json(await Attendance.find(filter).populate('employee', 'name department').sort('checkIn'));
  })
);

export default router;
