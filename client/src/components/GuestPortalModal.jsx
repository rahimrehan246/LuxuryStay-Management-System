import React, { useState } from 'react';
import API from '../api/axios';
import { X, CheckCircle, Sparkles, LogOut, Star, MessageSquare, Bell, ConciergeBell } from 'lucide-react';

export default function GuestPortalModal({ isOpen, onClose, currentStay, onClearStay }) {
  const [activeTab, setActiveTab] = useState('service');

  // Service request state
  const [requestType, setRequestType] = useState('Housekeeping');
  const [requestDetails, setRequestDetails] = useState('');
  const [serviceSubmitting, setServiceSubmitting] = useState(false);
  const [serviceSuccess, setServiceSuccess] = useState('');
  const [serviceError, setServiceError] = useState('');

  // Guest feedback state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  if (!isOpen || !currentStay) return null;

  const handleSendServiceRequest = async (e) => {
    e.preventDefault();
    try {
      setServiceSubmitting(true);
      setServiceSuccess('');
      setServiceError('');

      await API.post(
        '/service-requests',
        {
          roomNumber: currentStay.roomNumber,
          type: requestType,
          details: requestDetails || `${requestType} service requested`,
          guestName: currentStay.guestName,
        },
        {
          headers: { Authorization: '' }
        }
      );

      setServiceSuccess(`${requestType} request has been sent to the hotel team.`);
      setRequestDetails('');
    } catch (err) {
      console.error('Service request submission error:', err);
      setServiceError(err.response?.data?.message || 'Service request could not be submitted.');
    } finally {
      setServiceSubmitting(false);
    }
  };

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    try {
      setFeedbackSubmitting(true);
      setFeedbackSuccess('');
      setFeedbackError('');

      await API.post(
        '/feedback',
        {
          guestName: currentStay.guestName,
          email: currentStay.guestEmail || '',
          roomNumber: currentStay.roomNumber,
          bookingId: currentStay.bookingId,
          rating,
          comment: feedbackComment,
        },
        {
          headers: { Authorization: '' }
        }
      );

      setFeedbackSuccess('Your review has been recorded. Thank you.');
      setFeedbackComment('');
    } catch (err) {
      console.error('Feedback error:', err);
      setFeedbackError(err.response?.data?.message || 'Feedback could not be submitted.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('luxury_guest_stay');
    localStorage.removeItem('luxury_guest_ref');
    if (onClearStay) onClearStay();
    onClose();
  };

  const renderBadge = (st) => {
    switch (st) {
      case 'CheckedIn':
        return <span className="status-pill status-stay">Checked in</span>;
      case 'Confirmed':
        return <span className="status-pill status-confirmed">Confirmed</span>;
      case 'Pending':
        return <span className="status-pill status-pending">Pending approval</span>;
      default:
        return <span className="status-pill">{st}</span>;
    }
  };

  return (
    <div className="modal-backdrop-luxury" role="dialog" aria-modal="true" aria-label="Guest portal">
      <div className="modal-card-luxury">
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="staff-brand-mark"><Sparkles size={18} /></div>
            <div>
              <div className="text-warning text-uppercase fw-bold" style={{ fontSize: '10px', letterSpacing: '.16em' }}>Private guest portal</div>
              <div className="fw-semibold">{currentStay.guestName}</div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button onClick={handleLogout} className="btn btn-sm btn-outline-light rounded-pill d-flex align-items-center gap-1">
              <LogOut size={13} /> Exit stay
            </button>
            <button onClick={onClose} className="btn btn-sm btn-outline-light rounded-circle p-2" aria-label="Close">
              <X size={17} />
            </button>
          </div>
        </div>

        <div className="p-4 p-md-5">
          <div className="glass-panel p-4 mb-4">
            <div className="d-flex justify-content-between align-items-start gap-3">
              <div>
                <div className="text-white-50 small">Booking reference</div>
                <div className="fw-semibold text-warning">{currentStay.bookingId}</div>
              </div>
              {renderBadge(currentStay.status)}
            </div>
            <div className="row g-3 mt-3 pt-3 border-top">
              <div className="col-6">
                <div className="text-white-50 small">Residence</div>
                <div className="small">Suite {currentStay.roomNumber}</div>
              </div>
              <div className="col-6 text-end">
                <div className="text-white-50 small">Current total</div>
                <div className="small fw-semibold">${currentStay.grandTotal}</div>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 p-1 rounded-pill mb-4" style={{ background: 'rgba(255,255,255,.045)', border: '1px solid rgba(255,255,255,.06)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('service')}
              className={`btn btn-sm flex-fill rounded-pill py-2 border-0 d-flex align-items-center justify-content-center gap-2 ${activeTab === 'service' ? 'btn-gold' : 'text-white-50'}`}
            >
              <Bell size={14} /> Concierge
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('feedback')}
              className={`btn btn-sm flex-fill rounded-pill py-2 border-0 d-flex align-items-center justify-content-center gap-2 ${activeTab === 'feedback' ? 'btn-gold' : 'text-white-50'}`}
            >
              <MessageSquare size={14} /> Review
            </button>
          </div>

          {activeTab === 'service' && (
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <ConciergeBell size={17} className="text-warning" />
                <h5 className="page-title mb-0">In-room concierge</h5>
              </div>
              <p className="text-white-50 small mb-4">Request discreet assistance from the hotel team.</p>

              {serviceSuccess && <div className="alert alert-success py-3 small d-flex gap-2"><CheckCircle size={16} /> {serviceSuccess}</div>}
              {serviceError && <div className="alert alert-danger py-3 small">{serviceError}</div>}

              <form onSubmit={handleSendServiceRequest}>
                <label className="form-label small fw-semibold">Select service</label>
                <div className="d-flex gap-2 flex-wrap mb-3">
                  {['Housekeeping', 'Dining', 'Luggage'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setRequestType(type)}
                      className={`btn btn-sm rounded-pill px-3 ${requestType === type ? 'btn-gold' : 'btn-outline-light'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <label className="form-label small fw-semibold">Notes or instructions</label>
                <input
                  type="text"
                  placeholder="Extra towels, dinner menu, luggage collection..."
                  className="form-control mb-3"
                  value={requestDetails}
                  onChange={(e) => setRequestDetails(e.target.value)}
                />

                <button type="submit" disabled={serviceSubmitting} className="btn gold-button w-100 py-3">
                  {serviceSubmitting ? 'Sending request...' : 'Request concierge service'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <MessageSquare size={17} className="text-warning" />
                <h5 className="page-title mb-0">Rate your stay</h5>
              </div>
              <p className="text-white-50 small mb-4">Tell us about the details that made your stay memorable.</p>

              {feedbackSuccess && <div className="alert alert-success py-3 small d-flex gap-2"><CheckCircle size={16} /> {feedbackSuccess}</div>}
              {feedbackError && <div className="alert alert-danger py-3 small">{feedbackError}</div>}

              <form onSubmit={handleSendFeedback}>
                <div className="glass-panel p-4 mb-3 text-center">
                  <div className="text-white-50 small mb-2">Your rating</div>
                  <div className="d-flex justify-content-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="btn p-0 border-0 bg-transparent"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        aria-label={`Rate ${star} out of 5`}
                      >
                        <Star size={28} fill={(hoverRating || rating) >= star ? '#e5c378' : 'none'} color={(hoverRating || rating) >= star ? '#e5c378' : '#64748b'} />
                      </button>
                    ))}
                  </div>
                </div>

                <label className="form-label small fw-semibold">Your comments</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share what you loved or how we can improve..."
                  className="form-control mb-3"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                />

                <button type="submit" disabled={feedbackSubmitting} className="btn gold-button w-100 py-3">
                  {feedbackSubmitting ? 'Submitting review...' : 'Submit feedback'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
