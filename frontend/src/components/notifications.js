import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:4000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Asigurăm-ne că avem un array
      const notificationsData = Array.isArray(response.data) ? response.data : [];
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Eroare la obținerea notificărilor:', error);
      setError('Nu s-au putut încărca notificările');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:4000/api/notifications/${id}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Eroare la marcarea notificării ca citită:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('http://localhost:4000/api/notifications/read-all', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Eroare la marcarea notificărilor ca citite:', error);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (loading) {
    return <div className="notifications-loading">Se încarcă notificările...</div>;
  }

  if (error) {
    return <div className="notifications-error">{error}</div>;
  }

  return (
    <div className={`notifications-container ${isExpanded ? 'expanded' : ''}`}>
      <div className="notifications-header" onClick={toggleExpand}>
        <div className="notifications-title">
          <h3>Notificări</h3>
          {notifications.length > 0 && (
            <span className="notification-count">{notifications.length}</span>
          )}
        </div>
        <div className="notifications-actions">
          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} expand-icon`}></i>
        </div>
      </div>
      
      {isExpanded && (
        <>
          {notifications.length > 0 && (
            <button className="mark-all-read" onClick={markAllAsRead}>
              Marchează toate ca citite
            </button>
          )}
          
          {notifications.length === 0 ? (
            <div className="no-notifications">
              There are no notifications so far
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    <span className="notification-date">
                      {new Date(notification.created_at).toLocaleDateString('ro-RO')}
                    </span>
                  </div>
                  {!notification.read && <div className="unread-indicator"></div>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Notifications; 