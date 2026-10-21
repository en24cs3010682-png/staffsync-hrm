// Run: npm run seed   (clears the DB and adds demo data)
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Leave from './models/Leave.js';
import Attendance from './models/Attendance.js';
import Announcement from './models/Announcement.js';
import Training from './models/Training.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User, Leave, Attendance, Announcement, Training].map((m) => m.deleteMany({})));

  const hr = await User.create({ name: 'Anita HR', email: 'hr@staffsync.com', password: 'hr1234', role: 'hr', department: 'Human Resources', designation: 'HR Head' });
  const mgr = await User.create({ name: 'Rahul Manager', email: 'manager@staffsync.com', password: 'manager1234', role: 'manager', department: 'Engineering', designation: 'Engineering Manager' });
  await User.create({ name: 'Neha Employee', email: 'employee@staffsync.com', password: 'emp1234', role: 'employee', department: 'Engineering', designation: 'Software Developer', manager: mgr._id });
  await User.create({ name: 'Amit Employee', email: 'amit@staffsync.com', password: 'emp1234', role: 'employee', department: 'Engineering', designation: 'QA Engineer', manager: mgr._id });

  await Announcement.create({ title: 'Welcome to StaffSync', message: 'Mark attendance daily and apply for leaves from the Leaves page.', createdBy: hr._id });

  console.log('Seed done. Logins:');
  console.log('  hr@staffsync.com / hr1234');
  console.log('  manager@staffsync.com / manager1234');
  console.log('  employee@staffsync.com / emp1234');
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
