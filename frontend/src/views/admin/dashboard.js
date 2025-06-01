import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import UsersTab from './dashboard-tabs/users-tab';
import UniversitiesTab from './dashboard-tabs/universities-tab';
import ProgramsTab from './dashboard-tabs/programs-tab';
import ApplicationsTab from './dashboard-tabs/applications-tab';
import DocumentsTab from './dashboard-tabs/documents-tab';
import NotificationsTab from './dashboard-tabs/notifications-tab';
import './dashboard.css';
import '../../style.css';
import { API_BASE_URL, getAuthHeaders, handleApiError } from '../../config/api.config';
import { FaBell } from 'react-icons/fa';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('activeDashboardTab');
    return savedTab && ['users', 'universities', 'programs', 'applications', 'documents', 'notifications'].includes(savedTab) 
      ? savedTab 
      : 'users';
  });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('activeDashboardTab', tab);
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
                  <FaBell /> Notifications
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
              <NotificationsTab />
            ) : null}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard; 