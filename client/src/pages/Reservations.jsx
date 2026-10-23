import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  User, 
  Search, 
  Filter, 
  LogIn, 
  LogOut,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Fetch Reservations from Backend
  const fetchReservations = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await API.get('/reservations');
      const list = Array.isArray(res.data) ? res.data : (res.data?.reservations || []);
      setReservations(list);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setErrorMsg('Reservations could not be loaded. Check the session or network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // 2. Status Update Action (Approve, CheckIn, CheckOut, Cancel)
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setActionLoading(id);
      await API.patch(`/reservations/${id}/status`, { status: newStatus });
      
      // Update local state so the table reflects the new status without a full page reload.
      setReservations((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.message || 'Status update fail ho gaya.');
    } finally {
      setActionLoading(null);
    }
  };

  // 3. Filtered Reservations List
  const filteredList = reservations.filter((item) => {
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const query = searchTerm.toLowerCase();
    const guestName = (item.guest?.fullName || item.guest?.name || '').toLowerCase();
    const bookingId = (item.bookingId || '').toLowerCase();
    const roomNumber = String(item.room?.roomNumber || '').toLowerCase();

    const matchesSearch = 
      guestName.includes(query) || 
      bookingId.includes(query) || 
      roomNumber.includes(query);

    return matchesStatus && matchesSearch;
  });

  // Badge Color Helper
  const renderBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="badge bg-warning text-dark px-2 py-1"><Clock size={12} className="me-1" />Pending Approval</span>;
      case 'Confirmed':
        return <span className="badge bg-success px-2 py-1"><CheckCircle size={12} className="me-1" />Confirmed</span>;
      case 'CheckedIn':
        return <span className="badge bg-info text-dark px-2 py-1"><LogIn size={12} className="me-1" />Checked In</span>;
      case 'CheckedOut':
        return <span className="badge bg-secondary px-2 py-1"><LogOut size={12} className="me-1" />Checked Out</span>;
      case 'Cancelled':
        return <span className="badge bg-danger px-2 py-1"><XCircle size={12} className="me-1" />Cancelled</span>;
      default:
        return <span className="badge bg-dark px-2 py-1">{status}</span>;
    }
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f4f0e8', minHeight: '100vh', color: '#2a2825' }}>
      
      {/* Top Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px' }}>Reservations Management</h3>
          <p className="text-secondary small mb-0">Approve web guest bookings and manage room check-ins / check-outs.</p>
        </div>
        <button 
          onClick={fetchReservations} 
          disabled={loading}
          className="btn btn-outline-light btn-sm rounded-pill d-flex align-items-center gap-1 border-opacity-25"
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh List
        </button>
      </div>

      {errorMsg && (
        <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {/* Filters & Search */}
      <div className="card border-0 rounded-3 p-3 mb-4 shadow-sm" style={{ backgroundColor: '#f8f2e8' }}>
        <div className="row g-3">
          <div className="col-12 col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-dark border-secondary text-secondary"><Search size={14} /></span>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search Guest Name, Booking ID, or Room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-7 d-flex gap-2 flex-wrap justify-content-md-end">
            {['All', 'Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`btn btn-sm rounded-pill px-3 ${
                  statusFilter === tab ? 'btn-primary' : 'btn-outline-secondary text-secondary border-opacity-50'
                }`}
                style={{ fontSize: '12px' }}
              >
                {tab === 'Pending' ? '⚠️ Pending Approval' : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="card border-0 rounded-3 overflow-hidden shadow-sm" style={{ backgroundColor: '#f8f2e8' }}>
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle table-luxury">
            <thead style={{ backgroundColor: '#f1ece4', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <tr>
                <th className="py-3 px-3">Booking ID</th>
                <th className="py-3">Guest Details</th>
                <th className="py-3">Suite / Room</th>
                <th className="py-3">Dates</th>
                <th className="py-3">Total Bill</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-end px-3">Approval & Actions</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '13px' }}>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-secondary">
                    Loading reservations database...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-secondary">
                    No reservations found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredList.map((res) => {
                  const isProcessing = actionLoading === res._id;
                  return (
                    <tr key={res._id}>
                      {/* Booking ID */}
                      <td className="px-3 fw-semibold text-warning">
                        {res.bookingId}
                      </td>

                      {/* Guest Details */}
                      <td>
                        <div className="fw-semibold text-white">{res.guest?.fullName || res.guest?.name || 'Guest'}</div>
                        <div className="text-secondary small">{res.guest?.email || 'No email'} | {res.guest?.phone || 'No phone'}</div>
                      </td>

                      {/* Room */}
                      <td>
                        <span className="badge bg-secondary px-2 py-1">
                          Room {res.room?.roomNumber || 'N/A'}
                        </span>
                        <div className="text-secondary small mt-1">
                          {res.room?.roomType || 'Suite'}
                        </div>
                      </td>

                      {/* Dates */}
                      <td>
                        <div className="small text-white">
                          In: {res.checkInDate ? new Date(res.checkInDate).toLocaleDateString() : '-'}
                        </div>
                        <div className="small text-secondary">
                          Out: {res.checkOutDate ? new Date(res.checkOutDate).toLocaleDateString() : '-'}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="fw-bold text-white">
                        ${res.totalAmount || 0}
                      </td>

                      {/* Status */}
                      <td>
                        {renderBadge(res.status)}
                      </td>

                      {/* Actions Buttons (Approval Logic) */}
                      <td className="text-end px-3">
                        <div className="d-flex justify-content-end gap-1 flex-wrap">
                          
                          {/* 1. AGAR PENDING HO (APPROVE YA REJECT BUTTON) */}
                          {res.status === 'Pending' && (
                            <>
                              <button
                                disabled={isProcessing}
                                onClick={() => handleUpdateStatus(res._id, 'Confirmed')}
                                className="btn btn-sm btn-success rounded-pill px-3 py-1 d-flex align-items-center gap-1"
                                style={{ fontSize: '12px' }}
                              >
                                <CheckCircle size={13} /> Approve
                              </button>
                              <button
                                disabled={isProcessing}
                                onClick={() => handleUpdateStatus(res._id, 'Cancelled')}
                                className="btn btn-sm btn-outline-danger rounded-pill px-2 py-1 d-flex align-items-center gap-1"
                                style={{ fontSize: '12px' }}
                              >
                                <XCircle size={13} /> Reject
                              </button>
                            </>
                          )}

                          {/* 2. AGAR CONFIRMED HO (CHECK-IN BUTTON) */}
                          {res.status === 'Confirmed' && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleUpdateStatus(res._id, 'CheckedIn')}
                              className="btn btn-sm btn-info rounded-pill px-3 py-1 text-dark d-flex align-items-center gap-1"
                              style={{ fontSize: '12px' }}
                            >
                              <LogIn size={13} /> Check-In
                            </button>
                          )}

                          {/* 3. AGAR CHECKED-IN HO (CHECK-OUT BUTTON) */}
                          {res.status === 'CheckedIn' && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleUpdateStatus(res._id, 'CheckedOut')}
                              className="btn btn-sm btn-warning rounded-pill px-3 py-1 text-dark d-flex align-items-center gap-1"
                              style={{ fontSize: '12px' }}
                            >
                              <LogOut size={13} /> Check-Out
                            </button>
                          )}

                          {/* 4. COMPLETED YA CANCELLED HO */}
                          {['CheckedOut', 'Cancelled'].includes(res.status) && (
                            <span className="text-secondary small fst-italic">No action needed</span>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}