import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/api';
import Spinner from '../components/Spinner';

function DoctorCard({ doctor }) {
  const isOnline = doctor.is_available;
  const timings =
    doctor.available_from && doctor.available_to
      ? `${doctor.available_from} – ${doctor.available_to}`
      : 'Timings not set';
  return (
    <div className="doctor-card">
      <div className="doctor-card-top">
        <h6 style={{ fontWeight: 700, marginBottom: 0 }}>{doctor.name}</h6>
        <span className={`avail-pill ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      <span className="text-muted text-small">{doctor.specialization || 'General Physician'}</span>
      <span className="text-small" style={{ color: 'var(--clr-muted)' }}>{timings}</span>
    </div>
  );
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.patientDashboard()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner text="Loading dashboard…" />;

  const latest = data?.latest_test;
  const history = data?.history || [];
  const doctors = data?.doctors || [];

  return (
    <div className="page-shell">
      <div className="welcome-card fade-up">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.4rem' }}>
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted" style={{ marginBottom: 0 }}>Track your risk and connect with available doctors.</p>
      </div>

      <div className="dashboard-grid fade-up fade-up-delay-1">
        {/* Risk status */}
        <div className="surface-glass">
          <h5 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Current Stroke Risk Status</h5>
          {latest ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div className="text-muted text-small">Last assessed:</div>
                  <strong>{new Date(latest.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</strong>
                </div>
                <span className={`result-state ${latest.prediction_result === 'Likely' ? 'result-state--high' : 'result-state--low'}`}
                  style={{ fontSize: '1.1rem', padding: '0.4rem 1rem' }}>
                  {latest.prediction_result}
                </span>
              </div>
              <div className="grid-4">
                <div className="stat-tile">
                  <div className="val">{latest.bmi?.toFixed(1)}</div>
                  <div className="lbl">BMI</div>
                </div>
                <div className="stat-tile">
                  <div className="val">{Math.round(latest.avg_glucose_level)}</div>
                  <div className="lbl">Glucose</div>
                </div>
                <div className="stat-tile">
                  <div className="val">{latest.hypertension ? 'Yes' : 'No'}</div>
                  <div className="lbl">Hypertension</div>
                </div>
                <div className="stat-tile">
                  <div className="val">{latest.heart_disease ? 'Yes' : 'No'}</div>
                  <div className="lbl">Heart Disease</div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <i className="fas fa-heartbeat" />
              <h5>No assessment completed yet</h5>
              <p className="text-small">Take your first test to see your personalized risk score.</p>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="surface">
          <h5 style={{ fontWeight: 700, marginBottom: '1rem' }}>Quick Actions</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <Link to="/assessment" className="btn btn-primary btn-full btn-lg">
              <i className="fas fa-plus-circle" /> New Assessment
            </Link>
            <Link to="/doctors" className="btn btn-ghost btn-full">
              <i className="fas fa-user-md" /> Browse Doctors
            </Link>
            {latest && (
              <Link to="/history" className="btn btn-ghost btn-full">
                <i className="fas fa-history" /> View History
              </Link>
            )}
          </div>
          {!latest && (
            <div className="alert alert-info mt-2" style={{ fontSize: '0.82rem' }}>
              The assessment takes under 2 minutes and gives you a medical-grade risk score.
            </div>
          )}
        </div>
      </div>

      {/* Recent history strip */}
      {history.length > 0 && (
        <div className="surface mt-3 fade-up fade-up-delay-2">
          <div className="row-between mb-2">
            <h5 style={{ fontWeight: 700, marginBottom: 0 }}>Recent Assessments</h5>
            <Link to="/history" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="table-scroll">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Date</th><th>Result</th><th>BMI</th><th>Glucose</th><th>Smoking</th>
                </tr>
              </thead>
              <tbody>
                {history.map(t => (
                  <tr key={t.id}>
                    <td>{new Date(t.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
                    <td>
                      <span className={`badge ${t.prediction_result === 'Likely' ? 'badge-danger' : 'badge-success'}`}>
                        {t.prediction_result}
                      </span>
                    </td>
                    <td>{t.bmi?.toFixed(1) ?? '—'}</td>
                    <td className={t.avg_glucose_level > 200 ? 'text-danger' : ''}>
                      {t.avg_glucose_level ? Math.round(t.avg_glucose_level) : '—'}
                    </td>
                    <td className="text-muted">{t.smoking_status?.replace(/_/g, ' ') ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Doctors list */}
      <div className="surface mt-3 fade-up fade-up-delay-3">
        <div className="row-between mb-2">
          <h5 style={{ fontWeight: 700, marginBottom: 0 }}>Doctors</h5>
          <Link to="/doctors" className="btn btn-ghost btn-sm">Advanced Filters</Link>
        </div>
        {doctors.length === 0 ? (
          <p className="text-muted text-small">No doctors in the system yet.</p>
        ) : (
          <div className="grid-3">
            {doctors.map(d => <DoctorCard key={d.id} doctor={d} />)}
          </div>
        )}
      </div>
    </div>
  );
}
