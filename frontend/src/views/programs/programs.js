import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import AvailableProgramesTable from '../../components/available-programes-table';
import FilterSection from '../../components/filter-section';
import './styles.css';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State pentru filtre
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUniversity, setFilterUniversity] = useState('');
  const [filterDegree, setFilterDegree] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [sortBy, setSortBy] = useState('name');
  
  // Opțiuni pentru filtre
  const universityOptions = ['USM', 'UTM', 'ASEM', 'ULIM', 'USARB'];
  const degreeOptions = ['Bachelor', 'Master', 'PhD'];
  const languageOptions = ['English', 'Romanian', 'Russian', 'French'];

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/programs');
        if (!response.ok) {
          throw new Error('Failed to fetch programs');
        }
        const data = await response.json();
        setPrograms(data);
        setFilteredPrograms(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  // Filtrare și sortare programe
  useEffect(() => {
    let result = [...programs];
    
    // Filtrare după termen de căutare
    if (searchTerm) {
      result = result.filter(program => 
        program.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrare după universitate
    if (filterUniversity) {
      result = result.filter(program => program.university === filterUniversity);
    }
    
    // Filtrare după grad
    if (filterDegree) {
      result = result.filter(program => program.degree === filterDegree);
    }
    
    // Filtrare după limbă
    if (filterLanguage) {
      result = result.filter(program => program.language === filterLanguage);
    }
    
    // Sortare
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'university':
        result.sort((a, b) => a.university.localeCompare(b.university));
        break;
      case 'degree':
        result.sort((a, b) => a.degree.localeCompare(b.degree));
        break;
      case 'credits':
        result.sort((a, b) => a.credits - b.credits);
        break;
      default:
        break;
    }
    
    setFilteredPrograms(result);
  }, [programs, searchTerm, filterUniversity, filterDegree, filterLanguage, sortBy]);

  if (loading) {
    return (
      <div className="programs-container">
        <Navbar />
        <div className="loading">Loading programs...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="programs-container">
        <Navbar />
        <div className="error">Error: {error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="programs-container">
      <Helmet>
        <title>Study Programs - Study In Moldova</title>
        <meta property="og:title" content="Study Programs - Study In Moldova" />
      </Helmet>
      <Navbar />
      <div className="programs-content">
        <h1>Study Programs in Moldova</h1>
        <p>Explore the various study programs offered by Moldovan universities.</p>
        
        <div className="filter-section">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search by program name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={filterUniversity}
              onChange={(e) => setFilterUniversity(e.target.value)}
              className="filter-select"
            >
              <option value="">All Universities</option>
              {universityOptions.map((university) => (
                <option key={university} value={university}>
                  {university}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filterDegree}
              onChange={(e) => setFilterDegree(e.target.value)}
              className="filter-select"
            >
              <option value="">All Degrees</option>
              {degreeOptions.map((degree) => (
                <option key={degree} value={degree}>
                  {degree}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="filter-select"
            >
              <option value="">All Languages</option>
              {languageOptions.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="name">Sort by Name</option>
              <option value="university">Sort by University</option>
              <option value="degree">Sort by Degree</option>
              <option value="credits">Sort by Credits</option>
            </select>
          </div>
        </div>
        
        <AvailableProgramesTable
          programs={filteredPrograms}
          feature1Title="Discover the available programs"
          feature5Title411="Credits"
          feature5Title412="Degree"
          feature5Title413="Name"
          feature5Title4111="Languages"
          feature5Title4131="Faculty"
        />
      </div>
      <Footer />
    </div>
  );
};

export default Programs; 