import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import './profile.css';
import { API_BASE_URL, getAuthHeaders, handleApiError } from '../../config/api.config';
import Notifications from '../../components/notifications';
import { FaUser, FaGraduationCap, FaFileAlt, FaClipboardList, FaBookmark, FaBell } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// Lazy loading pentru componente
const ProfileTab = lazy(() => import('./profile-tabs/profile-tab'));
const PlanYourStudiesTab = lazy(() => import('./profile-tabs/plan-your-studies-tab'));
const DocumentsTab = lazy(() => import('./profile-tabs/documents-tab'));
const ApplicationsTab = lazy(() => import('./profile-tabs/application-tab'));
const SavedProgramsTab = lazy(() => import('./profile-tabs/saved-programs-tab'));
const NotificationsTab = lazy(() => import('./profile-tabs/notifications-tab'));

// Component de încărcare
const LoadingComponent = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Se încarcă...</p>
  </div>
);

// Component pentru navigarea profilului
const ProfileNavigation = ({ activeTab, onTabChange }) => (
  <nav className="profile-nav">
    <button 
      className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
      onClick={() => onTabChange('profile')}
    >
      <FaUser /> Profilul Meu
    </button>
    <button 
      className={`tab-button ${activeTab === 'studies' ? 'active' : ''}`}
      onClick={() => onTabChange('studies')}
    >
      <FaGraduationCap /> Planifică Studiile
    </button>
    <button 
      className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
      onClick={() => onTabChange('documents')}
    >
      <FaFileAlt /> Documente
    </button>
    <button 
      className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
      onClick={() => onTabChange('applications')}
    >
      <FaClipboardList /> Aplicații
    </button>
    <button 
      className={`tab-button ${activeTab === 'saved-programs' ? 'active' : ''}`}
      onClick={() => onTabChange('saved-programs')}
    >
      <FaBookmark /> Programe Salvate
    </button>
    <button 
      className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
      onClick={() => onTabChange('notifications')}
    >
      <FaBell /> Notificări
    </button>
  </nav>
);

// Component pentru conținutul profilului
const ProfileContent = ({ activeTab, userData, onProfileUpdate }) => (
  <div className="profile-content">
    <Suspense fallback={<LoadingComponent />}>
      {activeTab === 'profile' && <ProfileTab userData={userData} onProfileUpdate={onProfileUpdate} />}
      {activeTab === 'studies' && <PlanYourStudiesTab userData={userData} />}
      {activeTab === 'documents' && <DocumentsTab userData={userData} />}
      {activeTab === 'applications' && <ApplicationsTab userData={userData} />}
      {activeTab === 'saved-programs' && <SavedProgramsTab userData={userData} />}
      {activeTab === 'notifications' && <NotificationsTab userData={userData} />}
    </Suspense>
  </div>
);

// Component pentru formularul de editare
const EditProfileForm = ({ formData, handleChange, handleSubmit, loading, onClose }) => (
  <div className="edit-modal">
    <div className="edit-modal-content">
      <div className="modal-header">
        <h2>Editează Profilul</h2>
        <button 
          className="btn btn-secondary"
          onClick={onClose}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nume Complet:</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Telefon:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Data Nașterii:</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Țara de Origine:</label>
          <input
            type="text"
            name="country_of_origin"
            value={formData.country_of_origin}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Naționalitate:</label>
          <input
            type="text"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Nivelul de Studiu Dorit:</label>
          <select
            name="desired_study_level"
            value={formData.desired_study_level}
            onChange={handleChange}
          >
            <option value="">Selectează nivelul</option>
            <option value="bachelor">Licență</option>
            <option value="master">Master</option>
            <option value="doctorate">Doctorat</option>
          </select>
        </div>
        <div className="form-group">
          <label>Domeniul Preferat:</label>
          <input
            type="text"
            name="preferred_study_field"
            value={formData.preferred_study_field}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Anul Academic Dorit:</label>
          <input
            type="text"
            name="desired_academic_year"
            value={formData.desired_academic_year}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Limba de Studiu Preferată:</label>
          <select
            name="preferred_study_language"
            value={formData.preferred_study_language}
            onChange={handleChange}
          >
            <option value="">Selectează limba</option>
            <option value="romanian">Română</option>
            <option value="english">Engleză</option>
            <option value="russian">Rusă</option>
          </select>
        </div>
        <div className="form-group">
          <label>Buget Estimat (EUR):</label>
          <input
            type="number"
            name="estimated_budget"
            value={formData.estimated_budget}
            onChange={handleChange}
            min="0"
          />
        </div>
        <div className="form-group">
          <label>Preferințe Cazare:</label>
          <select
            name="accommodation_preferences"
            value={formData.accommodation_preferences}
            onChange={handleChange}
          >
            <option value="">Selectează preferința</option>
            <option value="dormitory">Cămin Studențesc</option>
            <option value="apartment">Apartament Privat</option>
            <option value="hostel">Hostel</option>
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <i className="fas fa-save"></i>
            {loading ? 'Se salvează...' : 'Salvează'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeProfileTab') || 'profile');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    country_of_origin: '',
    nationality: '',
    desired_study_level: '',
    preferred_study_field: '',
    desired_academic_year: '',
    preferred_study_language: '',
    estimated_budget: '',
    accommodation_preferences: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  // Save active tab in localStorage
  useEffect(() => {
    localStorage.setItem('activeProfileTab', activeTab);
  }, [activeTab]);

  // Verificare autentificare și încărcare date utilizator
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('Token lipsă - redirecționare către autentificare');
          navigate('/sign-in');
          return;
        }

        const headers = await getAuthHeaders();
        const response = await axios.get(`${API_BASE_URL}/api/users/profile`, { headers });

        if (!response.data?.success) {
          throw new Error('Date utilizator invalide');
        }

        const userData = response.data.data;
        setUserData(userData);
        setFormData(prevData => ({
          ...prevData,
          ...userData
        }));
        setError(null);
      } catch (err) {
        console.error('Eroare la încărcarea datelor utilizator:', err);
        setError(handleApiError(err));
        if (err.response?.status === 401) {
          navigate('/sign-in');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}/api/auth/update-profile`,
        formData,
        { headers: getAuthHeaders() }
      );

      if (response.data?.success) {
        const updatedUserData = response.data.data;
        setUserData(updatedUserData);
        setIsEditing(false);
        toast.success('Profilul a fost actualizat cu succes!');
      } else {
        throw new Error('Răspuns invalid de la server');
      }
    } catch (error) {
      console.error('Eroare la actualizarea profilului:', error);
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedData) => {
    setUserData(updatedData);
  };

  if (loading && !userData) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-container">
          <LoadingComponent />
        </div>
        <Footer />
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-container">
        <div className="profile-content">
          <ProfileNavigation activeTab={activeTab} onTabChange={handleTabChange} />
          <ProfileContent 
            activeTab={activeTab} 
            userData={userData} 
            onProfileUpdate={handleProfileUpdate}
          />
          {isEditing && (
            <EditProfileForm
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              loading={loading}
              onClose={() => setIsEditing(false)}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;