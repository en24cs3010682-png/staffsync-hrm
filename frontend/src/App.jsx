import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Announcements from './pages/Announcements';
import Training from './pages/Training';
import Profile from './pages/Profile';

const guard = (el, roles) => <ProtectedRoute roles={roles}>{el}</ProtectedRoute>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="container py-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={guard(<Dashboard />)} />
            <Route path="/employees" element={guard(<Employees />, ['hr', 'manager'])} />
            <Route path="/attendance" element={guard(<Attendance />)} />
            <Route path="/leaves" element={guard(<Leaves />)} />
            <Route path="/announcements" element={guard(<Announcements />)} />
            <Route path="/training" element={guard(<Training />)} />
            <Route path="/profile" element={guard(<Profile />)} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
