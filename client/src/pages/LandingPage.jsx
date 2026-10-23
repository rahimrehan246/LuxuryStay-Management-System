import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import BookingModal from '../components/BookingModal';
import GuestPortalModal from '../components/GuestPortalModal';
import GuestReviews from '../components/GuestReviews';
import {
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  Wifi,
  Coffee,
  Tv,
  Waves,
  ConciergeBell,
  UtensilsCrossed,
} from 'lucide-react';

const suiteImages = [
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=88',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=88',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=88',
];

export default function LandingPage() {
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Modal state
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);

  // Active stay tracking for the guest
  const [activeStay, setActiveStay] = useState(null);

  // Guest lookup state
  const [lookupRef, setLookupRef] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  useEffect(() => {
    const savedStay = localStorage.getItem('luxury_guest_stay');
    if (savedStay) {
      try {
        setActiveStay(JSON.parse(savedStay));
      } catch (e) {
        console.error('Error parsing stay cache:', e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        const res = await API.get('/rooms', {
          headers: { Authorization: '' },
        });
        const list = Array.isArray(res.data) ? res.data : (res.data?.rooms || []);
        const available = list.filter((r) => r.status === 'Available');
        setRooms(available.length > 0 ? available : list);
      } catch (err) {
        console.error('Error fetching rooms:', err);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, []);

  const handleLookupStay = async (e) => {
    e.preventDefault();
    try {
      setLookupLoading(true);
      setLookupError('');

      const res = await API.post(
        '/reservations/lookup',
        {
          bookingId: lookupRef.trim(),
          email: lookupEmail.trim(),
        },
        {
          headers: { Authorization: '' },
        }
      );

      const reservationData = res.data?.reservation;
      if (reservationData) {
        localStorage.setItem('luxury_guest_stay', JSON.stringify(reservationData));
        setActiveStay(reservationData);
        setIsPortalOpen(true);
        setLookupRef('');
        setLookupEmail('');
      }
    } catch (err) {
      console.error('Lookup failed:', err);
      setLookupError(err.response?.data?.message || 'Invalid Booking ID or Email address.');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="guest-page min-vh-100">
      <nav className="guest-nav">
        <div className="container-fluid p-0 d-flex align-items-center justify-content-between gap-3">
          <a href="/" className="text-decoration-none d-flex align-items-center gap-2">
            <span className="brand-monogram">LS</span>
            <span className="d-none d-sm-block">
              <span className="d-block fw-bold text-white tracking-wide">LUXURY STAY</span>
              <span className="d-block text-white-50" style={{ fontSize: '9px', letterSpacing: '.16em' }}>HOSPITALITY GROUP</span>
            </span>
          </a>

          <div className="desktop-nav d-flex align-items-center gap-2">
            <a href="#suites-section" className="btn btn-sm btn-link text-decoration-none">Suites</a>
            <a href="#experience-section" className="btn btn-sm btn-link text-decoration-none">Experience</a>
            <a href="#lookup-section" className="btn btn-sm btn-link text-decoration-none">Guest Portal</a>
          </div>

          <div className="d-flex align-items-center gap-2">
            {activeStay ? (
              <button onClick={() => setIsPortalOpen(true)} className="btn btn-sm gold-button px-3 d-flex align-items-center gap-2">
                <Sparkles size={14} /> <span className="d-none d-sm-inline">My Stay</span>
              </button>
            ) : (
              <a href="#lookup-section" className="btn btn-sm btn-outline-light rounded-pill px-3">Find My Stay</a>
            )}
            <a href="/login" className="btn btn-sm btn-link text-decoration-none d-none d-sm-inline">Staff</a>
          </div>
        </div>
      </nav>

      <header className="hero-luxury">
        <div className="container hero-content py-5">
          <div className="row">
            <div className="col-lg-8">
              <span className="hero-badge"><Sparkles size={13} /> Exquisite hospitality & private suites</span>
              <h1 className="hero-title text-white mt-4 mb-4">Stay somewhere <span style={{ color: '#e5c378' }}>extraordinary.</span></h1>
              <p className="hero-subtitle mb-4">
                A private collection of refined suites, attentive concierge service and quiet luxury designed around the way you want to stay.
              </p>
              <div className="d-flex flex-wrap gap-2 mb-5">
                <a href="#suites-section" className="btn gold-button px-4 py-3 d-inline-flex align-items-center gap-2">
                  Explore the collection <ArrowRight size={17} />
                </a>
                <a href="#lookup-section" className="btn btn-outline-light rounded-pill px-4 py-3">
                  Access guest portal
                </a>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <div className="hero-stat">
                  <div className="text-warning fw-bold">24/7</div>
                  <div className="small text-white-50">Private concierge</div>
                </div>
                <div className="hero-stat">
                  <div className="text-warning fw-bold">5★</div>
                  <div className="small text-white-50">Signature service</div>
                </div>
                <div className="hero-stat">
                  <div className="text-warning fw-bold">∞</div>
                  <div className="small text-white-50">Tailored comfort</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="experience-section" className="container py-5">
        <div className="row g-3">
          <div className="col-12 col-lg-4">
            <div className="glass-panel h-100 p-4">
              <ConciergeBell size={24} className="text-warning mb-3" />
              <h4 className="lux-serif">Personal concierge</h4>
              <p className="text-white-50 small mb-0 lh-lg">From arrival arrangements to in-room requests, every detail is handled with discreet attention.</p>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="glass-panel h-100 p-4">
              <Waves size={24} className="text-warning mb-3" />
              <h4 className="lux-serif">Serene spaces</h4>
              <p className="text-white-50 small mb-0 lh-lg">Marble finishes, soft lighting, considered textures and quiet views create a sense of arrival from the moment you enter.</p>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="glass-panel h-100 p-4">
              <UtensilsCrossed size={24} className="text-warning mb-3" />
              <h4 className="lux-serif">Elevated dining</h4>
              <p className="text-white-50 small mb-0 lh-lg">Thoughtful dining and attentive room service complete an experience that feels effortless rather than elaborate.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="suites-section" className="container py-5">
        <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap mb-4">
          <div>
            <div className="text-uppercase text-warning fw-semibold small" style={{ letterSpacing: '.18em' }}>The residences</div>
            <h2 className="page-title mt-2 mb-1">Curated suites</h2>
            <p className="text-white-50 small mb-0">Designed for long evenings, slow mornings and effortless arrivals.</p>
          </div>
          <div className="text-white-50 small d-flex align-items-center gap-2"><ShieldCheck size={15} className="text-warning" /> Flexible guest support</div>
        </div>

        {loadingRooms ? (
          <div className="glass-panel text-center py-5 text-white-50">Preparing the suite collection...</div>
        ) : rooms.length === 0 ? (
          <div className="glass-panel text-center py-5">
            <h5>No suites are currently available.</h5>
            <p className="text-white-50 small mb-0">Please return shortly or contact the front desk.</p>
          </div>
        ) : (
          <div className="row g-4">
            {rooms.map((room, index) => (
              <div key={room._id} className="col-12 col-md-6 col-xl-4">
                <article className="suite-card">
                  <div className="suite-image-wrap">
                    <img className="suite-image" src={suiteImages[index % suiteImages.length]} alt={`${room.roomType || room.type || 'Luxury'} suite`} />
                    <div className="position-absolute bottom-0 start-0 end-0 p-3 z-1 d-flex justify-content-between align-items-end">
                      <span className="status-pill status-confirmed">Available</span>
                      <span className="text-white small">Suite {room.roomNumber}</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="d-flex justify-content-between gap-3 align-items-start mb-2">
                      <div>
                        <div className="text-warning text-uppercase small fw-semibold" style={{ letterSpacing: '.13em' }}>Signature residence</div>
                        <h3 className="lux-serif mb-0 mt-1">{room.roomType || room.type || 'Luxury'} Suite</h3>
                      </div>
                      <div className="text-end flex-shrink-0">
                        <div className="fw-bold fs-5">${room.pricePerNight}</div>
                        <div className="text-white-50" style={{ fontSize: '10px' }}>/ night</div>
                      </div>
                    </div>

                    <p className="text-white-50 small lh-lg mt-3">
                      Refined interiors, king-sized bedding, marble bath amenities and dedicated concierge access.
                    </p>

                    <div className="d-flex flex-wrap gap-2 mb-4">
                      <span className="status-pill"><Wifi size={12} className="text-warning" /> WiFi</span>
                      <span className="status-pill"><Coffee size={12} className="text-warning" /> Breakfast</span>
                      <span className="status-pill"><Tv size={12} className="text-warning" /> Smart TV</span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedRoom(room);
                        setIsBookingOpen(true);
                      }}
                      className="btn gold-button w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                    >
                      Reserve this suite <ArrowRight size={15} />
                    </button>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </section>

      <GuestReviews />

      <section id="lookup-section" className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-7">
            <div className="glass-panel p-4 p-md-5">
              <div className="text-center mb-4">
                <span className="hero-badge">Private guest access</span>
                <h2 className="page-title mt-3 mb-2">Find your stay</h2>
                <p className="text-white-50 small mb-0">Open your concierge portal using the booking reference and email used for the reservation.</p>
              </div>

              {lookupError && <div className="alert alert-danger py-3 small">{lookupError}</div>}

              <form onSubmit={handleLookupStay}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Booking reference</label>
                    <input type="text" required placeholder="LS-935184-115" className="form-control" value={lookupRef} onChange={(e) => setLookupRef(e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Registered email</label>
                    <input type="email" required placeholder="guest@example.com" className="form-control" value={lookupEmail} onChange={(e) => setLookupEmail(e.target.value)} />
                  </div>
                  <div className="col-12">
                    <button type="submit" disabled={lookupLoading} className="btn gold-button w-100 py-3 d-flex align-items-center justify-content-center gap-2">
                      {lookupLoading ? 'Locating your stay...' : 'Open guest portal'} <Search size={16} />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="container py-5">
        <div className="gold-divider mb-4" />
        <div className="d-flex flex-wrap justify-content-between gap-3 small text-white-50">
          <span>© 2026 Luxury Stay Hospitality Group.</span>
          <span>Private stays · Signature service · Timeless design</span>
        </div>
      </footer>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedRoom={selectedRoom}
        onBookingSuccess={(stay) => setActiveStay(stay)}
      />

      <GuestPortalModal
        isOpen={isPortalOpen}
        onClose={() => setIsPortalOpen(false)}
        currentStay={activeStay}
        onClearStay={() => setActiveStay(null)}
      />
    </div>
  );
}
