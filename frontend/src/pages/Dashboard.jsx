import { useEffect, useState } from 'react';
import api, { fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';

const Card = ({ label, value, color }) => (
  <div className="col-md-4 mb-3">
    <div className={`card text-white bg-${color} shadow-sm`}>
      <div className="card-body">
        <div className="small text-uppercase">{label}</div>
        <div className="display-6">{value ?? '-'}</div>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [news, setNews] = useState([]);

  useEffect(() => {
    api.get('/dashboard').then((r) => setStats(r.data));
    api.get('/announcements').then((r) => setNews(r.data.slice(0, 3)));
  }, []);

  return (
    <>
      <h4 className="mb-3">Welcome, {user.name}</h4>
      <div className="row">
        {user.role === 'employee' ? (
          <>
            <Card label="Leave balance (days)" value={stats.leaveBalance} color="primary" />
            <Card label="Pending leave requests" value={stats.pendingLeaves} color="warning" />
            <Card label="Days present this month" value={stats.presentDaysThisMonth} color="success" />
          </>
        ) : (
          <>
            <Card label={user.role === 'hr' ? 'Total employees' : 'Team size'} value={stats.totalEmployees} color="primary" />
            <Card label="Pending leave requests" value={stats.pendingLeaves} color="warning" />
            <Card label="Present today" value={stats.presentToday} color="success" />
          </>
        )}
      </div>

      <h5 className="mt-3">Latest announcements</h5>
      {news.length === 0 && <p className="text-muted">No announcements yet.</p>}
      {news.map((a) => (
        <div className="card mb-2" key={a._id}>
          <div className="card-body py-2">
            <b>{a.title}</b> <span className="text-muted small">- {fmtDate(a.createdAt)}</span>
            <div>{a.message}</div>
          </div>
        </div>
      ))}
    </>
  );
}
