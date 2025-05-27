import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../../../config/api.config';

const ProgramsTab = () => {
  const [programs, setPrograms] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showAddProgramForm, setShowAddProgramForm] = useState(false);
  const [showEditProgramForm, setShowEditProgramForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [newProgram, setNewProgram] = useState({
    name: '',
    description: '',
    university_id: '',
    duration: '',
    degree: '',
    language: '',
    tuition_fee: '',
    start_date: '',
    application_deadline: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDegree, setFilterDegree] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterTuitionFee, setFilterTuitionFee] = useState({ min: '', max: '' });
  const [filteredPrograms, setFilteredPrograms] = useState([]);

  useEffect(() => {
    loadPrograms();
    loadUniversities();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      console.log('Începe încărcarea programelor...');
      const response = await axios.get(`${API_BASE_URL}/api/programs`, {
        headers: getAuthHeaders()
      });

      console.log('Răspuns server programe:', JSON.stringify(response.data, null, 2));

      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Format invalid al răspunsului de la server');
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Eroare la preluarea programelor');
      }

      const { data, total } = response.data;

      if (!Array.isArray(data)) {
        throw new Error('Format invalid al datelor primite');
      }

      // Formatăm datele
      const formattedData = data.map(program => ({
        id: program.id,
        name: program.name,
        description: program.description,
        duration: program.duration,
        degree_type: program.degree_type,
        language: program.language,
        tuition_fees: program.tuition_fees,
        credits: program.credits,
        faculty: program.faculty,
        university: program.university ? {
          id: program.university.id,
          name: program.university.name,
          image_url: program.university.image_url,
          location: program.university.location,
          website: program.university.website
        } : null,
        createdAt: program.createdAt,
        updatedAt: program.updatedAt
      }));

      setPrograms(formattedData);
      setFilteredPrograms(formattedData);
    } catch (error) {
      console.error('Eroare la încărcarea programelor:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUniversities = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/universities`, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success && response.data.data) {
        setUniversities(response.data.data);
      }
    } catch (error) {
      console.error('Eroare la încărcarea universităților:', error);
    }
  };

  const handleOpenAddProgramForm = () => {
    setShowAddProgramForm(true);
    setNewProgram({
      name: '',
      description: '',
      university_id: '',
      duration: '',
      degree: '',
      language: '',
      tuition_fee: '',
      start_date: '',
      application_deadline: ''
    });
  };

  const handleCloseAddProgramForm = () => {
    setShowAddProgramForm(false);
  };

  const handleAddProgram = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/programs`, newProgram, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setPrograms([...programs, response.data.data]);
        handleCloseAddProgramForm();
        setSuccessMessage('Programul a fost adăugat cu succes!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Eroare la adăugarea programului:', error);
      setError(error.response?.data?.message || 'Eroare la adăugarea programului');
    }
  };

  const handleNewProgramChange = (e) => {
    const { name, value } = e.target;
    setNewProgram(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditProgram = (program) => {
    setEditingProgram(program);
    setShowEditProgramForm(true);
  };

  const handleDeleteProgram = async (programId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/programs/${programId}`, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        await loadPrograms();
        setSuccessMessage('Programul a fost șters cu succes!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response.data.message || 'Eroare la ștergerea programului');
      }
    } catch (error) {
      console.error('Eroare la ștergerea programului:', error);
      setError('A apărut o eroare la ștergerea programului. Vă rugăm să încercați din nou.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUpdateProgram = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/programs/${editingProgram.id}`,
        editingProgram,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        await loadPrograms();
        setShowEditProgramForm(false);
        setEditingProgram(null);
        setSuccessMessage('Programul a fost actualizat cu succes!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response.data.message || 'Eroare la actualizarea programului');
      }
    } catch (error) {
      console.error('Eroare la actualizarea programului:', error);
      setError('A apărut o eroare la actualizarea programului. Vă rugăm să încercați din nou.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSearch = () => {
    const filtered = programs.filter(program => {
      const matchesSearch = searchTerm === '' || 
        program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDegree = filterDegree === 'all' || program.degree_type === filterDegree;
      const matchesLanguage = !filterLanguage || program.language === filterLanguage;
      const matchesTuitionFee = (!filterTuitionFee.min || program.tuition_fees >= filterTuitionFee.min) &&
                               (!filterTuitionFee.max || program.tuition_fees <= filterTuitionFee.max);
      return matchesSearch && matchesDegree && matchesLanguage && matchesTuitionFee;
    });
    setFilteredPrograms(filtered);
  };

  return (
    <div className="programs-tab">
      <div className="dashboard-filters">
        <div className="search-box">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Caută după nume sau descriere..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-section programs-filter">
          <div className="filter-group">
            <label>Grad:</label>
            <select
              value={filterDegree}
              onChange={(e) => setFilterDegree(e.target.value)}
              className="filter-select"
            >
              <option value="all">Toate gradele</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Master">Master</option>
              <option value="PhD">PhD</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Limbă:</label>
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="filter-select"
            >
              <option value="">Toate limbile</option>
              <option value="Romanian">Română</option>
              <option value="English">Engleză</option>
              <option value="Russian">Rusă</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Taxă școlară:</label>
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
              setFilterDegree('all');
              setFilterLanguage('');
              setFilterTuitionFee({ min: '', max: '' });
              setFilteredPrograms(programs);
            }}
          >
            Resetează filtrele
          </button>
          <button 
            className="search-button"
            onClick={handleSearch}
          >
            Caută
          </button>
        </div>
      </div>

      <div className="dashboard-actions">
        <button 
          className="btn1"
          onClick={handleOpenAddProgramForm}
        >
          Adaugă Program
        </button>
      </div>

      {successMessage && (
        <div className="alert-success">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Se încarcă programele...</p>
        </div>
      ) : (
        <div className="programs-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nume</th>
                <th>Grad</th>
                <th>Durată</th>
                <th>Limbă</th>
                <th>Taxă școlară</th>
                <th>Universitate</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrograms.map(program => (
                <tr key={program.id}>
                  <td>{program.id}</td>
                  <td>{program.name}</td>
                  <td>{program.degree_type}</td>
                  <td>{program.duration}</td>
                  <td>{program.language}</td>
                  <td>{program.tuition_fees}</td>
                  <td>{program.university?.name || 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEditProgram(program)} 
                        className="edit-button"
                      >
                        Editează
                      </button>
                      <button 
                        onClick={() => handleDeleteProgram(program.id)} 
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
      )}

      {showAddProgramForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Adaugă Program Nou</h2>
            <form onSubmit={handleAddProgram}>
              <div className="form-group">
                <label>Nume Program:</label>
                <input
                  type="text"
                  name="name"
                  value={newProgram.name}
                  onChange={handleNewProgramChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descriere:</label>
                <textarea
                  name="description"
                  value={newProgram.description}
                  onChange={handleNewProgramChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Universitate:</label>
                <select
                  name="university_id"
                  value={newProgram.university_id}
                  onChange={handleNewProgramChange}
                  required
                >
                  <option value="">Selectează universitatea</option>
                  {universities.map(uni => (
                    <option key={uni.id} value={uni.id}>{uni.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Durată (ani):</label>
                <input
                  type="number"
                  name="duration"
                  value={newProgram.duration}
                  onChange={handleNewProgramChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Grad:</label>
                <select
                  name="degree"
                  value={newProgram.degree}
                  onChange={handleNewProgramChange}
                  required
                >
                  <option value="">Selectează gradul</option>
                  <option value="Bachelor">Bachelor</option>
                  <option value="Master">Master</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
              <div className="form-group">
                <label>Limbă:</label>
                <input
                  type="text"
                  name="language"
                  value={newProgram.language}
                  onChange={handleNewProgramChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Taxă Școlară:</label>
                <input
                  type="number"
                  name="tuition_fee"
                  value={newProgram.tuition_fee}
                  onChange={handleNewProgramChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Data de început:</label>
                <input
                  type="date"
                  name="start_date"
                  value={newProgram.start_date}
                  onChange={handleNewProgramChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Termen limită aplicare:</label>
                <input
                  type="date"
                  name="application_deadline"
                  value={newProgram.application_deadline}
                  onChange={handleNewProgramChange}
                  required
                />
              </div>
              <div className="button-group">
                <button type="submit" className="save-button">Salvează</button>
                <button type="button" onClick={handleCloseAddProgramForm} className="cancel-button">Anulează</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditProgramForm && editingProgram && (
        <div className="modal-overlay">
          <div className="modal-content program-modal">
            <h2>Editează Program</h2>
            <form onSubmit={handleUpdateProgram} className="program-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nume Program:</label>
                  <input
                    type="text"
                    name="name"
                    value={editingProgram.name}
                    onChange={(e) => setEditingProgram({
                      ...editingProgram,
                      name: e.target.value
                    })}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Grad:</label>
                  <select
                    name="degree_type"
                    value={editingProgram.degree_type}
                    onChange={(e) => setEditingProgram({
                      ...editingProgram,
                      degree_type: e.target.value
                    })}
                    required
                    className="form-select"
                  >
                    <option value="">Selectează gradul</option>
                    <option value="Bachelor">Bachelor</option>
                    <option value="Master">Master</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Facultate:</label>
                  <input
                    type="text"
                    name="faculty"
                    value={editingProgram.faculty || ''}
                    onChange={(e) => setEditingProgram({
                      ...editingProgram,
                      faculty: e.target.value
                    })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Credite:</label>
                  <input
                    type="number"
                    name="credits"
                    value={editingProgram.credits || ''}
                    onChange={(e) => setEditingProgram({
                      ...editingProgram,
                      credits: e.target.value
                    })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Durată (ani):</label>
                  <input
                    type="number"
                    name="duration"
                    min="1"
                    max="6"
                    value={editingProgram.duration}
                    onChange={(e) => setEditingProgram({
                      ...editingProgram,
                      duration: e.target.value
                    })}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Limbă predare:</label>
                  <select
                    name="language"
                    value={editingProgram.language}
                    onChange={(e) => setEditingProgram({
                      ...editingProgram,
                      language: e.target.value
                    })}
                    required
                    className="form-select"
                  >
                    <option value="">Selectează limba</option>
                    <option value="Romanian">Română</option>
                    <option value="English">Engleză</option>
                    <option value="Russian">Rusă</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Descriere:</label>
                <textarea
                  name="description"
                  value={editingProgram.description}
                  onChange={(e) => setEditingProgram({
                    ...editingProgram,
                    description: e.target.value
                  })}
                  className="form-textarea"
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Taxă școlară:</label>
                  <input
                    type="text"
                    name="tuition_fees"
                    value={editingProgram.tuition_fees}
                    onChange={(e) => setEditingProgram({
                      ...editingProgram,
                      tuition_fees: e.target.value
                    })}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Universitate:</label>
                  <select
                    name="university_id"
                    value={editingProgram.university_id}
                    onChange={(e) => setEditingProgram({
                      ...editingProgram,
                      university_id: e.target.value
                    })}
                    required
                    className="form-select"
                  >
                    <option value="">Selectează universitatea</option>
                    {universities.map(university => (
                      <option key={university.id} value={university.id}>
                        {university.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowEditProgramForm(false);
                    setEditingProgram(null);
                  }}
                >
                  Anulează
                </button>
                <button type="submit" className="confirm-button">
                  Salvează modificările
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramsTab;
