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
      
      // Verificăm și procesăm datele pentru a ne asigura că taxele sunt corecte
      const processedData = data.map(uni => {
        // Convertim taxele la numere dacă nu sunt deja
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

    // Aplicăm filtrele
    if (searchTerm) {
      filtered = filtered.filter(uni => 
        uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType) {
      filtered = filtered.filter(uni => uni.type === filterType);
    }

    if (filterLocation) {
      filtered = filtered.filter(uni => uni.location === filterLocation);
    }

    // Aplicăm sortarea
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'location':
          return a.location.localeCompare(b.location);
        default:
          return 0;
      }
    });

    setFilteredUniversities(filtered);
  }, [universities, searchTerm, filterType, filterLocation, sortBy]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchUniversities();
  };

  if (loading) {
    return (
      <div className="universities-container">
        <Navbar />
        <div className="universities-loading">
          <p>Se încarcă universitățile...</p>
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
        <h1>Universități din Moldova</h1>
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