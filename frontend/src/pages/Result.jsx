import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { hospitalService } from '../services/api';

function Gauge({ probability }) {
  const needleRef = useRef(null);

  useEffect(() => {
    if (!needleRef.current) return;
    const deg = -90 + (probability * 1.8);
    needleRef.current.style.transform = `rotate(${deg}deg)`;
  }, [probability]);

  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 150 A130 130 0 0 1 110 40"  stroke="#22c55e" strokeWidth="22" fill="none" strokeLinecap="round"/>
        <path d="M110 40 A130 130 0 0 1 190 40"  stroke="#f59e0b" strokeWidth="22" fill="none" strokeLinecap="round"/>
        <path d="M190 40 A130 130 0 0 1 260 90"  stroke="#f97316" strokeWidth="22" fill="none" strokeLinecap="round"/>
        <path d="M260 90 A130 130 0 0 1 280 150" stroke="#ef4444" strokeWidth="22" fill="none" strokeLinecap="round"/>
        <line ref={needleRef} x1="150" y1="150" x2="150" y2="30"
          stroke="var(--clr-text)" strokeWidth="6" strokeLinecap="round"
          style={{ transformOrigin: '150px 150px', transition: 'transform 1.5s cubic-bezier(.34,1.56,.64,1)' }} />
        <circle cx="150" cy="150" r="8" fill="var(--clr-surface)" stroke="var(--clr-text)" strokeWidth="3" />
      </svg>
    </div>
  );
}

function HospitalCard({ hospital }) {
  const query = encodeURIComponent(`${hospital.name} ${hospital.address}`);
  return (
    <div className="hospital-card">
      <h6 style={{ marginBottom: '0.25rem', fontWeight: 700 }}>{hospital.name}</h6>
      <div className="text-muted text-small">{hospital.address}</div>
      <span className="hospital-dist">{hospital.distance.toFixed(1)} km away</span>
      <div style={{ marginTop: '0.6rem' }}>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${query}`}
          target="_blank" rel="noreferrer"
          className="btn btn-ghost btn-sm"
        >
          <i className="fas fa-map-marker-alt" /> Open in Maps
        </a>
      </div>
    </div>
  );
}

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [hospitalStatus, setHospitalStatus] = useState('idle'); // idle | loading | done | error | denied

  useEffect(() => {
    if (!state) { navigate('/assessment'); return; }
    if (state.result === 'Likely' && navigator.geolocation) {
      setHospitalStatus('loading');
      navigator.geolocation.getCurrentPosition(
        async pos => {
          try {
            const res = await hospitalService.nearby(pos.coords.latitude, pos.coords.longitude);
            setHospitals(res.data);
            setHospitalStatus('done');
          } catch {
            setHospitalStatus('error');
          }
        },
        () => setHospitalStatus('denied')
      );
    }
  }, [state, navigate]);

  if (!state) return null;

  const { result, probability, input_data, date } = state;
  const isHigh = result === 'Likely';

  function getRiskText(p) {
    if (p < 20) return 'Low risk. Continue a healthy lifestyle.';
    if (p < 40) return 'Mildly elevated risk. Lifestyle changes recommended.';
    if (p < 70) return 'High risk. Medical checkup strongly advised.';
    return 'Critical stroke risk. Seek immediate medical evaluation.';
  }

  const LABELS = {
    age: 'Age', gender: 'Gender', bmi: 'BMI', avg_glucose_level: 'Avg Glucose',
    hypertension: 'Hypertension', heart_disease: 'Heart Disease',
    ever_married: 'Ever Married', work_type: 'Work Type',
    residence_type: 'Residence', smoking_status: 'Smoking Status',
  };

  return (
    <div className="page-shell--narrow">
      <div className="surface-glass text-center fade-up">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.25rem' }}>
          Stroke Prediction Result
        </h1>
        <p className="text-muted text-small mb-3">Generated {date}</p>

        <div className={`result-state ${isHigh ? 'result-state--high' : 'result-state--low'}`}>
          {isHigh ? <i className="fas fa-exclamation-triangle" /> : <i className="fas fa-check-circle" />}
          {' '}Prediction: {result}
        </div>

        <Gauge probability={probability} />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.5rem' }}>
          {probability.toFixed(1)}%
        </div>

        {isHigh && (
          <div className="alert alert-danger" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            <i className="fas fa-ambulance" />
            If experiencing stroke symptoms, call emergency services immediately!
          </div>
        )}

        {/* Risk interpretation */}
        <div className="surface" style={{ textAlign: 'left', marginBottom: '1rem' }}>
          <h5 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
            <i className="fas fa-chart-bar" style={{ color: 'var(--clr-primary)', marginRight: '0.5rem' }} />
            Risk Interpretation
          </h5>
          <p className="text-muted" style={{ marginBottom: 0 }}>{getRiskText(probability)}</p>
        </div>

        {/* Doctor tips */}
        <div className="surface" style={{ textAlign: 'left', marginBottom: '1rem' }}>
          <h5 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>
            <i className="fas fa-user-md" style={{ color: 'var(--clr-accent)', marginRight: '0.5rem' }} />
            Doctor Recommendations
          </h5>
          <ul style={{ paddingLeft: '1.25rem', margin: 0, color: 'var(--clr-muted)' }}>
            <li>Get blood pressure checked regularly.</li>
            <li>Monitor glucose levels if diabetic.</li>
            <li>Avoid smoking completely.</li>
            <li>Maintain a healthy BMI.</li>
            <li>Consult a neurologist if symptoms persist.</li>
          </ul>
        </div>

        {/* Input summary */}
        {input_data && (
          <div className="surface" style={{ textAlign: 'left', marginBottom: '1rem' }}>
            <h5 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>
              <i className="fas fa-clipboard-list" style={{ color: 'var(--clr-primary)', marginRight: '0.5rem' }} />
              Your Inputs
            </h5>
            <div className="grid-4">
              {Object.entries(input_data).map(([k, v]) => (
                <div key={k} className="stat-tile" style={{ padding: '0.75rem' }}>
                  <div className="val" style={{ fontSize: '1.1rem' }}>{String(v)}</div>
                  <div className="lbl">{LABELS[k] || k}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nearby hospitals */}
        {isHigh && (
          <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
            <h5 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>
              <i className="fas fa-hospital" style={{ color: 'var(--clr-danger)', marginRight: '0.5rem' }} />
              Nearby Emergency Hospitals
            </h5>
            {hospitalStatus === 'loading' && <p className="text-muted text-small">Fetching nearby hospitals…</p>}
            {hospitalStatus === 'denied'  && <p className="text-muted text-small">Location access denied. Please enable location to see nearby hospitals.</p>}
            {hospitalStatus === 'error'   && <p className="text-muted text-small">Could not load hospitals at this time.</p>}
            {hospitalStatus === 'done'    && hospitals.length === 0 && <p className="text-muted text-small">No hospitals found in your area.</p>}
            {hospitalStatus === 'done' && hospitals.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {hospitals.map((h, i) => <HospitalCard key={i} hospital={h} />)}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <Link to="/assessment" className="btn btn-primary">
            <i className="fas fa-redo" /> New Assessment
          </Link>
          <Link to="/dashboard" className="btn btn-ghost">
            <i className="fas fa-tachometer-alt" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
