import React, { useState, useEffect } from 'react';
import { getAuthHeaders, API_BASE_URL } from '../../../config/api.config';
import axios from 'axios';
import DeleteDocumentModal from '../../../components/DeleteDocumentModal';

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUserDateRange, setFilterUserDateRange] = useState({ start: '', end: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showUserDocuments, setShowUserDocuments] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [docStatus, setDocStatus] = useState({});
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    loadUsers();
    loadDocuments();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('Începe încărcarea utilizatorilor...');
      const response = await axios.get(`${API_BASE_URL}/api/auth/users`, { 
        headers: getAuthHeaders()
      });
      
      console.log('Răspuns server utilizatori:', response.data);
      
      if (!response.data) {
        throw new Error('Nu s-au primit date de la server');
      }

      let usersData;
      if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        usersData = response.data.data;
      } else if (response.data.users && Array.isArray(response.data.users)) {
        usersData = response.data.users;
      } else {
        throw new Error('Format invalid al datelor primite');
      }

      console.log('Utilizatori procesați:', usersData);
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Eroare la încărcarea utilizatorilor:', error);
      setError('Eroare la încărcarea utilizatorilor: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/documents`, {
        headers: getAuthHeaders()
      });

      if (!response.data) {
        throw new Error('Nu s-au primit date de la server');
      }

      let documentsData = [];
      if (response.data.success && response.data.data) {
        documentsData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        documentsData = response.data;
      } else if (response.data.documents && Array.isArray(response.data.documents)) {
        documentsData = response.data.documents;
      }

      const activeDocuments = documentsData.filter(doc => doc.status !== 'deleted');
      setDocuments(activeDocuments);
    } catch (error) {
      console.error('Eroare la încărcarea documentelor:', error);
    }
  };

  const getDocumentStatus = (userId) => {
    const defaultStatus = {
      exists: false,
      status: 'missing',
      uploadDate: null
    };

    if (!userId || !Array.isArray(documents)) {
      return {
        diploma: { ...defaultStatus },
        transcript: { ...defaultStatus },
        passport: { ...defaultStatus },
        photo: { ...defaultStatus }
      };
    }

    const userDocuments = documents.filter(doc => doc && doc.user_id === userId && doc.status !== 'deleted');
    
    const getStatus = (type) => {
      const doc = userDocuments.find(d => d && d.document_type === type);
      
      if (!doc) {
        return { ...defaultStatus };
      }

      return {
        exists: true,
        status: doc.status || 'pending',
        uploadDate: doc.createdAt || doc.uploadDate || null
      };
    };

    return {
      diploma: getStatus('diploma'),
      transcript: getStatus('transcript'),
      passport: getStatus('passport'),
      photo: getStatus('photo')
    };
  };

  const getDocumentStatusClass = (status) => {
    if (!status || typeof status !== 'string') return 'status-missing';
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === 'missing') return 'status-missing';
    return `status-${normalizedStatus}`;
  };

  const getDocumentStatusText = (docStatus) => {
    if (!docStatus || typeof docStatus !== 'object' || !docStatus.exists || !docStatus.status) return 'Lipsește';
    const status = docStatus.status.toLowerCase();
    return status === 'pending' ? 'În procesare' : 
           status === 'approved' ? 'Aprobat' :
           status === 'rejected' ? 'Respinse' : 
           status === 'missing' ? 'Lipsește' : 'Încărcat';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/users/${userId}`, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        await loadUsers();
        setSuccessMessage('Utilizatorul a fost șters cu succes!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response.data.message || 'Eroare la ștergerea utilizatorului');
      }
    } catch (error) {
      console.error('Eroare la ștergerea utilizatorului:', error);
      setError('A apărut o eroare la ștergerea utilizatorului. Vă rugăm să încercați din nou.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleViewDocuments = (user) => {
    setSelectedUser(user);
    setShowUserDocuments(true);
  };

  const closeModals = () => {
    setShowUserDetails(false);
    setShowUserDocuments(false);
    setSelectedUser(null);
  };

  const confirmDelete = (userId) => {
    setDeleteConfirmation(userId);
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const renderUserDocuments = (user) => {
    if (!user || !user.documents) return null;
    
    return user.documents.map(doc => {
      if (!doc) return null;
      
      return (
        <div key={doc.id} className="document-item">
          <span className="document-type">{doc.document_type}</span>
          <span className={`status-badge ${getDocumentStatusClass(doc.status)}`}>
            {doc.status || 'pending'}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="users-tab">
      <div className="dashboard-filters">
        <div className="search-box">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Caută după nume, email sau ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-section users-filter">
          <div className="filter-group">
            <label>Rol:</label>
            <select 
              className="filter-select"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">Toți</option>
              <option value="admin">Admin</option>
              <option value="user">Utilizator</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <select 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Toți</option>
              <option value="active">Activi</option>
              <option value="inactive">Inactivi</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Data:</label>
            <div className="date-range-inputs">
              <input 
                type="date" 
                className="date-input" 
                value={filterUserDateRange.start}
                onChange={(e) => setFilterUserDateRange({...filterUserDateRange, start: e.target.value})}
              />
              <span>până la</span>
              <input 
                type="date" 
                className="date-input" 
                value={filterUserDateRange.end}
                onChange={(e) => setFilterUserDateRange({...filterUserDateRange, end: e.target.value})}
              />
            </div>
          </div>
          <button 
            className="clear-filters-button"
            onClick={() => {
              setFilterRole('all');
              setFilterStatus('all');
              setFilterUserDateRange({ start: '', end: '' });
            }}
          >
            Resetează Filtrele
          </button>
          <button 
            className="search-button"
            onClick={() => {
              const filtered = users.filter(user => {
                const matchesSearch = searchTerm === '' || 
                  user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.email.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesRole = filterRole === 'all' || user.role === filterRole;
                const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
                return matchesSearch && matchesRole && matchesStatus;
              });
              setFilteredUsers(filtered);
            }}
          >
            Caută
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Se încarcă utilizatorii...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={loadUsers}
          >
            Reîncearcă
          </button>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nume</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Diplomă</th>
                <th>Transcript</th>
                <th>Pașaport</th>
                <th>Fotografie</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => {
                const docStatus = getDocumentStatus(user.id);
                return (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.displayName || user.name || 'N/A'}</td>
                    <td>{user.email || 'N/A'}</td>
                    <td>{user.role === 'admin' ? 'Administrator' : 'Utilizator'}</td>
                    <td>
                      <span className={getDocumentStatusClass(docStatus?.diploma?.status)}>
                        {getDocumentStatusText(docStatus?.diploma)}
                        {docStatus?.diploma?.uploadDate && (
                          <span className="upload-date">
                            ({formatDate(docStatus.diploma.uploadDate)})
                          </span>
                        )}
                      </span>
                    </td>
                    <td>
                      <span className={getDocumentStatusClass(docStatus?.transcript?.status)}>
                        {getDocumentStatusText(docStatus?.transcript)}
                        {docStatus?.transcript?.uploadDate && (
                          <span className="upload-date">
                            ({formatDate(docStatus.transcript.uploadDate)})
                          </span>
                        )}
                      </span>
                    </td>
                    <td>
                      <span className={getDocumentStatusClass(docStatus?.passport?.status)}>
                        {getDocumentStatusText(docStatus?.passport)}
                        {docStatus?.passport?.uploadDate && (
                          <span className="upload-date">
                            ({formatDate(docStatus.passport.uploadDate)})
                          </span>
                        )}
                      </span>
                    </td>
                    <td>
                      <span className={getDocumentStatusClass(docStatus?.photo?.status)}>
                        {getDocumentStatusText(docStatus?.photo)}
                        {docStatus?.photo?.uploadDate && (
                          <span className="upload-date">
                            ({formatDate(docStatus.photo.uploadDate)})
                          </span>
                        )}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn1"
                          onClick={() => handleViewUser(user)}
                        >
                          <i className="fas fa-eye"></i> Vezi Utilizator
                        </button>
                        <button 
                          className="btn2"
                          onClick={() => handleViewDocuments(user)}
                        >
                          <i className="fas fa-file"></i> Vezi Documente
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => confirmDelete(user.id)}
                        >
                          <i className="fas fa-trash"></i> Șterge
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

      {showUserDetails && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content user-details-modal">
            <div className="modal-header">
              <h2>Detalii Utilizator</h2>
              <button className="close-button" onClick={closeModals}>
                <span className="close-x">×</span>
              </button>
            </div>
            <div className="user-details-content">
              <div className="user-details-section">
                <h3>Informații de Bază</h3>
                <div className="detail-row">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value">{selectedUser.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Nume:</span>
                  <span className="detail-value">{selectedUser.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedUser.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Rol:</span>
                  <span className="detail-value">{selectedUser.role === 'admin' ? 'Administrator' : 'Utilizator'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Data înregistrării:</span>
                  <span className="detail-value">{formatDate(selectedUser.created_at)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Ultima actualizare:</span>
                  <span className="detail-value">{formatDate(selectedUser.updated_at)}</span>
                </div>
              </div>

              <div className="user-details-section">
                <h3>Informații Personale</h3>
                <div className="detail-row">
                  <span className="detail-label">Data nașterii:</span>
                  <span className="detail-value">{selectedUser.date_of_birth ? formatDate(selectedUser.date_of_birth) : 'Nespecificată'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Țara de origine:</span>
                  <span className="detail-value">{selectedUser.country_of_origin || 'Nespecificată'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Naționalitate:</span>
                  <span className="detail-value">{selectedUser.nationality || 'Nespecificată'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Număr de telefon:</span>
                  <span className="detail-value">{selectedUser.phone || 'Nespecificat'}</span>
                </div>
              </div>

              <div className="user-details-section">
                <h3>Status Documente</h3>
                <div className="document-status-grid">
                  <div className="document-status-item">
                    <span className="status-label">Diplomă:</span>
                    <span className={`status-value ${docStatus.diploma.status}`}>
                      {docStatus.diploma.exists ? 'Încărcat' : 'Lipsește'}
                      {docStatus.diploma.uploadDate && (
                        <span className="upload-date">
                          ({formatDate(docStatus.diploma.uploadDate)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="document-status-item">
                    <span className="status-label">Transcript:</span>
                    <span className={`status-value ${docStatus.transcript.status}`}>
                      {docStatus.transcript.exists ? 'Încărcat' : 'Lipsește'}
                      {docStatus.transcript.uploadDate && (
                        <span className="upload-date">
                          ({formatDate(docStatus.transcript.uploadDate)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="document-status-item">
                    <span className="status-label">Pașaport:</span>
                    <span className={`status-value ${docStatus.passport.status}`}>
                      {docStatus.passport.exists ? 'Încărcat' : 'Lipsește'}
                      {docStatus.passport.uploadDate && (
                        <span className="upload-date">
                          ({formatDate(docStatus.passport.uploadDate)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="document-status-item">
                    <span className="status-label">Fotografie:</span>
                    <span className={`status-value ${docStatus.photo.status}`}>
                      {docStatus.photo.exists ? 'Încărcat' : 'Lipsește'}
                      {docStatus.photo.uploadDate && (
                        <span className="upload-date">
                          ({formatDate(docStatus.photo.uploadDate)})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="user-details-section">
                <h3>Activități Recente</h3>
                <div className="detail-row">
                  <span className="detail-label">Ultima autentificare:</span>
                  <span className="detail-value">{selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Nespecificată'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status cont:</span>
                  <span className="detail-value">{selectedUser.is_active ? 'Activ' : 'Inactiv'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUserDocuments && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content documents-modal">
            <div className="modal-header">
              <h2>Documente Utilizator</h2>
              <button className="close-button" onClick={closeModals}>
                <span className="close-x">×</span>
              </button>
            </div>
            <div className="user-documents">
              {renderUserDocuments(selectedUser)}
            </div>
          </div>
        </div>
      )}

      {deleteConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-warning">
              <span className="warning-icon">⚠️</span>
              <h3>ATENȚIE!</h3>
            </div>
            <p className="modal-message">
              Sunteți pe cale să ștergeți acest utilizator. 
              <strong>Această acțiune nu poate fi anulată!</strong>
            </p>
            <p className="modal-details">
              Toate datele utilizatorului, inclusiv documentele încărcate, vor fi șterse definitiv.
            </p>
            <div className="modal-buttons">
              <button 
                className="cancel-button"
                onClick={cancelDelete}
              >
                Anulează
              </button>
              <button 
                className="confirm-button"
                onClick={() => handleDeleteUser(deleteConfirmation)}
              >
                Da, șterge utilizatorul
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;