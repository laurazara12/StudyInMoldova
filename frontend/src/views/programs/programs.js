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
  const [filterTuitionFee, setFilterTuitionFee] = useState({ min: '', max: '' });
  const [viewingProgram, setViewingProgram] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

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
      console.log('Server response:', JSON.stringify(response.data, null, 2));
      
      let programsData = [];
      
      if (response.data?.success && Array.isArray(response.data.data)) {
        programsData = response.data.data.map(program => ({
          id: program.id,
          name: program.name || 'N/A',
          description: program.description || 'N/A',
          faculty: program.faculty || 'N/A',
          degree_type: program.degree_type || 'N/A',
          credits: program.credits || 'N/A',
          language: program.language || 'N/A',
          duration: program.duration || 'N/A',
          tuition_fees: program.tuition_fees || 'N/A',
          start_date: program.start_date === 'N/A' ? null : program.start_date,
          application_deadline: program.application_deadline === 'N/A' ? null : program.application_deadline,
          university: program.university ? {
            id: program.university.id,
            name: program.university.name || 'N/A'
          } : null
        }));
      } else {
        console.error('Invalid response format:', JSON.stringify(response.data, null, 2));
        setError('Eroare la încărcarea programelor: Format invalid');
        setPrograms([]);
        return;
      }

      console.log('Formatted programs:', JSON.stringify(programsData, null, 2));
      setPrograms(programsData);
      setFilteredPrograms(programsData);
    } catch (error) {
      console.error('Detailed error fetching programs:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
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
          start_date: program.start_date,
          application_deadline: program.application_deadline,
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
        throw new Error('You must be logged in to save programs');
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
        setSavedPrograms(prev => [...prev, { ...response.data.data, id: programIdInt }]);
        setNotification({
          type: 'success',
          message: 'Program saved successfully!'
        });
      }
    } catch (error) {
      console.error('Eroare la salvarea programului:', error);
      
      if (error.response?.data?.message?.includes('already saved')) {
        setNotification({
          type: 'info',
          message: 'Program is already saved!'
        });
        return;
      }
      
      setNotification({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Error saving program'
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

      setSavedPrograms(prev => prev.filter(sp => (sp.id || sp.program_id || sp.program?.id) !== parseInt(programId)));
      
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
        (program.name && program.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDegree = !degreeFilter || program.degree_type === degreeFilter;
      const matchesLanguage = !languageFilter || program.language === languageFilter;
      const matchesTuitionFee = (!filterTuitionFee.min || program.tuition_fees >= filterTuitionFee.min) &&
                           (!filterTuitionFee.max || program.tuition_fees <= filterTuitionFee.max);
      return matchesSearch && matchesDegree && matchesLanguage && matchesTuitionFee;
    });
    setFilteredPrograms(filtered);
  }, [programs, searchTerm, degreeFilter, languageFilter, filterTuitionFee]);

  const handleClearFilters = () => {
    setDegreeFilter('');
    setLanguageFilter('');
    setSearchTerm('');
    setFilterTuitionFee({ min: '', max: '' });
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
        <div className={`notification ${notification.type} notification-left`}>
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
        <h1>Available Study Programs</h1>
        
        <div className="dashboard-filters">
          <div className="search-box">
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-section programs-filter">
            <div className="filter-group">
              <label>Degree:</label>
              <select
                value={degreeFilter}
                onChange={(e) => setDegreeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Degrees</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Language:</label>
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Languages</option>
                <option value="Romanian">Romanian</option>
                <option value="English">English</option>
                <option value="Russian">Russian</option>
                <option value="French">French</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Tuition Fee:</label>
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filterTuitionFee.min}
                  onChange={(e) => setFilterTuitionFee(prev => ({ ...prev, min: e.target.value }))}
                  className="range-input"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filterTuitionFee.max}
                  onChange={(e) => setFilterTuitionFee(prev => ({ ...prev, max: e.target.value }))}
                  className="range-input"
                />
              </div>
            </div>
            <button 
              className="clear-filters-button"
              onClick={() => {
                setSearchTerm('');
                setDegreeFilter('');
                setLanguageFilter('');
                setFilterTuitionFee({ min: '', max: '' });
                setFilteredPrograms(programs);
              }}
            >
              Reset Filters
            </button>
            <button 
              className="clear-filters-button"
              onClick={() => {
                const filtered = programs.filter(program => {
                  const matchesSearch = searchTerm === '' || 
                    (program.name && program.name.toLowerCase().includes(searchTerm.toLowerCase()));
                  const matchesDegree = !degreeFilter || program.degree_type === degreeFilter;
                  const matchesLanguage = !languageFilter || program.language === languageFilter;
                  const matchesTuitionFee = (!filterTuitionFee.min || program.tuition_fees >= filterTuitionFee.min) &&
                                         (!filterTuitionFee.max || program.tuition_fees <= filterTuitionFee.max);
                  return matchesSearch && matchesDegree && matchesLanguage && matchesTuitionFee;
                });
                setFilteredPrograms(filtered);
              }}
            >
              Search
            </button>
          </div>
        </div>

        <div className="programs-table-container">
          {filteredPrograms.length === 0 ? (
            <div className="no-programs-message">
              <p>No study programs available at this moment.</p>
            </div>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Program Name</th>
                  <th>University</th>
                  <th>Degree</th>
                  <th>Language</th>
                  <th>Duration</th>
                  <th>Application Deadline</th>
                  <th>Tuition Fee</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrograms.map(program => (
                  <tr key={program.id}>
                    <td>{program.id}</td>
                    <td>
                      <div className="program-name" style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '250px'}}>
                        <strong>{program.name || 'Program name unavailable'}</strong>
                        {program.description && (
                          <div className="program-description">
                            {program.description.length > 40
                              ? program.description.slice(0, 40) + '...'
                              : program.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{program.university?.name
                      ? program.university.name.length > 20
                        ? program.university.name.slice(0, 20) + '...'
                        : program.university.name
                      : 'University not assigned'}</td>
                    <td>
                      <span className={`degree-badge ${program.degree_type?.toLowerCase() || 'unknown'}`}>
                        {program.degree_type || program.degree || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <span className={`language-badge ${program.language?.toLowerCase() || 'unknown'}`}>
                        {program.language || 'Language unknown'}
                      </span>
                    </td>
                    <td>{program.duration
                      ? /year/i.test(program.duration)
                        ? program.duration
                        : `${program.duration} years`
                      : 'Duration not assigned'}</td>
                    <td>{program.application_deadline ? new Date(program.application_deadline).toLocaleDateString() : 'Not set'}</td>
                    <td>{program.tuition_fees ? `${program.tuition_fees} EUR` : 'Fee not assigned'}</td>
                    <td>
                      <div className="action-buttons">
                        {isAuthenticated && !isAdmin ? (
                          isProgramSaved(program.id) ? (
                            <button 
                              className="btn-delete"
                              onClick={() => handleRemoveSavedProgram(program.id)}
                              title="Remove from saved programs"
                            >
                              Remove
                            </button>
                          ) : (
                            <button 
                              className="btn1"
                              onClick={() => handleSaveProgram(program.id)}
                              title="Save program"
                            >
                              Save
                            </button>
                          )
                        ) : null}
                        <button 
                          className="btn1"
                          onClick={() => { setViewingProgram(program); setIsViewModalOpen(true); }}
                          title="View program details"
                        >
                          View Program
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
      
      <Footer />
      {isViewModalOpen && viewingProgram && (
        <div className="modal-overlay">
          <div className="modal-content program-modal">
            <button className="close-button" style={{position: 'absolute', top: 10, right: 10}} onClick={() => { setIsViewModalOpen(false); setViewingProgram(null); }} aria-label="Close">×</button>
            <h2>Program Details</h2>
            <div className="program-details">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{viewingProgram.name || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">University:</span>
                  <span className="detail-value">{viewingProgram.university?.name || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Degree:</span>
                  <span className="detail-value">{viewingProgram.degree_type || viewingProgram.degree || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Faculty:</span>
                  <span className="detail-value">{viewingProgram.faculty || 'N/A'}</span>
                </div>
              </div>
              <div className="detail-section">
                <h3>Program Details</h3>
                <div className="detail-row">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{viewingProgram.duration || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Credits:</span>
                  <span className="detail-value">{viewingProgram.credits || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Language:</span>
                  <span className="detail-value">{viewingProgram.language || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tuition Fee:</span>
                  <span className="detail-value">{viewingProgram.tuition_fees || 'N/A'}</span>
                </div>
              </div>
              <div className="detail-section">
                <h3>Important Dates</h3>
                <div className="detail-row">
                  <span className="detail-label">Start Date:</span>
                  <span className="detail-value">{viewingProgram.start_date ? new Date(viewingProgram.start_date).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Application Deadline:</span>
                  <span className="detail-value">{viewingProgram.application_deadline ? new Date(viewingProgram.application_deadline).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
              <div className="detail-section">
                <h3>Description</h3>
                <div className="detail-description">
                  {viewingProgram.description || 'No description available'}
                </div>
              </div>
            </div>
            <div className="modal-buttons">
              <button 
                type="button" 
                className="btn-grey-2"
                onClick={() => { setIsViewModalOpen(false); setViewingProgram(null); }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Programs;