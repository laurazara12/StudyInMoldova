import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['universities', 'common']);

  return (
    <div className="filter-section">
      <div className="filter-group">
        <input
          type="text"
          placeholder={t('universities:filters.searchPlaceholder')}
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
          <option value="">{t('universities:filters.allTypes')}</option>
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {type === 'Public' ? t('universities:filters.public') : t('universities:filters.private')}
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
          <option value="">{t('universities:filters.allLocations')}</option>
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
          <option value="name">{t('universities:filters.sortOptions.nameAZ')}</option>
          <option value="name_desc">{t('universities:filters.sortOptions.nameZA')}</option>
          <option value="location">{t('universities:filters.sortOptions.locationAZ')}</option>
          <option value="type">{t('universities:filters.sortOptions.typeAZ')}</option>
          <option value="ranking">{t('universities:filters.sortOptions.rankingLowHigh')}</option>
          <option value="ranking_desc">{t('universities:filters.sortOptions.rankingHighLow')}</option>
          <option value="tuition">{t('universities:filters.sortOptions.tuitionLowHigh')}</option>
          <option value="tuition_desc">{t('universities:filters.sortOptions.tuitionHighLow')}</option>
        </select>
      </div>
    </div>
  );
};

export default FilterSection; 