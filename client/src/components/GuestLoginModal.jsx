import React, { useState } from 'react';
import API from '../api/axios';
import { X, KeyRound, Mail, Sparkles, ArrowRight } from 'lucide-react';

export default function GuestLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [bookingId, setBookingId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLookup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const res = await API.post('/reservations/lookup', {
        bookingId: bookingId.trim(),
        email: email.trim()
      });

      const stayData = res.data?.reservation;
      localStorage.setItem('luxury_guest_stay', JSON.stringify(stayData));
      localStorage.setItem('luxury_guest_ref', stayData.bookingId);

      onLoginSuccess(stayData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid booking reference or email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="modal fade show d-block" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(38, 34, 29, 0.58)', backdropFilter: 'blur(8px)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '450px' }}>
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden" style={{ backgroundColor: '#fffdf9', color: '#2a2825' }}>
          <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ backgroundColor: '#f1ece4' }}>
            <div className="d-flex align-items-center gap-2 text-white">
              <Sparkles size={16} color="#c5a880" />
              <span className="fw-bold tracking-wide small" style={{ letterSpacing: '0.5px' }}>
                ACCESS GUEST RESIDENCY
              </span>
            </div>
            <button onClick={onClose} className="btn btn-sm btn-link text-white-50 p-0 text-decoration-none">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleLookup} className="p-4">
            <p className="text-white-50 small mb-3">
              Enter your <strong>Booking Reference</strong> (for example, LS-793746-646) and the <strong>Registered Email</strong> used for your reservation.
            </p>

            {error && (
              <div className="alert alert-danger py-2 small mb-3">
                {error}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label small text-white-50 mb-1">Booking Reference #</label>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-white-50"><KeyRound size={15} /></span>
                <input 
                  type="text" 
                  required
                  placeholder="LS-XXXXXX-XXX"
                  className="form-control form-control-sm bg-dark text-white border-secondary"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small text-white-50 mb-1">Registered Email</label>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-white-50"><Mail size={15} /></span>
                <input 
                  type="email" 
                  required
                  placeholder="guest@example.com"
                  className="form-control form-control-sm bg-dark text-white border-secondary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn w-100 py-2 rounded-pill fw-semibold text-dark border-0 d-flex align-items-center justify-content-center gap-2"
              style={{ background: 'linear-gradient(135deg, #c5a880, #b39366)' }}
            >
              {loading ? 'Verifying stay...' : 'Open Guest Portal'} <ArrowRight size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}