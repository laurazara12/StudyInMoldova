import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/universities.css';

const UniversityPresentation = ({ university }) => {
  return (
    <div className="university-card">
      <div className="university-image-container">
        <img 
          src={university.imageUrl} 
          alt={university.name}
          className="university-image"
        />
      </div>
      <div className="university-content">
        <h2 className="university-name">{university.name}</h2>
        <p className="university-location">{university.location}</p>
        <p className="university-description">{university.description}</p>
        <div className="university-actions">
          <a 
            href={university.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="university-website-btn"
          >
            Website
          </a>
          <Link 
            to={`/universities/${university.id}`}
            className="university-details-btn"
          >
            Vezi mai multe detalii
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UniversityPresentation; 