import { useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [phone, setPhone] = useState(user.phone || '');
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/auth/profile', { phone });
      setUser({ ...user, ...data });
      setMsg({ type: 'success', text: 'Profile updated' });
    } catch (e2) {
      setMsg({ type: 'danger', text: errMsg(e2) });
    }
  };

  const changePw = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/change-password', pw);
      setPw({ currentPassword: '', newPassword: '' });
      setMsg({ type: 'success', text: 'Password changed' });
    } catch (e2) {
      setMsg({ type: 'danger', text: errMsg(e2) });
    }
  };

  const rows = [
    ['Name', user.name],
    ['Email', user.email],
    ['Role', user.role],
    ['Department', user.department || '-'],
    ['Designation', user.designation || '-'],
    ['Joined', fmtDate(user.joinDate)],
    ['Leave balance', `${user.leaveBalance} days`],
  ];

  return (
    <>
      <h4>My Profile</h4>
      {msg.text && <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>}
      <div className="row">
        <div className="col-md-6 mb-3">
          <div className="card card-body">
            <table className="table table-sm mb-3">
              <tbody>
                {rows.map(([k, v]) => (
                  <tr key={k}><th style={{ width: 140 }}>{k}</th><td className="text-capitalize">{v}</td></tr>
                ))}
              </tbody>
            </table>
            <form onSubmit={saveProfile} className="d-flex gap-2">
              <input className="form-control" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <button className="btn btn-primary">Save</button>
            </form>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <form className="card card-body" onSubmit={changePw}>
            <h6>Change password</h6>
            <input type="password" className="form-control mb-2" placeholder="Current password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required />
            <input type="password" className="form-control mb-2" placeholder="New password (min 6)" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required minLength={6} />
            <button className="btn btn-warning align-self-start">Update password</button>
          </form>
        </div>
      </div>
    </>
  );
}
