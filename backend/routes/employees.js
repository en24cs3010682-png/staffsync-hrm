import express from 'express';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { wrap } from '../utils/wrap.js';

const router = express.Router();
router.use(protect);

const FIELDS = ['name', 'email', 'password', 'role', 'department', 'designation', 'phone', 'manager', 'leaveBalance', 'joinDate'];

// HR: all employees | Manager: own team
router.get(
  '/',
  authorize('hr', 'manager'),
  wrap(async (req, res) => {
    const filter = req.user.role === 'manager' ? { manager: req.user._id } : {};
    const users = await User.find(filter).select('-password').populate('manager', 'name').sort('name');
    res.json(users);
  })
);

// HR: add employee
router.post(
  '/',
  authorize('hr'),
  wrap(async (req, res) => {
    const data = {};
    FIELDS.forEach((f) => {
      if (req.body[f] !== undefined && req.body[f] !== '') data[f] = req.body[f];
    });
    const user = await User.create(data);
    const safe = user.toObject();
    delete safe.password;
    res.status(201).json(safe);
  })
);

// HR: update employee
router.put(
  '/:id',
  authorize('hr'),
  wrap(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Employee not found' });
    FIELDS.forEach((f) => {
      if (req.body[f] === undefined) return;
      if (f === 'password' && req.body[f] === '') return;
      user[f] = req.body[f] === '' ? undefined : req.body[f];
    });
    await user.save();
    const safe = user.toObject();
    delete safe.password;
    res.json(safe);
  })
);

// HR: delete employee
router.delete(
  '/:id',
  authorize('hr'),
  wrap(async (req, res) => {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Employee not found' });
        await User.updateMany({ manager: user._id }, { $unset: { manager: 1 } });
    res.json({ message: 'Employee deleted' });
  })
);

export default router;
