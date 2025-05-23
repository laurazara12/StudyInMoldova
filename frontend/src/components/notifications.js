import React, { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaFilter, FaExclamationTriangle, FaInfoCircle, FaUserPlus, FaFileUpload, FaClipboardList, FaTrash, FaTimes, FaEdit, FaClock, FaUsers } from 'react-icons/fa';
import './notifications.css';
import { API_BASE_URL, getAuthHeaders } from '../config/api.config';

function Notifications() {
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
          expiresAt: calculateExpirationDate(notification),
          isAdminNotification: notification.is_admin_notification
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
  }, [userRole]);

  const calculatePriority = (notification) => {
    switch (notification.type) {
      case 'deadline':
      case 'document_expired':
      case 'new_application':
        return 'high';
      case 'team':
      case 'document_rejected':
      case 'new_document':
      case 'new_user':
        return 'medium';
      default:
        return 'low';
    }
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'document_deleted':
        return <FaTrash className="notification-icon document-deleted" />;
      case 'document_approved':
        return <FaCheck className="notification-icon document-approved" />;
      case 'document_rejected':
        return <FaTimes className="notification-icon document-rejected" />;
      case 'document_updated':
        return <FaEdit className="notification-icon document-updated" />;
      case 'document_expired':
        return <FaExclamationTriangle className="notification-icon document-expired" />;
      case 'deadline':
        return <FaClock className="notification-icon deadline" />;
      case 'team':
        return <FaUsers className="notification-icon team" />;
      default:
        return getPriorityIcon(calculatePriority({ type }));
    }
  };

  const getNotificationClass = (notification) => {
    const classes = [
      !notification.is_read ? 'unread' : '',
      notification.priority,
      notification.is_admin_notification ? 'admin' : ''
    ];

    // Adaugă clase specifice pentru tipul de notificare
    switch (notification.type) {
      case 'document_deleted':
        classes.push('document-deleted');
        break;
      case 'document_approved':
        classes.push('document-approved');
        break;
      case 'document_rejected':
        classes.push('document-rejected');
        break;
      case 'document_updated':
        classes.push('document-updated');
        break;
      case 'document_expired':
        classes.push('document-expired');
        break;
      case 'deadline':
        classes.push('deadline');
        break;
      case 'team':
        classes.push('team');
        break;
    }

    return classes.filter(Boolean).join(' ');
  };

  const filterNotifications = (notifications) => {
    const now = new Date();
    return notifications.filter(notification => {
      if (filter === 'unread') return !notification.is_read;
      if (filter === 'important') return notification.priority === 'high';
      if (filter === 'admin' && userRole === 'admin') {
        return notification.is_admin_notification;
      }
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
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/mark-read`, {
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
      const response = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
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
        <h2 style={{ margin: 0 }}>
          {userRole === 'admin' ? 'Notificări Administrative' : 'Notificările Mele'} 
          {unreadCount > 0 ? `(${unreadCount})` : ''}
        </h2>
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
          {userRole === 'admin' && (
            <button 
              className={`tab-button ${filter === 'admin' ? 'active' : ''}`}
              onClick={() => setFilter('admin')}
            >
              Administrative
            </button>
          )}
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
                  className={`notification-item ${getNotificationClass(notification)}`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="notification-content">
                    {getNotificationIcon(notification.type)}
                    {notification.is_admin_notification && (
                      <span className="admin-badge">Administrativ</span>
                    )}
                    <p>{notification.message}</p>
                    {notification.admin_message && (
                      <p className="admin-message">{notification.admin_message}</p>
                    )}
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
}

export default Notifications; 