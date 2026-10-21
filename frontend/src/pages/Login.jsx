import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await login(email, password);
      navigate('/');
    } catch (e2) {
      setErr(errMsg(e2));
    }
  };

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-5">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h3 className="text-center text-primary fw-bold">StaffSync</h3>
            <p className="text-center text-muted">Modern human resource management solution</p>
            {err && <div className="alert alert-danger py-2">{err}</div>}
            <form onSubmit={submit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <button className="btn btn-primary w-100">Login</button>
            </form>
            <hr />
            <div className="small text-muted">
              <b>Demo logins</b> (after <code>npm run seed</code>)<br />
              HR: hr@staffsync.com / hr1234<br />
              Manager: manager@staffsync.com / manager1234<br />
              Employee: employee@staffsync.com / emp1234
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
