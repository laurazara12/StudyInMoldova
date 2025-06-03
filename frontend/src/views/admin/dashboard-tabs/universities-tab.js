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
  const [viewingUniversity, setViewingUniversity] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
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
      console.log('Loading universities...');
      const response = await axios.get(`${API_BASE_URL}/api/universities`, {
        headers: getAuthHeaders()
      });
      
      console.log('Server response universities:', response.data);
      
      if (!response.data) {
        throw new Error('No data received from server');
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
        console.error('Invalid data format received:', response.data);
        throw new Error('Invalid data format received');
      }

      console.log('Processed universities:', universitiesData);
      setUniversities(universitiesData);
      setFilteredUniversities(universitiesData);
    } catch (error) {
      console.error('Error loading universities:', error);
      setError('Error loading universities: ' + error.message);
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
      // Pregătim datele pentru trimitere
      const universityData = {
        ...newUniversity,
        tuitionFees: {
          bachelor: newUniversity.tuitionFees.bachelor || null,
          master: newUniversity.tuitionFees.master || null,
          phd: newUniversity.tuitionFees.phd || null
        }
      };

      console.log('Sending university data:', universityData);

      const response = await axios.post(`${API_BASE_URL}/api/universities`, universityData, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setUniversities(prev => [...prev, response.data.data]);
        setShowAddUniversityForm(false);
        setNewUniversity({
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
        setSuccessMessage('University was successfully added!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error adding university:', error);
      setError(error.response?.data?.message || 'Error adding university');
    }
  };

  const handleEditUniversity = (university) => {
    setEditingUniversity(university);
    setIsModalOpen(true);
  };

  const handleDeleteUniversity = (universityId) => {
    setDeleteConfirmation(universityId);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/universities/${deleteConfirmation}`, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        await loadUniversities();
        setSuccessMessage('University was successfully deleted!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response.data.message || 'Error deleting university');
      }
    } catch (error) {
      console.error('Error deleting university:', error);
      if (error.response?.data?.message?.includes('foreign key constraint')) {
        setError('Cannot delete the university because it has associated programs. Please delete the programs first.');
      } else {
        setError(error.response?.data?.message || 'Error deleting university');
      }
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation(null);
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
      console.log('Starting university update:', editingUniversity);
      
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

      console.log('Data sent to server:', updateData);

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

      console.log('Server response:', response.data);

      if (response.data && typeof response.data === 'object') {
        await loadUniversities();
        setIsModalOpen(false);
        setEditingUniversity(null);
        setSuccessMessage('University was successfully updated!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error('Invalid server response format');
      }
    } catch (error) {
      console.error('Detailed error updating university:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while updating the university. Please try again.';
      setError(errorMessage);
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
        university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        university.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !filterType || university.type === filterType;
      const matchesLocation = !filterLocation || university.location === filterLocation;
      return matchesSearch && matchesType && matchesLocation;
    });
    setFilteredUniversities(filtered);
  };

  const handleOpenAddUniversityForm = () => {
    setShowAddUniversityForm(true);
  };

  const handleViewUniversity = (university) => {
    setViewingUniversity(university);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingUniversity(null);
  };

  return (
    <div className="universities-tab">
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
            Search
          </button>
        </div>
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
            Retry
          </button>
        </div>
      ) : (
        <div className="dashboard-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Location</th>
                <th>Ranking</th>
                <th>Tuition Fees</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUniversities.map(university => (
                <tr key={university.id}>
                  <td>{university.name || 'N/A'}</td>
                  <td>{university.type || 'N/A'}</td>
                  <td>{university.location || 'N/A'}</td>
                  <td>
                    {(() => {
                      const truncateText = (text) => {
                        if (!text) return 'N/A';
                        return text.length > 15 ? `${text.substring(0, 15)}...` : text;
                      };
                      return truncateText(university.ranking);
                    })()}
                  </td>
                  <td>
                    {(() => {
                      const fees = university.tuitionFees || university.tuition_fees || {};
                      const truncateText = (text) => {
                        if (!text) return 'N/A';
                        return text.length > 15 ? `${text.substring(0, 15)}...` : text;
                      };
                      return (
                        <div>
                          <div>Bachelor: {truncateText(fees.bachelor)}</div>
                          <div>Master: {truncateText(fees.master)}</div>
                          <div>PhD: {truncateText(fees.phd)}</div>
                        </div>
                      );
                    })()}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn1"
                        onClick={() => handleViewUniversity(university)}
                      >
                        <i className="fas fa-eye"></i> View
                      </button>
                      <button 
                        className="btn-grey"
                        onClick={() => handleEditUniversity(university)}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteUniversity(university.id)}
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

      {showAddUniversityForm && (
        <div className="modal-overlay">
          <div className="modal-content program-modal">
            <h2>Add New University</h2>
            <form onSubmit={handleAddUniversity}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={newUniversity.name}
                    onChange={handleUniversityInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Type:</label>
                  <select
                    name="type"
                    value={newUniversity.type}
                    onChange={handleUniversityInputChange}
                    className="form-select"
                    required
                  >
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location:</label>
                  <select
                    name="location"
                    value={newUniversity.location}
                    onChange={handleUniversityInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Location</option>
                    <option value="Chișinău">Chișinău</option>
                    <option value="Bălți">Bălți</option>
                    <option value="Cahul">Cahul</option>
                    <option value="Comrat">Comrat</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ranking:</label>
                  <input
                    type="text"
                    name="ranking"
                    value={newUniversity.ranking}
                    onChange={handleUniversityInputChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Image URL:</label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={newUniversity.imageUrl}
                    onChange={handleUniversityInputChange}
                    className="form-input"
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
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tuition Fees (Bachelor):</label>
                  <input
                    type="text"
                    name="tuitionFees.bachelor"
                    placeholder="Bachelor"
                    value={newUniversity.tuitionFees.bachelor}
                    onChange={handleUniversityInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Tuition Fees (Master):</label>
                  <input
                    type="text"
                    name="tuitionFees.master"
                    placeholder="Master"
                    value={newUniversity.tuitionFees.master}
                    onChange={handleUniversityInputChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tuition Fees (PhD):</label>
                  <input
                    type="text"
                    name="tuitionFees.phd"
                    placeholder="PhD"
                    value={newUniversity.tuitionFees.phd}
                    onChange={handleUniversityInputChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Email:</label>
                  <input
                    type="email"
                    name="contactInfo.email"
                    placeholder="Email"
                    value={newUniversity.contactInfo.email}
                    onChange={handleUniversityInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Contact Phone:</label>
                  <input
                    type="tel"
                    name="contactInfo.phone"
                    placeholder="Phone"
                    value={newUniversity.contactInfo.phone}
                    onChange={handleUniversityInputChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Contact Address:</label>
                <input
                  type="text"
                  name="contactInfo.address"
                  placeholder="Address"
                  value={newUniversity.contactInfo.address}
                  onChange={handleUniversityInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={newUniversity.description}
                  onChange={handleUniversityInputChange}
                  className="form-textarea"
                  rows="4"
                  required
                />
              </div>

              <div className="modal-buttons">
                <button 
                  type="button" 
                  className="btn-grey-2"
                  onClick={() => setShowAddUniversityForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn1">
                  Add University
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content program-modal">
            <h2>Edit University</h2>
            {editingUniversity && (
              <form onSubmit={handleUpdateUniversity} className="program-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={editingUniversity.name || ''}
                      onChange={handleEditUniversityChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Type:</label>
                    <select
                      name="type"
                      value={editingUniversity.type || ''}
                      onChange={handleEditUniversityChange}
                      className="form-select"
                    >
                      <option value="">Select Type</option>
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Location:</label>
                    <select
                      name="location"
                      value={editingUniversity.location || ''}
                      onChange={handleEditUniversityChange}
                      className="form-select"
                    >
                      <option value="">Select Location</option>
                      <option value="Chișinău">Chișinău</option>
                      <option value="Bălți">Bălți</option>
                      <option value="Cahul">Cahul</option>
                      <option value="Comrat">Comrat</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Ranking:</label>
                    <input
                      type="text"
                      name="ranking"
                      value={editingUniversity.ranking || ''}
                      onChange={handleEditUniversityChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Image URL:</label>
                    <input
                      type="text"
                      name="image_url"
                      value={editingUniversity.image_url || ''}
                      onChange={handleEditUniversityChange}
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
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tuition Fees (Bachelor):</label>
                    <input
                      type="text"
                      name="tuition_fees.bachelor"
                      value={editingUniversity.tuition_fees?.bachelor || ''}
                      onChange={handleEditUniversityChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tuition Fees (Master):</label>
                    <input
                      type="text"
                      name="tuition_fees.master"
                      value={editingUniversity.tuition_fees?.master || ''}
                      onChange={handleEditUniversityChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tuition Fees (PhD):</label>
                    <input
                      type="text"
                      name="tuition_fees.phd"
                      value={editingUniversity.tuition_fees?.phd || ''}
                      onChange={handleEditUniversityChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Email:</label>
                    <input
                      type="email"
                      name="contact_info.email"
                      value={editingUniversity.contact_info?.email || ''}
                      onChange={handleEditUniversityChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Phone:</label>
                    <input
                      type="text"
                      name="contact_info.phone"
                      value={editingUniversity.contact_info?.phone || ''}
                      onChange={handleEditUniversityChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Contact Address:</label>
                  <input
                    type="text"
                    name="contact_info.address"
                    value={editingUniversity.contact_info?.address || ''}
                    onChange={handleEditUniversityChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    name="description"
                    value={editingUniversity.description || ''}
                    onChange={handleEditUniversityChange}
                    className="form-textarea"
                    rows="4"
                  />
                </div>

                <div className="modal-buttons">
                  <button 
                    type="button" 
                    className="btn-grey-2"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn1">
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {isViewModalOpen && viewingUniversity && (
        <div className="modal-overlay">
          <div className="modal-content program-modal">
            <h2>University Details</h2>
            <div className="university-details">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{viewingUniversity.name || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{viewingUniversity.type || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{viewingUniversity.location || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Ranking:</span>
                  <span className="detail-value">{viewingUniversity.ranking || 'N/A'}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Contact Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{viewingUniversity.contact_info?.email || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{viewingUniversity.contact_info?.phone || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{viewingUniversity.contact_info?.address || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Website:</span>
                  <span className="detail-value">
                    {viewingUniversity.website ? (
                      <a href={viewingUniversity.website} target="_blank" rel="noopener noreferrer">
                        {viewingUniversity.website}
                      </a>
                    ) : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Tuition Fees</h3>
                <div className="detail-row">
                  <span className="detail-label">Bachelor:</span>
                  <span className="detail-value">
                    {viewingUniversity.tuition_fees?.bachelor ? `${viewingUniversity.tuition_fees.bachelor} EUR` : 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Master:</span>
                  <span className="detail-value">
                    {viewingUniversity.tuition_fees?.master ? `${viewingUniversity.tuition_fees.master} EUR` : 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">PhD:</span>
                  <span className="detail-value">
                    {viewingUniversity.tuition_fees?.phd ? `${viewingUniversity.tuition_fees.phd} EUR` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Description</h3>
                <div className="detail-description">
                  {viewingUniversity.description || 'No description available'}
                </div>
              </div>

              {viewingUniversity.image_url && (
                <div className="detail-section">
                  <h3>University Image</h3>
                  <div className="university-image">
                    <img 
                      src={viewingUniversity.image_url} 
                      alt={`${viewingUniversity.name} campus`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/placeholder-university.jpg';
                      }}
                    />
                  </div>
                </div>
              )}
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
            <h2>Delete Confirmation</h2>
            <p>Are you sure you want to delete this university? This action will also delete all associated programs.</p>
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

export default UniversitiesTab;
