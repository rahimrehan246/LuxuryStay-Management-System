import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { Hotel, Lock, Mail, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { getDefaultRoute } from '../utils/roles';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Admin');

  const { login } = useAuth();
  const navigate = useNavigate();

  const roles = ['Admin', 'Manager', 'Receptionist', 'Housekeeping', 'Kitchen'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const loggedInUser = await login(email, password);
      navigate(getDefaultRoute(loggedInUser?.role));
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or server error');
    } finally {
      setSubmitting(false);
    }
  };

  const roleDescriptions = {
    Admin: 'Full system access, reporting, settings and staff administration.',
    Manager: 'Operations, staff oversight, reporting and reservations.',
    Receptionist: 'Front office, guests, rooms, reservations and billing.',
    Housekeeping: 'Department tasks, room visibility and service requests.',
    Kitchen: 'Department tasks and guest service requests.',
  };

  return (
    <main className="lux-login-page">
      <div className="lux-login-glow lux-login-glow-one" />
      <div className="lux-login-glow lux-login-glow-two" />

      <section className="lux-login-shell">
        <div className="lux-login-visual">
          <div className="lux-login-visual-image" />
          <div className="lux-login-visual-overlay" />
          <div className="lux-login-visual-content">
            <div className="d-flex align-items-center gap-3 mb-5">
              <span className="brand-monogram">LS</span>
              <div>
                <div className="lux-login-brand">LUXURY STAY</div>
                <div className="lux-login-brand-sub">HOSPITALITY GROUP</div>
              </div>
            </div>

            <span className="lux-login-kicker"><Sparkles size={14} /> Five-star operations</span>
            <h1 className="lux-login-heading">A more refined way to run the house.</h1>
            <p className="lux-login-copy">
              Manage arrivals, rooms, reservations and guest experiences from one elegant hospitality command center.
            </p>

            <div className="lux-login-feature-grid">
              <div>
                <strong>24/7</strong>
                <span>Guest care</span>
              </div>
              <div>
                <strong>5★</strong>
                <span>Service standard</span>
              </div>
              <div>
                <strong>1</strong>
                <span>Unified workspace</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lux-login-form-panel">
          <div className="lux-login-mobile-brand d-lg-none">
            <span className="brand-monogram">LS</span>
            <div>
              <div className="lux-login-brand">LUXURY STAY</div>
              <div className="lux-login-brand-sub">STAFF PORTAL</div>
            </div>
          </div>

          <div className="lux-login-form-header">
            <span className="lux-login-eyebrow">Staff access</span>
            <h2>Welcome back.</h2>
            <p>Sign in with your existing LuxuryStay credentials.</p>
          </div>

          {error && (
            <div className="lux-login-error" role="alert">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="lux-login-field mb-4">
              <label htmlFor="staff-email">Access role</label>
              <div className="lux-role-grid">
                {roles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`lux-role-chip ${selectedRole === role ? 'active' : ''}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
              <p className="lux-role-description">{roleDescriptions[selectedRole]}</p>
            </div>

            <div className="lux-login-field mb-3">
              <label htmlFor="staff-email">Email address</label>
              <div className="lux-input-wrap">
                <Mail size={17} />
                <input
                  id="staff-email"
                  type="email"
                  placeholder="staff@luxurystay.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="lux-login-field mb-4">
              <label htmlFor="staff-password">Password</label>
              <div className="lux-input-wrap">
                <Lock size={17} />
                <input
                  id="staff-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="lux-login-security mb-4">
              <ShieldCheck size={18} />
              <span>The selected role is a visual shortcut only. Authentication and permissions remain controlled by the existing backend.</span>
            </div>

            <button type="submit" className="lux-login-submit" disabled={submitting}>
              {submitting ? 'Authenticating...' : 'Enter LuxuryStay'}
            </button>
          </form>

          <a href="/" className="lux-login-return">Return to guest website</a>
        </div>
      </section>
    </main>
  );
}
