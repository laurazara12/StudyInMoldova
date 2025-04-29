import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from './footer';
import './profile-component.css';
import { API_BASE_URL, getAuthHeaders, handleApiError } from '../config/api.config';

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

const ProfileComponent = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(initialDocuments);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/sign-in');
          return;
        }

        console.log('Preluare date utilizator din baza de date...');
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: getAuthHeaders()
        });

        console.log('Răspuns de la server:', response.data);
        
        if (response.data.success) {
          setUser(response.data.user);
          if (response.data.user.role !== 'admin') {
            await fetchDocuments(token);
          }
        } else {
          setError(response.data.message || 'Nu s-au putut prelua datele utilizatorului');
          navigate('/sign-in');
        }
      } catch (error) {
        const apiError = handleApiError(error);
        console.error('Eroare la preluarea datelor utilizatorului:', apiError);
        if (apiError.status === 401) {
          navigate('/sign-in');
        } else {
          setError(apiError.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/sign-in');
    }
  }, [user, loading, navigate]);

  const fetchDocuments = async (token) => {
    try {
      console.log('Preluare documente...');
      const response = await axios.get(`${API_BASE_URL}/documents/user-documents`, {
        headers: getAuthHeaders()
      });

      console.log('Răspuns documente:', response.data);
      
      if (Array.isArray(response.data)) {
        setDocuments(response.data);
      } else {
        console.error('Format invalid pentru documente:', response.data);
        setDocuments([]);
      }
    } catch (error) {
      const apiError = handleApiError(error);
      console.error('Eroare la preluarea documentelor:', apiError);
      setDocuments([]);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-main">Loading...</div>
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

    // Verifică dimensiunea fișierului (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Fișierul este prea mare. Dimensiunea maximă permisă este de 5MB.');
      event.target.value = '';
      return;
    }

    // Verifică tipul fișierului
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
      [type]: { ...prev[type], file }
    }));
  };

  const handleUpload = async (type) => {
    const { file } = uploadStatus[type];
    if (!file) return;

    setUploadStatus(prev => ({
      ...prev,
      [type]: { ...prev[type], uploading: true, progress: 0 }
    }));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', type);

    try {
      const response = await axios.post(`${API_BASE_URL}/documents/upload`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

      // Verificăm dacă avem un document în răspuns
      if (response.data && response.data.document) {
        setUploadStatus(prev => ({
          ...prev,
          [type]: { 
            ...prev[type], 
            uploading: false, 
            progress: 100,
            uploaded: true,
            filePath: response.data.document.file_path
          }
        }));

        // Actualizează lista de documente
        await fetchDocuments(localStorage.getItem('token'));
        alert('Document încărcat cu succes');
      } else {
        throw new Error('Răspuns invalid de la server');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(prev => ({
        ...prev,
        [type]: { ...prev[type], uploading: false, progress: 0 }
      }));
      alert(error.response?.data?.message || 'Eroare la încărcarea documentului');
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

      const response = await axios.delete(`${API_BASE_URL}/documents/${document.id}`, {
        headers: getAuthHeaders()
      });

      if (response.data.message === 'Document șters cu succes') {
        setDocuments(prev => prev.filter(doc => doc.id !== document.id));
        setUploadStatus(prev => ({
          ...prev,
          [documentType]: { ...prev[documentType], file: null, uploaded: false }
        }));
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

      // Obținem token-ul din localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Nu sunteți autentificat. Vă rugăm să vă autentificați din nou.');
        navigate('/sign-in');
        return;
      }

      // Folosim axios pentru a descărca fișierul cu header-ul de autorizare
      const response = await axios({
        url: `${API_BASE_URL}/documents/download/${doc.id}`,
        method: 'GET',
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Creăm un URL pentru blob-ul descărcat
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      
      // Creăm un element temporar pentru descărcare
      const downloadLink = window.document.createElement('a');
      downloadLink.href = url;
      downloadLink.setAttribute('download', doc.file_path ? doc.file_path.split('/').pop() : `${documentType}.pdf`);
      window.document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Curățăm
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

  const renderDocumentUpload = (documentType, documentName) => {
    const document = documents.find(doc => doc.document_type === documentType);
    
    return (
      <div className="document-card">
        <div className="document-icon">
          📄
        </div>
        <h4 className="document-name">{documentName}</h4>
        {document?.uploaded ? (
          <div className="document-status">
            <p className="document-status-text">Document uploaded</p>
            <div className="document-actions">
              <button onClick={() => handleDelete(documentType)}>
                <span className="button-icon">🗑️</span>
                Delete
              </button>
              <button onClick={() => handleDownload(documentType)}>
                <span className="button-icon">⬇️</span>
                Download
              </button>
            </div>
          </div>
        ) : (
          <div className="document-upload">
            <div className="file-upload">
              <input
                type="file"
                onChange={(e) => handleFileChange(documentType, e)}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                id={`file-${documentType}`}
              />
              <label htmlFor={`file-${documentType}`}>Choose file</label>
            </div>
            {uploadStatus[documentType].file && (
              <button 
                className="upload-button"
                onClick={() => handleUpload(documentType)}
                disabled={uploadStatus[documentType].uploading}
              >
                {uploadStatus[documentType].uploading ? 'Uploading...' : 'Upload'}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-info-section">
          <div className="profile-card">
            <div className="profile-info">
              <span className="info-label">Name:</span>
              <span className="info-value">{user.name}</span>
            </div>
            <div className="profile-info">
              <span className="info-label">Email:</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="profile-info">
              <span className="info-label">Role:</span>
              <span className="info-value">{user.role}</span>
            </div>
          </div>
        </div>
        {user.role !== 'admin' && (
          <div className="document-section">
            <h2 className="document-heading">Documents</h2>
            <p className="document-info">Please upload the following documents in PDF, JPG, JPEG, PNG, DOC, DOCX, XLS, or XLSX format. Maximum file size: 5MB. You will receive an error message if you try to upload a larger file.</p>
            <div className="documents-grid">
              {renderDocumentUpload('passport', 'Passport')}
              {renderDocumentUpload('diploma', 'Diploma')}
              {renderDocumentUpload('transcript', 'Transcript')}
              {renderDocumentUpload('photo', 'Photo')}
              {renderDocumentUpload('medical', 'Medical Certificate')}
              {renderDocumentUpload('insurance', 'Health Insurance')}
              {renderDocumentUpload('other', 'Other Documents')}
              {renderDocumentUpload('cv', 'CV')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileComponent;