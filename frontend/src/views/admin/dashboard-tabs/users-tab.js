// frontend/src/components/dashboard/UsersTab.js
import React, { useState, useEffect } from 'react';
import { getAuthHeaders, API_BASE_URL } from '../../../config/api.config';
import axios from 'axios';
import DeleteDocumentModal from './components/DeleteDocumentModal';

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
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      loadDocuments();
    }
  }, [users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('Loading users...');
      const response = await axios.get(`${API_BASE_URL}/api/auth/users`, { 
        headers: getAuthHeaders()
      });
      
      console.log('Server response users:', response.data);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      let usersData;
      if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        usersData = response.data.data;
      } else if (response.data.users && Array.isArray(response.data.users)) {
        usersData = response.data.users;
      } else {
        throw new Error('Invalid data format received');
      }

      console.log('Processed users:', usersData);
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Error loading users: ' + error.message);
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
        throw new Error('No data received from server');
      }

      let documentsData = [];
      if (response.data.success && response.data.data) {
        documentsData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        documentsData = response.data;
      } else if (response.data.documents && Array.isArray(response.data.documents)) {
        documentsData = response.data.documents;
      }

      const activeDocuments = documentsData.filter(doc => doc && doc.status !== 'deleted');
      setDocuments(activeDocuments);

      // Actualizăm statusul documentelor pentru fiecare utilizator
      const updatedDocStatus = {};
      users.forEach(user => {
        if (user && user.id) {
          updatedDocStatus[user.id] = getDocumentStatus(user.id);
        }
      });
      setDocStatus(updatedDocStatus);
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Error loading documents: ' + error.message);
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

    const userDocuments = documents.filter(doc => 
      doc && 
      doc.user_id === userId && 
      doc.status !== 'deleted' &&
      doc.document_type
    );
    
    const getStatus = (type) => {
      const doc = userDocuments.find(d => d && d.document_type === type);
      
      if (!doc) {
        return { ...defaultStatus };
      }

      return {
        exists: true,
        status: doc.status || 'pending',
        uploadDate: doc.createdAt || doc.uploadDate || null,
        filename: doc.filename || null,
        originalName: doc.originalName || null
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
    if (!docStatus || typeof docStatus !== 'object') return 'Missing';
    if (!docStatus.exists || !docStatus.status) return 'Missing';
    
    const status = docStatus.status.toLowerCase();
    return status === 'pending' ? 'Processing' : 
           status === 'approved' ? 'Approved' :
           status === 'rejected' ? 'Rejected' : 
           status === 'missing' ? 'Missing' : 'Uploaded';
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
      const response = await axios.delete(`${API_BASE_URL}/api/auth/users/${userId}`, {
        headers: getAuthHeaders()
      });

      // Verificăm dacă răspunsul este de succes (200 sau 204)
      if (response.status === 200 || response.status === 204) {
        // Actualizăm lista de utilizatori
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        setFilteredUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        setSuccessMessage('Utilizatorul a fost șters cu succes!');
        setDeleteConfirmation(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response.data?.message || 'Eroare la ștergerea utilizatorului');
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
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-section users-filter">
          <div className="filter-group">
            <label>Role:</label>
            <select 
              className="filter-select"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <select 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Date:</label>
            <div className="date-range-inputs">
              <input 
                type="date" 
                className="date-input" 
                value={filterUserDateRange.start}
                onChange={(e) => setFilterUserDateRange({...filterUserDateRange, start: e.target.value})}
              />
              <span>to</span>
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
              setSearchTerm('');
            }}
          >
            Clear Filters
          </button>
          <button 
            className="clear-filters-button"
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
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={loadUsers}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>ID</th>
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
                const docStatus = getDocumentStatus(user.id);
                return (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.displayName || user.name || 'N/A'}</td>
                    <td>{user.email || 'N/A'}</td>
                    <td>{user.role === 'admin' ? 'Administrator' : 'User'}</td>
                    <td>
                      <span className={getDocumentStatusClass(docStatus?.diploma?.status || 'missing')}>
                        {getDocumentStatusText(docStatus?.diploma || { exists: false, status: 'missing' })}
                      </span>
                    </td>
                    <td>
                      <span className={getDocumentStatusClass(docStatus?.transcript?.status || 'missing')}>
                        {getDocumentStatusText(docStatus?.transcript || { exists: false, status: 'missing' })}
                      </span>
                    </td>
                    <td>
                      <span className={getDocumentStatusClass(docStatus?.passport?.status || 'missing')}>
                        {getDocumentStatusText(docStatus?.passport || { exists: false, status: 'missing' })}
                      </span>
                    </td>
                    <td>
                      <span className={getDocumentStatusClass(docStatus?.photo?.status || 'missing')}>
                        {getDocumentStatusText(docStatus?.photo || { exists: false, status: 'missing' })}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn1"
                          onClick={() => handleViewUser(user)}
                        >
                          <i className="fas fa-eye"></i> View User
                        </button>
                        <button 
                          className="btn2"
                          onClick={() => handleViewDocuments(user)}
                        >
                          <i className="fas fa-file"></i> View Docs
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => confirmDelete(user.id)}
                        >
                          <i className="fas fa-trash"></i> Delete
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
              <h2>User Details</h2>
              <button className="close-button" onClick={closeModals}>
                <span className="close-x">×</span>
              </button>
            </div>
            <div className="user-details-content">
              <div className="user-details-section">
                <h3>Basic Information</h3>
                <div className="detail-row">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value">{selectedUser.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedUser.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedUser.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Role:</span>
                  <span className="detail-value">{selectedUser.role === 'admin' ? 'Administrator' : 'User'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Registration Date:</span>
                  <span className="detail-value">{formatDate(selectedUser.created_at)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Last Update:</span>
                  <span className="detail-value">{formatDate(selectedUser.updated_at)}</span>
                </div>
              </div>

              <div className="user-details-section">
                <h3>Personal Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Date of Birth:</span>
                  <span className="detail-value">{selectedUser.date_of_birth ? formatDate(selectedUser.date_of_birth) : 'Not specified'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Country of Origin:</span>
                  <span className="detail-value">{selectedUser.country_of_origin || 'Not specified'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Nationality:</span>
                  <span className="detail-value">{selectedUser.nationality || 'Not specified'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone Number:</span>
                  <span className="detail-value">{selectedUser.phone || 'Not specified'}</span>
                </div>
              </div>

              <div className="user-details-section">
                <h3>Document Status</h3>
                <div className="document-status-grid">
                  <div className="document-status-item">
                    <span className="status-label">Diploma:</span>
                    <span className={`status-value ${docStatus?.diploma?.status || 'missing'}`}>
                      {docStatus?.diploma?.exists ? 'Uploaded' : 'Missing'}
                      {docStatus?.diploma?.uploadDate && (
                        <span className="upload-date">
                          ({formatDate(docStatus.diploma.uploadDate)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="document-status-item">
                    <span className="status-label">Transcript:</span>
                    <span className={`status-value ${docStatus?.transcript?.status || 'missing'}`}>
                      {docStatus?.transcript?.exists ? 'Uploaded' : 'Missing'}
                      {docStatus?.transcript?.uploadDate && (
                        <span className="upload-date">
                          ({formatDate(docStatus.transcript.uploadDate)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="document-status-item">
                    <span className="status-label">Passport:</span>
                    <span className={`status-value ${docStatus?.passport?.status || 'missing'}`}>
                      {docStatus?.passport?.exists ? 'Uploaded' : 'Missing'}
                      {docStatus?.passport?.uploadDate && (
                        <span className="upload-date">
                          ({formatDate(docStatus.passport.uploadDate)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="document-status-item">
                    <span className="status-label">Photo:</span>
                    <span className={`status-value ${docStatus?.photo?.status || 'missing'}`}>
                      {docStatus?.photo?.exists ? 'Uploaded' : 'Missing'}
                      {docStatus?.photo?.uploadDate && (
                        <span className="upload-date">
                          ({formatDate(docStatus.photo.uploadDate)})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="user-details-section">
                <h3>Recent Activity</h3>
                <div className="detail-row">
                  <span className="detail-label">Last Login:</span>
                  <span className="detail-value">{selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Not specified'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Account Status:</span>
                  <span className="detail-value">{selectedUser.is_active ? 'Active' : 'Inactive'}</span>
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
              <h2>User Documents</h2>
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
  );
};

export default UsersTab;