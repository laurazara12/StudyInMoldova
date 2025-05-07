import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api.config';
import './styles.css';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [savedPrograms, setSavedPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [degreeFilter, setDegreeFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      await fetchPrograms();
      if (isAuthenticated) {
        await fetchSavedPrograms();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    // Verificăm autentificarea la fiecare schimbare a token-ului
    window.addEventListener('storage', checkAuth);
    checkAuth();

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const fetchPrograms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/programs`);
      setPrograms(response.data);
    } catch (error) {
      console.error('Eroare la obținerea programelor:', error);
      throw new Error('Eroare la obținerea programelor');
    }
  };

  const fetchSavedPrograms = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Nu sunteți autentificat');
      }

      const response = await axios.get(`${API_BASE_URL}/api/saved-programs`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data) {
        throw new Error('Nu s-au primit date de la server');
      }

      setSavedPrograms(response.data);
    } catch (error) {
      console.error('Eroare detaliată la obținerea programelor salvate:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        throw new Error('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
      }
      
      throw new Error(error.response?.data?.message || 'Eroare la obținerea programelor salvate');
    }
  };

  const handleSaveProgram = async (programId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/saved-programs`, { programId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchSavedPrograms();
    } catch (error) {
      console.error('Eroare la salvarea programului:', error);
    }
  };

  const handleRemoveSavedProgram = async (programId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/saved-programs/${programId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchSavedPrograms();
    } catch (error) {
      console.error('Eroare la eliminarea programului salvat:', error);
    }
  };

  const isProgramSaved = (programId) => {
    return savedPrograms.some(sp => sp.id === programId);
  };

  const filteredPrograms = programs.filter(program => {
    const matchesDegree = !degreeFilter || program.degree === degreeFilter;
    const matchesLanguage = !languageFilter || program.languages.includes(languageFilter);
    return matchesDegree && matchesLanguage;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Se încarcă...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reîncarcă pagina</button>
      </div>
    );
  }

  return (
    <div className="programs-page">
      <Helmet>
        <title>Programe de studiu - Study in Moldova</title>
      </Helmet>
      <Navbar />
      
      <main className="programs-content">
        <h1>Programe de studiu disponibile</h1>
        
        <div className="filters">
          <select 
            value={degreeFilter} 
            onChange={(e) => setDegreeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Toate gradele</option>
            <option value="Bachelor">Licență</option>
            <option value="Master">Master</option>
            <option value="PhD">Doctorat</option>
          </select>
          
          <select 
            value={languageFilter} 
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Toate limbile</option>
            <option value="Romanian">Română</option>
            <option value="Russian">Rusă</option>
            <option value="English">Engleză</option>
          </select>
        </div>

        <div className="programs-table-container">
          <table className="programs-table">
            <thead>
              <tr>
                <th>Nume program</th>
                <th>Facultate</th>
                <th>Grad</th>
                <th>Credite</th>
                <th>Limbi</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrograms.map(program => (
                <tr key={program.id}>
                  <td>{program.name}</td>
                  <td>{program.faculty}</td>
                  <td>{program.degree}</td>
                  <td>{program.credits}</td>
                  <td>{program.languages.join(', ')}</td>
                  <td>
                    {isAuthenticated && (
                      isProgramSaved(program.id) ? (
                        <button 
                          className="remove-save-button"
                          onClick={() => handleRemoveSavedProgram(program.id)}
                        >
                          Elimină
                        </button>
                      ) : (
                        <button 
                          className="save-button"
                          onClick={() => handleSaveProgram(program.id)}
                        >
                          Salvează
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Programs; 