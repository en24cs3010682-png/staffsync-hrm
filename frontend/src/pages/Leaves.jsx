import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';

const badge = { Pending: 'warning', Approved: 'success', Rejected: 'danger' };
const emptyForm = { type: 'Casual', fromDate: '', toDate: '', reason: '' };

export default function Leaves() {
  const { user } = useAuth();
  const canReview = user.role !== 'employee';
  const [form, setForm] = useState(emptyForm);
  const [mine, setMine] = useState([]);
  const [requests, setRequests] = useState([]);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const load = () => {
    api.get('/leaves/mine').then((r) => setMine(r.data));
    if (canReview) api.get('/leaves').then((r) => setRequests(r.data));
  };
  useEffect(() => {
    load();
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const apply = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves', form);
      setForm(emptyForm);
      setMsg({ type: 'success', text: 'Leave request submitted' });
      load();
    } catch (e2) {
      setMsg({ type: 'danger', text: errMsg(e2) });
    }
  };

  const review = async (id, status) => {
    const reviewComment = window.prompt(`Comment for ${status.toLowerCase()} (optional)`) || '';
    try {
      await api.put(`/leaves/${id}/status`, { status, reviewComment });
      setMsg({ type: 'success', text: `Leave ${status.toLowerCase()}` });
      load();
    } catch (e) {
      setMsg({ type: 'danger', text: errMsg(e) });
    }
  };

  return (
    <>
      <h4>Leaves</h4>
      {msg.text && <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>}

      <form className="card card-body mb-4" onSubmit={apply}>
        <h6>Apply for leave <span className="text-muted small">(balance: {user.leaveBalance} days)</span></h6>
        <div className="row g-2">
          <div className="col-md-2">
            <select name="type" className="form-select" value={form.type} onChange={change}>
              <option>Casual</option><option>Sick</option><option>Earned</option><option>Unpaid</option>
            </select>
          </div>
          <div className="col-md-2"><input type="date" name="fromDate" className="form-control" value={form.fromDate} onChange={change} required /></div>
          <div className="col-md-2"><input type="date" name="toDate" className="form-control" value={form.toDate} onChange={change} required /></div>
          <div className="col-md-4"><input name="reason" className="form-control" placeholder="Reason" value={form.reason} onChange={change} required /></div>
          <div className="col-md-2"><button className="btn btn-primary w-100">Apply</button></div>
        </div>
      </form>

      <h5>My leave requests</h5>
      <table className="table table-bordered bg-white mb-4">
        <thead className="table-light"><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Comment</th></tr></thead>
        <tbody>
          {mine.map((l) => (
            <tr key={l._id}>
              <td>{l.type}</td><td>{fmtDate(l.fromDate)}</td><td>{fmtDate(l.toDate)}</td><td>{l.days}</td><td>{l.reason}</td>
              <td><span className={`badge bg-${badge[l.status]}`}>{l.status}</span></td>
              <td>{l.reviewComment || '-'}</td>
            </tr>
          ))}
          {mine.length === 0 && <tr><td colSpan={7} className="text-center text-muted">No requests</td></tr>}
        </tbody>
      </table>

      {canReview && (
        <>
          <h5>{user.role === 'hr' ? 'All leave requests' : 'Team leave requests'}</h5>
          <table className="table table-bordered bg-white">
            <thead className="table-light"><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {requests.map((l) => (
                <tr key={l._id}>
                  <td>{l.employee?.name}</td><td>{l.type}</td><td>{fmtDate(l.fromDate)}</td><td>{fmtDate(l.toDate)}</td><td>{l.days}</td><td>{l.reason}</td>
                  <td><span className={`badge bg-${badge[l.status]}`}>{l.status}</span></td>
                  <td>
                    {l.status === 'Pending' && l.employee?._id !== user._id ? (
                      <>
                        <button className="btn btn-sm btn-success me-1" onClick={() => review(l._id, 'Approved')}>Approve</button>
                        <button className="btn btn-sm btn-danger" onClick={() => review(l._id, 'Rejected')}>Reject</button>
                      </>
                    ) : '-'}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && <tr><td colSpan={8} className="text-center text-muted">No requests</td></tr>}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
