import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFlash } from '../context/FlashContext';
import { dashboardService, doctorService } from '../services/api';
import Spinner from '../components/Spinner';

export default function DoctorDashboard() {
  const { user, login } = useAuth();
  const { flash } = useFlash();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avail, setAvail] = useState({
    specialization: user?.specialization || '',
    available_from: user?.available_from || '',
    available_to: user?.available_to || '',
  });
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    dashboardService.doctorDashboard()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(e) {
    e.preventDefault();
    setToggling(true);
    try {
      const res = await doctorService.toggleAvailability(avail);
      login(res.data.user);
      flash(`Availability updated to ${res.data.user.is_available ? 'Online' : 'Offline'}.`, 'success');
      // refresh data
      const dash = await dashboardService.doctorDashboard();
      setData(dash.data);
    } catch {
      flash('Failed to update availability.', 'danger');
    } finally {
      setToggling(false);
    }
  }

  if (loading) return <Spinner text="Loading dashboard…" />;

  const rows = data?.likely_patients || [];
  const isOnline = user?.is_available;

  return (
    <div className="page-shell">
      {/* Welcome */}
      <div className="welcome-card fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.35rem' }}>
              Welcome, Dr. {user?.name}!
            </h1>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              Manage your availability and review high-risk patient records.
            </p>
          </div>
          <span className={`avail-pill ${isOnline ? 'online' : 'offline'}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
            {isOnline ? '● Online' : '○ Offline'}
          </span>
        </div>
      </div>

      {/* Availability settings */}
      <div className="surface mb-3 fade-up fade-up-delay-1">
        <h5 style={{ fontWeight: 700, marginBottom: '1rem' }}>
          <i className="fas fa-clock" style={{ color: 'var(--clr-accent)', marginRight: '0.5rem' }} />
          Availability Settings
        </h5>
        <form onSubmit={handleToggle}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Specialization</label>
              <input type="text" className="form-control" placeholder="Neurology"
                value={avail.specialization}
                onChange={e => setAvail(a => ({ ...a, specialization: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Available From</label>
              <input type="time" className="form-control"
                value={avail.available_from}
                onChange={e => setAvail(a => ({ ...a, available_from: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Available To</label>
              <input type="time" className="form-control"
                value={avail.available_to}
                onChange={e => setAvail(a => ({ ...a, available_to: e.target.value }))} />
            </div>
            <div className="form-group" style={{ alignSelf: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-full" disabled={toggling}>
                {toggling
                  ? <><i className="fas fa-circle-notch fa-spin" /> Updating…</>
                  : <><i className={`fas ${isOnline ? 'fa-toggle-off' : 'fa-toggle-on'}`} /> Go {isOnline ? 'Offline' : 'Online'}</>}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Likely stroke patients table */}
      <div className="table-card fade-up fade-up-delay-2">
        <div className="table-card-header">
          <div>
            <h5 style={{ fontWeight: 700, marginBottom: '0.2rem' }}>
              <i className="fas fa-exclamation-triangle" style={{ color: 'var(--clr-danger)', marginRight: '0.5rem' }} />
              Likely Stroke Patients
            </h5>
            <span className="text-muted text-small">Patients with recent "Likely" predictions.</span>
          </div>
          <Link to="/patients" className="btn btn-ghost btn-sm">View All Patient Records</Link>
        </div>
        <div className="table-scroll">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Patient Name</th><th>Email</th><th>Result</th><th>Risk %</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--clr-muted)' }}>
                    <i className="fas fa-users" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem', opacity: 0.4 }} />
                    No high-risk patients yet.
                  </td>
                </tr>
              ) : rows.map((r, i) => (
                <tr key={i}>
                  <td><strong>{r.patient_name}</strong></td>
                  <td className="text-muted text-small">{r.patient_email}</td>
                  <td><span className="badge badge-danger">{r.prediction_result}</span></td>
                  <td>{r.risk_probability != null ? `${r.risk_probability.toFixed(1)}%` : '—'}</td>
                  <td className="text-muted text-small">{new Date(r.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
