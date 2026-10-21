import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const links = [
    ['/', 'Dashboard'],
    ...(user.role !== 'employee' ? [['/employees', user.role === 'hr' ? 'Employees' : 'My Team']] : []),
    ['/attendance', 'Attendance'],
    ['/leaves', 'Leaves'],
    ['/announcements', 'Announcements'],
    ['/training', 'Training'],
    ['/profile', 'Profile'],
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <span className="navbar-brand fw-bold">StaffSync</span>
        <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#nav">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav me-auto">
            {links.map(([to, label]) => (
              <li className="nav-item" key={to}>
                <NavLink end={to === '/'} to={to} className="nav-link">
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
          <span className="text-white me-3 small">
            {user.name} <span className="badge bg-light text-primary text-uppercase">{user.role}</span>
          </span>
          <button
            className="btn btn-outline-light btn-sm"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
