import React, { useState, useEffect, useCallback } from 'react';
import { FaBell, FaCheck, FaFilter, FaExclamationTriangle, FaInfoCircle, FaUserPlus, FaFileUpload, FaClipboardList, FaTrash, FaTimes, FaEdit, FaClock, FaUsers } from 'react-icons/fa';
import './notifications.css';
import { API_BASE_URL, getAuthHeaders } from '../config/api.config';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [userRole, setUserRole] = useState(null);
  const [ws, setWs] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const { token } = useAuth();

  const connectWebSocket = useCallback(() => {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Maximum reconnection attempts reached');
      return;
    }

    if (!token) {
      console.error('Missing token for WebSocket connection');
      return;
    }

    try {
      const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:4000'}`;
      const socket = new WebSocket(wsUrl, [token]);

      socket.onopen = () => {
        console.log('WebSocket connection established');
        setWsConnected(true);
        setReconnectAttempts(0);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Message received:', data);
          
          if (data.type === 'connection_established') {
            console.log('WebSocket connection confirmed:', data.message);
          } else if (data.type === 'new_notification') {
            console.log('New notification received:', data.notification);
            setNotifications(prev => [data.notification, ...prev]);
            toast.info(data.notification.message);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
        toast.error('Error connecting to notification server');
      };

      socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setWsConnected(false);
        
        if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connectWebSocket();
          }, 5000 * (reconnectAttempts + 1)); // Exponential backoff
        }
      };

      setWs(socket);

      return () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.close(1000, 'Component disconnecting');
        }
      };
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      setWsConnected(false);
      toast.error('Could not establish connection to notification server');
    }
  }, [reconnectAttempts, token]);

  useEffect(() => {
    if (token) {
      connectWebSocket();
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [token, connectWebSocket]);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        console.log('Starting user role loading...');
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('Missing token');
          setUserRole(null);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/users/role`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        console.log('Response received:', response.status);
        console.log('Headers:', response.headers);

        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Eroare la server:', errorData);
          throw new Error(errorData.message || `Eroare HTTP: ${response.status}`);
        }

        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Invalid response:', text);
          throw new Error('Response is not in JSON format');
        }

        const data = await response.json();
        console.log('Date primite:', data);

        if (data.success && data.data && data.data.role) {
          console.log('Rolul utilizatorului a fost setat:', data.data.role);
          setUserRole(data.data.role);
        } else {
          console.error('Invalid response structure:', data);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error loading role:', error);
        setUserRole(null);
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
            throw new Error('You are not authenticated');
          }
          throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Notifications data received:', data);
        
        if (!data.success) {
          throw new Error(data.message || 'Error loading notifications');
        }
        
        if (!Array.isArray(data.data)) {
          console.error('Invalid notifications data format:', data);
          throw new Error('Invalid notifications data format');
        }
        
        const processedNotifications = data.data.map(notification => ({
          ...notification,
          priority: calculatePriority(notification),
          expiresAt: calculateExpirationDate(notification),
          isAdminNotification: notification.is_admin_notification
        }));
        
        setNotifications(processedNotifications);
      } catch (err) {
        console.error('Detailed error loading notifications:', err);
        setError(err.message || 'Could not load notifications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 300000); // Actualizare la fiecare 5 minute

    return () => clearInterval(interval);
  }, []);

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
        throw new Error('Could not mark notification as read');
      }

      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Could not mark all notifications as read');
      }

      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h3>Notifications</h3>
        <div className="notifications-filters">
          <button 
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-button ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          {userRole === 'admin' && (
            <button 
              className={`filter-button ${filter === 'admin' ? 'active' : ''}`}
              onClick={() => setFilter('admin')}
            >
              Administrative
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="notifications-loading">Loading...</div>
      ) : error ? (
        <div className="notifications-error">{error}</div>
      ) : filterNotifications(notifications).length > 0 ? (
        <>
          {unreadCount > 0 && (
            <button 
              className="mark-all-read"
              onClick={handleMarkAllRead}
            >
              <FaCheck /> Mark all as read
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
                    <span className="admin-badge">Administrative</span>
                  )}
                  <p>{notification.message}</p>
                  {notification.admin_message && (
                    <p className="admin-message">{notification.admin_message}</p>
                  )}
                  <span className="notification-date">
                    {new Date(notification.createdAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {new Date(notification.expiresAt) < new Date() && (
                    <span className="expired-badge">Expired</span>
                  )}
                </div>
                {!notification.is_read && <div className="unread-indicator" />}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="no-notifications">
          No notifications
        </div>
      )}
    </div>
  );
}

export default Notifications; 