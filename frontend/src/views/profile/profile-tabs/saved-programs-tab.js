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
    if (userData) {<button class="remove-button">Elimină</button>
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
      
      console.log('Răspuns programe salvate:', response.data);
      
      if (response.data?.data) {
        setSavedPrograms(response.data.data);
      } else {
        setSavedPrograms([]);
      }
    } catch (error) {
      console.error('Eroare la preluarea programelor salvate:', error);
      
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
          message: 'Programul a fost eliminat cu succes!'
        });
      }
    } catch (error) {
      console.error('Eroare la eliminarea programului:', error);
      setError('A apărut o eroare la eliminarea programului. Vă rugăm să încercați din nou.');
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
        <div className="loading">Se încarcă programele salvate...</div>
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
      <h2>Programe Salvate</h2>
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
                  Elimină
                </button>
              </div>
              <div className="program-details">
                <p><strong>Universitate:</strong> {program.university?.name || 'N/A'}</p>
                <p><strong>Facultate:</strong> {program.faculty || 'N/A'}</p>
                <p><strong>Grad:</strong> {program.degree_type || program.degree || 'N/A'}</p>
                <p><strong>Credite:</strong> {program.credits || 'N/A'}</p>
                <p><strong>Limbă:</strong> {program.language || 'N/A'}</p>
                <p><strong>Durată:</strong> {program.duration ? `${program.duration} ani` : 'N/A'}</p>
                <p><strong>Taxă de școlarizare:</strong> {program.tuition_fees ? `${program.tuition_fees} EUR` : 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-programs-message">
          <p>Nu aveți programe salvate.</p>
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <h3>Confirmare ștergere</h3>
            <p>Ești sigur că vrei să elimini acest program din lista ta?</p>
            <div className="confirmation-buttons">
              <button 
                className="btn btn-secondary" 
                onClick={cancelDeleteProgram}
              >
                Anulează
              </button>
              <button 
                className="btn btn-primary" 
                onClick={confirmDeleteProgram}
              >
                Elimină
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedProgramsTab;
