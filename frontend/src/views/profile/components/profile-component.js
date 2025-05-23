import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '../../../components/footer';
import './profile-component.css';
import { API_BASE_URL, getAuthHeaders, handleApiError } from '../../../config/api.config';
import PlanYourStudies from '../../../components/plan-your-studies';
import DocumentCounter from '../../../components/document-counter';
import Notifications from '../../../components/notifications';

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

const ProfileComponent = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Save active tab in localStorage
  useEffect(() => {
    localStorage.setItem('activeProfileTab', activeTab);
  }, [activeTab]);

  // Save documents in localStorage
  useEffect(() => {
    localStorage.setItem('uploadedDocuments', JSON.stringify(uploadStatus));
  }, [uploadStatus]);

  // Check authentication and load user data
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

  const fetchDocuments = async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/documents/user-documents`, {
        headers: getAuthHeaders()
      });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid document format');
      }

      const validDocuments = response.data.filter(doc => {
        if (!doc.id || !doc.document_type || !doc.file_path) {
          console.warn('Invalid document - missing required fields:', doc);
          return false;
        }

        if (doc.status === 'deleted') {
          console.warn('Deleted document:', doc);
          return false;
        }

        if (!doc.uploaded) {
          console.warn('Document not uploaded:', doc);
          return false;
        }

        return true;
      });

      setDocuments(validDocuments);
      
      // Update uploaded documents status
      const newUploadStatus = { ...uploadStatus };
      validDocuments.forEach(doc => {
        if (newUploadStatus[doc.document_type]) {
          newUploadStatus[doc.document_type] = {
            ...newUploadStatus[doc.document_type],
            uploaded: true
          };
        }
      });
      setUploadStatus(newUploadStatus);
    } catch (error) {
      const apiError = handleApiError(error);
      console.error('Error fetching documents:', apiError);
      setError(apiError.message || 'An error occurred while loading documents');
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
          <div className="profile-main-content">
            <div className="profile-main-content-header">
              <h1>Profile</h1>
            </div>
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

    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Maximum allowed size is 5MB.');
      event.target.value = '';
      return;
    }

    // Check file type
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

    // Update state with selected file, but don't start upload
    setUploadStatus(prev => ({
      ...prev,
      [type]: { 
        ...prev[type], 
        file: file,
        uploading: false,
        uploaded: false,
        error: null
      }
    }));
  };

  const handleUpload = async (documentType) => {
    try {
      const uploadStatusForType = uploadStatus[documentType];
      if (!uploadStatusForType?.file) {
        console.error('No file selected for upload');
        return;
      }

      // Check file size
      if (uploadStatusForType.file.size > 10 * 1024 * 1024) {
        setError('File is too large. Maximum allowed size is 10MB.');
        return;
      }

      // Check file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

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

      console.log('Uploading document:', {
        documentType,
        fileName: uploadStatusForType.file.name,
        fileSize: uploadStatusForType.file.size,
        fileType: uploadStatusForType.file.type
      });

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

      console.log('Upload response:', response.data);

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
      console.error('Upload error:', error);
      setUploadStatus(prev => ({
        ...prev,
        [documentType]: { 
          ...prev[documentType], 
          uploading: false, 
          error: error.message || 'Error uploading document'
        }
      }));
      setError(error.response?.data?.message || error.message || 'Error uploading document. Please try again.');
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
        // Remove document from localStorage
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

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You are not authenticated. Please sign in again.');
        navigate('/sign-in');
        return;
      }

      // Use axios to download file with authorization header
      const response = await axios({
        url: `${API_BASE_URL}/documents/download/${doc.id}`,
        method: 'GET',
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Create URL for downloaded blob
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      
      // Create temporary download element
      const downloadLink = window.document.createElement('a');
      downloadLink.href = url;
      downloadLink.setAttribute('download', doc.file_path ? doc.file_path.split('/').pop() : `${documentType}.pdf`);
      window.document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Cleanup
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      console.log('Saving profile data:', formData);
      
      // Send only modified fields
      const updatedFields = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== userData[key]) {
          updatedFields[key] = formData[key];
        }
      });
      
      // If no fields were modified, close modal
      if (Object.keys(updatedFields).length === 0) {
        alert('No changes made');
        setIsEditing(false);
        return;
      }
      
      const response = await axios.put(`${API_BASE_URL}/api/auth/update-profile`, updatedFields, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        // Update user data in interface
        setUserData(prev => ({
          ...prev,
          ...updatedFields
        }));
        
        alert('Profile updated successfully!');
        setIsEditing(false);
      } else {
        alert(response.data.message || 'Error updating profile');
      }
    } catch (error) {
      const apiError = handleApiError(error);
      console.error('Error updating profile:', apiError);
      alert(apiError.message || 'Error updating profile');
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
      <div className="profile-header">
        <div className="profile-tabs-container">
          <div className="profile-tabs">
            <button 
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              My Profile
            </button>
            <button 
              className={`tab-button ${activeTab === 'studies' ? 'active' : ''}`}
              onClick={() => setActiveTab('studies')}
            >
              Plan Your Studies
            </button>
            <button 
              className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              Upload Documents
            </button>
          </div>
        </div>
        <div className="edit-button-container">
          <button 
            className="btn btn-primary"
            onClick={() => {
              setFormData({
                full_name: userData?.name || '',
                email: userData?.email || '',
                phone: userData?.phone || '',
                date_of_birth: userData?.date_of_birth || '',
                country_of_origin: userData?.country_of_origin || '',
                nationality: userData?.nationality || '',
                desired_study_level: userData?.desired_study_level || '',
                preferred_study_field: userData?.preferred_study_field || '',
                desired_academic_year: userData?.desired_academic_year || '',
                preferred_study_language: userData?.preferred_study_language || '',
                estimated_budget: userData?.estimated_budget || '',
                accommodation_preferences: userData?.accommodation_preferences || ''
              });
              setIsEditing(true);
            }}
          >
            <i className="fas fa-edit"></i>
            Editează Profilul
          </button>
          <Notifications />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="profile-content">
          {/* Profile Section */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>My Profile</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Full Name:</span>
                  <span className="info-value">{userData?.name || 'Not specified'}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{userData && userData.email ? userData.email : 'Not specified'}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{userData && userData.phone ? userData.phone : 'Not specified'}</span>
                </div>
                <div className="info-item">
                  <label>Date of Birth:</label>
                  <span>{userData && userData.date_of_birth ? new Date(userData.date_of_birth).toLocaleDateString('en-US') : 'Not specified'}</span>
                </div>
                <div className="info-item">
                  <label>Country of Origin:</label>
                  <span>{userData && userData.country_of_origin ? userData.country_of_origin : 'Not specified'}</span>
                </div>
                <div className="info-item">
                  <label>Nationality:</label>
                  <span>{userData && userData.nationality ? userData.nationality : 'Not specified'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Plan Your Studies Section */}
          {activeTab === 'studies' && (
            <PlanYourStudies 
              userData={userData}
              documents={documents}
              documentTypes={documentTypes}
              calculateProfileProgress={() => calculateProfileProgress(userData)}
            />
          )}

          {/* Upload Documents Section */}
          {activeTab === 'documents' && (
            <div className="profile-section">
              <h2>Upload Documents</h2>
              
              <DocumentCounter 
                documents={documents}
                documentTypes={documentTypes}
              />

              <div className="documents-grid">
                {documentTypes.map((docType) => {
                  const document = documents.find(d => d.document_type === docType.id);
                  const uploadStatusForType = uploadStatus[docType.id];
                  const isDocumentValid = document && document.status !== 'deleted' && document.uploaded;
                  
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
                            {(!uploadStatusForType?.file || uploadStatusForType?.uploaded) && (
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

              <div className="documents-header">
                <h3>My Documents</h3>
                <button onClick={cleanupDocuments} className="btn btn-secondary">
                  <i className="fas fa-broom"></i>
                  Curăță documente invalide
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <button 
              className="btn btn-secondary"
              onClick={() => setIsEditing(false)}
            >
              <i className="fas fa-times"></i>
              Anulează
            </button>
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name:</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
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
                />
              </div>
              <div className="form-group">
                <label>Nationality:</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Desired Study Level:</label>
                <select
                  name="desired_study_level"
                  value={formData.desired_study_level}
                  onChange={handleChange}
                >
                  <option value="">Select level</option>
                  <option value="bachelor">Bachelor's</option>
                  <option value="master">Master's</option>
                  <option value="doctorate">Doctorate</option>
                </select>
              </div>
              <div className="form-group">
                <label>Preferred Field of Study:</label>
                <input
                  type="text"
                  name="preferred_study_field"
                  value={formData.preferred_study_field}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Desired Academic Year:</label>
                <input
                  type="text"
                  name="desired_academic_year"
                  value={formData.desired_academic_year}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Preferred Study Language:</label>
                <select
                  name="preferred_study_language"
                  value={formData.preferred_study_language}
                  onChange={handleChange}
                >
                  <option value="">Select language</option>
                  <option value="romanian">Romanian</option>
                  <option value="english">English</option>
                  <option value="russian">Russian</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estimated Budget (EUR):</label>
                <input
                  type="number"
                  name="estimated_budget"
                  value={formData.estimated_budget}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Accommodation Preferences:</label>
                <select
                  name="accommodation_preferences"
                  value={formData.accommodation_preferences}
                  onChange={handleChange}
                >
                  <option value="">Select preference</option>
                  <option value="dormitory">Student Dormitory</option>
                  <option value="apartment">Private Apartment</option>
                  <option value="hostel">Hostel</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i>
                  Salvează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileComponent;