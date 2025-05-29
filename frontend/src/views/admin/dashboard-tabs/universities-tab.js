import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../../../config/api.config';

const UniversitiesTab = () => {
  const [universities, setUniversities] = useState([]);
  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterRanking, setFilterRanking] = useState({ min: '', max: '' });
  const [filterTuitionFee, setFilterTuitionFee] = useState({ min: '', max: '' });
  const [filterUniversityDateRange, setFilterUniversityDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('name');
  const [showAddUniversityForm, setShowAddUniversityForm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [newUniversity, setNewUniversity] = useState({
    name: '',
    type: 'Public',
    description: '',
    location: '',
    imageUrl: '',
    website: '',
    ranking: '',
    tuitionFees: {
      bachelor: '',
      master: '',
      phd: ''
    },
    programs: [],
    contactInfo: {
      email: '',
      phone: '',
      address: ''
    }
  });

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    try {
      setLoading(true);
      console.log('Începe încărcarea universităților...');
      const response = await axios.get(`${API_BASE_URL}/api/universities`, {
        headers: getAuthHeaders()
      });
      
      console.log('Răspuns server universități:', response.data);
      
      if (!response.data) {
        throw new Error('Nu s-au primit date de la server');
      }

      let universitiesData;
      if (response.data.success && response.data.data) {
        universitiesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        universitiesData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        universitiesData = response.data.data;
      } else if (response.data.universities && Array.isArray(response.data.universities)) {
        universitiesData = response.data.universities;
      } else {
        console.error('Format invalid al datelor primite:', response.data);
        throw new Error('Format invalid al datelor primite');
      }

      console.log('Universități procesate:', universitiesData);
      setUniversities(universitiesData);
      setFilteredUniversities(universitiesData);
    } catch (error) {
      console.error('Eroare la încărcarea universităților:', error);
      setError('Eroare la încărcarea universităților: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUniversityInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewUniversity(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setNewUniversity(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddUniversity = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/universities`, newUniversity, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setUniversities(prev => [...prev, response.data.data]);
        setShowAddUniversityForm(false);
        setSuccessMessage('Universitatea a fost adăugată cu succes!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Eroare la adăugarea universității:', error);
      setError(error.response?.data?.message || 'Eroare la adăugarea universității');
    }
  };

  const handleEditUniversity = (university) => {
    setEditingUniversity(university);
    setIsModalOpen(true);
  };

  const handleDeleteUniversity = (universityId) => {
    setDeleteConfirmation(universityId);
  };

  const handleEditUniversityChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditingUniversity(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditingUniversity(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdateUniversity = async (e) => {
    e.preventDefault();
    try {
      console.log('Începe actualizarea universității:', editingUniversity);
      
      // Pregătim datele pentru actualizare
      const updateData = {
        name: editingUniversity.name,
        type: editingUniversity.type,
        description: editingUniversity.description || '',
        location: editingUniversity.location,
        image_url: editingUniversity.image_url || '',
        website: editingUniversity.website || '',
        ranking: editingUniversity.ranking || '',
        tuition_fees: {
          bachelor: editingUniversity.tuition_fees?.bachelor || null,
          master: editingUniversity.tuition_fees?.master || null,
          phd: editingUniversity.tuition_fees?.phd || null
        },
        contact_info: {
          email: editingUniversity.contact_info?.email || null,
          phone: editingUniversity.contact_info?.phone || null,
          address: editingUniversity.contact_info?.address || null
        }
      };

      console.log('Date trimise la server:', updateData);

      const response = await axios.put(
        `${API_BASE_URL}/api/universities/${editingUniversity.id}`,
        updateData,
        { 
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Răspuns server:', response.data);

      // Verificăm dacă răspunsul este un obiect valid
      if (response.data && typeof response.data === 'object') {
        await loadUniversities();
        setIsModalOpen(false);
        setEditingUniversity(null);
        setSuccessMessage('Universitatea a fost actualizată cu succes!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error('Format invalid al răspunsului de la server');
      }
    } catch (error) {
      console.error('Eroare detaliată la actualizarea universității:', error);
      const errorMessage = error.response?.data?.message || error.message || 'A apărut o eroare la actualizarea universității. Vă rugăm să încercați din nou.';
      setError(errorMessage);
      // Nu închidem modalul în caz de eroare
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUniversity(null);
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

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterLocation('');
    setFilterRanking({ min: '', max: '' });
    setFilterTuitionFee({ min: '', max: '' });
    setFilterUniversityDateRange({ start: '', end: '' });
    setSortBy('name');
  };

  const handleSearch = () => {
    const filtered = universities.filter(university => {
      const matchesSearch = searchTerm === '' || 
        university.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !filterType || university.type === filterType;
      const matchesLocation = !filterLocation || university.location === filterLocation;
      return matchesSearch && matchesType && matchesLocation;
    });
    setFilteredUniversities(filtered);
  };

  const handleOpenAddUniversityForm = () => {
    setShowAddUniversityForm(true);
  };

  return (
    <div className="universities-tab">
      <div className="filter-section universities-filter">
        <div className="filter-group">
          <label>Type:</label>
          <select 
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Location:</label>
          <select 
            className="filter-select"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          >
            <option value="">All Locations</option>
            <option value="Chișinău">Chișinău</option>
            <option value="Bălți">Bălți</option>
            <option value="Cahul">Cahul</option>
            <option value="Comrat">Comrat</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Ranking Range:</label>
          <div className="range-inputs">
            <input
              type="number"
              placeholder="Min"
              className="range-input"
              value={filterRanking.min}
              onChange={(e) => setFilterRanking({...filterRanking, min: e.target.value})}
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              className="range-input"
              value={filterRanking.max}
              onChange={(e) => setFilterRanking({...filterRanking, max: e.target.value})}
            />
          </div>
        </div>
        <div className="filter-group">
          <label>Tuition Fee Range:</label>
          <div className="range-inputs">
            <input
              type="number"
              placeholder="Min"
              className="range-input"
              value={filterTuitionFee.min}
              onChange={(e) => setFilterTuitionFee({...filterTuitionFee, min: e.target.value})}
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              className="range-input"
              value={filterTuitionFee.max}
              onChange={(e) => setFilterTuitionFee({...filterTuitionFee, max: e.target.value})}
            />
          </div>
        </div>
        <div className="filter-group">
          <label>Date:</label>
          <div className="date-range-inputs">
            <input
              type="date"
              className="date-input"
              value={filterUniversityDateRange.start}
              onChange={(e) => setFilterUniversityDateRange({...filterUniversityDateRange, start: e.target.value})}
            />
            <span>to</span>
            <input
              type="date"
              className="date-input"
              value={filterUniversityDateRange.end}
              onChange={(e) => setFilterUniversityDateRange({...filterUniversityDateRange, end: e.target.value})}
            />
          </div>
        </div>
        <div className="filter-group">
          <label>Sort:</label>
          <select 
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="location">Location (A-Z)</option>
            <option value="type">Type (A-Z)</option>
            <option value="ranking">Ranking (Low-High)</option>
            <option value="ranking_desc">Ranking (High-Low)</option>
            <option value="tuition">Tuition Fee (Low-High)</option>
            <option value="tuition_desc">Tuition Fee (High-Low)</option>
          </select>
        </div>
        <button 
          className="clear-filters-button"
          onClick={handleClearFilters}
        >
          Clear Filters
        </button>
        <button 
          className="search-button"
          onClick={handleSearch}
        >
          Caută
        </button>
      </div>

      <div className="dashboard-actions">
        <button className="btn1" onClick={handleOpenAddUniversityForm}>
          Add University
        </button>
      </div>

      {successMessage && (
        <div className="alert-success">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading universities...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={loadUniversities}
          >
            Reîncearcă
          </button>
        </div>
      ) : (
        <div className="dashboard-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Nume</th>
                <th>Tip</th>
                <th>Locație</th>
                <th>Ranking</th>
                <th>Taxe de școlarizare</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filteredUniversities.map(university => (
                <tr key={university.id}>
                  <td>{university.name || 'N/A'}</td>
                  <td>{university.type || 'N/A'}</td>
                  <td>{university.location || 'N/A'}</td>
                  <td>{university.ranking || 'N/A'}</td>
                  <td>
                    {(() => {
                      const fees = university.tuitionFees || university.tuition_fees || {};
                      return (
                        <div>
                          <div>Bachelor: {fees.bachelor ? `${fees.bachelor} EUR` : 'N/A'}</div>
                          <div>Master: {fees.master ? `${fees.master} EUR` : 'N/A'}</div>
                          <div>PhD: {fees.phd ? `${fees.phd} EUR` : 'N/A'}</div>
                        </div>
                      );
                    })()}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-grey"
                        onClick={() => handleEditUniversity(university)}
                      >
                        <i className="fas fa-edit"></i> Editează
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteUniversity(university.id)}
                      >
                        <i className="fas fa-trash"></i> Șterge
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddUniversityForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New University</h2>
            <form onSubmit={handleAddUniversity}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={newUniversity.name}
                  onChange={handleUniversityInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Type:</label>
                <select
                  name="type"
                  value={newUniversity.type}
                  onChange={handleUniversityInputChange}
                  required
                >
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={newUniversity.description}
                  onChange={handleUniversityInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Location:</label>
                <input
                  type="text"
                  name="location"
                  value={newUniversity.location}
                  onChange={handleUniversityInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Image URL:</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={newUniversity.imageUrl}
                  onChange={handleUniversityInputChange}
                  placeholder="URL or relative path (ex: /images/universities/example.jpg)"
                  required
                />
              </div>

              <div className="form-group">
                <label>Website:</label>
                <input
                  type="url"
                  name="website"
                  value={newUniversity.website}
                  onChange={handleUniversityInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ranking:</label>
                <input
                  type="text"
                  name="ranking"
                  value={newUniversity.ranking}
                  onChange={handleUniversityInputChange}
                />
              </div>

              <div className="form-group">
                <label>Tuition Fees:</label>
                <div className="nested-form-group">
                  <input
                    type="text"
                    name="tuitionFees.bachelor"
                    placeholder="Bachelor"
                    value={newUniversity.tuitionFees.bachelor}
                    onChange={handleUniversityInputChange}
                  />
                  <input
                    type="text"
                    name="tuitionFees.master"
                    placeholder="Master"
                    value={newUniversity.tuitionFees.master}
                    onChange={handleUniversityInputChange}
                  />
                  <input
                    type="text"
                    name="tuitionFees.phd"
                    placeholder="PhD"
                    value={newUniversity.tuitionFees.phd}
                    onChange={handleUniversityInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Contact Info:</label>
                <div className="nested-form-group">
                  <input
                    type="email"
                    name="contactInfo.email"
                    placeholder="Email"
                    value={newUniversity.contactInfo.email}
                    onChange={handleUniversityInputChange}
                  />
                  <input
                    type="tel"
                    name="contactInfo.phone"
                    placeholder="Phone"
                    value={newUniversity.contactInfo.phone}
                    onChange={handleUniversityInputChange}
                  />
                  <input
                    type="text"
                    name="contactInfo.address"
                    placeholder="Address"
                    value={newUniversity.contactInfo.address}
                    onChange={handleUniversityInputChange}
                  />
                </div>
              </div>

              <div className="modal-buttons">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowAddUniversityForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="confirm-button">
                  Add University
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Editare Universitate</h2>
              <button 
                className="close-button" 
                onClick={handleCloseModal}
              >×</button>
            </div>
            <div className="modal-body">
              {editingUniversity && (
                <form onSubmit={handleUpdateUniversity} className="university-form">
                  <div className="form-group">
                    <label>Nume:</label>
                    <input
                      type="text"
                      name="name"
                      value={editingUniversity.name || ''}
                      onChange={handleEditUniversityChange}
                      placeholder="Introduceți numele universității"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tip:</label>
                    <select
                      name="type"
                      value={editingUniversity.type || ''}
                      onChange={handleEditUniversityChange}
                      className="form-select"
                    >
                      <option value="">Selectați tipul</option>
                      <option value="Public">Public</option>
                      <option value="Private">Privat</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Descriere:</label>
                    <textarea
                      name="description"
                      value={editingUniversity.description || ''}
                      onChange={handleEditUniversityChange}
                      placeholder="Introduceți descrierea universității"
                      className="form-textarea"
                    />
                  </div>
                  <div className="form-group">
                    <label>Locație:</label>
                    <select
                      name="location"
                      value={editingUniversity.location || ''}
                      onChange={handleEditUniversityChange}
                      className="form-select"
                    >
                      <option value="">Selectați locația</option>
                      <option value="Chișinău">Chișinău</option>
                      <option value="Bălți">Bălți</option>
                      <option value="Cahul">Cahul</option>
                      <option value="Comrat">Comrat</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>URL Imagine:</label>
                    <input
                      type="text"
                      name="image_url"
                      value={editingUniversity.image_url || ''}
                      onChange={handleEditUniversityChange}
                      placeholder="Introduceți URL-ul imaginii"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Website:</label>
                    <input
                      type="url"
                      name="website"
                      value={editingUniversity.website || ''}
                      onChange={handleEditUniversityChange}
                      placeholder="Introduceți adresa website-ului"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Clasament:</label>
                    <input
                      type="text"
                      name="ranking"
                      value={editingUniversity.ranking || ''}
                      onChange={handleEditUniversityChange}
                      placeholder="Introduceți clasamentul"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Taxe de Studii:</label>
                    <div className="nested-form">
                      <div className="form-group">
                        <label>Licență:</label>
                        <input
                          type="text"
                          name="tuition_fees.bachelor"
                          value={editingUniversity.tuition_fees?.bachelor || ''}
                          onChange={handleEditUniversityChange}
                          placeholder="Introduceți taxa de studii pentru licență"
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Master:</label>
                        <input
                          type="text"
                          name="tuition_fees.master"
                          value={editingUniversity.tuition_fees?.master || ''}
                          onChange={handleEditUniversityChange}
                          placeholder="Introduceți taxa de studii pentru master"
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Doctorat:</label>
                        <input
                          type="text"
                          name="tuition_fees.phd"
                          value={editingUniversity.tuition_fees?.phd || ''}
                          onChange={handleEditUniversityChange}
                          placeholder="Introduceți taxa de studii pentru doctorat"
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Informații de Contact:</label>
                    <div className="nested-form">
                      <div className="form-group">
                        <label>Email:</label>
                        <input
                          type="email"
                          name="contact_info.email"
                          value={editingUniversity.contact_info?.email || ''}
                          onChange={handleEditUniversityChange}
                          placeholder="Introduceți adresa de email"
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Telefon:</label>
                        <input
                          type="text"
                          name="contact_info.phone"
                          value={editingUniversity.contact_info?.phone || ''}
                          onChange={handleEditUniversityChange}
                          placeholder="Introduceți numărul de telefon"
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Adresă:</label>
                        <input
                          type="text"
                          name="contact_info.address"
                          value={editingUniversity.contact_info?.address || ''}
                          onChange={handleEditUniversityChange}
                          placeholder="Introduceți adresa"
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-button" 
                      onClick={handleCloseModal}
                    >
                      Anulează
                    </button>
                    <button 
                      type="submit" 
                      className="save-button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleUpdateUniversity(e);
                      }}
                    >
                      Salvează
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversitiesTab;
