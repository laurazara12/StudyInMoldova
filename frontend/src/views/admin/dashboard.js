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

  const getDocumentStatus = (userId) => {
    const userDocuments = documents.filter(doc => doc.user_id === userId);
    const requiredDocuments = ['diploma', 'transcript', 'passport', 'photo'];
    const status = {};

    requiredDocuments.forEach(docType => {
      const hasDocument = userDocuments.some(doc => doc.type === docType);
      status[docType] = hasDocument ? 'Încărcat' : 'Lipsește';
    });

    return status;
  };

  const handleDeleteUser = async (userId) => {
    try {
      console.log('Încercare de ștergere pentru utilizatorul:', userId);
      const response = await axios.delete(`http://localhost:4000/api/auth/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Răspuns de la server:', response.data);

      if (response.status === 200) {
        setUsers(users.filter(user => user.id !== userId));
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

  const confirmDelete = (userId) => {
    setDeleteConfirmation(userId);
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

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
          </div>

          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p>{users.length}</p>
            </div>
            <div className="stat-card">
              <h3>Active Users</h3>
              <p>{users.filter(user => user.role === 'user').length}</p>
            </div>
            <div className="stat-card">
              <h3>Administrators</h3>
              <p>{users.filter(user => user.role === 'admin').length}</p>
            </div>
          </div>

          <div className="dashboard-tabs">
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

          {activeTab === 'users' ? (
            <div className="dashboard-table-container">
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
                  {users.map(user => {
                    const docStatus = getDocumentStatus(user.id);
                    return (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role === 'admin' ? 'Administrator' : 'User'}</td>
                        <td className={docStatus.diploma === 'Încărcat' ? 'status-success' : 'status-missing'}>
                          {docStatus.diploma === 'Încărcat' ? 'Uploaded' : 'Missing'}
                        </td>
                        <td className={docStatus.transcript === 'Încărcat' ? 'status-success' : 'status-missing'}>
                          {docStatus.transcript === 'Încărcat' ? 'Uploaded' : 'Missing'}
                        </td>
                        <td className={docStatus.passport === 'Încărcat' ? 'status-success' : 'status-missing'}>
                          {docStatus.passport === 'Încărcat' ? 'Uploaded' : 'Missing'}
                        </td>
                        <td className={docStatus.photo === 'Încărcat' ? 'status-success' : 'status-missing'}>
                          {docStatus.photo === 'Încărcat' ? 'Uploaded' : 'Missing'}
                        </td>
                        <td>
                          {user.role !== 'admin' && (
                            <button 
                              className="delete-button"
                              onClick={() => confirmDelete(user.id)}
                            >
                              Delete
                            </button>
                          )}
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
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => {
                    const user = users.find(u => u.id === doc.user_id);
                    return (
                      <tr key={doc.id}>
                        <td>{doc.id}</td>
                        <td>{user ? user.name : 'Unknown'}</td>
                        <td>{doc.type}</td>
                        <td>{new Date(doc.created_at).toLocaleDateString('en-US')}</td>
                        <td className="status-success">Verified</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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