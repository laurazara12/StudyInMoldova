import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '../components/navbar';
import './profile.css';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return window.location.href = '/sign-in';
  }

  return (
    <div className="profile-container">
      <Helmet>
        <title>Profile - Study In Moldova</title>
        <meta property="og:title" content="Profile - Study In Moldova" />
      </Helmet>
      <Navbar rootClassName="navbar-root-class-name" />
      <div className="profile-main">
        <div className="profile-header">
          <h1 className="profile-heading">Profilul Meu</h1>
        </div>
        <div className="profile-content">
          <div className="profile-info-card">
            <div className="profile-info-item">
              <span className="info-label">Nume:</span>
              <span className="info-value">{user.name}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Rol:</span>
              <span className="info-value">
                {user.role === 'admin' ? 'Administrator' : 'Student'}
              </span>
            </div>
          </div>

          {user.role === 'admin' && (
            <div className="profile-admin-section">
              <h2 className="admin-heading">Panou Administrator</h2>
              <div className="admin-actions">
                <button
                  className="admin-button"
                  onClick={() => window.location.href = '/admin/users'}
                >
                  Gestionare Utilizatori
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;