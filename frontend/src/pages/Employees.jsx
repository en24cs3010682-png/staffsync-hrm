import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';

const empty = { name: '', email: '', password: '', role: 'employee', department: '', designation: '', phone: '', manager: '' };

export default function Employees() {
  const { user } = useAuth();
  const isHR = user.role === 'hr';
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');

  const load = () => api.get('/employees').then((r) => setList(r.data)).catch((e) => setErr(errMsg(e)));
  useEffect(() => {
    load();
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const body = { ...form };
      if (editId) {
        if (!body.password) delete body.password;
        await api.put(`/employees/${editId}`, body);
      } else {
        await api.post('/employees', body);
      }
      setForm(empty);
      setEditId(null);
      setShow(false);
      load();
    } catch (e2) {
      setErr(errMsg(e2));
    }
  };

  const edit = (u) => {
    const f = {};
    Object.keys(empty).forEach((k) => (f[k] = u[k] || ''));
    f.password = '';
    f.manager = u.manager?._id || '';
    setForm(f);
    setEditId(u._id);
    setShow(true);
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}?`)) return;
    try {
      await api.delete(`/employees/${u._id}`);
      load();
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  const managers = list.filter((u) => u.role === 'manager');

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">{isHR ? 'Employees' : 'My Team'}</h4>
        {isHR && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setForm(empty);
              setEditId(null);
              setShow(!show);
            }}
          >
            {show ? 'Close' : '+ Add employee'}
          </button>
        )}
      </div>
      {err && <div className="alert alert-danger py-2">{err}</div>}

      {isHR && show && (
        <form className="card card-body mb-3" onSubmit={submit}>
          <div className="row g-2">
            <div className="col-md-4"><input name="name" className="form-control" placeholder="Full name" value={form.name} onChange={change} required /></div>
            <div className="col-md-4"><input name="email" type="email" className="form-control" placeholder="Email" value={form.email} onChange={change} required /></div>
            <div className="col-md-4"><input name="password" type="password" className="form-control" placeholder={editId ? 'New password (optional)' : 'Password (min 6)'} value={form.password} onChange={change} required={!editId} minLength={editId ? 0 : 6} /></div>
            <div className="col-md-3">
              <select name="role" className="form-select" value={form.role} onChange={change}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR</option>
              </select>
            </div>
            <div className="col-md-3"><input name="department" className="form-control" placeholder="Department" value={form.department} onChange={change} /></div>
            <div className="col-md-3"><input name="designation" className="form-control" placeholder="Designation" value={form.designation} onChange={change} /></div>
            <div className="col-md-3"><input name="phone" className="form-control" placeholder="Phone" value={form.phone} onChange={change} /></div>
            <div className="col-md-4">
              <select name="manager" className="form-select" value={form.manager} onChange={change}>
                <option value="">No manager</option>
                {managers.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div className="col-md-2"><button className="btn btn-success w-100">{editId ? 'Update' : 'Save'}</button></div>
          </div>
        </form>
      )}

      <div className="table-responsive">
        <table className="table table-bordered bg-white align-middle">
          <thead className="table-light">
            <tr>
              <th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Designation</th><th>Manager</th><th>Leave bal.</th>
              {isHR && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td className="text-capitalize">{u.role}</td>
                <td>{u.department || '-'}</td>
                <td>{u.designation || '-'}</td>
                <td>{u.manager?.name || '-'}</td>
                <td>{u.leaveBalance}</td>
                {isHR && (
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => edit(u)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(u)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={8} className="text-center text-muted">No records</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
