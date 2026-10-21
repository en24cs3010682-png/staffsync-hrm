import { useEffect, useState } from 'react';
import api, { errMsg, fmtTime } from '../api';
import { useAuth } from '../context/AuthContext';

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Attendance() {
  const { user } = useAuth();
  const canView = user.role !== 'employee';
  const [mine, setMine] = useState([]);
  const [team, setTeam] = useState([]);
  const [date, setDate] = useState(todayStr());
  const [msg, setMsg] = useState({ type: '', text: '' });

  const loadMine = () => api.get('/attendance/mine').then((r) => setMine(r.data));
  const loadTeam = () => canView && api.get('/attendance', { params: { date } }).then((r) => setTeam(r.data));

  useEffect(() => {
    loadMine();
  }, []);
  useEffect(() => {
    loadTeam();
  }, [date]);

  const act = async (path) => {
    try {
      await api.post(`/attendance/${path}`);
      setMsg({ type: 'success', text: path === 'check-in' ? 'Checked in' : 'Checked out' });
      loadMine();
      loadTeam();
    } catch (e) {
      setMsg({ type: 'danger', text: errMsg(e) });
    }
  };

  const today = mine.find((r) => r.date === todayStr());

  return (
    <>
      <h4>Attendance</h4>
      {msg.text && <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>}

      <div className="card card-body mb-4">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div>Today: {today ? `In ${fmtTime(today.checkIn)} / Out ${fmtTime(today.checkOut)}` : 'Not marked yet'}</div>
          <button className="btn btn-success btn-sm" disabled={!!today} onClick={() => act('check-in')}>Check in</button>
          <button className="btn btn-danger btn-sm" disabled={!today || !!today?.checkOut} onClick={() => act('check-out')}>Check out</button>
        </div>
      </div>

      <h5>My records</h5>
      <table className="table table-bordered bg-white">
        <thead className="table-light"><tr><th>Date</th><th>Check in</th><th>Check out</th><th>Status</th></tr></thead>
        <tbody>
          {mine.map((r) => (
            <tr key={r._id}><td>{r.date}</td><td>{fmtTime(r.checkIn)}</td><td>{fmtTime(r.checkOut)}</td><td>{r.status}</td></tr>
          ))}
          {mine.length === 0 && <tr><td colSpan={4} className="text-center text-muted">No records</td></tr>}
        </tbody>
      </table>

      {canView && (
        <>
          <div className="d-flex align-items-center gap-3 mt-4 mb-2">
            <h5 className="m-0">{user.role === 'hr' ? 'All employees' : 'My team'}</h5>
            <input type="date" className="form-control w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <table className="table table-bordered bg-white">
            <thead className="table-light"><tr><th>Employee</th><th>Department</th><th>Check in</th><th>Check out</th><th>Status</th></tr></thead>
            <tbody>
              {team.map((r) => (
                <tr key={r._id}><td>{r.employee?.name}</td><td>{r.employee?.department || '-'}</td><td>{fmtTime(r.checkIn)}</td><td>{fmtTime(r.checkOut)}</td><td>{r.status}</td></tr>
              ))}
              {team.length === 0 && <tr><td colSpan={5} className="text-center text-muted">No attendance marked on this date</td></tr>}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
