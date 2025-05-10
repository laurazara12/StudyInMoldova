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
      <h2>Programe salvate</h2>
      {loading ? (
        <p>Se încarcă programele salvate...</p>
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
                    Elimină
                  </button>
                </div>
                <div className="program-details">
                  <p><strong>Universitate:</strong> {university?.name || 'N/A'}</p>
                  <p><strong>Facultate:</strong> {program.faculty}</p>
                  <p><strong>Grad:</strong> {program.degree}</p>
                  <p><strong>Credite:</strong> {program.credits}</p>
                  <p><strong>Limbi:</strong> {Array.isArray(program.languages) ? program.languages.join(', ') : program.languages}</p>
                  <p><strong>Durată:</strong> {program.duration}</p>
                  <p><strong>Taxă de școlarizare:</strong> {program.tuitionFee}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p>Nu aveți programe salvate.</p>
      )}
    </div>
  );
};

export default SavedProgramsSection; 