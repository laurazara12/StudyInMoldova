import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from './footer';
import './profile-component.css';

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
        const response = await axios.get('http://localhost:4000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Răspuns de la server:', response.data);
        
        if (response.data.success) {
          setUser(response.data.user);
          // Preluăm documentele după ce avem datele utilizatorului
          await fetchDocuments(token);
        } else {
          setError(response.data.message || 'Nu s-au putut prelua datele utilizatorului');
          navigate('/sign-in');
        }
      } catch (error) {
        console.error('Eroare la preluarea datelor utilizatorului:', error);
        if (error.response?.status === 401) {
          navigate('/sign-in');
        } else {
          setError('Eroare la preluarea datelor utilizatorului');
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
      const response = await axios.get('http://localhost:4000/api/documents/user-documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Răspuns documente:', response.data);
      
      if (response.data.success) {
        setDocuments(response.data.documents);
      } else {
        console.error('Eroare la preluarea documentelor:', response.data.message);
      }
    } catch (error) {
      console.error('Eroare la preluarea documentelor:', error);
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
    if (file) {
      // Verificăm dimensiunea fișierului (5MB = 5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        alert('Dimensiunea fișierului depășește limita de 5MB. Vă rugăm să alegeți un fișier mai mic.');
        event.target.value = ''; // Resetăm input-ul
        return;
      }

      // Verificăm tipul fișierului
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      if (!allowedTypes.includes(file.type)) {
        alert('Tip de fișier invalid. Vă rugăm să încărcați doar fișiere PDF, JPG, JPEG, PNG, DOC, DOCX, XLS sau XLSX.');
        event.target.value = ''; // Resetăm input-ul
        return;
      }

      setUploadStatus(prev => ({
        ...prev,
        [type]: { ...prev[type], file }
      }));
    }
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
    formData.append('type', type);

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadStatus(prev => ({
        ...prev,
        [type]: { 
          ...prev[type], 
          uploading: false, 
          progress: 100,
          uploaded: true,
          filePath: data.filePath
        }
      }));

      // Actualizează lista de documente
      setDocuments(prev => prev.map(doc => 
        doc.name.toLowerCase() === type ? { ...doc, uploaded: true, filePath: data.filePath } : doc
      ));
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(prev => ({
        ...prev,
        [type]: { ...prev[type], uploading: false, progress: 0 }
      }));
    }
  };

  const handleDelete = async (documentType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You are not authenticated');
      }

      const response = await axios.delete(`http://localhost:4000/api/documents/${documentType}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        await fetchDocuments(token);
        alert('Document deleted successfully!');
      } else {
        throw new Error(response.data.message || 'Error deleting document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      if (error.response?.status === 404) {
        alert('Document not found');
      } else if (error.response?.status === 401) {
        alert('You are not authenticated');
      } else {
        alert(error.response?.data?.message || 'Error deleting document');
      }
    }
  };

  const handleDownload = async (documentType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not authenticated');
        return;
      }

      console.log('Attempting to download:', documentType);

      const response = await axios({
        url: `http://localhost:4000/api/documents/download/${documentType}`,
        method: 'GET',
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const contentType = response.headers['content-type'];
      console.log('Content-Type:', contentType);

      // Găsim documentul în lista de documente pentru a obține numele original
      const doc = documents.find(doc => doc.document_type === documentType);
      let fileName;

      if (doc && doc.file_path) {
        // Extragem numele original al fișierului din calea completă
        fileName = doc.file_path.split('/').pop();
      } else {
        // Dacă nu avem numele original, folosim numele documentului cu extensia corectă
        const fileExtension = contentType === 'image/png' ? '.png' : 
                            contentType === 'image/jpeg' || contentType === 'image/jpg' ? '.jpg' : 
                            contentType === 'application/pdf' ? '.pdf' : '.pdf';
        fileName = `${documentType}${fileExtension}`;
      }

      console.log('Downloading file as:', fileName);

      // Creăm blob-ul cu tipul MIME corect
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      
      // Creăm link-ul de descărcare
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log('Download successful for:', documentType);
    } catch (error) {
      console.error('Error downloading document:', error);
      if (error.response?.status === 404) {
        alert('Document not found');
      } else if (error.response?.status === 401) {
        alert('You are not authenticated');
      } else {
        alert(error.response?.data?.message || 'Error downloading document');
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
      </div>
    </div>
  );
};

export default ProfileComponent;