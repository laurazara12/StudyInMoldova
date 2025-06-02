import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getAuthHeaders, handleApiError } from '../../../config/api.config';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './saved-programs-tab.css';

const SavedProgramsTab = ({ userData }) => {
  const navigate = useNavigate();
  const [savedPrograms, setSavedPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);

  useEffect(() => {
    if (userData) {
      fetchSavedPrograms();
    }
  }, [userData]);

  const fetchSavedPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/api/saved-programs`, {
        headers: getAuthHeaders()
      });
      
      console.log('Saved programs response:', response.data);
      
      if (response.data?.data) {
        setSavedPrograms(response.data.data);
      } else {
        setSavedPrograms([]);
      }
    } catch (error) {
      console.error('Error fetching saved programs:', error);
      
      if (error.response?.status === 401) {
        navigate('/sign-in');
        return;
      }
      setError(handleApiError(error).message);
      setSavedPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSavedProgram = async (programId) => {
    setProgramToDelete(programId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteProgram = async () => {
    if (!programToDelete) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/saved-programs/${programToDelete}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setSavedPrograms(prev => prev.filter(p => p.id !== programToDelete));
        setNotification({
          type: 'success',
          message: 'Your document has been successfully uploaded'
        });
      }
    } catch (error) {
      console.error('Error removing program:', error);
      setError('An error occurred while removing the program. Please try again.');
    } finally {
      setShowDeleteConfirmation(false);
      setProgramToDelete(null);
    }
  };

  const cancelDeleteProgram = () => {
    setShowDeleteConfirmation(false);
    setProgramToDelete(null);
  };

  if (loading) {
    return (
      <div className="saved-programs-section">
        <div className="loading">Loading saved programs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="saved-programs-section">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="saved-programs-section">
      <h2>Saved Programs</h2>
      {savedPrograms.length > 0 ? (
        <div className="programs-grid">
          {savedPrograms.map((program) => (
            <div key={program.id} className="program-card">
              <div className="program-header">
                <h3>{program.name || 'N/A'}</h3>
                <button
                  className="btn1"
                  onClick={() => handleRemoveSavedProgram(program.id)}
                >
                  Remove
                </button>
              </div>
              <div className="program-details">
                <p><strong>University:</strong> {program.university?.name || 'N/A'}</p>
                <p><strong>Faculty:</strong> {program.faculty || 'N/A'}</p>
                <p><strong>Degree:</strong> {program.degree_type || program.degree || 'N/A'}</p>
                <p><strong>Credits:</strong> {program.credits || 'N/A'}</p>
                <p><strong>Language:</strong> {program.language || 'N/A'}</p>
                <p><strong>Duration:</strong> {program.duration ? `${program.duration} years` : 'N/A'}</p>
                <p><strong>Tuition Fee:</strong> {program.tuition_fees ? `${program.tuition_fees} EUR` : 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-programs-message">
          <p>You don't have any saved programs.</p>
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <h3>Delete Confirmation</h3>
            <p>Are you sure you want to remove this program from your list?</p>
            <div style={{ gap: '10px', display: 'flex' }}>
              <button 
                className="btn2" 
                onClick={cancelDeleteProgram}
              >
                Cancel
              </button>
              <button 
                className="btn1" 
                onClick={confirmDeleteProgram}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedProgramsTab;
