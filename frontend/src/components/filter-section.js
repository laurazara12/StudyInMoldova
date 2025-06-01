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
          placeholder="Search by name..."
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
          <option value="">All types</option>
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
          <option value="">All locations</option>
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
          <option value="name">Sort by name</option>
          <option value="type">Sort by type</option>
          <option value="location">Sort by location</option>
        </select>
      </div>
    </div>
  );
};

export default FilterSection; 