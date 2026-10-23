import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import {
  BedDouble,
  Users,
  CalendarCheck,
  DollarSign,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    cleaningRooms: 0,
    totalGuests: 0,
    activeBookings: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    pendingTasks: 0,
  });

  const [recentReservations, setRecentReservations] = useState([]);
  const [pendingTasksList, setPendingTasksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resRooms, resGuests, resBookings, resInvoices, resTasks] = await Promise.all([
        API.get('/rooms'),
        API.get('/guests'),
        API.get('/reservations'),
        API.get('/invoices'),
        API.get('/tasks'),
      ]);

      const rooms = resRooms.data?.data || resRooms.data?.rooms || resRooms.data || [];
      const guests = resGuests.data?.data || resGuests.data?.guests || resGuests.data || [];
      const bookings = resBookings.data?.data || resBookings.data?.reservations || resBookings.data || [];
      const invoices = resInvoices.data?.data || resInvoices.data?.invoices || resInvoices.data || [];
      const tasks = resTasks.data?.data || resTasks.data?.tasks || resTasks.data || [];

      // Calculate room metrics from the existing API response.
      const availableRooms = rooms.filter((r) => r.status === 'Available').length;
      const occupiedRooms = rooms.filter((r) => r.status === 'Occupied').length;
      const cleaningRooms = rooms.filter((r) => r.status === 'Cleaning' || r.status === 'Maintenance').length;

      // Calculate active reservations using the existing reservation status values.
      const activeBookings = bookings.filter(
        (b) => b.status === 'Confirmed' || b.status === 'CheckedIn' || b.bookingStatus === 'Booked' || b.bookingStatus === 'Checked-In'
      ).length;

      // Calculate settled revenue and outstanding invoice count.
      const totalRevenue = invoices
        .filter((inv) => inv.paymentStatus === 'Paid')
        .reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);

      const pendingInvoices = invoices.filter((inv) => inv.paymentStatus !== 'Paid').length;
      const pendingTasks = tasks.filter((t) => t.status !== 'Completed').length;

      setStats({
        totalRooms: rooms.length,
        availableRooms,
        occupiedRooms,
        cleaningRooms,
        totalGuests: guests.length,
        activeBookings,
        totalRevenue,
        pendingInvoices,
        pendingTasks,
      });

      setRecentReservations(Array.isArray(bookings) ? bookings.slice(0, 5) : []);
      setPendingTasksList(Array.isArray(tasks) ? tasks.filter((t) => t.status !== 'Completed').slice(0, 4) : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const occupancyRate = stats.totalRooms > 0
    ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
    : 0;

  const kpis = [
    {
      label: 'Settled revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      meta: 'Paid folios',
      icon: DollarSign,
      tone: 'gold',
    },
    {
      label: 'Room occupancy',
      value: `${occupancyRate}%`,
      meta: `${stats.occupiedRooms} of ${stats.totalRooms} rooms`,
      icon: BedDouble,
      tone: 'indigo',
    },
    {
      label: 'Active bookings',
      value: stats.activeBookings,
      meta: `${stats.totalGuests} registered guests`,
      icon: CalendarCheck,
      tone: 'emerald',
    },
    {
      label: 'Pending tasks',
      value: stats.pendingTasks,
      meta: `${stats.cleaningRooms} rooms being serviced`,
      icon: Sparkles,
      tone: 'amber',
    },
  ];

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <div className="text-uppercase text-warning fw-semibold small" style={{ letterSpacing: '.17em' }}>Operations overview</div>
          <h2 className="page-title mt-2 mb-1">Hospitality command center</h2>
          <p className="text-white-50 small mb-0">Live rooms, guest activity, reservations and service performance.</p>
        </div>
        <Link to="/reservations" className="btn btn-luxury d-flex align-items-center gap-2">
          <CalendarCheck size={16} /> New booking
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="luxury-card p-5 text-center text-white-50">Synchronizing live hotel operations...</div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            {kpis.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="col-12 col-sm-6 col-xl-3">
                  <div className="luxury-card p-4 h-100">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <div className="text-white-50 text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '.14em' }}>{item.label}</div>
                        <div className="display-6 fw-semibold mt-2">{item.value}</div>
                        <div className="text-white-50 small mt-1 d-flex align-items-center gap-1">
                          {item.tone === 'gold' && <TrendingUp size={13} className="text-warning" />}
                          {item.meta}
                        </div>
                      </div>
                      <div className="kpi-icon"><Icon size={21} /></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="luxury-card p-4 mb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <div>
                <div className="text-warning text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '.16em' }}>Inventory pulse</div>
                <h5 className="mb-0 mt-1">Room allocation</h5>
              </div>
              <span className="text-white-50 small">{stats.totalRooms} inventory units</span>
            </div>

            <div className="progress" style={{ height: '12px', borderRadius: '999px' }}>
              <div className="progress-bar bg-success" style={{ width: `${stats.totalRooms ? (stats.availableRooms / stats.totalRooms) * 100 : 0}%` }} title={`Available: ${stats.availableRooms}`} />
              <div className="progress-bar bg-primary" style={{ width: `${stats.totalRooms ? (stats.occupiedRooms / stats.totalRooms) * 100 : 0}%` }} title={`Occupied: ${stats.occupiedRooms}`} />
              <div className="progress-bar bg-warning" style={{ width: `${stats.totalRooms ? (stats.cleaningRooms / stats.totalRooms) * 100 : 0}%` }} title={`Cleaning / Maintenance: ${stats.cleaningRooms}`} />
            </div>

            <div className="d-flex flex-wrap gap-4 mt-3 small text-white-50">
              <span><span className="badge bg-success rounded-circle p-1 me-2" />Available ({stats.availableRooms})</span>
              <span><span className="badge bg-primary rounded-circle p-1 me-2" />Occupied ({stats.occupiedRooms})</span>
              <span><span className="badge bg-warning rounded-circle p-1 me-2" />Service ({stats.cleaningRooms})</span>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-xl-8">
              <div className="luxury-card h-100 overflow-hidden">
                <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-warning text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '.15em' }}>Live feed</div>
                    <h5 className="mb-0 mt-1">Recent bookings</h5>
                  </div>
                  <Link to="/reservations" className="small text-decoration-none fw-semibold d-flex align-items-center gap-1">View all <ArrowRight size={14} /></Link>
                </div>
                {recentReservations.length === 0 ? (
                  <div className="p-5 text-center text-white-50 small">No recent bookings found.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="small text-white-50">
                        <tr>
                          <th className="ps-4 py-3">Guest</th>
                          <th>Room</th>
                          <th>Check-in</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody className="small">
                        {recentReservations.map((res) => (
                          <tr key={res._id}>
                            <td className="ps-4 fw-semibold">{res.guest?.fullName || 'Guest'}</td>
                            <td>Room {res.room?.roomNumber || 'N/A'}</td>
                            <td>{new Date(res.checkInDate).toLocaleDateString()}</td>
                            <td className="fw-bold">${res.totalAmount}</td>
                            <td><span className="status-pill">{res.status || res.bookingStatus || 'Active'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-xl-4">
              <div className="luxury-card h-100 p-4">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                  <div>
                    <div className="text-warning text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '.15em' }}>Service queue</div>
                    <h5 className="mb-0 mt-1">Housekeeping</h5>
                  </div>
                  <Link to="/tasks" className="small text-decoration-none">All tasks</Link>
                </div>

                {pendingTasksList.length === 0 ? (
                  <div className="text-center py-4 text-white-50 small">
                    <CheckCircle2 size={34} className="text-success mb-2" />
                    <div>All tasks completed.</div>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {pendingTasksList.map((t) => (
                      <div key={t._id} className="glass-panel p-3">
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <span className="fw-semibold small">{t.title}</span>
                          <span className={`badge ${t.priority === 'Urgent' ? 'bg-danger' : t.priority === 'High' ? 'bg-warning' : 'bg-secondary'}`} style={{ fontSize: '10px' }}>
                            {t.priority}
                          </span>
                        </div>
                        <div className="text-white-50 small mt-2" style={{ fontSize: '11px' }}>
                          Room {t.room?.roomNumber || 'N/A'} · {t.taskType}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
