import React, { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (n) => {
    try {
      if (!n.isRead) await API.put(`/notifications/${n._id}/read`);
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
    setOpen(false);
    if (n.link) navigate(n.link);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        className="btn btn-outline-light position-relative rounded-circle p-2"
        onClick={() => setOpen(!open)}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={18} className={unreadCount > 0 ? 'text-warning' : ''} />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '9px' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-panel position-absolute end-0 mt-2 rounded-4 overflow-hidden" style={{ zIndex: 1050, maxHeight: '420px', overflowY: 'auto' }}>
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <div>
              <div className="text-warning text-uppercase fw-semibold" style={{ fontSize: '9px', letterSpacing: '.16em' }}>Operations</div>
              <span className="fw-semibold small">Notifications</span>
            </div>
            {unreadCount > 0 && (
              <button className="btn btn-sm btn-link p-0 small" onClick={handleMarkAllRead}>Mark all read</button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center text-white-50 small py-5">No new notifications.</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`notification-row p-3 border-bottom small ${n.isRead ? '' : 'bg-light bg-opacity-10'}`}
                style={{ cursor: 'pointer' }}
              >
                <div className={n.isRead ? 'text-white-50' : 'fw-semibold'}>{n.message}</div>
                <div className="text-white-50 mt-1" style={{ fontSize: '10px' }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
