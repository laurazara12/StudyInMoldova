import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import { API_BASE_URL, getAuthHeaders, handleApiError } from '../../config/api.config';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './profile.css';

import PlanYourStudies from './components/plan-your-studies';
import DocumentCounter from '../../components/document-counter';
import Notifications from '../../components/notifications';
import ApplicationsSection from './applications-section';

const initialDocuments = {
  diploma: { uploading: false, progress: 0, uploaded: false, file: null },
  transcript: { uploading: false, progress: 0, uploaded: false, file: null },
  passport: { uploading: false, progress: 0, uploaded: false, file: null },
  photo: { uploading: false, progress: 0, uploaded: false, file: null },
  medical: { uploading: false, progress: 0, uploaded: false, file: null },
  insurance: { uploading: false, progress: 0, uploaded: false, file: null },
  other: { uploading: false, progress: 0, uploaded: false, file: null },
  cv: { uploading: false, progress: 0, uploaded: false, file: null }
};

const documentTypes = [
  { id: 'diploma', name: 'Diploma', description: 'High school diploma or equivalent' },
  { id: 'transcript', name: 'Transcript', description: 'High school transcript with grades' },
  { id: 'passport', name: 'Passport', description: 'Valid passport' },
  { id: 'photo', name: 'Photo', description: 'Recent 3x4 photo' },
  { id: 'medical', name: 'Medical Certificate', description: 'Medical certificate' },
  { id: 'insurance', name: 'Health Insurance', description: 'Health insurance' },
  { id: 'other', name: 'Other Documents', description: 'Other documents' },
  { id: 'cv', name: 'CV', description: 'Curriculum Vitae' }
];

