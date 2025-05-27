import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import Notifications from '../../components/notifications';
import UsersTab from './dashboard-tabs/users-tab';
import UniversitiesTab from './dashboard-tabs/universities-tab';
import ProgramsTab from './dashboard-tabs/programs-tab';
import ApplicationsTab from './dashboard-tabs/applications-tab';
import DocumentsTab from './dashboard-tabs/documents-tab';
import './dashboard.css';
import '../../style.css';
import { API_BASE_URL, getAuthHeaders, handleApiError } from '../../config/api.config';
import { FaCheckCircle, FaTimesCircle, FaTrash, FaEdit, FaClock, FaUsers, FaUserPlus, FaFileUpload, FaFileAlt, FaShieldAlt } from 'react-icons/fa';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [errorNotifications, setErrorNotifications] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('ro-RO', {
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

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <div className="header-content">
              <h1>Admin Dashboard</h1>
              <nav className="dashboard-nav">
                <button 
                  className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
                  onClick={() => handleTabChange('documents')}
                >
                  Documents
                </button>
                <button 
                  className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => handleTabChange('users')}
                >
                  Users
                </button>
                <button 
                  className={`tab-button ${activeTab === 'universities' ? 'active' : ''}`}
                  onClick={() => handleTabChange('universities')}
                >
                  Universities
                </button>
                <button 
                  className={`tab-button ${activeTab === 'programs' ? 'active' : ''}`}
                  onClick={() => handleTabChange('programs')}
                >
                  Programs
                </button>
                <button 
                  className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
                  onClick={() => handleTabChange('applications')}
                >
                  Applications
                </button>
                <button 
                  className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => handleTabChange('notifications')}
                >
                  Notifications
                </button>
              </nav>
            </div>
          </div>

          <div className="dashboard-filters">
            {activeTab === 'users' ? (
              <UsersTab />
            ) : activeTab === 'universities' ? (
              <UniversitiesTab />
            ) : activeTab === 'programs' ? (
              <ProgramsTab />
            ) : activeTab === 'applications' ? (
              <ApplicationsTab />
              ) : activeTab === 'documents' ? (
              <DocumentsTab />
              ) : activeTab === 'notifications' ? (
                <div className="notifications-container">
                  {loadingNotifications ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p>Se încarcă notificările...</p>
                    </div>
                  ) : errorNotifications ? (
                    <div className="error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      <p>{errorNotifications}</p>
                      <button 
                        className="retry-button"
                        onClick={loadNotifications}
                      >
                        Reîncearcă
                      </button>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="no-notifications">
                      <p>Nu există notificări</p>
                    </div>
                  ) : (
                    <div className="notifications-list">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`notification-item ${notification.is_read ? 'read' : 'unread'} ${notification.is_admin_notification ? 'admin' : ''}`}
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
                            <div className="notification-header">
                              <span className="notification-title">{notification.title}</span>
                              <span className="notification-date">{formatDate(notification.created_at)}</span>
                            </div>
                            <p className="notification-message">{notification.message}</p>
                            {notification.is_admin_notification && (
                              <div className="admin-message">
                                <FaShieldAlt /> Notificare administrativă
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
                    </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard; 