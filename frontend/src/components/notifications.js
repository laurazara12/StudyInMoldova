import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaChevronDown, FaCheck } from 'react-icons/fa';
import './notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications', {
          headers: getAuthHeaders()
        });
        
        if (!response.ok) {
          throw new Error('Nu s-au putut încărca notificările');
        }
        
        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        console.error('Eroare la încărcarea notificărilor:', err);
        setError('Nu s-au putut încărca notificările. Vă rugăm să încercați din nou mai târziu.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/mark-read`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Nu s-a putut marca notificarea ca citită');
      }

      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Eroare la marcarea notificării:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Nu s-au putut marca toate notificările ca citite');
      }

      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (err) {
      console.error('Eroare la marcarea tuturor notificărilor:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div 
      ref={containerRef}
      className={`notifications-container ${isExpanded ? 'expanded' : ''}`}
    >
      <div 
        className="notifications-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="notifications-title">
          <FaBell />
          <h3>Notificări {unreadCount > 0 ? `(${unreadCount})` : ''}</h3>
        </div>
        <div className="notifications-actions">
          <FaChevronDown className="expand-icon" />
        </div>
      </div>

      {isExpanded && (
        <div className="notifications-list">
          {loading ? (
            <div className="notifications-loading">Se încarcă...</div>
          ) : error ? (
            <div className="notifications-error">{error}</div>
          ) : notifications.length > 0 ? (
            <>
              {unreadCount > 0 && (
                <button 
                  className="mark-all-read"
                  onClick={handleMarkAllRead}
                >
                  <FaCheck /> Marchează toate ca citite
                </button>
              )}
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    <span className="notification-date">
                      {new Date(notification.createdAt).toLocaleDateString('ro-RO', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {!notification.is_read && <div className="unread-indicator" />}
                </div>
              ))}
            </>
          ) : (
            <div className="no-notifications">Nu există notificări</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications; 