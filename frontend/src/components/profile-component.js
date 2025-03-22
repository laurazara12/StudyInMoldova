import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    return <div className="profile-main">Se încarcă...</div>;
  }

  if (!user) {
    return null;
  }

  const handleFileChange = (event, documentType) => {
    const file = event.target.files[0];
    if (file) {
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
        throw new Error('Nu sunteți autentificat');
      }

      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);

      console.log('Încărcare document:', {
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

      console.log('Răspuns upload:', response.data);

      if (response.data.document) {
        // Actualizăm lista de documente după upload
        await fetchDocuments(token);
        alert('Document încărcat cu succes!');
      } else {
        throw new Error('Eroare la încărcarea documentului');
      }
    } catch (error) {
      console.error('Eroare la încărcarea documentului:', error);
      alert(error.response?.data?.message || 'Eroare la încărcarea documentului');
    }
  };

  const handleDelete = async (documentType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Nu sunteți autentificat');
      }

      const response = await axios.delete(`http://localhost:4000/api/documents/${documentType}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Actualizăm lista de documente după ștergere
        await fetchDocuments(token);
        alert('Document șters cu succes!');
      } else {
        throw new Error('Eroare la ștergerea documentului');
      }
    } catch (error) {
      console.error('Eroare la ștergerea documentului:', error);
      alert(error.response?.data?.message || 'Eroare la ștergerea documentului');
    }
  };

  const handleDownload = async (documentType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Nu sunteți autentificat');
        return;
      }

      console.log('Încercare de descărcare pentru:', documentType);

      // Găsim documentul în lista locală
      const document = documents.find(doc => doc.document_type === documentType);
      if (!document) {
        setError('Documentul nu a fost găsit');
        return;
      }

      const response = await axios({
        url: `http://localhost:4000/api/documents/download/${documentType}`,
        method: 'GET',
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Verificăm tipul conținutului
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('application/')) {
        // Dacă nu este un fișier, încercăm să citim mesajul de eroare
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            setError(errorData.message || 'Eroare la descărcarea documentului');
          } catch (e) {
            setError('Eroare la descărcarea documentului');
          }
        };
        reader.readAsText(response.data);
        return;
      }

      // Creăm un URL pentru blob și descărcăm fișierul
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${documentType}_document.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log('Descărcare reușită pentru:', documentType);
    } catch (error) {
      console.error('Eroare la descărcarea documentului:', error);
      if (error.response?.status === 404) {
        setError('Documentul nu a fost găsit');
      } else if (error.response?.status === 401) {
        setError('Nu sunteți autentificat');
      } else {
        setError(error.response?.data?.message || 'Eroare la descărcarea documentului');
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
        {document ? (
          <div className="document-status">
            <p className="document-status-text">Document încărcat</p>
            <div className="document-actions">
              <button onClick={() => handleDelete(documentType)}>
                <span className="button-icon">🗑️</span>
                Șterge
              </button>
              <button onClick={() => handleDownload(documentType)}>
                <span className="button-icon">⬇️</span>
                Descarcă
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
              <label htmlFor={`file-${documentType}`}>Alege fișier</label>
            </div>
            <button 
              className="upload-button"
              onClick={() => document?.file && handleUpload(documentType, document.file)}
              disabled={!document?.file || document.uploading}
            >
              {document?.uploading ? 'Se încarcă...' : 'Încarcă document'}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="profile-main">
      <div className="profile-header">
        <h1 className="profile-heading">Profil Utilizator</h1>
      </div>

      <div className="profile-content">
        <div className="profile-info-section">
          <div className="profile-card">
            <div className="profile-info">
              <span className="info-label">Nume:</span>
              <span className="info-value">{user?.name || 'Nume nespecificat'}</span>
            </div>
            <div className="profile-info">
              <span className="info-label">Email:</span>
              <span className="info-value">{user?.email || 'Email nespecificat'}</span>
            </div>
            <div className="profile-info">
              <span className="info-label">Rol:</span>
              <span className="info-value">{user?.role === 'admin' ? 'Administrator' : 'Utilizator'}</span>
            </div>
          </div>
        </div>

        <div className="document-section">
          <h2 className="document-heading">Documente</h2>
          <div className="documents-grid">
            {renderDocumentUpload('passport', 'Pașaport')}
            {renderDocumentUpload('diploma', 'Diplomă')}
            {renderDocumentUpload('transcript', 'Foaie Matricolă')}
            {renderDocumentUpload('photo', 'Foto')}
            {renderDocumentUpload('medical', 'Certificat Medical')}
            {renderDocumentUpload('insurance', 'Asigurare Medicală')}
            {renderDocumentUpload('other', 'Alte Documente')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;