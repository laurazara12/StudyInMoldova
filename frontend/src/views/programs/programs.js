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
  const [isAdmin, setIsAdmin] = useState(false);
  const [degreeFilter, setDegreeFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');

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
    console.log('Componenta Programs montată');
    fetchData();
  }, [isAuthenticated]);

  const fetchPrograms = async () => {
    try {
      console.log('Începe încărcarea programelor...');
      const response = await axios.get(`${API_BASE_URL}/programs`);
      console.log('Răspuns de la server:', response.data);
      
      if (Array.isArray(response.data)) {
        console.log('Programe găsite (array direct):', response.data);
        setPrograms(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('Programe găsite (în data.data):', response.data.data);
        setPrograms(response.data.data);
      } else {
        console.error('Format invalid al răspunsului:', response.data);
        setError('Eroare la încărcarea programelor: Format invalid al datelor');
        setPrograms([]);
      }
    } catch (error) {
      console.error('Eroare detaliată la obținerea programelor:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setPrograms([]);
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

      console.log('Răspuns programe salvate:', response.data);
      
      if (response.data?.data) {
        const savedProgramsData = response.data.data;
        console.log('Programe salvate procesate:', savedProgramsData);
        setSavedPrograms(savedProgramsData);
      }
    } catch (error) {
      console.error('Eroare la obținerea programelor salvate:', error);
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
    console.log(`Verificare program ${programIdInt}:`, isSaved, 'Lista programe salvate:', savedPrograms);
    return isSaved;
  };

  const handleSaveProgram = async (programId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Trebuie să fiți autentificat pentru a salva programe');
      }

      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) {
        throw new Error('Informațiile utilizatorului nu sunt disponibile');
      }

      const programIdInt = parseInt(programId);
      
      // Verificăm dacă programul este deja salvat
      if (isProgramSaved(programIdInt)) {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Programul este deja salvat!';
        document.body.appendChild(successMessage);
        setTimeout(() => successMessage.remove(), 3000);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/saved-programs`,
        { program_id: programIdInt, user_id: user.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Răspuns salvare program:', response.data);

      if (response.data?.data) {
        // Adăugăm noul program salvat la lista existentă
        setSavedPrograms(prev => [...prev, response.data.data]);
        
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Program salvat cu succes!';
        document.body.appendChild(successMessage);
        setTimeout(() => successMessage.remove(), 3000);
      }
    } catch (error) {
      console.error('Eroare la salvarea programului:', error);
      
      // Verificăm dacă eroarea este deja salvat
      if (error.response?.data?.message?.includes('deja salvat')) {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Programul este deja salvat!';
        document.body.appendChild(successMessage);
        setTimeout(() => successMessage.remove(), 3000);
        return;
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Eroare la salvarea programului';
      const errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.textContent = errorMessage;
      document.body.appendChild(errorElement);
      setTimeout(() => errorElement.remove(), 3000);
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
      successMessage.textContent = 'Program eliminat din lista salvată!';
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);
    } catch (error) {
      console.error('Eroare la eliminarea programului:', error);
      
      const errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.textContent = 'Eroare la eliminarea programului din lista salvată';
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

  const filteredPrograms = programs.filter(program => {
    const matchesDegree = !degreeFilter || program.degree_type === degreeFilter;
    const matchesLanguage = !languageFilter || program.language === languageFilter;
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
          {filteredPrograms.length === 0 ? (
            <div className="no-programs-message">
              <p>Nu există programe de studiu disponibile în acest moment.</p>
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
                  <th>Limbi</th>
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
                        <strong>{program.name}</strong>
                        {program.description && (
                          <div className="program-description">{program.description}</div>
                        )}
                      </div>
                    </td>
                    <td>{program.University?.name || 'N/A'}</td>
                    <td>{program.faculty || 'N/A'}</td>
                    <td>
                      <span className={`degree-badge ${program.degree_type?.toLowerCase()}`}>
                        {program.degree_type === 'Bachelor' ? 'Licență' : 
                         program.degree_type === 'Master' ? 'Master' : 
                         program.degree_type === 'PhD' ? 'Doctorat' : program.degree_type}
                      </span>
                    </td>
                    <td>{program.credits || 'N/A'}</td>
                    <td>
                      <span className={`language-badge ${program.language?.toLowerCase()}`}>
                        {program.language === 'Romanian' ? 'Română' :
                         program.language === 'Russian' ? 'Rusă' :
                         program.language === 'English' ? 'Engleză' : program.language}
                      </span>
                    </td>
                    <td>{program.duration} ani</td>
                    <td>{program.tuition_fees ? `${program.tuition_fees} EUR` : 'N/A'}</td>
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