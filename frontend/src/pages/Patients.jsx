import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { patientService } from '../services/api';
import Spinner from '../components/Spinner';

export default function Patients() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientService.records()
      .then(r => setRecords(r.data || []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell">
      <div className="table-card fade-up">
        <div className="table-card-header">
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.2rem' }}>
              <i className="fas fa-clipboard-list" style={{ color: 'var(--clr-primary)', marginRight: '0.5rem' }} />
              Patient Records
            </h4>
            <span className="text-muted text-small">All patient predictions with key details.</span>
          </div>
          <Link to="/dashboard" className="btn btn-ghost btn-sm">
            <i className="fas fa-arrow-left" /> Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <Spinner text="Loading patient records…" />
        ) : (
          <div className="table-scroll">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Patient</th><th>Result</th><th>Risk %</th>
                  <th>Age</th><th>BMI</th><th>Glucose</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--clr-muted)' }}>
                      No patient records found.
                    </td>
                  </tr>
                ) : records.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.patient_name}</div>
                      <div className="text-muted text-small">{r.patient_email}</div>
                    </td>
                    <td>
                      <span className={`badge ${r.prediction_result === 'Likely' ? 'badge-danger' : 'badge-success'}`}>
                        {r.prediction_result}
                      </span>
                    </td>
                    <td>{r.risk_probability != null ? `${r.risk_probability.toFixed(1)}%` : '—'}</td>
                    <td>{r.age ?? '—'}</td>
                    <td>{r.bmi != null ? r.bmi.toFixed(1) : '—'}</td>
                    <td className={r.avg_glucose_level > 200 ? 'text-danger' : ''}>
                      {r.avg_glucose_level != null ? Math.round(r.avg_glucose_level) : '—'}
                    </td>
                    <td className="text-muted text-small">
                      {new Date(r.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
