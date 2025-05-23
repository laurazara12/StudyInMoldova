import React from 'react';
import './saved-programs-section.css';

const SavedProgramsSection = ({ 
  loading, 
  error, 
  savedPrograms, 
  handleRemoveSavedProgram 
}) => {
  return (
    <div className="saved-programs-section">
      <h2>Saved Programs</h2>
      {loading ? (
        <p>Loading saved programs...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : savedPrograms.length > 0 ? (
        <div className="programs-grid">
          {savedPrograms.map((savedProgram) => {
            const program = savedProgram.program;
            const university = program.university;
            
            return (
              <div key={savedProgram.id} className="program-card">
                <div className="program-header">
                  <h3>{program.name}</h3>
                  <button
                    className="remove-button"
                    onClick={() => handleRemoveSavedProgram(savedProgram.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="program-details">
                  <p><strong>University:</strong> {university?.name || 'N/A'}</p>
                  <p><strong>Faculty:</strong> {program.faculty}</p>
                  <p><strong>Degree:</strong> {program.degree}</p>
                  <p><strong>Credits:</strong> {program.credits}</p>
                  <p><strong>Languages:</strong> {Array.isArray(program.languages) ? program.languages.join(', ') : program.languages}</p>
                  <p><strong>Duration:</strong> {program.duration}</p>
                  <p><strong>Tuition Fee:</strong> {program.tuitionFee}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p>You have no saved programs.</p>
      )}
    </div>
  );
};

export default SavedProgramsSection; 