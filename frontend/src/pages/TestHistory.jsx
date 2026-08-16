import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { historyService } from '../services/api';
import Spinner from '../components/Spinner';

export default function TestHistory() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    historyService.list()
      .then(r => setTests(r.data?.records ?? r.data ?? []))
      .catch(() => setTests([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell">
      <div className="surface fade-up">
        <div className="row-between mb-4">
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '0.25rem' }}>
              <i className="fas fa-history" style={{ color: 'var(--clr-primary)', marginRight: '0.5rem' }} />
              Test History
            </h2>
            <p className="text-muted text-small" style={{ marginBottom: 0 }}>
              Review how your stroke risk and key metrics have changed over time.
            </p>
          </div>
          <Link to="/assessment" className="btn btn-primary">
            <i className="fas fa-plus-circle" /> New Assessment
          </Link>
        </div>

        {loading ? (
          <Spinner text="Loading history…" />
        ) : tests.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-clipboard-list" />
            <h4>No assessments yet</h4>
            <p className="text-small">Your test history will appear here once you complete your first stroke risk assessment.</p>
            <Link to="/assessment" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Take Your First Test
            </Link>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Date & Time</th><th>Result</th><th>Risk %</th>
                  <th>BMI</th><th>Glucose</th><th>Hypertension</th>
                  <th>Heart Disease</th><th>Smoking</th>
                </tr>
              </thead>
              <tbody>
                {tests.map(t => (
                  <tr key={t.id}>
                    <td>
                      <strong>{new Date(t.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</strong>
                      <div className="text-muted text-small">
                        {new Date(t.created_at).toLocaleTimeString('en-US', { timeStyle: 'short' })}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${t.prediction_result === 'Likely' ? 'badge-danger' : 'badge-success'}`}>
                        {t.prediction_result}
                      </span>
                    </td>
                    <td>{t.risk_probability != null ? `${t.risk_probability.toFixed(1)}%` : '—'}</td>
                    <td style={{ fontWeight: 600 }}>{t.bmi != null ? t.bmi.toFixed(1) : '—'}</td>
                    <td className={t.avg_glucose_level > 200 ? 'text-danger fw-bold' : 'fw-bold'}>
                      {t.avg_glucose_level != null ? Math.round(t.avg_glucose_level) : '—'}
                    </td>
                    <td>
                      <span className={`badge ${t.hypertension ? 'badge-danger' : 'badge-success'}`}>
                        {t.hypertension ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${t.heart_disease ? 'badge-danger' : 'badge-success'}`}>
                        {t.heart_disease ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="text-muted text-small">
                      {t.smoking_status?.replace(/_/g, ' ') ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: '1.25rem' }}>
          <Link to="/dashboard" className="btn btn-ghost btn-sm">
            <i className="fas fa-arrow-left" /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
