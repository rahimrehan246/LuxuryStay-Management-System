import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Star, Quote, UserCheck } from 'lucide-react';

export default function GuestReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await API.get('/feedback', {
          headers: { Authorization: '' },
        });
        const list = Array.isArray(res.data) ? res.data : [];
        // Show highly rated reviews first while preserving the existing response contract.
        const positiveReviews = list.filter((r) => Number(r.rating) >= 4);
        setReviews(positiveReviews.length > 0 ? positiveReviews.slice(0, 6) : list.slice(0, 6));
      } catch (err) {
        console.error('Error loading guest reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading || reviews.length === 0) return null;

  return (
    <section className="container py-5">
      <div className="text-center mb-5">
        <span className="hero-badge">Verified guest impressions</span>
        <h2 className="page-title mt-3 mb-2">Stories from the house</h2>
        <p className="text-white-50 small mx-auto mb-0" style={{ maxWidth: '560px' }}>
          Authentic experiences from guests who enjoyed considered comfort and signature hospitality.
        </p>
      </div>

      <div className="row g-4">
        {reviews.map((rev) => (
          <div key={rev._id} className="col-12 col-md-6 col-lg-4">
            <article className="luxury-card h-100 p-4 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="d-flex gap-1">
                    {[...Array(Number(rev.rating) || 5)].map((_, i) => (
                      <Star key={i} size={15} fill="#e5c378" color="#e5c378" />
                    ))}
                  </div>
                  <Quote size={25} className="text-warning opacity-50" />
                </div>

                <p className="text-white-50 fst-italic lh-lg mb-4">
                  “{rev.comment || 'Wonderful experience and great service.'}”
                </p>
              </div>

              <div className="pt-3 border-top d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle d-flex align-items-center justify-content-center text-dark fw-bold" style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #e5c378, #c5a880)' }}>
                    {rev.guestName ? rev.guestName.charAt(0).toUpperCase() : 'G'}
                  </div>
                  <div>
                    <div className="small fw-semibold">{rev.guestName || 'Verified Guest'}</div>
                    <div className="text-white-50" style={{ fontSize: '11px' }}>
                      {rev.roomNumber && rev.roomNumber !== 'N/A' ? `Suite ${rev.roomNumber}` : 'LuxuryStay guest'}
                    </div>
                  </div>
                </div>
                <span className="status-pill d-flex align-items-center gap-1">
                  <UserCheck size={11} className="text-warning" /> Verified
                </span>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
