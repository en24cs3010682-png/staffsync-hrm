import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';

const emptyForm = { title: '', description: '', startDate: '', endDate: '', participants: [] };

export default function Training() {
  const { user } = useAuth();
  const canManage = user.role !== 'employee';
  const [list, setList] = useState([]);
  const [people, setPeople] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [err, setErr] = useState('');

  const load = () => api.get('/trainings').then((r) => setList(r.data));
  useEffect(() => {
    load();
    if (canManage) api.get('/employees').then((r) => setPeople(r.data.filter((p) => p.role === 'employee')));
  }, []);

  const toggle = (id) =>
    setForm((f) => ({
      ...f,
      participants: f.participants.includes(id) ? f.participants.filter((x) => x !== id) : [...f.participants, id],
    }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/trainings', form);
      setForm(emptyForm);
      setErr('');
      load();
    } catch (e2) {
      setErr(errMsg(e2));
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this program?')) return;
    try {
      await api.delete(`/trainings/${id}`);
      load();
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  return (
    <>
      <h4>Training & Development</h4>
      {err && <div className="alert alert-danger py-2">{err}</div>}

      {canManage && (
        <form className="card card-body mb-4" onSubmit={submit}>
          <h6>Create training program</h6>
          <div className="row g-2 mb-2">
            <div className="col-md-4"><input className="form-control" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="col-md-3"><input type="date" className="form-control" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
            <div className="col-md-3"><input type="date" className="form-control" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required /></div>
          </div>
          <textarea className="form-control mb-2" rows={2} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="mb-2">
            <div className="small text-muted">Participants</div>
            {people.map((p) => (
              <label key={p._id} className="me-3">
                <input type="checkbox" className="form-check-input me-1" checked={form.participants.includes(p._id)} onChange={() => toggle(p._id)} />
                {p.name}
              </label>
            ))}
            {people.length === 0 && <span className="text-muted small">No employees available</span>}
          </div>
          <button className="btn btn-primary align-self-start">Create</button>
        </form>
      )}

      <div className="row">
        {list.map((t) => (
          <div className="col-md-6 mb-3" key={t._id}>
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <h6>{t.title}</h6>
                  {canManage && (user.role === 'hr' || t.createdBy?._id === user._id) && (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(t._id)}>Delete</button>
                  )}
                </div>
                <p className="mb-1">{t.description}</p>
                <div className="small text-muted">{fmtDate(t.startDate)} to {fmtDate(t.endDate)} | By {t.createdBy?.name}</div>
                <div className="small mt-1">Participants: {t.participants.map((p) => p.name).join(', ') || '-'}</div>
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-muted">No training programs.</p>}
      </div>
    </>
  );
}
