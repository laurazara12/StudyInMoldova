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
  const [sortBy, setSortBy] = useState('name');
  
  // Opțiuni pentru filtre
  const typeOptions = ['Public', 'Private'];
  const locationOptions = ['Chișinău', 'Bălți', 'Comrat', 'Tiraspol'];

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const data = await getAllUniversities();
      console.log('Date primite de la serviciu:', data);
      
      if (Array.isArray(data)) {
        // Verificăm și procesăm datele pentru a ne asigura că taxele sunt corecte
        const processedData = data.map(uni => ({
          ...uni,
          tuitionFees: {
            bachelor: uni.tuitionFees?.bachelor ? parseFloat(uni.tuitionFees.bachelor) : 0,
            master: uni.tuitionFees?.master ? parseFloat(uni.tuitionFees.master) : 0,
            phd: uni.tuitionFees?.phd ? parseFloat(uni.tuitionFees.phd) : 0
          }
        }));
        
        console.log('Date procesate pentru afișare:', processedData);
        setUniversities(processedData);
        setFilteredUniversities(processedData);
      } else {
        console.error('Date invalide primite:', data);
        setError('Formatul datelor primite este invalid');
      }
    } catch (error) {
      console.error('Eroare la încărcarea universităților:', error);
      setError('Nu s-au putut încărca universitățile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  // Filtrare și sortare universități
  useEffect(() => {
    if (!universities) return;

    let result = [...universities];
    
    // Filtrare după termen de căutare
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(uni => 
        uni.name?.toLowerCase().includes(searchLower) ||
        uni.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtrare după tip
    if (filterType) {
      result = result.filter(uni => uni.type === filterType);
    }
    
    // Filtrare după locație
    if (filterLocation) {
      result = result.filter(uni => uni.location === filterLocation);
    }
    
    // Sortare
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'type':
        result.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case 'location':
        result.sort((a, b) => a.location.localeCompare(b.location));
        break;
      case 'ranking':
        result.sort((a, b) => (a.ranking || 0) - (b.ranking || 0));
        break;
      case 'ranking_desc':
        result.sort((a, b) => (b.ranking || 0) - (a.ranking || 0));
        break;
      default:
        break;
    }
    
    setFilteredUniversities(result);
  }, [universities, searchTerm, filterType, filterLocation, sortBy]);

  const handleRetry = () => {
    setRetryCount(0);
    fetchUniversities();
  };

  if (loading) {
    return (
      <div className="universities-container">
        <Navbar />
        <div className="universities-loading">Se încarcă universitățile...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="universities-container">
        <Navbar />
        <div className="universities-error">
          <p>Eroare: {error}</p>
          <p>Vă rugăm să verificați conexiunea la internet și să reîncercați.</p>
          <button onClick={handleRetry} className="retry-button">
            Reîncearcă
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="universities-container">
      <Helmet>
        <title>Universități - Study In Moldova</title>
        <meta property="og:title" content="Universități - Study In Moldova" />
      </Helmet>
      <Navbar />
      <div className="universities-header">
        <h1 className="universities-title">Universități din Moldova</h1>
        <p className="universities-description">Descoperă universitățile de top din Moldova care oferă educație de calitate pentru studenții internaționali.</p>
      </div>
      <div className="universities-content">
        <FilterSection 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          filterLocation={filterLocation}
          setFilterLocation={setFilterLocation}
          sortBy={sortBy}
          setSortBy={setSortBy}
          typeOptions={typeOptions}
          locationOptions={locationOptions}
        />
        
        <div className="universities-grid">
          {filteredUniversities.length > 0 ? (
            filteredUniversities.map(university => (
              <UniversityPresentation 
                key={university.id} 
                university={university} 
              />
            ))
          ) : (
            <p>Nu s-au găsit universități care să corespundă criteriilor selectate.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Universities; 