import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFlash } from '../context/FlashContext';
import { authService } from '../services/api';

export default function Login() {
  const { userType } = useParams(); // 'patient' | 'doctor'
  const { login } = useAuth();
  const { flash } = useFlash();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const isDoctor = userType === 'doctor';

  function validate() {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await authService.login(userType, form.email, form.password);
      login(res.data.user);
      flash(`Welcome back, ${res.data.user.name}!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      flash(msg, 'danger');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card fade-up">
        <div className="auth-icon">
          <i className={`fas ${isDoctor ? 'fa-user-md' : 'fa-user-circle'}`} />
        </div>
        <h2>{isDoctor ? 'Doctor' : 'Patient'} Login</h2>
        <p className="sub">{isDoctor ? 'Manage patients, assessments, and clinical reports.' : 'Access your personal dashboard and risk insights.'}</p>

        <form onSubmit={handleSubmit} className="form-stack" noValidate>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <span className="icon"><i className="fas fa-envelope" /></span>
              <input
                type="email"
                className={`form-control ${errors.email ? 'error' : ''}`}
                placeholder={isDoctor ? 'dr@example.com' : 'you@email.com'}
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <span className="icon"><i className="fas fa-lock" /></span>
              <input
                type={showPwd ? 'text' : 'password'}
                className={`form-control ${errors.password ? 'error' : ''}`}
                style={{ paddingRight: '2.8rem' }}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              <button type="button" onClick={() => setShowPwd(p => !p)}
                style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--clr-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>
                <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <><i className="fas fa-circle-notch fa-spin" /> Signing in…</> : <><i className="fas fa-sign-in-alt" /> Login</>}
          </button>

          <p className="text-center text-muted text-small mt-1">
            {isDoctor ? 'Need access?' : "Don't have an account?"}{' '}
            <Link to={`/signup/${userType}`} style={{ color: 'var(--clr-primary)', fontWeight: 600 }}>
              {isDoctor ? 'Create a doctor account' : 'Sign up here'}
            </Link>
          </p>
          {isDoctor ? null : (
            <p className="text-center text-muted text-small">
              Are you a doctor?{' '}
              <Link to="/login/doctor" style={{ color: 'var(--clr-primary)', fontWeight: 600 }}>Doctor login</Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
