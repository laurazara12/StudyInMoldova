import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getAuthHeaders, handleApiError } from '../../../config/api.config';
import axios from 'axios';
import { FaCheck, FaFilter, FaExclamationTriangle, FaInfoCircle, FaUserPlus, FaFileUpload, FaClipboardList, FaTrash, FaTimes, FaEdit, FaClock, FaUsers } from 'react-icons/fa';
import '../profile.css';

const NotificationsTab = ({ userData }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'important', 'expired'

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Starting to fetch notifications...');
      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: getAuthHeaders()
      });

      console.log('Response received:', response.data);

      let notificationsData;
      if (response.data && Array.isArray(response.data)) {
        notificationsData = response.data;
      } else if (response.data?.success && Array.isArray(response.data.data)) {
        notificationsData = response.data.data;
      } else {
        console.error('Invalid data format received:', response.data);
        throw new Error('Invalid data format received');
      }

      console.log('Processed notifications data:', notificationsData);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Detailed error while fetching notifications:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const calculatePriority = (notification) => {
    console.log('Calculating priority for notification:', notification);
    const priority = (() => {
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
    })();
    console.log('Calculated priority:', priority);
    return priority;
  };

  const calculateExpirationDate = (notification) => {
    console.log('Calculating expiration date for notification:', notification);
    const now = new Date();
    const expiresAt = (() => {
      switch (notification.type) {
        case 'deadline':
          return new Date(notification.deadline);
        case 'team':
          return new Date(now.setDate(now.getDate() + 7));
        default:
          return new Date(now.setDate(now.getDate() + 30));
      }
    })();
    console.log('Calculated expiration date:', expiresAt);
    return expiresAt;
  };

  const getNotificationIcon = (type) => {
    console.log('Getting icon for notification type:', type);
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

  const getPriorityIcon = (priority) => {
    console.log('Getting priority icon for:', priority);
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
      console.log('Starting to mark notification as read:', notificationId);
      
      // Verificăm dacă notificarea există
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) {
        console.error('Notification not found:', notificationId);
        return;
      }

      // Verificăm dacă notificarea este deja marcată ca citită
      if (notification.is_read || notification.read) {
        console.log('Notification is already marked as read:', notificationId);
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
        {},
        { 
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Server response for marking as read:', response.data);

      if (response.data.success) {
        console.log('Notification successfully marked as read');
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, is_read: true, read: true }
              : notification
          )
        );
      } else {
        console.error('Server did not confirm marking as read:', response.data);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      if (error.response) {
        console.error('Error details:', error.response.data);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      console.log('Starting to mark all notifications as read');
      
      const response = await axios.put(
        `${API_BASE_URL}/api/notifications/read-all`,
        {},
        { 
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Server response for marking all as read:', response.data);

      if (response.data.success) {
        console.log('All notifications successfully marked as read');
        setNotifications(prevNotifications =>
          prevNotifications.map(notification => ({ 
            ...notification, 
            is_read: true,
            read: true 
          }))
        );
      } else {
        console.error('Server did not confirm marking all as read:', response.data);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      if (error.response) {
        console.error('Error details:', error.response.data);
      }
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    console.log('Filtering notification:', notification);
    console.log('Current filter:', filter);
    
    const now = new Date();
    const expiresAt = calculateExpirationDate(notification);
    const isRead = notification.is_read || notification.read; // Verificăm ambele proprietăți
    
    let shouldShow = true;
    switch (filter) {
      case 'unread':
        shouldShow = !isRead;
        break;
      case 'important':
        shouldShow = calculatePriority(notification) === 'high';
        break;
      case 'expired':
        shouldShow = expiresAt < now;
        break;
      default:
        shouldShow = true;
    }
    
    console.log('Should show notification:', shouldShow);
    return shouldShow;
  });

  const unreadCount = notifications.filter(n => !(n.is_read || n.read)).length;

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="loading">Loading notifications...</div>
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
        <h3>Notifications</h3>
        <div className="notifications-filters">
          <button 
            className={`tab-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => {
              console.log('Setting filter to: all');
              setFilter('all');
            }}
          >
            All
          </button>
          <button 
            className={`tab-button ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => {
              console.log('Setting filter to: unread');
              setFilter('unread');
            }}
          >
            Unread
          </button>
          <button 
            className={`tab-button ${filter === 'important' ? 'active' : ''}`}
            onClick={() => {
              console.log('Setting filter to: important');
              setFilter('important');
            }}
          >
            Important
          </button>
          <button 
            className={`tab-button ${filter === 'expired' ? 'active' : ''}`}
            onClick={() => {
              console.log('Setting filter to: expired');
              setFilter('expired');
            }}
          >
            Expired
          </button>
        </div>
      </div>

      {unreadCount > 0 && (
        <button 
          className="mark-all-read"
          onClick={handleMarkAllRead}
        >
          <FaCheck /> Mark all as read
        </button>
      )}

      {filteredNotifications.length === 0 ? (
        <div className="no-notifications">
          No notifications
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${!(notification.is_read || notification.read) ? 'unread' : ''} ${calculatePriority(notification)}`}
              onClick={() => handleNotificationClick(notification.id)}
            >
              <div className="notification-content">
                {getNotificationIcon(notification.type)}
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <span className="notification-date">
                  {new Date(notification.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                {calculateExpirationDate(notification) < new Date() && (
                  <span className="expired-badge">Expired</span>
                )}
              </div>
              {!(notification.is_read || notification.read) && <div className="unread-indicator" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsTab; 