import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import './users-admin.css';

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/api/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Verificăm dacă răspunsul conține data
      if (response.data && response.data.data) {
        setUsers(response.data.data);
      } else {
        setUsers([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Eroare la încărcarea utilizatorilor:', err);
      setError('Eroare la încărcarea utilizatorilor');
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleCloseModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  // Filtrăm utilizatorii doar dacă avem date
  const filteredUsers = users ? users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) {
    return <div className="users-admin-loading">Se încarcă utilizatorii...</div>;
  }

  if (error) {
    return <div className="users-admin-error">{error}</div>;
  }

  return (
    <div className="users-admin-container">
      <Helmet>
        <title>Gestionare Utilizatori - Study In Moldova</title>
      </Helmet>

      <div className="users-admin-header">
        <h1>Gestionare Utilizatori</h1>
        <div className="users-admin-search">
          <input
            type="text"
            placeholder="Caută utilizatori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="users-admin-grid">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <div
              key={user.id}
              className="user-card"
              onClick={() => handleUserClick(user)}
            >
              <div className="user-card-header">
                <h3>{user.name}</h3>
                <span className={`user-role ${user.role}`}>{user.role}</span>
              </div>
              <div className="user-card-body">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Data înregistrării:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-users-message">Nu există utilizatori de afișat.</div>
        )}
      </div>

      {showUserModal && selectedUser && (
        <div className="user-modal-overlay" onClick={handleCloseModal}>
          <div className="user-modal-content" onClick={e => e.stopPropagation()}>
            <div className="user-modal-header">
              <h2>Detalii Utilizator</h2>
              <button className="close-button" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="user-modal-body">
              <div className="user-detail">
                <label>Nume:</label>
                <p>{selectedUser.name}</p>
              </div>
              <div className="user-detail">
                <label>Email:</label>
                <p>{selectedUser.email}</p>
              </div>
              <div className="user-detail">
                <label>Rol:</label>
                <p>{selectedUser.role}</p>
              </div>
              <div className="user-detail">
                <label>Data înregistrării:</label>
                <p>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="user-detail">
                <label>Ultima actualizare:</label>
                <p>{new Date(selectedUser.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersAdmin; 