const Profile = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user: authUser, checkAuth } = useAuth();
  const [savedPrograms, setSavedPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(() => {
    const savedDocuments = localStorage.getItem('uploadedDocuments');
    return savedDocuments ? { ...initialDocuments, ...JSON.parse(savedDocuments) } : initialDocuments;
  });
  const [isEditing, setIsEditing] = useState(false);
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
  const [userData, setUserData] = useState(null);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeProfileTab') || 'profile');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !authUser) {
      navigate('/sign-in');
      return;
    }

    if (!isInitialized) {
      fetchSavedPrograms();
      setIsInitialized(true);
    }
  }, [isAuthenticated, authUser, navigate, isInitialized]);

  useEffect(() => {
    localStorage.setItem('activeProfileTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('uploadedDocuments', JSON.stringify(uploadStatus));
  }, [uploadStatus]);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/sign-in');
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: getAuthHeaders()
        });

        if (!response.data?.success || !response.data?.user) {
          throw new Error('User data is missing or invalid');
        }

        const userData = response.data.user;
        
        if (isMounted) {
          setUser(userData);
          setUserData(userData);
          setFormData({
            full_name: userData.full_name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            date_of_birth: userData.date_of_birth || '',
            country_of_origin: userData.country_of_origin || '',
            nationality: userData.nationality || '',
            desired_study_level: userData.desired_study_level || '',
            preferred_study_field: userData.preferred_study_field || '',
            desired_academic_year: userData.desired_academic_year || '',
            preferred_study_language: userData.preferred_study_language || '',
            estimated_budget: userData.estimated_budget || '',
            accommodation_preferences: userData.accommodation_preferences || ''
          });

          if (userData.role !== 'admin') {
            await fetchDocuments();
          }
        }
      } catch (error) {
        if (isMounted) {
          const apiError = handleApiError(error);
          console.error('Error fetching user data:', apiError);
          
          if (apiError.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/sign-in');
          } else {
            setError(apiError.message || 'An error occurred while loading data');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const fetchSavedPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/api/saved-programs`, {
        headers: getAuthHeaders()
      });
      
      console.log('Saved programs response:', response.data);
      
      if (response.data?.data) {
        const savedProgramsData = response.data.data;
        console.log('Processed saved programs:', savedProgramsData);
        setSavedPrograms(savedProgramsData);
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Unexpected server response format');
        setSavedPrograms([]);
      }
    } catch (error) {
      console.error('Error fetching saved programs:', error);
      
      if (error.response?.status === 401) {
        navigate('/sign-in');
        return;
      }
      setError(handleApiError(error).message);
      setSavedPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      setError(null);
      console.log('Starting document fetch...');
      
      const response = await axios.get(`${API_BASE_URL}/api/documents/user-documents`, {
        headers: getAuthHeaders()
      });

      console.log('Server document response:', response.data);

      if (!response.data) {
        throw new Error('No data received from server');
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error fetching documents');
      }

      const documentsArray = response.data.data || [];
      
      if (!Array.isArray(documentsArray)) {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid data format received from server');
      }

      const validDocuments = documentsArray.filter(doc => {
        if (!doc.id || !doc.document_type || !doc.file_path) {
          console.warn('Invalid document - missing required fields:', doc);
          return false;
        }

        if (doc.status === 'deleted') {
          console.warn('Deleted document:', doc);
          return false;
        }

        return true;
      });

      console.log('Valid documents found:', validDocuments.length);
      setDocuments(validDocuments);
      
      const newUploadStatus = { ...initialDocuments };
      validDocuments.forEach(doc => {
        if (newUploadStatus[doc.document_type]) {
          newUploadStatus[doc.document_type] = {
            ...newUploadStatus[doc.document_type],
            uploaded: true,
            file: null,
            progress: 100
          };
        }
      });
      setUploadStatus(newUploadStatus);
    } catch (error) {
      console.error('Document fetch error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });

      let errorMessage = 'An error occurred while loading documents. ';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Session expired. Please sign in again.';
          navigate('/sign-in');
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to access these documents.';
        } else {
          errorMessage += error.response.data?.message || 'Server error.';
        }
      } else if (error.request) {
        errorMessage += 'Could not connect to server. Please check your internet connection.';
      } else {
        errorMessage += error.message;
      }

      setError(errorMessage);
      setDocuments([]);
    }
  };

  const calculateProfileProgress = (userData) => {
    if (!userData) return 0;
    
    const requiredFields = [
      'phone',
      'date_of_birth',
      'country_of_origin',
      'nationality',
      'desired_study_level',
      'preferred_study_field',
      'desired_academic_year',
      'preferred_study_language',
      'estimated_budget',
      'accommodation_preferences'
    ];
    
    const completedFields = requiredFields.filter(field => 
      userData[field] && userData[field].toString().trim() !== ''
    );
    
    const progress = Math.round((completedFields.length / requiredFields.length) * 100);
    return progress;
  };

  if (loading) {
    return (
      <div className="profile-container">
        <Navbar />
        <div className="profile-content">
          <div className="loading">Se încarcă...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleFileChange = (type, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Maximum allowed size is 5MB.');
      event.target.value = '';
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('File type not accepted. Please use only PDF, JPG, PNG, DOC, DOCX, XLS or XLSX.');
      event.target.value = '';
      return;
    }

    setUploadStatus(prev => ({
      ...prev,
      [type]: { 
        ...prev[type], 
        file: file,
        uploading: false,
        uploaded: false,
        error: null,
        progress: 0
      }
    }));
  };

  const handleUpload = async (documentType) => {
    const uploadStatusForType = uploadStatus[documentType];
    
    try {
      if (!uploadStatusForType?.file) {
        console.error('No file selected for upload');
        return;
      }

      if (!documentType) {
        console.error('Document type is missing');
        return;
      }

      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (uploadStatusForType.file.size > 10 * 1024 * 1024) {
        setError('File is too large. Maximum allowed size is 10MB.');
        return;
      }

      if (!allowedTypes.includes(uploadStatusForType.file.type)) {
        setError('File type not accepted. Please use only PDF, JPG, PNG, DOC, DOCX, XLS or XLSX.');
        return;
      }

      setUploadStatus(prev => ({
        ...prev,
        [documentType]: { ...prev[documentType], uploading: true, error: null }
      }));

      const formData = new FormData();
      formData.append('file', uploadStatusForType.file);
      formData.append('document_type', documentType);

      console.log('FormData content:', {
        documentType: documentType,
        fileName: uploadStatusForType.file.name,
        fileSize: uploadStatusForType.file.size,
        fileType: uploadStatusForType.file.type
      });

      const formDataEntries = {};
      for (let [key, value] of formData.entries()) {
        formDataEntries[key] = value;
      }
      console.log('FormData entries:', formDataEntries);

      if (!formDataEntries.document_type) {
        throw new Error('Document type was not included in FormData');
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/documents/upload`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadStatus(prev => ({
              ...prev,
              [documentType]: { ...prev[documentType], progress }
            }));
          }
        }
      );

      console.log('Server response:', response.data);

      if (response.data.success) {
        setUploadStatus(prev => ({
          ...prev,
          [documentType]: { 
            ...prev[documentType], 
            uploading: false, 
            uploaded: true,
            error: null,
            progress: 100
          }
        }));
        await fetchDocuments();
        setError(null);
      } else {
        throw new Error(response.data.message || 'Error uploading document');
      }
    } catch (error) {
      console.error('Upload error:', {
        error: error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        documentType: documentType,
        formData: uploadStatusForType ? {
          file: uploadStatusForType.file,
          document_type: documentType
        } : null
      });

      let errorMessage = 'Error uploading document. ';
      
      if (error.response) {
        if (error.response.status === 413) {
          errorMessage += 'File is too large.';
        } else if (error.response.status === 415) {
          errorMessage += 'File type not accepted.';
        } else if (error.response.status === 401) {
          errorMessage += 'Session expired. Please sign in again.';
          navigate('/sign-in');
        } else {
          errorMessage += error.response.data?.message || error.message;
        }
      } else if (error.request) {
        errorMessage += 'Could not connect to server. Please check your internet connection.';
      } else {
        errorMessage += error.message;
      }

      setUploadStatus(prev => ({
        ...prev,
        [documentType]: { 
          ...prev[documentType], 
          uploading: false, 
          error: errorMessage
        }
      }));
      setError(errorMessage);
    }
  };

  const handleDelete = async (documentType) => {
    try {
      const document = documents.find(doc => doc.document_type === documentType);
      if (!document) {
        alert('Document not found');
        return;
      }

      if (!window.confirm('Are you sure you want to delete this document?')) {
        return;
      }

      const response = await axios.delete(`${API_BASE_URL}/api/documents/${document.id}`, {
        headers: getAuthHeaders()
      });

      if (response.data.message === 'Document deleted successfully') {
        const updatedStatus = {
          ...uploadStatus,
          [documentType]: { ...uploadStatus[documentType], file: null, uploaded: false, filePath: null, fileName: null, uploadDate: null }
        };
        setUploadStatus(updatedStatus);
        localStorage.setItem('uploadedDocuments', JSON.stringify(updatedStatus));
        
        setDocuments(prev => prev.filter(doc => doc.id !== document.id));
        alert('Document deleted successfully');
      }
    } catch (error) {
      const apiError = handleApiError(error);
      console.error('Error deleting document:', apiError);
      alert(apiError.message || 'Error deleting document');
    }
  };

  const handleDownload = async (documentType) => {
    try {
      const doc = documents.find(doc => doc.document_type === documentType);
      if (!doc) {
        alert('Document not found');
        return;
      }

      console.log('Attempting download:', documentType);

      const token = localStorage.getItem('token');
      if (!token) {
        alert('You are not authenticated. Please sign in again.');
        navigate('/sign-in');
        return;
      }

      const response = await axios({
        url: `${API_BASE_URL}/documents/download/${doc.id}`,
        method: 'GET',
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      
      const downloadLink = window.document.createElement('a');
      downloadLink.href = url;
      downloadLink.setAttribute('download', doc.file_path ? doc.file_path.split('/').pop() : `${documentType}.pdf`);
      window.document.body.appendChild(downloadLink);
      downloadLink.click();
      
      window.document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(url);
      
      console.log('Download initiated for:', documentType);
    } catch (error) {
      console.error('Detailed download error:', error);
      
      if (error.response) {
        if (error.response.status === 404) {
          alert('Document not found on server');
        } else if (error.response.status === 401) {
          alert('You are not authenticated. Please sign in again.');
          navigate('/sign-in');
        } else {
          alert(`Error downloading document: ${error.response.data?.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        alert('Could not connect to server. Please check your internet connection.');
      } else {
        alert(`Error downloading document: ${error.message}`);
      }
    }
  };

  const handleRemoveSavedProgram = async (programId) => {
    setProgramToDelete(programId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteProgram = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/saved-programs/${programToDelete}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSavedPrograms(prevPrograms => 
        prevPrograms.filter(program => program.id !== programToDelete)
      );
      setShowDeleteConfirmation(false);
      setProgramToDelete(null);
    } catch (error) {
      console.error('Error removing program:', error);
      setError('An error occurred while removing the program. Please try again.');
    }
  };

  const cancelDeleteProgram = () => {
    setShowDeleteConfirmation(false);
    setProgramToDelete(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      console.log('Saving profile data:', formData);
      
      const updatedFields = {};
      Object.keys(formData).forEach(key => {
        const oldValue = String(userData[key] || '');
        const newValue = String(formData[key] || '');
        
        if (oldValue !== newValue) {
          updatedFields[key] = formData[key];
        }
      });
      
      if (Object.keys(updatedFields).length === 0) {
        alert('Nu au fost făcute modificări');
        setIsEditing(false);
        return;
      }
      
      console.log('Fields to update:', updatedFields);
      
      const response = await axios.put(`${API_BASE_URL}/api/auth/update-profile`, updatedFields, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        const userResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: getAuthHeaders()
        });
        
        if (userResponse.data?.success && userResponse.data?.user) {
          const updatedUserData = userResponse.data.user;
          setUserData(updatedUserData);
          setUser(updatedUserData);
          setFormData({
            full_name: updatedUserData.full_name || '',
            email: updatedUserData.email || '',
            phone: updatedUserData.phone || '',
            date_of_birth: updatedUserData.date_of_birth || '',
            country_of_origin: updatedUserData.country_of_origin || '',
            nationality: updatedUserData.nationality || '',
            desired_study_level: updatedUserData.desired_study_level || '',
            preferred_study_field: updatedUserData.preferred_study_field || '',
            desired_academic_year: updatedUserData.desired_academic_year || '',
            preferred_study_language: updatedUserData.preferred_study_language || '',
            estimated_budget: updatedUserData.estimated_budget || '',
            accommodation_preferences: updatedUserData.accommodation_preferences || ''
          });
        }
        
        alert('Profilul a fost actualizat cu succes!');
        setIsEditing(false);
      } else {
        throw new Error(response.data.message || 'Eroare la actualizarea profilului');
      }
    } catch (error) {
      console.error('Eroare la actualizarea profilului:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Eroare la actualizarea profilului';
      alert(errorMessage);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getDocumentTypeLabel = (documentType) => {
    switch (documentType) {
      case 'passport':
        return 'Passport';
      case 'diploma':
        return 'Diploma';
      case 'transcript':
        return 'Transcript';
      case 'photo':
        return 'Photo';
      case 'medical':
        return 'Medical Certificate';
      case 'insurance':
        return 'Health Insurance';
      case 'other':
        return 'Other Documents';
      case 'cv':
        return 'CV';
      default:
        return documentType;
    }
  };

  async function cleanupDocuments() {
    try {
      if (!window.confirm('Are you sure you want to clean up invalid documents? This action cannot be undone.')) {
        return;
      }
      
      const response = await axios.post(`${API_BASE_URL}/api/documents/cleanup`, {}, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        alert(response.data.message);
        await fetchDocuments();
      } else {
        alert('An error occurred while cleaning up documents: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error cleaning up documents:', error);
      alert('An error occurred while cleaning up documents. Please try again.');
    }
  }

  return (
    <div className="profile-container">
      <Helmet>
        <title>Profile - Study In Moldova</title>
        <meta property="og:title" content="Profile - Study In Moldova" />
      </Helmet>
      <Navbar />
      <div className="profile-content">
        <div className="profile-header">
          <h1>My Profile</h1>
          <div className="profile-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${calculateProfileProgress(userData)}%` }}
              ></div>
            </div>
            <span>{calculateProfileProgress(userData)}% Complete</span>
          </div>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
          <button 
            className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
          <button 
            className={`tab-button ${activeTab === 'study-plan' ? 'active' : ''}`}
            onClick={() => setActiveTab('study-plan')}
          >
            Study Plan
          </button>
          <button 
            className={`tab-button ${activeTab === 'saved-programs' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved-programs')}
          >
            Saved Programs
          </button>
          <button 
            className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
        </div>

        <div className="profile-main">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="user-info">
                <div className="profile-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0 }}>Personal Information</h2>
                  <button 
                    className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Anulează' : 'Editează Profilul'}
                  </button>
                </div>
                {!isEditing ? (
                  <>
                    <div className="profile-info-text">
                      <p><strong>Nume:</strong> {authUser.name}</p>
                      <p><strong>Email:</strong> {authUser.email}</p>
                      <p><strong>Data nașterii:</strong> {userData?.date_of_birth ? new Date(userData.date_of_birth).toLocaleDateString('ro-RO') : 'Nespecificată'}</p>
                      {userData?.phone && <p><strong>Telefon:</strong> {userData.phone}</p>}
                      {userData?.country_of_origin && <p><strong>Țara de origine:</strong> {userData.country_of_origin}</p>}
                      {userData?.nationality && <p><strong>Naționalitate:</strong> {userData.nationality}</p>}
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleSubmit} className="edit-profile-form">
                    <div className="form-group">
                      <label>Full Name:</label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone:</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="form-group">
                      <label>Date of Birth:</label>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Country of Origin:</label>
                      <input
                        type="text"
                        name="country_of_origin"
                        value={formData.country_of_origin}
                        onChange={handleChange}
                        placeholder="Enter your country of origin"
                      />
                    </div>
                    <div className="form-group">
                      <label>Nationality:</label>
                      <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        placeholder="Enter your nationality"
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">Salvează Modificările</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="profile-section">
              <h2>Documents</h2>
              
              <DocumentCounter 
                documents={documents}
                documentTypes={documentTypes}
              />

              <div className="documents-grid">
                {documentTypes.map((docType) => {
                  const document = documents.find(d => d.document_type === docType.id);
                  const uploadStatusForType = uploadStatus[docType.id];
                  const isDocumentValid = document && document.status !== 'deleted';
                  
                  return (
                    <div key={docType.id} className="document-item">
                      <div className="document-info">
                        <h3>{docType.name}</h3>
                        <p>{docType.description}</p>
                        {isDocumentValid && (
                          <>
                            <p>Status: {document.status}</p>
                            <p>Uploaded: {new Date(document.uploadDate).toLocaleDateString()}</p>
                          </>
                        )}
                      </div>
                      <div className="document-actions">
                        {isDocumentValid ? (
                          <>
                            <button 
                              className="action-button download-button"
                              onClick={() => handleDownload(docType.id)}
                            >
                              <i className="fas fa-download"></i>
                              Descarcă
                            </button>
                            <button 
                              className="action-button delete-button"
                              onClick={() => handleDelete(docType.id)}
                            >
                              <i className="fas fa-trash"></i>
                              Șterge
                            </button>
                          </>
                        ) : (
                          <>
                            {uploadStatusForType?.file && !uploadStatusForType?.uploaded && (
                              <button 
                                className="action-button upload-button"
                                onClick={() => handleUpload(docType.id)}
                                disabled={uploadStatusForType.uploading}
                              >
                                {uploadStatusForType.uploading ? 'Se încarcă...' : 'Încarcă'}
                              </button>
                            )}
                            {!uploadStatusForType?.file && (
                              <button 
                                className="action-button choose-button"
                                onClick={() => {
                                  fileInputRef.current.click();
                                  fileInputRef.current.dataset.documentType = docType.id;
                                }}
                              >
                                <i className="fas fa-file"></i>
                                Alege Fișier
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      {uploadStatusForType?.uploading && (
                        <div className="upload-progress">
                          <div 
                            className="progress-bar"
                            style={{ width: `${uploadStatusForType.progress}%` }}
                          ></div>
                          <span>{uploadStatusForType.progress}%</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(event) => {
                  const documentType = event.target.dataset.documentType;
                  handleFileChange(documentType, event);
                }}
              />
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="applications-section">
              <ApplicationsSection />
            </div>
          )}

          {activeTab === 'study-plan' && (
            <div className="study-plan-section">
              <PlanYourStudies 
                userData={userData}
                documents={documents}
                documentTypes={documentTypes}
                calculateProfileProgress={calculateProfileProgress}
              />
            </div>
          )}

          {activeTab === 'saved-programs' && (
            <div className="saved-programs-section">
              <h2>Saved Programs</h2>
              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Loading saved programs...</p>
                </div>
              ) : error ? (
                <p className="error-message">{error}</p>
              ) : savedPrograms && savedPrograms.length > 0 ? (
                <div className="programs-grid">
                  {savedPrograms.map((savedProgram) => {
                    const program = savedProgram.program || savedProgram;
                    const university = program.university || program.University;
                    return (
                      <div key={program.id} className="program-card">
                        <div className="program-header">
                          <h3>{program.name}</h3>
                          <button
                            className="action-button delete-button"
                            onClick={() => handleRemoveSavedProgram(program.id)}
                          >
                            <i className="fas fa-trash"></i>
                            Elimină
                          </button>
                        </div>
                        <div className="program-details">
                          <p><strong>University:</strong> {university?.name || 'N/A'}</p>
                          <p><strong>Faculty:</strong> {program.faculty}</p>
                          <p><strong>Degree:</strong> {program.degree}</p>
                          <p><strong>Credits:</strong> {program.credits}</p>
                          <p><strong>Languages:</strong> {Array.isArray(program.languages) ? program.languages.join(', ') : program.languages}</p>
                          <p><strong>Duration:</strong> {program.duration}</p>
                          <p><strong>Tuition Fee:</strong> {program.tuitionFee}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="no-programs-message">You have no saved programs.</p>
              )}

              {showDeleteConfirmation && (
                <div className="confirmation-modal">
                  <div className="confirmation-content">
                    <h3>Confirm Deletion</h3>
                    <p>Are you sure you want to remove this program from your saved programs list?</p>
                    <div className="confirmation-buttons">
                      <button className="btn btn-secondary" onClick={cancelDeleteProgram}>
                        Anulează
                      </button>
                      <button className="btn btn-primary" onClick={confirmDeleteProgram}>
                        Elimină
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="notifications-section">
              <Notifications />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;