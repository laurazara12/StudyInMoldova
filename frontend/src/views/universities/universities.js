import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import FilterSection from '../../components/filter-section';
import UniversityPresentation from './components/university-presentation';
import { getAllUniversities } from '../../services/universityService';
import './universities.css';

const Universities = () => {
  const [universities, setUniversities] = useState([]);
  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // State pentru filtre
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterRanking, setFilterRanking] = useState({ min: '', max: '' });
  const [filterTuitionFee, setFilterTuitionFee] = useState({ min: '', max: '' });
  const [filterDateRange, setFilterDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('name');
  
  // Opțiuni pentru filtre
  const typeOptions = ['Public', 'Private'];
  const locationOptions = ['Chișinău', 'Bălți', 'Cahul', 'Comrat'];

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getAllUniversities();
      console.log('Date primite de la serviciu:', data);
      
      if (!Array.isArray(data)) {
        console.error('Date invalide primite:', data);
        setError('Formatul datelor primite este invalid');
        setUniversities([]);
        setFilteredUniversities([]);
        return;
      }
      
      const processedData = data.map(uni => {
        const tuitionFees = uni.tuition_fees || {};
        const processedFees = {
          bachelor: typeof tuitionFees.bachelor === 'number' ? tuitionFees.bachelor : 
                   tuitionFees.bachelor ? parseFloat(tuitionFees.bachelor) : null,
          master: typeof tuitionFees.master === 'number' ? tuitionFees.master :
                 tuitionFees.master ? parseFloat(tuitionFees.master) : null,
          phd: typeof tuitionFees.phd === 'number' ? tuitionFees.phd :
               tuitionFees.phd ? parseFloat(tuitionFees.phd) : null
        };
        
        return {
          ...uni,
          tuition_fees: processedFees
        };
      });
      
      console.log('Date procesate pentru afișare:', processedData);
      setUniversities(processedData);
      setFilteredUniversities(processedData);
    } catch (error) {
      console.error('Eroare la încărcarea universităților:', error);
      setError(error.message || 'Nu s-au putut încărca universitățile');
      setUniversities([]);
      setFilteredUniversities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    let filtered = [...universities];


    if (searchTerm) {
      filtered = filtered.filter(uni => 
        uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType) {
      filtered = filtered.filter(uni => uni.type.toLowerCase() === filterType.toLowerCase());
    }

    if (filterLocation) {
      filtered = filtered.filter(uni => uni.location === filterLocation);
    }

    // Filtrare după ranking
    if (filterRanking.min) {
      filtered = filtered.filter(uni => uni.ranking >= parseInt(filterRanking.min));
    }
    if (filterRanking.max) {
      filtered = filtered.filter(uni => uni.ranking <= parseInt(filterRanking.max));
    }

    // Filtrare după taxe de studii
    if (filterTuitionFee.min) {
      filtered = filtered.filter(uni => {
        const fees = uni.tuition_fees || {};
        return (fees.bachelor >= parseInt(filterTuitionFee.min) ||
                fees.master >= parseInt(filterTuitionFee.min) ||
                fees.phd >= parseInt(filterTuitionFee.min));
      });
    }
    if (filterTuitionFee.max) {
      filtered = filtered.filter(uni => {
        const fees = uni.tuition_fees || {};
        return (fees.bachelor <= parseInt(filterTuitionFee.max) ||
                fees.master <= parseInt(filterTuitionFee.max) ||
                fees.phd <= parseInt(filterTuitionFee.max));
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'location':
          return a.location.localeCompare(b.location);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'ranking':
          return (a.ranking || 0) - (b.ranking || 0);
        case 'ranking_desc':
          return (b.ranking || 0) - (a.ranking || 0);
        case 'tuition':
          return ((a.tuition_fees?.bachelor || 0) - (b.tuition_fees?.bachelor || 0));
        case 'tuition_desc':
          return ((b.tuition_fees?.bachelor || 0) - (a.tuition_fees?.bachelor || 0));
        default:
          return 0;
      }
    });

    setFilteredUniversities(filtered);
  }, [universities, searchTerm, filterType, filterLocation, filterRanking, filterTuitionFee, filterDateRange, sortBy]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchUniversities();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterLocation('');
    setFilterRanking({ min: '', max: '' });
    setFilterTuitionFee({ min: '', max: '' });
    setFilterDateRange({ start: '', end: '' });
    setSortBy('name');
  };

  if (loading) {
    return (
      <div className="universities-container">
        <Navbar />
        <div className="universities-loading">
          <p>Loading universities...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="universities-container">
        <Navbar />
        <div className="universities-error">
          <p>Error: {error}</p>
          <p>Please check your internet connection and try again.</p>
          <button onClick={handleRetry} className="retry-button">
            Retry
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="universities-container">
      <Helmet>
        <title>Universities - Study In Moldova</title>
        <meta property="og:title" content="Universities - Study In Moldova" />
      </Helmet>
      <Navbar />
      <div className="universities-header">
        <h1>Universities in Moldova</h1>
        <p className="universities-description">Discover top universities in Moldova offering quality education for international students.</p>
      </div>
      <div className="universities-content">
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
                value={filterDateRange.start}
                onChange={(e) => setFilterDateRange({...filterDateRange, start: e.target.value})}
              />
              <span>to</span>
              <input
                type="date"
                className="date-input"
                value={filterDateRange.end}
                onChange={(e) => setFilterDateRange({...filterDateRange, end: e.target.value})}
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
            onClick={() => setFilteredUniversities([...filteredUniversities])}
          >
            Search
          </button>
        </div>
        
        <div className="universities-grid">
          {filteredUniversities.length > 0 ? (
            filteredUniversities.map(university => (
              <UniversityPresentation 
                key={university.id} 
                university={university} 
              />
            ))
          ) : (
            <p>No universities found matching the selected criteria.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Universities; 