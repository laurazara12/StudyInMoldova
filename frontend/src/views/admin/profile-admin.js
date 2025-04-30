import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import { API_BASE_URL, getAuthHeaders, handleApiError } from '../../config/api.config';
import './styles.css';

const ProfileAdmin = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (!token || !storedUser) {
          navigate('/login');
          return;
        }

        if (storedUser.role !== 'admin') {
          navigate('/profile');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: getAuthHeaders()
        });

        if (response.data && response.data.success) {
          const userData = response.data.user;
          if (userData && userData.role === 'admin') {
            setUser(userData);
            setEditedUser(userData);
          } else {
            navigate('/profile');
          }
        }
      } catch (error) {
        const apiError = handleApiError(error);
        setError(apiError.message);
        if (apiError.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_BASE_URL}/api/auth/update-profile`, editedUser, {
        headers: getAuthHeaders()
      });

      if (response.data && response.data.success) {
        setUser(editedUser);
        setIsEditing(false);
        alert('Profilul a fost actualizat cu succes!');
      }
    } catch (error) {
      const apiError = handleApiError(error);
      setError(apiError.message);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-container">
          <div className="loading">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-container">
          <div className="error">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-main">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-tabs">
              <button className="tab-button active" style={{ backgroundColor: 'rgb(255, 107, 53)', color: 'rgb(255, 255, 255)', border: '1px solid rgb(255, 107, 53)' }}>
                My Profile
              </button>
            </div>
            <button 
              className="edit-button" 
              style={{ backgroundColor: 'rgb(224, 224, 224)', color: 'rgb(85, 85, 85)', border: '1px solid rgb(204, 204, 204)' }}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </div>
          <div className="profile-content">
            <div className="profile-section">
              <h2>My Profile</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Full Name:</span>
                  <span className="info-value">{user?.name || 'Not specified'}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{user?.email || 'Not specified'}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{user?.phone || 'Not specified'}</span>
                </div>
                <div className="info-item">
                  <label>Date of Birth:</label>
                  <span>{user?.dateOfBirth || 'Not specified'}</span>
                </div>
                <div className="info-item">
                  <label>Country of Origin:</label>
                  <span>{user?.countryOfOrigin || 'Not specified'}</span>
                </div>
                <div className="info-item">
                  <label>Nationality:</label>
                  <span>{user?.nationality || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfileAdmin; 