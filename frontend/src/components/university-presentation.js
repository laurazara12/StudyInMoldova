import React from 'react';
import { Link } from 'react-router-dom';
import '../views/universities/universities.css';

const UniversityPresentation = ({ university }) => {
  if (!university) {
    return <div className="university-card">Se încarcă...</div>;
  }

  const handleImageError = (e) => {
    e.target.src = 'http://localhost:3000/images/placeholder.jpg';
    e.target.onerror = null;
  };

  return (
    <div className="university-card university-card-small-font">
      <img 
        src={university.imageUrl} 
        alt={university.name} 
        className="university-image"
        onError={handleImageError}
      />
      <div className="university-content">
        <div className="university-header">
          <span className="university-type">{university.type === 'Public' ? 'Universitate publică' : 'Universitate privată'}</span>
          <h2 className="university-title-small">{university.name}</h2>
        </div>
        <p className="university-description-small">{university.description}</p>
        {university.website && (
          <div className="university-link-wrapper">
            <a href={university.website} className="university-link-small" target="_blank" rel="noopener noreferrer">{university.website}</a>
          </div>
        )}
        <div className="university-details-row">
          <div className="university-details-col">
            <h3 className="university-details-title-small">Clasament universitate</h3>
            <div className="university-ranking-small">{university.ranking || 'N/A'}</div>
          </div>
          <div className="university-details-col">
            <h3 className="university-details-title-small">Taxe de studii (2023)</h3>
            <ul className="tuition-fees tuition-fees-small">
              {university.tuitionFees && (
                <>
                  <li>Licență: {university.tuitionFees.bachelor}</li>
                  <li>Master: {university.tuitionFees.master}</li>
                  <li>Doctorat: {university.tuitionFees.phd}</li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="university-actions">
          <Link to={`/universities/${university.id}`} className="btn btn-secondary btn-small">
            Vezi detalii
          </Link>
          <a href={`mailto:${university.contactEmail || ''}`} className="btn btn-primary btn-small">
            Contactează universitatea
          </a>
        </div>
      </div>
    </div>
  );
};

export default UniversityPresentation; 