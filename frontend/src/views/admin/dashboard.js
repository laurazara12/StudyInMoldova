import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/navbar';
import './dashboard.css';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || user.role !== 'admin') {
      console.log('Utilizator neautorizat:', user);
      navigate('/sign-in');
      return;
    }

    if (!token) {
      console.log('Token lipsă');
      setError('Token de autentificare lipsă. Vă rugăm să vă autentificați din nou.');
      setLoading(false);
      navigate('/sign-in');
      return;
    }

    let isMounted = true;

    const fetchUsers = async () => {
      try {
        console.log('Încercare de a prelua utilizatorii...');
        console.log('Token:', token ? 'prezent' : 'lipsă');
        console.log('User:', user);

        const response = await axios.get('http://localhost:4000/api/auth/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!isMounted) return;

        console.log('Răspuns primit:', response.data);

        if (response.data && Array.isArray(response.data)) {
          const sortedUsers = response.data.sort((a, b) => b.id - a.id);
          setUsers(sortedUsers);
          console.log('Utilizatori încărcați:', sortedUsers.length);
        } else {
          console.error('Format invalid al datelor:', response.data);
          setError('Formatul datelor primite este invalid');
        }
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;

        console.error('Eroare la încărcarea datelor:', err);

        if (err.response) {
          console.error('Detalii eroare:', {
            status: err.response.status,
            data: err.response.data,
            headers: err.response.headers
          });

          if (err.response.status === 401) {
            console.log('Token expirat sau invalid');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/sign-in');
          } else if (err.response.status === 403) {
            console.log('Acces interzis');
            navigate('/profile');
          } else if (err.response.status === 500) {
            const errorMessage = err.response.data.message || 'Vă rugăm să încercați din nou mai târziu.';
            console.error('Eroare server:', errorMessage);
            setError(`Eroare server: ${errorMessage}`);
          } else {
            setError(err.response.data.message || 'Eroare la încărcarea datelor');
          }
        } else if (err.request) {
          console.error('Nu s-a primit răspuns de la server');
          setError('Nu s-a putut conecta la server. Verificați conexiunea la internet.');
        } else {
          console.error('Eroare la configurarea request-ului:', err.message);
          setError('A apărut o eroare neașteptată. Vă rugăm să încercați din nou.');
        }
        setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Se încarcă datele...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Încercați din nou
        </button>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-heading">Administrare</h1>
        </div>
        <div className="dashboard-content">
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Utilizatori</h3>
              <p>{users.length}</p>
            </div>
            <div className="stat-card">
              <h3>Utilizatori Activi</h3>
              <p>{users.filter(user => user.role === 'user').length}</p>
            </div>
            <div className="stat-card">
              <h3>Administratori</h3>
              <p>{users.filter(user => user.role === 'admin').length}</p>
            </div>
          </div>

          <div className="dashboard-section">
            <h2>Gestionare Utilizatori</h2>
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nume</th>
                    <th>Email</th>
                    <th>Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 