import React, { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaFilter, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import './notifications.css';
import { API_BASE_URL, getAuthHeaders } from '../config/api.config';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/role`, {
          headers: getAuthHeaders()
        });
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role);
        }
      } catch (err) {
        console.error('Eroare la încărcarea rolului:', err);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/api/notifications`, {
          headers: getAuthHeaders()
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Nu sunteți autentificat');
          }
          throw new Error(`Eroare HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Format invalid al datelor primite');
        }
        
        const processedNotifications = data.map(notification => ({
          ...notification,
          priority: calculatePriority(notification),
          expiresAt: calculateExpirationDate(notification)
        }));
        
        setNotifications(processedNotifications);
      } catch (err) {
        console.error('Eroare detaliată la încărcarea notificărilor:', err);
        setError(err.message || 'Nu s-au putut încărca notificările. Vă rugăm să încercați din nou mai târziu.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 300000);
    return () => clearInterval(interval);
  }, []);

  const calculatePriority = (notification) => {
    if (notification.type === 'deadline') return 'high';
    if (notification.type === 'team') return 'medium';
    return 'low';
  };

  const calculateExpirationDate = (notification) => {
    const now = new Date();
    switch (notification.type) {
      case 'deadline':
        return new Date(notification.deadline);
      case 'team':
        return new Date(now.setDate(now.getDate() + 7));
      default:
        return new Date(now.setDate(now.getDate() + 30));
    }
  };

  const filterNotifications = (notifications) => {
    const now = new Date();
    return notifications.filter(notification => {
      if (filter === 'unread') return !notification.is_read;
      if (filter === 'important') return notification.priority === 'high';
      if (filter === 'expired') return new Date(notification.expiresAt) < now;
      return true;
    });
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <FaExclamationTriangle className="priority-icon high" />;
      case 'medium':
        return <FaInfoCircle className="priority-icon medium" />;
      default:
        return null;
    }
  };

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
    <div className="notifications-section">
      <div className="profile-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Notificări {unreadCount > 0 ? `(${unreadCount})` : ''}</h2>
      </div>

      <div className="notifications-content">
        <div className="notifications-filters">
          <button 
            className={`tab-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Toate
          </button>
          <button 
            className={`tab-button ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Necitite
          </button>
          <button 
            className={`tab-button ${filter === 'important' ? 'active' : ''}`}
            onClick={() => setFilter('important')}
          >
            Importante
          </button>
        </div>

        {loading ? (
          <div className="notifications-loading">Se încarcă...</div>
        ) : error ? (
          <div className="notifications-error">{error}</div>
        ) : filterNotifications(notifications).length > 0 ? (
          <>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read"
                onClick={handleMarkAllRead}
              >
                <FaCheck /> Marchează toate ca citite
              </button>
            )}
            <div className="notifications-list">
              {filterNotifications(notifications).map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.is_read ? 'unread' : ''} ${notification.priority}`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="notification-content">
                    {getPriorityIcon(notification.priority)}
                    <p>{notification.message}</p>
                    <span className="notification-date">
                      {new Date(notification.createdAt).toLocaleDateString('ro-RO', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {new Date(notification.expiresAt) < new Date() && (
                      <span className="expired-badge">Expirată</span>
                    )}
                  </div>
                  {!notification.is_read && <div className="unread-indicator" />}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="no-notifications">Nu există notificări</div>
        )}
      </div>
    </div>
  );
};

export default Notifications; 