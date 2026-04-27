import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFlash } from '../context/FlashContext';
import { authService } from '../services/api';

const INIT_PATIENT = { name: '', email: '', password: '' };
const INIT_DOCTOR  = { name: '', email: '', password: '', specialization: '', available_from: '', available_to: '', is_available: false };

export default function Signup() {
  const { userType } = useParams();
  const { flash } = useFlash();
  const navigate = useNavigate();
  const isDoctor = userType === 'doctor';

  const [form, setForm] = useState(isDoctor ? INIT_DOCTOR : INIT_PATIENT);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); }

  function validate() {
    const e = {};
    if (!form.name.trim())  e.name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await authService.signup(userType, form);
      flash('Account created! Please log in.', 'success');
      navigate(`/login/${userType}`);
    } catch (err) {
      flash(err.response?.data?.message || 'Signup failed. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card fade-up" style={{ maxWidth: isDoctor ? 520 : 440 }}>
        <div className="auth-icon">
          <i className={`fas ${isDoctor ? 'fa-user-md' : 'fa-user-plus'}`} />
        </div>
        <h2>{isDoctor ? 'Doctor Registration' : 'Create Patient Account'}</h2>
        <p className="sub">{isDoctor ? 'Join the care team and unlock patient management tools.' : 'Unlock personalized dashboards and downloadable reports.'}</p>

        <form onSubmit={handleSubmit} className="form-stack" noValidate>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <span className="icon"><i className="fas fa-user" /></span>
              <input type="text" className={`form-control ${errors.name ? 'error' : ''}`} placeholder="Your full name"
                value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <span className="icon"><i className="fas fa-envelope" /></span>
              <input type="email" className={`form-control ${errors.email ? 'error' : ''}`} placeholder="you@email.com"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
            {!isDoctor && <span className="form-hint">We'll never share your email with anyone.</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <span className="icon"><i className="fas fa-lock" /></span>
              <input type={showPwd ? 'text' : 'password'}
                className={`form-control ${errors.password ? 'error' : ''}`}
                style={{ paddingRight: '2.8rem' }}
                placeholder="Create a password"
                value={form.password} onChange={e => set('password', e.target.value)} />
              <button type="button" onClick={() => setShowPwd(p => !p)}
                style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--clr-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>
                <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
            <span className="form-hint">At least 8 characters, mixing letters and numbers.</span>
          </div>

          {isDoctor && (
            <>
              <div className="form-group">
                <label className="form-label">Specialization</label>
                <div className="input-with-icon">
                  <span className="icon"><i className="fas fa-stethoscope" /></span>
                  <input type="text" className="form-control" placeholder="Neurology, Cardiology…"
                    value={form.specialization} onChange={e => set('specialization', e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Available From</label>
                  <input type="time" className="form-control"
                    value={form.available_from} onChange={e => set('available_from', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Available To</label>
                  <input type="time" className="form-control"
                    value={form.available_to} onChange={e => set('available_to', e.target.value)} />
                </div>
              </div>

              <label className="form-check">
                <input type="checkbox" checked={form.is_available}
                  onChange={e => set('is_available', e.target.checked)} />
                <span>Mark me as online now</span>
              </label>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading
              ? <><i className="fas fa-circle-notch fa-spin" /> Creating account…</>
              : <><i className="fas fa-user-plus" /> Create Account</>}
          </button>

          <p className="text-center text-muted text-small mt-1">
            Already have an account?{' '}
            <Link to={`/login/${userType}`} style={{ color: 'var(--clr-primary)', fontWeight: 600 }}>Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
