import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import { API_BASE_URL, getAuthHeaders, handleApiError } from '../../config/api.config';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './styles.css';
import PlanYourStudies from '../../components/plan-your-studies';
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
      
      if (response.data) {
        setSavedPrograms(response.data);
      }
    } catch (error) {
      console.error('Error fetching saved programs:', error);
      
      if (error.response?.status === 401) {
        navigate('/sign-in');
        return;
      }
      setError(handleApiError(error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/documents/user-documents`, {
        headers: getAuthHeaders()
      });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Format invalid al documentelor');
      }

      const validDocuments = response.data.filter(doc => {
        if (!doc.id || !doc.document_type || !doc.file_path) {
          console.warn('Document invalid - lipsesc câmpuri obligatorii:', doc);
          return false;
        }

        if (doc.status === 'deleted') {
          console.warn('Document șters:', doc);
          return false;
        }

        return true;
      });

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
      const apiError = handleApiError(error);
      console.error('Eroare la preluarea documentelor:', apiError);
      setError(apiError.message || 'A apărut o eroare la încărcarea documentelor');
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
      alert('Fișierul este prea mare. Dimensiunea maximă permisă este de 5MB.');
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
      alert('Tip de fișier neacceptat. Folosiți doar PDF, JPG, PNG, DOC, DOCX, XLS sau XLSX.');
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
        console.error('Nu există fișier selectat pentru upload');
        return;
      }

      if (!documentType) {
        console.error('Tipul documentului este lipsă');
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
        setError('Fișierul este prea mare. Dimensiunea maximă permisă este de 10MB.');
        return;
      }

      if (!allowedTypes.includes(uploadStatusForType.file.type)) {
        setError('Tip de fișier neacceptat. Folosiți doar PDF, JPG, PNG, DOC, DOCX, XLS sau XLSX.');
        return;
      }

      setUploadStatus(prev => ({
        ...prev,
        [documentType]: { ...prev[documentType], uploading: true, error: null }
      }));

      const formData = new FormData();
      formData.append('file', uploadStatusForType.file);
      formData.append('document_type', documentType);

      console.log('Conținut FormData:', {
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
        throw new Error('Tipul documentului nu a fost inclus în FormData');
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

      console.log('Răspuns server:', response.data);

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
        throw new Error(response.data.message || 'Eroare la încărcarea documentului');
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

      let errorMessage = 'Eroare la încărcarea documentului. ';
      
      if (error.response) {
        if (error.response.status === 413) {
          errorMessage += 'Fișierul este prea mare.';
        } else if (error.response.status === 415) {
          errorMessage += 'Tip de fișier neacceptat.';
        } else if (error.response.status === 401) {
          errorMessage += 'Sesiunea a expirat. Vă rugăm să vă autentificați din nou.';
          navigate('/sign-in');
        } else {
          errorMessage += error.response.data?.message || error.message;
        }
      } else if (error.request) {
        errorMessage += 'Nu s-a putut conecta la server. Verificați conexiunea la internet.';
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
        alert('Documentul nu a fost găsit');
        return;
      }

      if (!window.confirm('Sunteți sigur că doriți să ștergeți acest document?')) {
        return;
      }

      const response = await axios.delete(`${API_BASE_URL}/api/documents/${document.id}`, {
        headers: getAuthHeaders()
      });

      if (response.data.message === 'Document șters cu succes') {
        const updatedStatus = {
          ...uploadStatus,
          [documentType]: { ...uploadStatus[documentType], file: null, uploaded: false, filePath: null, fileName: null, uploadDate: null }
        };
        setUploadStatus(updatedStatus);
        localStorage.setItem('uploadedDocuments', JSON.stringify(updatedStatus));
        
        setDocuments(prev => prev.filter(doc => doc.id !== document.id));
        alert('Document șters cu succes');
      }
    } catch (error) {
      const apiError = handleApiError(error);
      console.error('Eroare la ștergerea documentului:', apiError);
      alert(apiError.message || 'Eroare la ștergerea documentului');
    }
  };

  const handleDownload = async (documentType) => {
    try {
      const doc = documents.find(doc => doc.document_type === documentType);
      if (!doc) {
        alert('Documentul nu a fost găsit');
        return;
      }

      console.log('Încercare descărcare:', documentType);

      const token = localStorage.getItem('token');
      if (!token) {
        alert('Nu sunteți autentificat. Vă rugăm să vă autentificați din nou.');
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
      
      console.log('Descărcare inițiată pentru:', documentType);
    } catch (error) {
      console.error('Eroare detaliată la descărcare:', error);
      
      if (error.response) {
        if (error.response.status === 404) {
          alert('Documentul nu a fost găsit pe server');
        } else if (error.response.status === 401) {
          alert('Nu sunteți autentificat. Vă rugăm să vă autentificați din nou.');
          navigate('/sign-in');
        } else {
          alert(`Eroare la descărcarea documentului: ${error.response.data?.message || 'Eroare necunoscută'}`);
        }
      } else if (error.request) {
        alert('Nu s-a putut conecta la server. Verificați conexiunea la internet.');
      } else {
        alert(`Eroare la descărcarea documentului: ${error.message}`);
      }
    }
  };

  const handleRemoveSavedProgram = async (programId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/saved-programs/${programId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Actualizează lista de programe salvate după ștergere
      setSavedPrograms(prevPrograms => 
        prevPrograms.filter(program => program.id !== programId)
      );
    } catch (error) {
      console.error('Eroare la eliminarea programului:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      console.log('Salvare date profil:', formData);
      
      const updatedFields = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== userData[key]) {
          updatedFields[key] = formData[key];
        }
      });
      
      if (Object.keys(updatedFields).length === 0) {
        alert('Nu s-au făcut modificări');
        setIsEditing(false);
        return;
      }
      
      const response = await axios.put(`${API_BASE_URL}/api/auth/update-profile`, updatedFields, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        setUserData(prev => ({
          ...prev,
          ...updatedFields
        }));
        
        alert('Profilul a fost actualizat cu succes!');
        setIsEditing(false);
      } else {
        alert(response.data.message || 'Eroare la actualizarea profilului');
      }
    } catch (error) {
      const apiError = handleApiError(error);
      console.error('Eroare la actualizarea profilului:', apiError);
      alert(apiError.message || 'Eroare la actualizarea profilului');
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
      if (!window.confirm('Sunteți sigur că doriți să curățați documentele invalide? Această acțiune nu poate fi anulată.')) {
        return;
      }
      
      const response = await axios.post(`${API_BASE_URL}/api/documents/cleanup`, {}, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        alert(response.data.message);
        await fetchDocuments();
      } else {
        alert('A apărut o eroare la curățarea documentelor: ' + (response.data.error || 'Eroare necunoscută'));
      }
    } catch (error) {
      console.error('Eroare la curățarea documentelor:', error);
      alert('A apărut o eroare la curățarea documentelor. Vă rugăm să încercați din nou.');
    }
  }

  return (
    <div className="profile-container">
      <Helmet>
        <title>Profil - Study In Moldova</title>
        <meta property="og:title" content="Profil - Study In Moldova" />
      </Helmet>
      <Navbar />
      <div className="profile-content">
        <div className="profile-header">
          <h1>Profilul meu</h1>
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
            Profil
          </button>
          <button 
            className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Documente
          </button>
          <button 
            className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Aplicații
          </button>
          <button 
            className={`tab-button ${activeTab === 'study-plan' ? 'active' : ''}`}
            onClick={() => setActiveTab('study-plan')}
          >
            Plan de studii
          </button>
          <button 
            className={`tab-button ${activeTab === 'saved-programs' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved-programs')}
          >
            Programe salvate
          </button>
          <button 
            className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notificări
          </button>
        </div>

        <div className="profile-main">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="user-info">
                <h2>Informații personale</h2>
                <p><strong>Nume:</strong> {authUser.name}</p>
                <p><strong>Email:</strong> {authUser.email}</p>
                {authUser.phone && <p><strong>Telefon:</strong> {authUser.phone}</p>}
                {authUser.country_of_origin && <p><strong>Țara de origine:</strong> {authUser.country_of_origin}</p>}
                {authUser.nationality && <p><strong>Naționalitate:</strong> {authUser.nationality}</p>}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="profile-section">
              <h2>Documente</h2>
              
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
                            <p>Încărcat: {new Date(document.uploadDate).toLocaleDateString()}</p>
                          </>
                        )}
                      </div>
                      <div className="document-actions">
                        {isDocumentValid ? (
                          <>
                            <button 
                              className="download-button"
                              onClick={() => handleDownload(docType.id)}
                            >
                              Descarcă
                            </button>
                            <button 
                              className="delete-button"
                              onClick={() => handleDelete(docType.id)}
                            >
                              Șterge
                            </button>
                          </>
                        ) : (
                          <>
                            {uploadStatusForType?.file && !uploadStatusForType?.uploaded && (
                              <button 
                                className="upload-button"
                                onClick={() => handleUpload(docType.id)}
                                disabled={uploadStatusForType.uploading}
                              >
                                {uploadStatusForType.uploading ? 'Se încarcă...' : 'Încarcă'}
                              </button>
                            )}
                            {!uploadStatusForType?.file && (
                              <button 
                                className="choose-button"
                                onClick={() => {
                                  fileInputRef.current.click();
                                  fileInputRef.current.dataset.documentType = docType.id;
                                }}
                              >
                                Alege fișier
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
              <h2>Programe salvate</h2>
              {savedPrograms.length > 0 ? (
                <div className="programs-grid">
                  {savedPrograms.map((savedProgram) => {
                    const program = savedProgram.program || savedProgram;
                    const university = program.university || program.University;
                    return (
                      <div key={program.id} className="program-card">
                        <div className="program-header">
                          <h3>{program.name}</h3>
                          <button
                            className="remove-button"
                            onClick={() => handleRemoveSavedProgram(program.id)}
                          >
                            Elimină
                          </button>
                        </div>
                        <div className="program-details">
                          <p><strong>Universitate:</strong> {university?.name || 'N/A'}</p>
                          <p><strong>Facultate:</strong> {program.faculty}</p>
                          <p><strong>Grad:</strong> {program.degree}</p>
                          <p><strong>Credite:</strong> {program.credits}</p>
                          <p><strong>Limbi:</strong> {Array.isArray(program.languages) ? program.languages.join(', ') : program.languages}</p>
                          <p><strong>Durată:</strong> {program.duration}</p>
                          <p><strong>Taxă de școlarizare:</strong> {program.tuitionFee}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>Nu aveți programe salvate.</p>
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