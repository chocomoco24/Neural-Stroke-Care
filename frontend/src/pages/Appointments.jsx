import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFlash } from '../context/FlashContext';
import { appointmentService } from '../services/api';
import Spinner from '../components/Spinner';

export default function Appointments() {
  const { user } = useAuth();
  const { flash } = useFlash();
  const isDoctor = user?.user_type === 'doctor';

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptModal, setAcceptModal] = useState(null);
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('');

  useEffect(() => {
    const fetch = isDoctor
      ? appointmentService.listDoctor()
      : appointmentService.listPatient();

    fetch
      .then(res => setAppointments(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isDoctor]);

  async function handleReject(id) {
    try {
      await appointmentService.update(id, 'rejected');
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
    } catch {
      flash('Failed to reject appointment.', 'danger');
    }
  }

  async function confirmAccept() {
    if (!apptDate || !apptTime) {
      flash('Please set both date and time.', 'warn');
      return;
    }
    try {
      await appointmentService.update(acceptModal, 'accepted', apptDate, apptTime);
      setAppointments(prev => prev.map(a =>
        a.id === acceptModal
          ? { ...a, status: 'accepted', appointment_date: apptDate, appointment_time: apptTime }
          : a
      ));
      setAcceptModal(null);
      setApptDate('');
      setApptTime('');
    } catch {
      flash('Failed to accept appointment.', 'danger');
    }
  }

  return (
    <div className="page-shell">

      {/* Page header */}
      <div className="welcome-card fade-up" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.4rem' }}>
          <i className="fas fa-calendar-check" style={{ color: 'var(--clr-primary)', marginRight: '0.6rem' }} />
          Appointments
        </h1>
        <p className="text-muted" style={{ marginBottom: 0 }}>
          {isDoctor
            ? 'Review and manage appointment requests from patients.'
            : 'Track your appointment requests and confirmed bookings.'}
        </p>
      </div>

      {/* Accept modal — doctor only */}
      {acceptModal && (
        <div className="appt-overlay" onClick={() => setAcceptModal(null)}>
          <div className="appt-modal" onClick={e => e.stopPropagation()}>
            <div className="appt-modal-icon"><i className="fas fa-calendar-check" /></div>
            <h3 className="appt-modal-title">Set Appointment Details</h3>
            <p className="appt-modal-body">Choose a date and time for this appointment.</p>
            <div className="form-stack mt-2">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="form-control"
                  value={apptDate} onChange={e => setApptDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input type="time" className="form-control"
                  value={apptTime} onChange={e => setApptTime(e.target.value)} />
              </div>
            </div>
            <div className="appt-modal-actions mt-3">
              <button className="btn btn-ghost appt-btn-no" onClick={() => setAcceptModal(null)}>
                Cancel
              </button>
              <button className="btn btn-primary appt-btn-yes" onClick={confirmAccept}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? <Spinner text="Loading appointments…" /> : (
        appointments.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-calendar-times" />
            <h5>{isDoctor ? 'No appointment requests yet.' : 'No appointment requests yet.'}</h5>
            <p className="text-small">
              {!isDoctor && 'Request an appointment from the Doctors page and track its status here.'}
            </p>
          </div>
        ) : (
          <div className="grid-3 fade-up">
            {appointments.map(a => (
              <div key={a.id} className="doctor-card">
                <div className="doctor-card-top">
                  <div>
                    <h6 style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>
                      {isDoctor ? a.patient_name : a.doctor_name}
                    </h6>
                    <div className="text-muted text-small">
                      {isDoctor ? a.patient_email : (a.doctor_spec || 'General Physician')}
                    </div>
                  </div>
                  <span className={`badge ${a.status === 'pending' ? 'badge-primary' : a.status === 'accepted' ? 'badge-success' : 'badge-danger'}`}>
                    {a.status === 'accepted' ? 'Confirmed' : a.status}
                  </span>
                </div>

                {a.status === 'accepted' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div className="text-small"><strong>Date:</strong> <span className="text-muted">{a.appointment_date}</span></div>
                    <div className="text-small"><strong>Time:</strong> <span className="text-muted">{a.appointment_time}</span></div>
                  </div>
                )}

                {isDoctor && a.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
                      onClick={() => setAcceptModal(a.id)}>
                      <i className="fas fa-check" /> Accept
                    </button>
                    <button className="btn btn-danger btn-sm" style={{ flex: 1 }}
                      onClick={() => handleReject(a.id)}>
                      <i className="fas fa-times" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}