import React, { Fragment, useState } from 'react'

import PropTypes from 'prop-types'

import './search-bar.css'

const SearchBar = (props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    tuitionRange: 'all',
    ranking: 'all'
  });

  const handleSearch = () => {
    const universities = document.querySelectorAll('.university-presentation-container');
    
    universities.forEach(university => {
      const universityName = university.querySelector('.thq-heading-2')?.textContent.toLowerCase() || '';
      const universityType = university.querySelector('.thq-body-small')?.textContent.toLowerCase() || '';
      const tuitionText = university.querySelector('.university-presentation-text37')?.textContent.toLowerCase() || '';
      
      // Extragem suma de taxă din text
      const tuitionMatch = tuitionText.match(/(\d+)\s*euro/i);
      const tuitionAmount = tuitionMatch ? parseInt(tuitionMatch[1]) : 0;
      
      // Verificăm toate condițiile de filtrare
      const matchesSearch = universityName.includes(searchTerm.toLowerCase());
      const matchesType = filters.type === 'all' || universityType.includes(filters.type.toLowerCase());
      const matchesTuition = filters.tuitionRange === 'all' || 
        (filters.tuitionRange === 'low' && tuitionAmount <= 3000) ||
        (filters.tuitionRange === 'medium' && tuitionAmount > 3000 && tuitionAmount <= 5000) ||
        (filters.tuitionRange === 'high' && tuitionAmount > 5000);
      
      const isVisible = matchesSearch && matchesType && matchesTuition;
      university.style.display = isVisible ? 'block' : 'none';
    });
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    handleSearch();
  };

  return (
    <div className="search-bar-container1">
      <div className="search-bar-container2">
        <div className="search-bar-container3">
          <label className="search-bar-text1">
            {props.text1 ?? (
              <Fragment>
                <span className="search-bar-text3">
                  Looking for a university ?
                </span>
              </Fragment>
            )}
          </label>
          <input 
            type="text" 
            placeholder="University Name" 
            className="input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          
          <div className="filters-container">
            <select 
              className="filter-select"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>

            <select 
              className="filter-select"
              value={filters.tuitionRange}
              onChange={(e) => handleFilterChange('tuitionRange', e.target.value)}
            >
              <option value="all">All Tuition Ranges</option>
              <option value="low">Up to 3000€</option>
              <option value="medium">3000€ - 5000€</option>
              <option value="high">Over 5000€</option>
            </select>
          </div>

          <button 
            type="button" 
            className="button search-bar-button"
            onClick={handleSearch}
          >
            <span>
              {props.button ?? (
                <Fragment>
                  <span className="search-bar-text4">Search</span>
                </Fragment>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

SearchBar.propTypes = {
  text1: PropTypes.element,
  button: PropTypes.element,
}

export default SearchBar
