import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import FilterSection from './components/filter-section';
import UniversityPresentation from './university-presentation';
import { getAllUniversities } from '../../services/universityService';
import './universities.css';

const Universities = () => {
  const { t, i18n } = useTranslation(['universities', 'common']);
  const [universities, setUniversities] = useState([]);
  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // State pentru filtre
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
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
      
      if (!Array.isArray(data)) {
        console.error('Invalid data', data);
        setError('Invalid data format');
        setUniversities([]);
        setFilteredUniversities([]);
        return;
      }
      
      const processedData = data.map(uni => {
        const tuitionFees = uni.tuition_fees || {};
        const processedFees = {
          bachelor: tuitionFees.bachelor || '',
          master: tuitionFees.master || '',
          phd: tuitionFees.phd || ''
        };
        
        return {
          ...uni,
          tuition_fees: processedFees
        };
      });
      
      console.log('Processed data for display:', processedData);
      setUniversities(processedData);
      setFilteredUniversities(processedData);
    } catch (error) {
      console.error('Error loading universities:', error);
      setError(error.message || 'Could not load universities');
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
        default:
          return 0;
      }
    });

    setFilteredUniversities(filtered);
  }, [universities, searchTerm, filterType, filterLocation, filterDateRange, sortBy]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchUniversities();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterLocation('');
    setSortBy('name');
  };

  if (loading) {
    return (
      <div className="universities-container">
        <Navbar />
        <div className="universities-loading">
          <p>{t('universities:loading')}</p>
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
          <p>{t('universities:error.title')}: {error}</p>
          <p>{t('universities:error.message')}</p>
          <button onClick={handleRetry} className="retry-button">
            {t('universities:error.retry')}
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="universities-container">
      <Helmet>
        <title>{t('universities:title')} - Study In Moldova</title>
        <meta property="og:title" content={`${t('universities:title')} - Study In Moldova`} />
      </Helmet>
      <Navbar />
      <div className="universities-header">
        <h1>{t('universities:title')}</h1>
        <p className="universities-description">{t('universities:description')}</p>
      </div>
      <div className="universities-content">
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
        <div className="filter-section universities-filter">
          
          <div className="filter-group">
            <label>{t('universities:filters.type')}:</label>
            <select 
              className="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">{t('universities:filters.allTypes')}</option>
              <option value="public">{t('universities:filters.public')}</option>
              <option value="private">{t('universities:filters.private')}</option>
            </select>
          </div>
          <div className="filter-group">
            <label>{t('universities:filters.location')}:</label>
            <select 
              className="filter-select"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            >
              <option value="">{t('universities:filters.allLocations')}</option>
              <option value="Chișinău">Chișinău</option>
              <option value="Bălți">Bălți</option>
              <option value="Cahul">Cahul</option>
              <option value="Comrat">Comrat</option>
            </select> 
          </div>
        
        
          <div className="filter-group">
            <label>{t('universities:filters.sort')}:</label>
            <select 
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">{t('universities:filters.sortOptions.nameAZ')}</option>
              <option value="name_desc">{t('universities:filters.sortOptions.nameZA')}</option>
              <option value="location">{t('universities:filters.sortOptions.locationAZ')}</option>
              <option value="type">{t('universities:filters.sortOptions.typeAZ')}</option>
            </select>
          </div>
          <button 
            className="clear-filters-button"
            onClick={handleClearFilters}
          >
            {t('universities:filters.clearFilters')}
          </button>
          <button 
            className=" clear-filters-button"
            onClick={() => setFilteredUniversities([...filteredUniversities])}
          >
            {t('universities:filters.search')}
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
            <p>{t('universities:noResults')}</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Universities; 