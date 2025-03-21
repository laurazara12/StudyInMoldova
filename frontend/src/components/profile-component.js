import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './profile-component.css';

const initialDocuments = {
  diploma: { uploading: false, progress: 0, uploaded: false, file: null },
  transcript: { uploading: false, progress: 0, uploaded: false, file: null },
  passport: { uploading: false, progress: 0, uploaded: false, file: null },
  photo: { uploading: false, progress: 0, uploaded: false, file: null }
};

const ProfileComponent = () => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/sign-in');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (loading || !user) return;
      
      setLoading(true);
      try {
        if (!user.token) {
          setError('Nu sunteți autentificat');
          return;
        }

        console.log('Încercare de obținere documente...');
        const response = await axios.get('http://localhost:4000/api/documents/user-documents', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        console.log('Răspuns de la server:', response.data);
        
        if (response.data.success) {
          const formattedDocuments = response.data.documents.map(doc => ({
            document_type: doc.document_type,
            uploaded: true,
            url: doc.file_path,
            uploading: false,
            progress: 0
          }));
          setDocuments(formattedDocuments);
          setError(null);
        } else {
          setError(response.data.message || 'Nu s-au putut încărca documentele');
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        setError(error.response?.data?.message || 'Eroare la încărcarea documentelor');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [loading, user]);

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

  const handleUpload = async (documentType) => {
    const document = documents.find(doc => doc.document_type === documentType);
    if (!document || !document.file) return;

    setDocuments(prev => 
      prev.map(doc => 
        doc.document_type === documentType 
          ? { ...doc, uploading: true, progress: 0 }
          : doc
      )
    );

    const formData = new FormData();
    formData.append('file', document.file);
    formData.append('documentType', documentType);

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.token) {
        throw new Error('Nu sunteți autentificat');
      }

      console.log('Token găsit:', userData.token);
      console.log('Încercare de încărcare document la:', 'http://localhost:4000/api/documents/upload');

      const response = await axios.post('http://localhost:4000/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${userData.token}`
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setDocuments(prev => 
            prev.map(doc => 
              doc.document_type === documentType 
                ? { ...doc, progress }
                : doc
            )
          );
        }
      });

      console.log('Răspuns de la server:', response.data);

      if (response.data.success) {
        const userData = JSON.parse(localStorage.getItem('user'));
        const docResponse = await axios.get('http://localhost:4000/api/documents/user-documents', {
          headers: {
            'Authorization': `Bearer ${userData.token}`
          }
        });

        if (docResponse.data.success) {
          const formattedDocuments = docResponse.data.documents.map(doc => ({
            document_type: doc.document_type,
            uploaded: true,
            url: doc.file_path,
            uploading: false,
            progress: 0
          }));
          setDocuments(formattedDocuments);
          setError(null);
        }
      } else {
        throw new Error(response.data.message || 'Nu s-a putut încărca documentul');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      console.error('Error details:', error.response?.data || error.message);
      setDocuments(prev => 
        prev.map(doc => 
          doc.document_type === documentType 
            ? { ...doc, uploading: false }
            : doc
        )
      );
      setError(error.response?.data?.message || error.message || 'Eroare la încărcarea documentului');
    }
  };

  const handleDelete = async (documentType) => {
    if (window.confirm(`Sigur doriți să ștergeți documentul de tip ${documentType}?`)) {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || !userData.token) {
          throw new Error('Nu sunteți autentificat');
        }

        await axios.delete(`http://localhost:4000/api/documents/${documentType}`, {
          headers: {
            'Authorization': `Bearer ${userData.token}`
          }
        });

        setDocuments(prev => prev.filter(doc => doc.document_type !== documentType));
      } catch (error) {
        console.error('Error deleting document:', error);
        setError(error.response?.data?.message || 'Eroare la ștergerea documentului');
      }
    }
  };

  const handleDownload = async (documentType) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.token) {
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
          'Authorization': `Bearer ${userData.token}`
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
        {document?.uploaded ? (
          <div>
            <p>Document încărcat</p>
            <div className="document-actions">
              <button onClick={() => handleDelete(documentType)}>Șterge</button>
              <button onClick={() => handleDownload(documentType)}>Descarcă</button>
            </div>
          </div>
        ) : (
          <div>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, documentType)}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <button 
              onClick={() => handleUpload(documentType)}
              disabled={!document?.file || document.uploading}
            >
              {document?.uploading ? 'Se încarcă...' : 'Încarcă'}
            </button>
          </div>
        )}
      </div>
    );
  };

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

        <div className="document-section">
          <h2 className="document-heading">Încărcare Documente</h2>
          <div className="document-upload-form">
            {renderDocumentUpload('diploma', 'Diplomă')}
            {renderDocumentUpload('transcript', 'Foaie Matricolă')}
            {renderDocumentUpload('passport', 'Pașaport')}
            {renderDocumentUpload('photo', 'Fotografie')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;