import express from 'express';
import User from '../models/User.js';
import Leave from '../models/Leave.js';
import Attendance from '../models/Attendance.js';
import { protect } from '../middleware/auth.js';
import { wrap, today } from '../utils/wrap.js';

const router = express.Router();
router.use(protect);

router.get(
  '/',
  wrap(async (req, res) => {
    const { role, _id } = req.user;
    const date = today();

    if (role === 'employee') {
      const month = date.slice(0, 7);
      const [pending, presentDays] = await Promise.all([
        Leave.countDocuments({ employee: _id, status: 'Pending' }),
        Attendance.countDocuments({ employee: _id, date: new RegExp(`^${month}`) }),
      ]);
      return res.json({ role, leaveBalance: req.user.leaveBalance, pendingLeaves: pending, presentDaysThisMonth: presentDays });
    }

    const teamIds = role === 'manager' ? await User.find({ manager: _id }).distinct('_id') : null;
    const empFilter = teamIds ? { _id: { $in: teamIds } } : {};
    const scoped = teamIds ? { $in: teamIds } : { $exists: true };

    const [total, pending, presentToday] = await Promise.all([
      User.countDocuments(empFilter),
      Leave.countDocuments({ status: 'Pending', employee: scoped, ...(role === 'hr' ? {} : {}) }),
      Attendance.countDocuments({ date, employee: scoped }),
    ]);
    res.json({ role, totalEmployees: total, pendingLeaves: pending, presentToday });
  })
);

export default router;
