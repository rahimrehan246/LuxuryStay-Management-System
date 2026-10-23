import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import {
  LayoutDashboard,
  BedDouble,
  Users,
  CalendarCheck,
  Receipt,
  CheckSquare,
  LogOut,
  Hotel,
  ShieldCheck,
  UserCog,
  Settings as SettingsIcon,
  MessageSquare,
  Bell as BellIcon,
  BarChart3,
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import { FRONT_OFFICE, MANAGEMENT, isOperational } from '../utils/roles';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const ALL_NAV = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: FRONT_OFFICE },
    { name: 'Rooms', path: '/rooms', icon: BedDouble, roles: null },
    { name: 'Guests', path: '/guests', icon: Users, roles: FRONT_OFFICE },
    { name: 'Reservations', path: '/reservations', icon: CalendarCheck, roles: FRONT_OFFICE },
    { name: 'Invoices', path: '/invoices', icon: Receipt, roles: FRONT_OFFICE },
    { name: isOperational(user?.role) ? 'My Tasks' : 'Tasks', path: '/tasks', icon: CheckSquare, roles: null },
    { name: 'Service Requests', path: '/service-requests', icon: BellIcon, roles: [...FRONT_OFFICE, 'Housekeeping', 'Kitchen', 'Laundry'] },
    { name: 'Feedback', path: '/feedback', icon: MessageSquare, roles: FRONT_OFFICE },
    { name: 'Staff', path: '/staff', icon: UserCog, roles: MANAGEMENT },
    { name: 'Reports', path: '/reports', icon: BarChart3, roles: MANAGEMENT },
    { name: 'Settings', path: '/settings', icon: SettingsIcon, roles: ['Admin'] },
  ];

  const navItems = ALL_NAV.filter((item) => !item.roles || item.roles.includes(user?.role));

  return (
    <div className="staff-shell d-flex">
      <aside className="staff-sidebar d-flex flex-column flex-shrink-0 p-3 text-white position-sticky top-0 vh-100">
        <div className="staff-brand d-flex align-items-center mb-4 ps-2 text-decoration-none text-white">
          <div className="staff-brand-mark me-2">
            <Hotel size={21} />
          </div>
          <div className="brand-copy">
            <div className="fw-bold fs-5 tracking-wide">LuxuryStay</div>
            <div className="text-white-50" style={{ fontSize: '10px', letterSpacing: '0.16em' }}>
              HOSPITALITY OS
            </div>
          </div>
        </div>

        <div className="gold-divider mb-3" />

        <div className="small text-uppercase text-white-50 px-2 mb-2" style={{ letterSpacing: '.14em' }}>
          <span className="nav-label">Workspace</span>
        </div>

        <ul className="nav nav-pills flex-column mb-auto gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name} className="nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `staff-nav-link nav-link d-flex align-items-center gap-3 px-3 py-2 ${isActive ? 'active' : ''}`}
                  title={item.name}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span className="nav-label">{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        <div className="staff-user-card d-flex align-items-center justify-content-between p-2">
          <div className="d-flex align-items-center gap-2 overflow-hidden">
            <div
              className="user-avatar rounded-circle d-flex align-items-center justify-content-center text-dark fw-bold flex-shrink-0"
              style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #e5c378, #c5a880)' }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-copy text-truncate">
              <div className="text-white small fw-semibold text-truncate">{user?.name || 'Staff Member'}</div>
              <div className="text-white-50 d-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
                <ShieldCheck size={12} className="text-warning" />
                {user?.role || 'Staff'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-sm btn-link text-white-50 p-1"
            title="Sign Out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <div className="staff-main d-flex flex-column flex-grow-1">
        <header className="staff-topbar navbar navbar-expand px-4 py-3 sticky-top">
          <div className="container-fluid p-0 d-flex justify-content-between align-items-center">
            <div>
              <div className="text-uppercase text-white-50 fw-semibold" style={{ fontSize: '10px', letterSpacing: '.18em' }}>
                LuxuryStay / Operations
              </div>
              <h5 className="mb-0 fw-semibold page-title">Staff Command Center</h5>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="d-none d-md-block text-end">
                <div className="text-white small">{user?.name || 'Staff Member'}</div>
                <div className="text-white-50" style={{ fontSize: '11px' }}>{user?.email}</div>
              </div>
              <NotificationBell />
            </div>
          </div>
        </header>

        <main className="p-3 p-lg-4 flex-grow-1">
          {children}
        </main>
      </div>
    </div>
  );
}
