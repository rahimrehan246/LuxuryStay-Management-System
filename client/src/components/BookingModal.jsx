import React, { useState } from 'react';
import API from '../api/axios';
import { X, CheckCircle, ShieldCheck, CalendarDays, UserRound, CreditCard } from 'lucide-react';

export default function BookingModal({ isOpen, onClose, selectedRoom, onBookingSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash at Front Desk');

  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!isOpen || !selectedRoom) return null;

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 1;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  const pricePerNight = Number(selectedRoom?.pricePerNight) || 0;
  const grandTotal = pricePerNight * nights;

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg('');

      // Create the guest profile without a token because this is a public reservation flow.
      const guestRes = await API.post('/guests', {
        fullName: guestName,
        name: guestName,
        email: guestEmail.trim().toLowerCase(),
        phone: guestPhone,
        idNumber: `WEB-${Date.now().toString().slice(-6)}`,
        address: 'Online Website Guest'
      }, {
        headers: { Authorization: '' }
      });

      const guestId = guestRes.data?._id || guestRes.data?.guest?._id;

      if (!guestId) {
        throw new Error('Guest profile could not be registered.');
      }

      // Create the reservation using the existing public reservation contract.
      const resPayload = {
        guestId: guestId,
        roomId: selectedRoom._id,
        checkInDate,
        checkOutDate,
        paymentMethod,
        notes: specialRequests,
        status: 'Pending'
      };

      const bookingRes = await API.post('/reservations', resPayload, {
        headers: { Authorization: '' }
      });

      const data = bookingRes.data;

      const stayRecord = {
        bookingId: data.bookingId || data._id,
        guestName,
        guestEmail,
        roomNumber: selectedRoom.roomNumber,
        roomType: selectedRoom.roomType || selectedRoom.type,
        grandTotal: data.totalAmount || grandTotal,
        status: data.status || 'Pending'
      };

      localStorage.setItem('luxury_guest_stay', JSON.stringify(stayRecord));
      localStorage.setItem('luxury_guest_ref', stayRecord.bookingId);

      setConfirmedBooking(stayRecord);
      setStep(2);
      if (onBookingSuccess) onBookingSuccess(stayRecord);

    } catch (err) {
      console.error('Booking submission error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Booking could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setErrorMsg('');
    setConfirmedBooking(null);
    onClose();
  };

  return (
    <div className="modal-backdrop-luxury" role="dialog" aria-modal="true" aria-label="Reserve suite">
      <div className="modal-card-luxury wide">
        <div className="p-4 border-bottom d-flex align-items-center justify-content-between">
          <div>
            <div className="text-warning text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '.18em' }}>Private reservation</div>
            <h4 className="page-title mb-0 mt-1">Reserve Suite {selectedRoom?.roomNumber}</h4>
          </div>
          <button onClick={handleClose} className="btn btn-sm btn-outline-light rounded-circle p-2" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {errorMsg && <div className="alert alert-danger rounded-0 m-0 py-3 px-4 small">{errorMsg}</div>}

        <div className="p-4 p-md-5">
          {step === 1 ? (
            <form onSubmit={handleSubmitBooking}>
              <div className="glass-panel p-3 mb-4 d-flex justify-content-between align-items-center gap-3">
                <div>
                  <div className="text-warning small text-uppercase fw-semibold" style={{ letterSpacing: '.12em' }}>Selected residence</div>
                  <h5 className="mb-1 mt-1">{selectedRoom?.roomType || selectedRoom?.type} Suite</h5>
                  <span className="text-white-50 small">${pricePerNight} per night</span>
                </div>
                <span className="status-pill status-confirmed">Available</span>
              </div>

              <div className="text-uppercase text-white-50 fw-semibold mb-3" style={{ fontSize: '10px', letterSpacing: '.16em' }}>Stay dates</div>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold"><CalendarDays size={14} className="text-warning me-1" /> Check-in</label>
                  <input type="date" required className="form-control" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold"><CalendarDays size={14} className="text-warning me-1" /> Check-out</label>
                  <input type="date" required className="form-control" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} />
                </div>
              </div>

              <div className="text-uppercase text-white-50 fw-semibold mb-3" style={{ fontSize: '10px', letterSpacing: '.16em' }}>Guest details</div>
              <div className="row g-3 mb-4">
                <div className="col-12">
                  <label className="form-label small fw-semibold"><UserRound size={14} className="text-warning me-1" /> Full name</label>
                  <input type="text" required placeholder="Enter guest full name" className="form-control" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Email address</label>
                  <input type="email" required placeholder="guest@example.com" className="form-control" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Phone number</label>
                  <input type="tel" required placeholder="+1 555 000 0000" className="form-control" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Payment preference</label>
                  <div className="input-group">
                    <span className="input-group-text"><CreditCard size={15} className="text-warning" /></span>
                    <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <option value="Cash at Front Desk">Pay at reception upon arrival</option>
                      <option value="Online Card Settle">Online credit/debit card</option>
                    </select>
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Special requests</label>
                  <textarea rows={3} placeholder="Airport transfer, dietary preference, celebration details..." className="form-control" value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center border-top pt-3 mb-4">
                <div>
                  <div className="text-white-50 small">Estimated stay</div>
                  <div className="fw-semibold">{nights} {nights > 1 ? 'nights' : 'night'}</div>
                </div>
                <div className="text-end">
                  <div className="text-white-50 small">Estimated total</div>
                  <div className="fs-4 fw-bold text-warning">${grandTotal}</div>
                </div>
              </div>

              <button type="submit" disabled={loading || !checkInDate || !checkOutDate} className="btn gold-button w-100 py-3 d-flex align-items-center justify-content-center gap-2">
                {loading ? 'Submitting reservation...' : 'Confirm booking request'} <ShieldCheck size={17} />
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="kpi-icon mx-auto mb-3"><CheckCircle size={24} /></div>
              <div className="text-warning text-uppercase fw-semibold small" style={{ letterSpacing: '.16em' }}>Reservation received</div>
              <h3 className="page-title mt-2">Your stay is on its way.</h3>
              <p className="text-white-50 small mx-auto mb-4" style={{ maxWidth: '520px' }}>
                Your booking request has reached the reception team and is currently pending staff approval.
              </p>

              <div className="glass-panel text-start p-4 mb-4">
                <div className="d-flex justify-content-between gap-3 py-2 border-bottom">
                  <span className="text-white-50 small">Booking reference</span>
                  <strong className="text-warning small">{confirmedBooking?.bookingId}</strong>
                </div>
                <div className="d-flex justify-content-between gap-3 py-2 border-bottom">
                  <span className="text-white-50 small">Guest</span>
                  <span className="small">{confirmedBooking?.guestName}</span>
                </div>
                <div className="d-flex justify-content-between gap-3 py-2 border-bottom">
                  <span className="text-white-50 small">Suite</span>
                  <span className="small">Room {confirmedBooking?.roomNumber}</span>
                </div>
                <div className="d-flex justify-content-between gap-3 pt-2">
                  <span className="text-white-50 small">Status</span>
                  <span className="status-pill status-pending">Pending staff approval</span>
                </div>
              </div>

              <button onClick={handleClose} className="btn btn-outline-light rounded-pill px-4">Return to suites</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
