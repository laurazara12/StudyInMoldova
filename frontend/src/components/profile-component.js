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
  other: { uploading: false, progress: 0, uploaded: false, file: null }
};

const ProfileComponent = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);

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

  const handleFileChange = (event, documentType) => {
    const file = event.target.files[0];
    if (file) {
      // Verificăm dimensiunea fișierului (5MB = 5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please choose a smaller file.');
        event.target.value = ''; // Resetăm input-ul
        return;
      }

      // Verificăm tipul fișierului
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload only PDF, JPG, JPEG, or PNG files.');
        event.target.value = ''; // Resetăm input-ul
        return;
      }

      setDocuments(prev => {
        const existingDoc = prev.find(doc => doc.document_type === documentType);
        if (existingDoc) {
          return prev.map(doc => 
            doc.document_type === documentType 
              ? { ...doc, file, uploaded: false }
              : doc
          );
        }
        return [...prev, { document_type: documentType, file, uploaded: false }];
      });
    }
  };

  const handleUpload = async (documentType, file) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You are not authenticated');
      }

      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);

      console.log('Uploading document:', {
        documentType,
        fileName: file?.name,
        fileSize: file?.size
      });

      const response = await axios.post('http://localhost:4000/api/documents/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Upload response:', response.data);

      if (response.data.document) {
        await fetchDocuments(token);
        alert('Document uploaded successfully!');
      } else {
        throw new Error(response.data.message || 'Error uploading document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      if (error.response?.status === 401) {
        alert('You are not authenticated');
      } else {
        alert(error.response?.data?.message || 'Error uploading document');
      }
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
                onChange={(e) => handleFileChange(e, documentType)}
                accept=".pdf,.jpg,.jpeg,.png"
                id={`file-${documentType}`}
              />
              <label htmlFor={`file-${documentType}`}>Choose file</label>
            </div>
            {document?.file && (
              <button 
                className="upload-button"
                onClick={() => handleUpload(documentType, document.file)}
                disabled={document.uploading}
              >
                {document.uploading ? 'Uploading...' : 'Upload'}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="profile-container">
      <div className="profile-main">
        <div className="profile-header">
          <h1 className="profile-heading">User Profile</h1>
        </div>
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
            <p className="document-info">Please upload the following documents in PDF, JPG, JPEG, or PNG format. Maximum file size: 5MB. You will receive an error message if you try to upload a larger file.</p>
            <div className="documents-grid">
              {renderDocumentUpload('passport', 'Passport')}
              {renderDocumentUpload('diploma', 'Diploma')}
              {renderDocumentUpload('transcript', 'Transcript')}
              {renderDocumentUpload('photo', 'Photo')}
              {renderDocumentUpload('medical', 'Medical Certificate')}
              {renderDocumentUpload('insurance', 'Health Insurance')}
              {renderDocumentUpload('other', 'Other Documents')}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfileComponent;