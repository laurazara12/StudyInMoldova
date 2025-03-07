import React from 'react';
import { useNavigate } from 'react-router-dom';
import './profile-component.css';

const ProfileComponent = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    navigate('/sign-in');
    return null;
  }

  return (
    <div className="profile-main">
      <div className="profile-header">
        <h1 className="profile-heading">Profilul meu</h1>
      </div>
      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-info">
            <span className="info-label">Nume:</span>
            <span className="info-value">{user.name}</span>
          </div>
          <div className="profile-info">
            <span className="info-label">Email:</span>
            <span className="info-value">{user.email}</span>
          </div>
          <div className="profile-info">
            <span className="info-label">Rol:</span>
            <span className="info-value">
              {user.role === 'admin' ? 'Administrator' : 'Student'}
            </span>
          </div>
        </div>
        
        {user.role === 'admin' && (
          <div className="admin-panel">
            <h2 className="admin-heading">Panou Administrator</h2>
            <button
              className="admin-button"
              onClick={() => navigate('/admin/users')}
            >
              Gestionare Utilizatori
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileComponent;