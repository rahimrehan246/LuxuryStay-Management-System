import React, { useState } from 'react';
import API from '../api/axios';
import { Star, X, CheckCircle, MessageSquare } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose, currentStay }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg('');

      await API.post(
        '/feedback',
        {
          guestName: currentStay?.guestName || 'Website Guest',
          email: currentStay?.guestEmail || '',
          roomNumber: currentStay?.roomNumber || 'Website Visit',
          bookingId: currentStay?.bookingId || '',
          rating,
          comment,
        },
        {
          headers: { Authorization: '' }, // Public request; no token is required.
        }
      );

      setSuccess(true);
    } catch (err) {
      console.error('Feedback submission error:', err);
      setErrorMsg(err.response?.data?.message || 'Feedback could not be submitted.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccess(false);
    setComment('');
    setRating(5);
    setErrorMsg('');
    onClose();
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(38, 34, 29, 0.58)', backdropFilter: 'blur(8px)', zIndex: 1070 }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '460px' }}>
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden" style={{ backgroundColor: '#fffdf9', color: '#2a2825' }}>
          
          <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ backgroundColor: '#f1ece4' }}>
            <div className="d-flex align-items-center gap-2">
              <MessageSquare size={16} color="#c5a880" />
              <span className="fw-bold tracking-wide small" style={{ color: '#9b753e', letterSpacing: '1px' }}>
                SHARE YOUR EXPERIENCE
              </span>
            </div>
            <button onClick={handleResetAndClose} className="btn btn-sm btn-link text-white-50 p-0 text-decoration-none">
              <X size={20} />
            </button>
          </div>

          <div className="p-4">
            {success ? (
              <div className="text-center py-4">
                <CheckCircle size={46} className="text-success mb-2" />
                <h5 className="fw-bold text-white mb-1">Thank You!</h5>
                <p className="text-white-50 small mb-3">
                  Your review has been recorded. We appreciate your feedback and will use it to improve future stays.
                </p>
                <button onClick={handleResetAndClose} className="btn btn-sm btn-outline-light rounded-pill px-4">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {errorMsg && <div className="alert alert-danger py-2 small mb-3">{errorMsg}</div>}

                {/* Star Rating */}
                <div className="text-center mb-3">
                  <label className="form-label small text-white-50 d-block mb-2">How was your stay?</label>
                  <div className="d-flex justify-content-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="btn p-0 border-0 bg-transparent"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                      >
                        <Star
                          size={28}
                          fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'}
                          color={(hoverRating || rating) >= star ? '#f59e0b' : '#64748b'}
                          style={{ transition: 'transform 0.15s ease' }}
                        />
                      </button>
                    ))}
                  </div>
                  <small className="text-warning fw-semibold mt-1 d-block">
                    {rating === 5 && 'Outstanding'}
                    {rating === 4 && 'Very Good'}
                    {rating === 3 && 'Average'}
                    {rating === 2 && 'Needs Improvement'}
                    {rating === 1 && 'Poor'}
                  </small>
                </div>

                {/* Comment Box */}
                <div className="mb-3">
                  <label className="form-label small text-white-50 mb-1">Your Feedback / Suggestions</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what you loved or how we can improve..."
                    className="form-control form-control-sm bg-dark text-white border-secondary"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn w-100 py-2 rounded-pill fw-semibold text-dark border-0"
                  style={{ background: 'linear-gradient(135deg, #c5a880, #b39366)' }}
                >
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}