import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Announcements() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title: '', message: '' });
  const [err, setErr] = useState('');

  const load = () => api.get('/announcements').then((r) => setList(r.data));
  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', form);
      setForm({ title: '', message: '' });
      setErr('');
      load();
    } catch (e2) {
      setErr(errMsg(e2));
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    await api.delete(`/announcements/${id}`);
    load();
  };

  return (
    <>
      <h4>Announcements</h4>
      {err && <div className="alert alert-danger py-2">{err}</div>}
      {user.role === 'hr' && (
        <form className="card card-body mb-4" onSubmit={submit}>
          <input className="form-control mb-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className="form-control mb-2" rows={3} placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          <button className="btn btn-primary align-self-start">Post announcement</button>
        </form>
      )}
      {list.map((a) => (
        <div className="card mb-2" key={a._id}>
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <h6 className="mb-1">{a.title}</h6>
              {user.role === 'hr' && <button className="btn btn-sm btn-outline-danger" onClick={() => remove(a._id)}>Delete</button>}
            </div>
            <p className="mb-1">{a.message}</p>
            <small className="text-muted">Posted by {a.createdBy?.name} on {fmtDate(a.createdAt)}</small>
          </div>
        </div>
      ))}
      {list.length === 0 && <p className="text-muted">No announcements yet.</p>}
    </>
  );
}
