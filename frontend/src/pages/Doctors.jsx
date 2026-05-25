import { useEffect, useState } from 'react';
import { doctorService } from '../services/api';
import Spinner from '../components/Spinner';

function AppointmentModal({ doctor, onConfirm, onCancel }) {
  return (
    <div className="appt-overlay" onClick={onCancel}>
      <div className="appt-modal" onClick={e => e.stopPropagation()}>
        <div className="appt-modal-icon">
          <i className="fas fa-calendar-check" />
        </div>
        <h3 className="appt-modal-title">Confirm Appointment</h3>
        <p className="appt-modal-body">
          Are you willing to take an appointment for{' '}
          <strong style={{ color: 'var(--clr-primary)' }}>Dr. {doctor.name}</strong>?
        </p>
        {doctor.specialization && (
          <p className="appt-modal-spec">{doctor.specialization}</p>
        )}
        <div className="appt-modal-actions">
          <button className="btn btn-ghost appt-btn-no" onClick={onCancel}>
            <i className="fas fa-times" /> No
          </button>
          <button className="btn btn-primary appt-btn-yes" onClick={onConfirm}>
            <i className="fas fa-check" /> Yes
          </button>
        </div>
      </div>
    </div>
  );
}

function DoctorCard({ doctor }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const timings =
    doctor.available_from && doctor.available_to
      ? `${doctor.available_from} – ${doctor.available_to}`
      : 'Timings not set';

  return (
    <>
      <div className="doctor-card">
        <div className="doctor-card-top">
          <div>
            <h6 style={{ fontSize: '25px', marginBottom: '0.15rem' }}>{doctor.name}</h6>
            <div className="text-muted text-small">{doctor.email}</div>
          </div>
          <span className={`avail-pill ${doctor.is_available ? 'online' : 'offline'}`}>
            {doctor.is_available ? 'Online' : 'Offline'}
          </span>
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <strong className="text-small">Specialization:</strong>{' '}
          <span className="text-muted text-small">{doctor.specialization || 'General Physician'}</span>
        </div>
        <div>
          <strong className="text-small">Timings:</strong>{' '}
          <span className="text-muted text-small">{timings}</span>
          <button
            className={`btn btn-full appointment ${submitted ? 'btn-submitted' : 'btn-primary'}`}
            style={{ marginTop: '0.8rem' }}
            disabled={submitted}
            onClick={() => !submitted && setModalOpen(true)}
          >
            {submitted ? (
              <><i className="fas fa-check-circle" /> Application Submitted</>
            ) : (
              <><i className="fas fa-calendar-plus" /> Appointment</>
            )}
          </button>
        </div>
      </div>

      {modalOpen && (
        <AppointmentModal
          doctor={doctor}
          onConfirm={() => { setSubmitted(true); setModalOpen(false); }}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ availability: 'all', specialization: '' });
  const [applied, setApplied] = useState({ availability: 'all', specialization: '' });

  useEffect(() => {
    doctorService.specializations()
      .then(r => setSpecs(r.data || []))
      .catch(() => { });
  }, []);

  useEffect(() => {
    setLoading(true);
    doctorService.list(applied)
      .then(r => setDoctors(r.data || []))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, [applied]);

  function applyFilter(e) {
    e.preventDefault();
    setApplied({ ...filters });
  }

  return (
    <div className="page-shell">
      {/* Filter bar */}
      <div className="surface mb-3 fade-up">
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1rem' }}>
          <i className="fas fa-user-md" style={{ color: 'var(--clr-primary)', marginRight: '0.5rem' }} />
          Doctor Directory
        </h4>
        <form onSubmit={applyFilter} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group">
            <label className="form-label">Availability</label>
            <select className="form-control" value={filters.availability}
              onChange={e => setFilters(f => ({ ...f, availability: e.target.value }))}>
              <option value="all">All</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Specialization</label>
            <input list="spec-list" type="text" className="form-control" placeholder="Neurology…"
              value={filters.specialization}
              onChange={e => setFilters(f => ({ ...f, specialization: e.target.value }))} />
            <datalist id="spec-list">
              {specs.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>
          <div>
            <button type="submit" className="btn btn-primary btn-full">
              <i className="fas fa-filter" /> Apply Filter
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <Spinner text="Loading doctors…" />
      ) : doctors.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-user-slash" />
          <h5>No doctors found</h5>
          <p className="text-small">Try adjusting your filter criteria.</p>
        </div>
      ) : (
        <div className="grid-3 fade-up fade-up-delay-1">
          {doctors.map(d => <DoctorCard key={d.id} doctor={d} />)}
        </div>
      )}
    </div>
  );
}
