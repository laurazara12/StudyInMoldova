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
  const [viewingProgram, setViewingProgram] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [newProgram, setNewProgram] = useState({
    name: '',
    description: '',
    university_id: '',
    duration: '',
    degree: '',
    language: '',
    tuition_fee: '',
    start_date: '',
    application_deadline: '',
    faculty: '',
    credits: ''
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
      console.log('Loading programs...');
      const response = await axios.get(`${API_BASE_URL}/api/programs`, {
        headers: getAuthHeaders()
      });
      
      console.log('Server response programs:', response.data);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      let programsData;
      if (Array.isArray(response.data)) {
        programsData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        programsData = response.data.data;
      } else if (response.data.programs && Array.isArray(response.data.programs)) {
        programsData = response.data.programs;
      } else {
        throw new Error('Invalid data format received');
      }

      console.log('Processed programs:', programsData);
      setPrograms(programsData);
      setFilteredPrograms(programsData);
    } catch (error) {
      console.error('Error loading programs:', error);
      setError('Error loading programs: ' + error.message);
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
      console.error('Error loading universities:', error);
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
      application_deadline: '',
      faculty: '',
      credits: ''
    });
  };

  const handleCloseAddProgramForm = () => {
    setShowAddProgramForm(false);
  };

  const handleAddProgram = async (e) => {
    e.preventDefault();
    try {
      const programData = {
        name: newProgram.name,
        description: newProgram.description,
        university_id: newProgram.university_id,
        degree_type: newProgram.degree,
        language: newProgram.language,
        duration: `${newProgram.duration} years`,
        tuition_fees: newProgram.tuition_fee,
        start_date: newProgram.start_date ? new Date(newProgram.start_date).toISOString().split('T')[0] : null,
        application_deadline: newProgram.application_deadline ? new Date(newProgram.application_deadline).toISOString().split('T')[0] : null,
        faculty: newProgram.faculty,
        credits: newProgram.credits
      };

      console.log('Data sent for creation:', programData);

      const response = await axios.post(`${API_BASE_URL}/api/programs`, programData, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        await loadPrograms();
        handleCloseAddProgramForm();
        setSuccessMessage('Program was successfully added!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response.data.message || 'Error adding program');
      }
    } catch (error) {
      console.error('Error adding program:', error);
      setError(error.response?.data?.message || 'Error adding program');
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

  const handleDeleteProgram = (programId) => {
    setDeleteConfirmation(programId);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/programs/${deleteConfirmation}`, {
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
      console.error('Error deleting program:', error);
      setError(error.response?.data?.message || 'Eroare la ștergerea programului');
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleUpdateProgram = async (e) => {
    e.preventDefault();
    try {
      // Validare și conversie sigură pentru date
      const getValidDate = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
      };
      const updatedData = {
        name: editingProgram.name,
        description: editingProgram.description,
        university_id: editingProgram.university_id,
        degree_type: editingProgram.degree_type,
        faculty: editingProgram.faculty,
        credits: editingProgram.credits,
        language: editingProgram.language,
        duration: editingProgram.duration?.years ? `${editingProgram.duration.years} years` : editingProgram.duration,
        tuition_fees: editingProgram.tuition_fees,
        start_date: getValidDate(editingProgram.start_date),
        application_deadline: getValidDate(editingProgram.application_deadline)
      };

      console.log('Data sent for update:', updatedData);

      const response = await axios.put(
        `${API_BASE_URL}/api/programs/${editingProgram.id}`,
        updatedData,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        await loadPrograms();
        setShowEditProgramForm(false);
        setEditingProgram(null);
        setSuccessMessage('Program was successfully updated!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response.data.message || 'Error updating program');
      }
    } catch (error) {
      console.error('Error updating program:', error);
      setError(error.response?.data?.message || 'An error occurred while updating the program. Please try again.');
    }
  };

  const handleEditProgramChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditingProgram(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditingProgram(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSearch = () => {
    const filtered = programs.filter(program => {
      const matchesSearch = searchTerm === '' || 
        program.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDegree = filterDegree === 'all' || program.degree_type === filterDegree;
      const matchesLanguage = !filterLanguage || program.language === filterLanguage;
      const matchesTuitionFee = (!filterTuitionFee.min || program.tuition_fees >= filterTuitionFee.min) &&
                               (!filterTuitionFee.max || program.tuition_fees <= filterTuitionFee.max);
      return matchesSearch && matchesDegree && matchesLanguage && matchesTuitionFee;
    });
    setFilteredPrograms(filtered);
  };

  const handleViewProgram = (program) => {
    setViewingProgram(program);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingProgram(null);
  };

  return (
    <div className="programs-tab">
      <div className="dashboard-filters">
        <div className="search-box">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-section programs-filter">
          <div className="filter-group">
            <label>Degree:</label>
            <select
              value={filterDegree}
              onChange={(e) => setFilterDegree(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Degrees</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Master">Master</option>
              <option value="PhD">PhD</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Language:</label>
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
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
              setFilterDegree('all');
              setFilterLanguage('');
              setFilterTuitionFee({ min: '', max: '' });
              setFilteredPrograms(programs);
            }}
          >
            Reset Filters
          </button>
          <button 
            className="clear-filters-button"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>

      <div className="dashboard-actions">
        <button 
          className="btn1"
          onClick={handleOpenAddProgramForm}
        >
          Add Program
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
          <p>Loading programs...</p>
        </div>
      ) : (
        <div className="programs-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Degree</th>
                <th>Duration</th>
                <th>Language</th>
                <th>Tuition Fee</th>
                <th>University</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrograms.map(program => (
                <tr key={program.id}>
                  <td>{program.id}</td>
                  <td>
                    <div style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '200px'}}>
                      {program.name || 'N/A'}
                    </div>
                  </td>
                  <td>{program.degree_type || program.degree || 'N/A'}</td>
                  <td>{program.duration || 'N/A'}</td>
                  <td>{program.language === 'Ro' ? 'Romanian' : 
                       program.language === 'En' ? 'English' : 
                       program.language === 'Ru' ? 'Russian' : 
                       program.language === 'Fr' ? 'French' : 
                       program.language || 'N/A'}</td>
                  <td>{program.tuition_fees || 'N/A'}</td>
                  <td>{program.university?.name
  ? program.university.name.length > 25
    ? program.university.name.slice(0, 25) + '...'
    : program.university.name
  : 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn1"
                        onClick={() => handleViewProgram(program)}
                      >
                        <i className="fas fa-eye"></i> View
                      </button>
                      <button 
                        onClick={() => handleEditProgram(program)} 
                        className="btn1"
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteProgram(program.id)} 
                        className="btn-delete"
                      >
                        <i className="fas fa-trash"></i> Delete
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
        <div className="modal-overlay">
          <div className="modal-content program-modal">
            <button className="close-button" style={{position: 'absolute', top: 10, right: 10}} onClick={handleCloseAddProgramForm} aria-label="Close">×</button>
            <h2>Add New Program</h2>
            <form onSubmit={handleAddProgram}>
              <div className="form-row">
                <div className="form-group">
                  <label>Program Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={newProgram.name}
                    onChange={handleNewProgramChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>University:</label>
                  <select
                    name="university_id"
                    value={newProgram.university_id}
                    onChange={handleNewProgramChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select University</option>
                    {universities.map(uni => (
                      <option key={uni.id} value={uni.id}>{uni.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Degree:</label>
                  <select
                    name="degree"
                    value={newProgram.degree}
                    onChange={handleNewProgramChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Degree</option>
                    <option value="Bachelor">Bachelor</option>
                    <option value="Master">Master</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tuition Fee (EUR):</label>
                  <input
                    type="number"
                    name="tuition_fee"
                    value={newProgram.tuition_fee}
                    onChange={handleNewProgramChange}
                    className="form-input"
                    placeholder="Enter amount in EUR"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration (years):</label>
                  <input
                    type="number"
                    name="duration"
                    value={newProgram.duration}
                    onChange={handleNewProgramChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Language:</label>
                  <select
                    name="language"
                    value={newProgram.language}
                    onChange={handleNewProgramChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Language</option>
                    <option value="Romanian">Romanian</option>
                    <option value="English">English</option>
                    <option value="Russian">Russian</option>
                    <option value="French">French</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Faculty:</label>
                  <input
                    type="text"
                    name="faculty"
                    value={newProgram.faculty}
                    onChange={handleNewProgramChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Credits:</label>
                  <input
                    type="number"
                    name="credits"
                    value={newProgram.credits}
                    onChange={handleNewProgramChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date:</label>
                  <input
                    type="date"
                    name="start_date"
                    value={newProgram.start_date}
                    onChange={handleNewProgramChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Application Deadline:</label>
                  <input
                    type="date"
                    name="application_deadline"
                    value={newProgram.application_deadline}
                    onChange={handleNewProgramChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={newProgram.description}
                  onChange={handleNewProgramChange}
                  className="form-textarea"
                  rows="4"
                />
              </div>

              <div className="modal-buttons">
                <button type="button" onClick={handleCloseAddProgramForm} className="btn-grey-2">Cancel</button>
                <button type="submit" className="btn1">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditProgramForm && editingProgram && (
        <div className="modal-overlay">
          <div className="modal-content program-modal">
            <button className="close-button" style={{position: 'absolute', top: 10, right: 10}} onClick={() => { setShowEditProgramForm(false); setEditingProgram(null); }} aria-label="Close">×</button>
            <h2>Edit Program</h2>
            <form onSubmit={handleUpdateProgram} className="program-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Program Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={editingProgram.name || ''}
                    onChange={handleEditProgramChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Degree:</label>
                  <select
                    name="degree_type"
                    value={editingProgram.degree_type || ''}
                    onChange={handleEditProgramChange}
                    className="form-select"
                  >
                    <option value="">Select Degree</option>
                    <option value="Bachelor">Bachelor</option>
                    <option value="Master">Master</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Faculty:</label>
                  <input
                    type="text"
                    name="faculty"
                    value={editingProgram.faculty || ''}
                    onChange={handleEditProgramChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Credits:</label>
                  <input
                    type="text"
                    name="credits"
                    value={editingProgram.credits || ''}
                    onChange={handleEditProgramChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration (years):</label>
                  <input
                    type="text"
                    name="duration"
                    value={editingProgram.duration || ''}
                    onChange={handleEditProgramChange}
                    className="form-input"
                    placeholder="ex: 3 years"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Language:</label>
                  <select
                    name="language"
                    value={editingProgram.language || ''}
                    onChange={handleEditProgramChange}
                    className="form-select"
                  >
                    <option value="">Select Language</option>
                    <option value="Romanian">Romanian</option>
                    <option value="English">English</option>
                    <option value="Russian">Russian</option>
                    <option value="French">French</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={editingProgram.description || ''}
                  onChange={handleEditProgramChange}
                  className="form-textarea"
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tuition Fee:</label>
                  <input
                    type="text"
                    name="tuition_fees"
                    value={editingProgram.tuition_fees || ''}
                    onChange={handleEditProgramChange}
                    className="form-input"
                    placeholder="ex: 2000 EUR/year"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date:</label>
                  <input
                    type="date"
                    name="start_date"
                    value={editingProgram.start_date || ''}
                    onChange={handleEditProgramChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Application Deadline:</label>
                  <input
                    type="date"
                    name="application_deadline"
                    value={editingProgram.application_deadline || ''}
                    onChange={handleEditProgramChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>University:</label>
                  <select
                    name="university_id"
                    value={editingProgram.university_id || ''}
                    onChange={handleEditProgramChange}
                    className="form-select"
                  >
                    <option value="">Select University</option>
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
                  className="btn-grey-2"
                  onClick={() => {
                    setShowEditProgramForm(false);
                    setEditingProgram(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn1">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewModalOpen && viewingProgram && (
        <div className="modal-overlay">
          <div className="modal-content program-modal">
            <button className="close-button" style={{position: 'absolute', top: 10, right: 10}} onClick={handleCloseViewModal} aria-label="Close">×</button>
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
                  <span className="detail-value">
                    {viewingProgram.language === 'Ro' ? 'Romanian' : 
                     viewingProgram.language === 'En' ? 'English' : 
                     viewingProgram.language === 'Ru' ? 'Russian' : 
                     viewingProgram.language === 'Fr' ? 'French' : 
                     viewingProgram.language || 'N/A'}
                  </span>
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
                  <span className="detail-value">
                    {viewingProgram.start_date ? new Date(viewingProgram.start_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Application Deadline:</span>
                  <span className="detail-value">
                    {viewingProgram.application_deadline ? new Date(viewingProgram.application_deadline).toLocaleDateString() : 'N/A'}
                  </span>
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
                onClick={handleCloseViewModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirm delete</h2>
            <p>Are you sure you want to delete this program? This action will also delete all associated applications.</p>
            <div className="modal-buttons">
              <button 
                className="btn-grey-2"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <button 
                className="btn-delete"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramsTab;
