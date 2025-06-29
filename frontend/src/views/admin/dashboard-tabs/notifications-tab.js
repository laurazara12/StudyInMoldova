import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../../../config/api.config';
import { FaCheckCircle, FaTimesCircle, FaTrash, FaEdit, FaClock, FaUsers, FaUserPlus, FaFileUpload, FaFileAlt, FaShieldAlt, FaCheck, FaFilter } from 'react-icons/fa';
import './documents-tab.css';

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'important', 'expired', 'admin'

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setNotifications(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Error loading notifications');
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleNotificationClick = async (notificationId) => {
    try {
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
      
      if (response.data.success) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, is_read: true, read: true }
              : notification
          )
        );
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
      
      if (response.data.success) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notification => ({ 
            ...notification, 
            is_read: true,
            read: true 
          }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      if (error.response) {
        console.error('Error details:', error.response.data);
      }
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const now = new Date();
    const expiresAt = calculateExpirationDate(notification);
    
    switch (filter) {
      case 'unread':
        return !notification.is_read;
      case 'important':
        return calculatePriority(notification) === 'high';
      case 'expired':
        return expiresAt < now;
      case 'admin':
        return notification.is_admin_notification;
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getNotificationMessage = (notification) => {
    const userName = notification.user_name || 'Unknown User';
    const documentType = notification.document_type || 'document';
    
    switch (notification.type) {
      case 'document_deleted':
        return `User ${userName} has deleted a ${documentType} document.`;
      case 'document_approved':
        return `User ${userName}'s ${documentType} document has been approved.`;
      case 'document_rejected':
        return `User ${userName}'s ${documentType} document has been rejected.`;
      case 'document_updated':
        return `User ${userName} has updated their ${documentType} document.`;
      case 'document_expired':
        return `User ${userName}'s ${documentType} document has expired.`;
      case 'deadline':
        return `Deadline approaching for ${documentType} document.`;
      case 'team':
        return `New team member ${userName} has joined.`;
      case 'new_user':
        return `New user ${userName} has registered.`;
      case 'new_document':
        return `User ${userName} has uploaded a new ${documentType} document.`;
      case 'new_application':
        return `New application received from ${userName}.`;
      default:
        return notification.message || 'New notification received.';
    }
  };

  return (
    <div className="notifications-tab">
      <div className="notifications-section full-width">
          <div className="notifications-filters">
            <button 
              className={`tab-button ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`tab-button ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread
            </button>
            <button 
              className={`tab-button ${filter === 'important' ? 'active' : ''}`}
              onClick={() => setFilter('important')}
            >
              Important
            </button>
            <button 
              className={`tab-button ${filter === 'expired' ? 'active' : ''}`}
              onClick={() => setFilter('expired')}
            >
              Expired
            </button>
            <button 
              className={`tab-button ${filter === 'admin' ? 'active' : ''}`}
              onClick={() => setFilter('admin')}
            >
              Administrative
            </button>
        </div>

        {unreadCount > 0 && (
          <button 
            className="mark-all-read"
            onClick={handleMarkAllRead}
          >
            <FaCheck /> Mark all as read
          </button>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={loadNotifications}
            >
              Retry
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="no-notifications">
            <p>No notifications</p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${notification.is_read ? 'read' : 'unread'} ${notification.is_admin_notification ? 'admin' : ''} ${calculatePriority(notification)}`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="notification-icon">
                  {notification.type === 'document_approved' && <FaCheckCircle />}
                  {notification.type === 'document_rejected' && <FaTimesCircle />}
                  {notification.type === 'document_deleted' && <FaTrash />}
                  {notification.type === 'document_updated' && <FaEdit />}
                  {notification.type === 'document_expired' && <FaClock />}
                  {notification.type === 'team' && <FaUsers />}
                  {notification.type === 'new_user' && <FaUserPlus />}
                  {notification.type === 'new_document' && <FaFileUpload />}
                  {notification.type === 'new_application' && <FaFileAlt />}
                </div>
                <div className="notification-content">
                  <div className="notification-header">
                    <span className="notification-title">{notification.title}</span>
                    <span className="notification-date">{formatDate(notification.created_at)}</span>
                  </div>
                  <p className="notification-message">{getNotificationMessage(notification)}</p>
                  {notification.admin_message && (
                    <p className="admin-message">{notification.admin_message}</p>
                  )}
                  {notification.is_admin_notification && (
                    <div className="admin-badge">
                      <FaShieldAlt /> Admin Notification
                    </div>
                  )}
                  {calculateExpirationDate(notification) < new Date() && (
                    <span className="expired-badge">Expired</span>
                  )}
                </div>
                {!notification.is_read && <div className="unread-indicator" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsTab;
