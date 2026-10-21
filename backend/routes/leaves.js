import express from 'express';
import Leave from '../models/Leave.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { wrap } from '../utils/wrap.js';

const router = express.Router();
router.use(protect);

// Apply for leave (any logged-in user)
router.post(
  '/',
  wrap(async (req, res) => {
    const { type, fromDate, toDate, reason } = req.body;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (isNaN(from) || isNaN(to) || to < from) {
      return res.status(400).json({ message: 'Please provide valid from/to dates' });
    }
        let days = 0;
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const day = d.getDay(); // 0 = Sunday, 6 = Saturday
      if (day !== 0 && day !== 6) days++;
    }
    if (days === 0) {
      return res
        .status(400)
        .json({ message: 'Selected dates only contain weekends, no leave needed' });
    }
        const overlap = await Leave.findOne({
      employee: req.user._id,
      status: { $in: ['Pending', 'Approved'] },
      fromDate: { $lte: to },
      toDate: { $gte: from },
    });
    if (overlap) {
      return res
        .status(400)
        .json({ message: 'You already have a leave request overlapping these dates' });
    }
    const leave = await Leave.create({
      employee: req.user._id,
      type,
      fromDate: from,
      toDate: to,
      days,
      reason,
    });
    res.status(201).json(leave);
  })
);

// My own leaves
router.get(
  '/mine',
  wrap(async (req, res) => {
    const leaves = await Leave.find({ employee: req.user._id })
      .populate('reviewedBy', 'name')
      .sort('-createdAt');
    res.json(leaves);
  })
);

// HR: all leaves | Manager: team leaves
router.get(
  '/',
  authorize('hr', 'manager'),
  wrap(async (req, res) => {
    const filter = {};
    if (req.user.role === 'manager') {
      filter.employee = { $in: await User.find({ manager: req.user._id }).distinct('_id') };
    }
    if (req.query.status) filter.status = req.query.status;
    const leaves = await Leave.find(filter)
      .populate('employee', 'name department leaveBalance')
      .sort('-createdAt');
    res.json(leaves);
  })
);

// Approve / reject
router.put(
  '/:id/status',
  authorize('hr', 'manager'),
  wrap(async (req, res) => {
    const { status, reviewComment } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Approved or Rejected' });
    }
    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: 'This request was already reviewed' });
    }
    if (String(leave.employee._id) === String(req.user._id)) {
      return res.status(403).json({ message: 'You cannot review your own leave' });
    }
    if (req.user.role === 'manager' && String(leave.employee.manager) !== String(req.user._id)) {
      return res.status(403).json({ message: 'This employee is not in your team' });
    }
    if (status === 'Approved' && leave.type !== 'Unpaid') {
      if (leave.employee.leaveBalance < leave.days) {
        return res.status(400).json({ message: 'Not enough leave balance' });
      }
      await User.updateOne({ _id: leave.employee._id }, { $inc: { leaveBalance: -leave.days } });
    }
    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewComment = reviewComment;
    await leave.save();
    res.json(leave);
  })
);

export default router;
