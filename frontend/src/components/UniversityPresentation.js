import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/universities.css';

const UniversityPresentation = ({ university }) => {
  if (!university) {
    return <div className="university-card">Loading...</div>;
  }

  const handleImageError = (e) => {
    console.error('Error loading image:', e.target.src);
    e.target.src = 'http://localhost:3000/images/placeholder.jpg';
    e.target.onerror = null;
  };

  return (
    <div className="university-card">
      <img 
        src={university.imageUrl} 
        alt={university.name} 
        className="university-image"
        onError={handleImageError}
      />
      <div className="university-content">
        <h2>{university.name}</h2>
        <p className="university-type">Type: {university.type === 'Public' ? 'Public' : 'Private'}</p>
        
        <div className="university-details">
          <h3>Tuition Fees:</h3>
          <ul className="tuition-fees">
            {university.tuitionFees && (
              <>
                <li>Bachelor: {university.tuitionFees.bachelor}</li>
                <li>Master: {university.tuitionFees.master}</li>
                <li>PhD: {university.tuitionFees.phd}</li>
              </>
            )}
          </ul>

          <h3>Brief Description:</h3>
          <p className="university-description">{university.description}</p>
        </div>

        <div className="university-actions">
          <Link to={`/universities/${university.id}`} className="btn btn-secondary">
            More Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UniversityPresentation; 