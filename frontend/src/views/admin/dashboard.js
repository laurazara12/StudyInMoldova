import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import './dashboard.css';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDocumentType, setFilterDocumentType] = useState('all');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    let isMounted = true;

    const checkAdminAccess = () => {
      if (!user || user.role !== 'admin') {
        navigate('/sign-in');
        return false;
      }
      return true;
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/auth/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!isMounted) return;

        if (response.data && Array.isArray(response.data)) {
          const sortedUsers = response.data.sort((a, b) => b.id - a.id);
          setUsers(sortedUsers);
        } else {
          setError('Formatul datelor primite este invalid');
        }
      } catch (err) {
        if (!isMounted) return;
        handleError(err);
      }
    };

    const fetchDocuments = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/documents', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!isMounted) return;

        if (response.data && Array.isArray(response.data)) {
          setDocuments(response.data);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Eroare la încărcarea documentelor:', err);
      }
    };

    const handleError = (err) => {
      if (!isMounted) return;

      if (err.response) {
        if (err.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/sign-in');
        } else if (err.response.status === 403) {
          navigate('/profile');
        } else if (err.response.status === 500) {
          const errorMessage = err.response.data.message || 'Vă rugăm să încercați din nou mai târziu.';
          setError(`Eroare server: ${errorMessage}`);
        } else {
          setError(err.response.data.message || 'Eroare la încărcarea datelor');
        }
      } else if (err.request) {
        setError('Nu s-a putut conecta la server. Verificați conexiunea la internet.');
      } else {
        setError('A apărut o eroare neașteptată. Vă rugăm să încercați din nou.');
      }
    };

    const initializeDashboard = async () => {
      if (!checkAdminAccess()) return;

      try {
        await Promise.all([fetchUsers(), fetchDocuments()]);
      } catch (err) {
        console.error('Eroare la inițializarea dashboard-ului:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeDashboard();

    return () => {
      isMounted = false;
    };
  }, [navigate, token, user?.role]);

  const getDocumentStatus = (userUUID) => {
    const userDocuments = documents.filter(doc => doc.user_uuid === userUUID);
    console.log('Documente pentru utilizatorul', userUUID, ':', userDocuments);
    
    const requiredDocuments = ['diploma', 'transcript', 'passport', 'photo'];
    const status = {};

    requiredDocuments.forEach(docType => {
      const hasDocument = userDocuments.some(doc => doc.document_type === docType);
      console.log('Verificare document', docType, ':', hasDocument);
      status[docType] = hasDocument ? 'Uploaded' : 'Missing';
    });

    return status;
  };

  const handleDeleteUser = async (userUUID) => {
    try {
      console.log('Încercare de ștergere pentru utilizatorul:', userUUID);
      const response = await axios.delete(`http://localhost:4000/api/auth/users/${userUUID}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Răspuns de la server:', response.data);

      if (response.status === 200) {
        setUsers(users.filter(user => user.uuid !== userUUID));
        setDeleteConfirmation(null);
      }
    } catch (err) {
      console.error('Eroare la ștergerea utilizatorului:', err);
      if (err.response) {
        console.log('Răspuns de eroare:', err.response.data);
        setError(err.response.data.message || 'Nu s-a putut șterge utilizatorul');
      } else if (err.request) {
        console.log('Nu s-a primit răspuns de la server');
        setError('Nu s-a putut conecta la server. Verificați conexiunea la internet.');
      } else {
        console.log('Eroare la configurarea cererii:', err.message);
        setError('Eroare la ștergerea utilizatorului. Vă rugăm să încercați din nou.');
      }
    }
  };

  const confirmDelete = (userUUID) => {
    setDeleteConfirmation(userUUID);
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleDownloadDocument = async (documentType, userUUID) => {
    try {
      const response = await axios({
        url: `http://localhost:4000/api/documents/download/${documentType}`,
        method: 'GET',
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Obținem tipul MIME din header-ul Content-Type
      const contentType = response.headers['content-type'];
      
      // Găsim documentul în lista de documente pentru a obține numele original
      const doc = documents.find(doc => doc.document_type === documentType && doc.user_uuid === userUUID);
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
    } catch (err) {
      console.error('Eroare la descărcarea documentului:', err);
      alert('Eroare la descărcarea documentului');
    }
  };

  const handleDeleteDocument = async (documentType, userUUID) => {
    if (!window.confirm('Sigur doriți să ștergeți acest document?')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:4000/api/documents/${documentType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Actualizăm lista de documente
        setDocuments(documents.filter(doc => 
          !(doc.document_type === documentType && doc.user_uuid === userUUID)
        ));
        alert('Document șters cu succes!');
      }
    } catch (err) {
      console.error('Eroare la ștergerea documentului:', err);
      alert('Eroare la ștergerea documentului');
    }
  };

  const renderUserDocuments = (userUUID) => {
    const userDocuments = documents.filter(doc => doc.user_uuid === userUUID);
    
    if (userDocuments.length === 0) {
      return <p>Nu există documente încărcate</p>;
    }

    return (
      <div className="user-documents">
        <h4>Documente încărcate:</h4>
        <div className="dashboard-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Tip Document</th>
                <th>Data Încărcării</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {userDocuments.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.document_type}</td>
                  <td>{new Date(doc.created_at).toLocaleDateString('en-US')}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleDownloadDocument(doc.document_type, userUUID)}
                        className="download-button"
                      >
                        Descarcă
                      </button>
                      <button 
                        onClick={() => handleDeleteDocument(doc.document_type, userUUID)}
                        className="delete-button"
                      >
                        Șterge
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.uuid.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const filteredDocuments = documents.filter(doc => {
    const user = users.find(u => u.uuid === doc.user_uuid);
    const matchesSearch = 
      (user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      doc.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterDocumentType === 'all' || doc.document_type === filterDocumentType;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="dashboard-container">
          <div className="dashboard-content">
            <div className="loading">Loading...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="dashboard-container">
          <div className="dashboard-content">
            <div className="error">{error}</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1>Admin Dashboard</h1>
            <div className="tab-buttons">
              <button 
                className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                Users
              </button>
              <button 
                className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveTab('documents')}
              >
                Documents
              </button>
            </div>
          </div>

          <div className="dashboard-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Caută..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            {activeTab === 'users' ? (
              <div className="filter-box">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Toate rolurile</option>
                  <option value="admin">Administratori</option>
                  <option value="user">Utilizatori</option>
                </select>
              </div>
            ) : (
              <div className="filter-box">
                <select
                  value={filterDocumentType}
                  onChange={(e) => setFilterDocumentType(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Toate tipurile</option>
                  <option value="diploma">Diplomă</option>
                  <option value="transcript">Transcript</option>
                  <option value="passport">Pașaport</option>
                  <option value="photo">Fotografie</option>
                </select>
              </div>
            )}
          </div>

          {activeTab === 'users' ? (
            <div className="dashboard-table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>UUID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Diploma</th>
                    <th>Transcript</th>
                    <th>Passport</th>
                    <th>Photo</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => {
                    const docStatus = getDocumentStatus(user.uuid);
                    return (
                      <tr key={user.uuid}>
                        <td>{user.id}</td>
                        <td>{user.uuid}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role === 'admin' ? 'Administrator' : 'User'}</td>
                        <td className={docStatus.diploma === 'Uploaded' ? 'status-success' : 'status-missing'}>
                          {docStatus.diploma}
                        </td>
                        <td className={docStatus.transcript === 'Uploaded' ? 'status-success' : 'status-missing'}>
                          {docStatus.transcript}
                        </td>
                        <td className={docStatus.passport === 'Uploaded' ? 'status-success' : 'status-missing'}>
                          {docStatus.passport}
                        </td>
                        <td className={docStatus.photo === 'Uploaded' ? 'status-success' : 'status-missing'}>
                          {docStatus.photo}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="view-documents-button"
                              onClick={() => setSelectedUser(user)}
                            >
                              View Docs
                            </button>
                            {user.role !== 'admin' && (
                              <button 
                                className="delete-button"
                                onClick={() => confirmDelete(user.uuid)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="dashboard-table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Document Type</th>
                    <th>Upload Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map(doc => {
                    const user = users.find(u => u.uuid === doc.user_uuid);
                    return (
                      <tr key={`${doc.user_uuid}_${doc.document_type}`}>
                        <td>{doc.id}</td>
                        <td>{user ? user.name : 'Unknown'}</td>
                        <td>{doc.document_type}</td>
                        <td>{new Date(doc.created_at).toLocaleDateString('en-US')}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="download-button"
                              onClick={() => handleDownloadDocument(doc.document_type, doc.user_uuid)}
                            >
                              Download
                            </button>
                            <button 
                              className="delete-button"
                              onClick={() => handleDeleteDocument(doc.document_type, doc.user_uuid)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {selectedUser && (
            <div className="modal-overlay">
              <div className="modal-content documents-modal">
                <div className="modal-header">
                  <h3>Documente pentru {selectedUser.name}</h3>
                  <button className="close-button" onClick={() => setSelectedUser(null)}>
                    Închide
                  </button>
                </div>
                {renderUserDocuments(selectedUser.uuid)}
              </div>
            </div>
          )}

          {deleteConfirmation && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-warning">
                  <span className="warning-icon">⚠️</span>
                  <h3>WARNING!</h3>
                </div>
                <p className="modal-message">
                  You are about to delete this user. 
                  <strong>This action cannot be undone!</strong>
                </p>
                <p className="modal-details">
                  All user data, including uploaded documents, will be permanently deleted.
                </p>
                <div className="modal-buttons">
                  <button 
                    className="cancel-button"
                    onClick={cancelDelete}
                  >
                    Cancel
                  </button>
                  <button 
                    className="confirm-button"
                    onClick={() => handleDeleteUser(deleteConfirmation)}
                  >
                    Yes, delete user
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard; 