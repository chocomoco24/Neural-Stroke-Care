import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFlash } from '../context/FlashContext';
import { authService } from '../services/api';

export default function Navbar() {
  const { user, logout, isLoggedIn } = useAuth();
  const { flash } = useFlash();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try { await authService.logout(); } catch {}
    logout();
    flash('Logged out successfully.', 'success');
    navigate('/');
    setOpen(false);
  };

  const close = () => setOpen(false);

  return (
    <nav className="app-navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand" onClick={close}>
          <span className="brand-icon"><i className="fas fa-heartbeat" /></span>
          Neural Stroke Care
        </NavLink>

        <button className="nav-hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
          <i className={open ? 'fas fa-times' : 'fas fa-bars'} />
        </button>

        <ul className={`nav-links ${open ? 'open' : ''}`}>
          {isLoggedIn ? (
            <>
              {user?.user_type === 'patient' && (
                <li><NavLink to="/assessment" onClick={close}>Assessment</NavLink></li>
              )}
              <li><NavLink to="/dashboard" onClick={close}>Dashboard</NavLink></li>
              {user?.user_type === 'doctor' ? (
                <li><NavLink to="/patients" onClick={close}>Patients</NavLink></li>
              ) : (
                <li><NavLink to="/doctors" onClick={close}>Doctors</NavLink></li>
              )}
              {user?.user_type === 'patient' && (
                <li><NavLink to="/history" onClick={close}>History</NavLink></li>
              )}
              <li><NavLink to="/appointments" onClick={close}>Appointments</NavLink></li>
              
              <li>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ marginLeft: '0.5rem' }}>
                  <i className="fas fa-sign-out-alt" /> Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><NavLink to="/login/patient" onClick={close}>Patient Login</NavLink></li>
              <li><NavLink to="/login/doctor" onClick={close}>Doctor Login</NavLink></li>
              <li>
                <NavLink to="/signup/patient" onClick={close} className="btn btn-primary btn-sm" style={{ color: 'white', marginLeft: '0.5rem'}}>
                  Get Started
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
