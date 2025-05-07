import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaChevronDown, FaCheck, FaFilter, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import './notifications.css';
import { API_BASE_URL, getAuthHeaders } from '../config/api.config';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'important', 'expired'
  const [userRole, setUserRole] = useState(null);
  const containerRef = useRef(null);

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
    // Logica de prioritizare bazată pe tipul și conținutul notificării
    if (notification.type === 'deadline') return 'high';
    if (notification.type === 'team') return 'medium';
    return 'low';
  };

  const calculateExpirationDate = (notification) => {
    // Logica pentru data de expirare bazată pe tipul notificării
    const now = new Date();
    switch (notification.type) {
      case 'deadline':
        return new Date(notification.deadline);
      case 'team':
        return new Date(now.setDate(now.getDate() + 7)); // Expiră după 7 zile
      default:
        return new Date(now.setDate(now.getDate() + 30)); // Expiră după 30 de zile
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
          <div className="notifications-filters">
            <button 
              className={`filter-button ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Toate
            </button>
            <button 
              className={`filter-button ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Necitite
            </button>
            <button 
              className={`filter-button ${filter === 'important' ? 'active' : ''}`}
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
                      <span className="expired-badge">Expirat</span>
                    )}
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