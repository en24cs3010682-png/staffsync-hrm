import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import leaveRoutes from './routes/leaves.js';
import attendanceRoutes from './routes/attendance.js';
import announcementRoutes from './routes/announcements.js';
import trainingRoutes from './routes/trainings.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.startsWith('change_this')) {
  console.error('Set a real JWT_SECRET in backend/.env');
  process.exit(1);
}

connectDB();

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: { message: 'Too many failed login attempts. Try again in 15 minutes.' },
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Central error handler
app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Server error';
  if (err.code === 11000) {
    status = 400;
    message = 'Email already exists';
  } else if (err.name === 'ValidationError' || err.name === 'CastError') {
    status = 400;
  }
  if (status === 500) console.error(err);
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`StaffSync API running on port ${PORT}`));
