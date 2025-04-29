import React from 'react';
import './filter-section.css';

const FilterSection = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterLocation,
  setFilterLocation,
  sortBy,
  setSortBy,
  typeOptions,
  locationOptions
}) => {
  return (
    <div className="filter-section">
      <div className="filter-group">
        <input
          type="text"
          placeholder="Caută după nume..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-group">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="">Toate tipurile</option>
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="filter-select"
        >
          <option value="">Toate locațiile</option>
          {locationOptions.map((location) => (
            <option key={location} value={location}>
              {location}
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
          <option value="name">Sortează după nume</option>
          <option value="type">Sortează după tip</option>
          <option value="location">Sortează după locație</option>
        </select>
      </div>
    </div>
  );
};

export default FilterSection; 