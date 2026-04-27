import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="page-shell">
      {/* Hero */}
      <section className="hero-section fade-up">
        <span className="hero-chip">
          <i className="fas fa-brain" /> AI-assisted predictions
        </span>
        <h1 className="hero-title">
          Early stroke insights for patients<br />and clinicians
        </h1>
        <p className="hero-sub">
          Modern screening tools, personalized dashboards, and rich analytics
          built to keep you one step ahead of serious events.
        </p>
        <div className="hero-actions">
          <Link to="/signup/patient" className="btn btn-primary btn-lg">
            <i className="fas fa-user-plus" /> Patient Onboarding
          </Link>
          <Link to="/signup/doctor" className="btn btn-ghost btn-lg">
            <i className="fas fa-user-md" /> Doctor Workspace
          </Link>
        </div>
      </section>

      {/* CTA cards */}
      <div className="grid-2 mb-4 fade-up fade-up-delay-1">
        <div className="surface" style={{ borderTop: '3px solid var(--clr-primary)' }}>
          <h3 className="section-title mb-2">For Patients</h3>
          <p className="text-muted mb-3">
            Track risk factors, revisit historic assessments, and download share-ready reports.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <Link to="/login/patient" className="btn btn-primary btn-full">
              <i className="fas fa-sign-in-alt" /> Patient Login
            </Link>
            <Link to="/signup/patient" className="btn btn-ghost btn-full">
              Create Account
            </Link>
          </div>
        </div>

        <div className="surface" style={{ borderTop: '3px solid var(--clr-accent)' }}>
          <h3 className="section-title mb-2">For Doctors</h3>
          <p className="text-muted mb-3">
            Review panels, filter cohorts, and update care notes with collaborative tools.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <Link to="/login/doctor" className="btn btn-primary btn-full">
              <i className="fas fa-sign-in-alt" /> Doctor Login
            </Link>
            <Link to="/signup/doctor" className="btn btn-ghost btn-full">
              Join the Network
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="surface-glass fade-up fade-up-delay-2">
        <div className="grid-3">
          <div className="feature-card">
            <div style={{ color: 'var(--clr-primary)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
              <i className="fas fa-bolt" />
            </div>
            <h5>Realtime Analysis</h5>
            <p className="text-muted text-small">
              AI evaluates every submission in milliseconds with calibrated risk scoring.
            </p>
          </div>
          <div className="feature-card">
            <div style={{ color: 'var(--clr-accent)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
              <i className="fas fa-chart-line" />
            </div>
            <h5>Progress Tracking</h5>
            <p className="text-muted text-small">
              Visualize BMI, glucose, and lifestyle shifts over your assessments.
            </p>
          </div>
          <div className="feature-card">
            <div style={{ color: 'var(--clr-success)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
              <i className="fas fa-shield-alt" />
            </div>
            <h5>Privacy-First</h5>
            <p className="text-muted text-small">
              Role-based access control for every health record. Your data stays yours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
