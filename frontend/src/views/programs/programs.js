import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api.config';
import './programs.css';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [savedPrograms, setSavedPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [degreeFilter, setDegreeFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [notification, setNotification] = useState(null);

  const fetchData = async () => {
    try {
      console.log('Începe fetchData...');
      setLoading(true);
      setError(null);
      await fetchPrograms();
      if (isAuthenticated) {
        await fetchSavedPrograms();
      }
    } catch (error) {
      console.error('Eroare în fetchData:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const isAuth = !!token;
      setIsAuthenticated(isAuth);
      setIsAdmin(user?.role === 'admin');
      
      if (isAuth) {
        fetchSavedPrograms();
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    console.log('Programs component mounted');
    fetchData();
  }, [isAuthenticated]);

  const fetchPrograms = async () => {
    try {
      console.log('Starting program fetch...');
      const response = await axios.get(`${API_BASE_URL}/api/programs`);
      console.log('Server response:', response.data);
      
      let programsData = [];
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        programsData = response.data.data.map(program => ({
          id: program.id,
          name: program.name,
          description: program.description,
          faculty: program.faculty,
          degree_type: program.degree_type,
          credits: program.credits,
          language: program.language,
          duration: program.duration,
          tuition_fees: program.tuition_fees,
          university: program.university ? {
            id: program.university.id,
            name: program.university.name
          } : null
        }));
      } else {
        console.error('Invalid response format:', response.data);
        setError('Eroare la încărcarea programelor: Format invalid');
        setPrograms([]);
        return;
      }

      console.log('Formatted programs:', programsData);
      setPrograms(programsData);
      setFilteredPrograms(programsData);
    } catch (error) {
      console.error('Detailed error fetching programs:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setPrograms([]);
      setFilteredPrograms([]);
      setError('Eroare la încărcarea programelor: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchSavedPrograms = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/api/saved-programs`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Saved programs response:', response.data);
      
      if (response.data?.data) {
        const savedProgramsData = response.data.data.map(program => ({
          id: program.id,
          name: program.name,
          description: program.description,
          faculty: program.faculty,
          degree_type: program.degree_type,
          credits: program.credits,
          language: program.language,
          duration: program.duration,
          tuition_fees: program.tuition_fees,
          university: program.university ? {
            id: program.university.id,
            name: program.university.name
          } : null
        }));
        console.log('Programe salvate procesate:', savedProgramsData);
        setSavedPrograms(savedProgramsData);
      }
    } catch (error) {
      console.error('Error fetching saved programs:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    }
  };

  const isProgramSaved = (programId) => {
    const programIdInt = parseInt(programId);
    const isSaved = savedPrograms.some(sp => {
      const savedId = sp.id || sp.program_id || sp.program?.id;
      return savedId === programIdInt;
    });
    console.log(`Program check ${programIdInt}:`, isSaved, 'Saved programs list:', savedPrograms);
    return isSaved;
  };

  const handleSaveProgram = async (programId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Trebuie să fiți autentificat pentru a salva programe');
      }

      const programIdInt = parseInt(programId);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/saved-programs`,
        { program_id: programIdInt },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.data) {
        setSavedPrograms(prev => [...prev, response.data.data]);
        setNotification({
          type: 'success',
          message: 'Programul a fost salvat cu succes!'
        });
      }
    } catch (error) {
      console.error('Eroare la salvarea programului:', error);
      
      if (error.response?.data?.message?.includes('deja salvat')) {
        setNotification({
          type: 'info',
          message: 'Programul este deja salvat!'
        });
        return;
      }
      
      setNotification({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Eroare la salvarea programului'
      });
    }
  };

  const handleRemoveSavedProgram = async (programId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.delete(`${API_BASE_URL}/api/saved-programs/${programId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Eliminăm programul din lista locală
      setSavedPrograms(prev => prev.filter(sp => (sp.program_id || sp.program?.id) !== programId));
      
      const successMessage = document.createElement('div');
      successMessage.className = 'success-message';
      successMessage.textContent = 'Program removed from saved list!';
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);
    } catch (error) {
      console.error('Error removing program:', error);
      
      const errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.textContent = 'Error removing program from saved list';
      document.body.appendChild(errorElement);
      setTimeout(() => errorElement.remove(), 3000);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedPrograms();
      const interval = setInterval(fetchSavedPrograms, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const filtered = programs.filter(program => {
      const matchesSearch = searchTerm === '' || 
        (program.name && program.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (program.description && program.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDegree = !degreeFilter || program.degree_type === degreeFilter;
      const matchesLanguage = !languageFilter || program.language === languageFilter;
      return matchesSearch && matchesDegree && matchesLanguage;
    });
    setFilteredPrograms(filtered);
  }, [programs, searchTerm, degreeFilter, languageFilter]);

  const handleClearFilters = () => {
    setDegreeFilter('');
    setLanguageFilter('');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reload page</button>
      </div>
    );
  }

  return (
    <div className="programs-page">
      <Helmet>
        <title>Study in Moldova - Available Programs</title>
      </Helmet>
      <Navbar />
      
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button 
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}
      
      <main className="programs-content">
        <h1>Available study programs</h1>
        
        <div className="filters">
          <div className="filter-group">
            <input
              type="text"
              id="program-search"
              placeholder="Caută programe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
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
          </div>
          
          <div className="filter-group">
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

          <button 
            className="clear-filters-button"
            onClick={handleClearFilters}
          >
            Curăță filtrele
          </button>
          <button 
            className="search-button"
            onClick={() => {
              const filtered = programs.filter(program => {
                const matchesSearch = searchTerm === '' || 
                  (program.name && program.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (program.description && program.description.toLowerCase().includes(searchTerm.toLowerCase()));
                const matchesDegree = !degreeFilter || program.degree_type === degreeFilter;
                const matchesLanguage = !languageFilter || program.language === languageFilter;
                return matchesSearch && matchesDegree && matchesLanguage;
              });
              setFilteredPrograms(filtered);
            }}
          >
            Caută
          </button>
        </div>

        <div className="programs-table-container">
          {filteredPrograms.length === 0 ? (
            <div className="no-programs-message">
              <p>No study programs available at this moment.</p>
            </div>
          ) : (
            <table className="programs-table">
              <thead>
                <tr>
                  <th>Nume program</th>
                  <th>Universitate</th>
                  <th>Facultate</th>
                  <th>Grad</th>
                  <th>Credite</th>
                  <th>Limbă</th>
                  <th>Durată</th>
                  <th>Taxă de școlarizare</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrograms.map(program => (
                  <tr key={program.id}>
                    <td>
                      <div className="program-name">
                        <strong>{program.name || 'Nume program indisponibil'}</strong>
                        {program.description && (
                          <div className="program-description">{program.description}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      {program.university?.name || 'Universitate neasignată'}
                    </td>
                    <td>{program.faculty || 'Facultate neasignată'}</td>
                    <td>
                      <span className={`degree-badge ${program.degree_type?.toLowerCase() || 'necunoscut'}`}>
                        {program.degree_type || program.degree || 'Necunoscut'}
                      </span>
                    </td>
                    <td>{program.credits || 'Credite neasignate'}</td>
                    <td>
                      <span className={`language-badge ${program.language?.toLowerCase() || 'necunoscut'}`}>
                        {program.language || 'Limba necunoscută'}
                      </span>
                    </td>
                    <td>{program.duration ? `${program.duration} ani` : 'Durată neasignată'}</td>
                    <td>{program.tuition_fees ? `${program.tuition_fees} EUR` : 'Taxă neasignată'}</td>
                    <td>
                      {isAuthenticated && !isAdmin ? (
                        isProgramSaved(program.id) ? (
                          <button 
                            className="remove-save-button"
                            onClick={() => handleRemoveSavedProgram(program.id)}
                            title="Elimină din programele salvate"
                          >
                            Elimină
                          </button>
                        ) : (
                          <button 
                            className="save-button"
                            onClick={() => handleSaveProgram(program.id)}
                            title="Salvează programul"
                          >
                            Salvează
                          </button>
                        )
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Programs;