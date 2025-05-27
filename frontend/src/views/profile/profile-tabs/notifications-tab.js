import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getAuthHeaders, handleApiError } from '../../../config/api.config';
import axios from 'axios';
import '../profile.css';

const NotificationsTab = ({ userData }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' sau 'unread'

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: getAuthHeaders()
      });

      if (response.data?.success) {
        setNotifications(response.data.data);
      } else {
        throw new Error('Răspuns invalid de la server');
      }
    } catch (error) {
      console.error('Eroare la obținerea notificărilor:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(notification => !notification.read);

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="loading">Se încarcă notificările...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h3>Notificări</h3>
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
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="no-notifications">
          Nu există notificări
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
            >
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <span className="notification-date">
                  {new Date(notification.created_at).toLocaleDateString('ro-RO')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsTab; 