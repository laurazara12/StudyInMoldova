import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL, getAuthHeaders } from '../../config/api.config';
import './applications-section.css';

const CreateApplicationForm = ({ onClose, onSuccess }) => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/programs`);
      setPrograms(response.data);
    } catch (err) {
      setError('Eroare la încărcarea programelor');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post(`${API_BASE_URL}/api/applications`, {
        program_id: selectedProgram
      }, {
        headers: getAuthHeaders()
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError('Eroare la crearea aplicației');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-application-modal">
      <div className="modal-content">
        <h3>Crează Aplicație Nouă</h3>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="program">Selectează Program:</label>
            <select
              id="program"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              required
            >
              <option value="">Selectează un program</option>
              {programs.map(program => (
                <option key={program.id} value={program.id}>
                  {program.name} - {program.university?.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Anulează
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Se procesează...' : 'Creează Aplicație'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ApplicationsSection = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/api/applications`, {
        headers: getAuthHeaders()
      });

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setApplications(response.data.data);
      } else {
        console.error('Format răspuns neașteptat:', response.data);
        setError('Format răspuns neașteptat de la server');
        setApplications([]);
      }
    } catch (err) {
      console.error('Eroare la preluarea aplicațiilor:', err);
      if (err.response) {
        if (err.response.status === 401) {
          setError('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
        } else {
          setError(err.response.data?.error || 'Eroare la preluarea aplicațiilor');
        }
      } else {
        setError('Eroare la comunicarea cu serverul');
      }
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    fetchApplications();
    setShowCreateForm(false);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'În proces';
      case 'approved':
        return 'Aprobată';
      case 'rejected':
        return 'Respinsă';
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  const filterApplications = (status) => {
    return applications.filter(app => app.status === status);
  };

  if (loading) {
    return <div className="loading">Se încarcă aplicațiile...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="applications-section">
      <div className="applications-header">
        <h2>Aplicațiile mele</h2>
        <button onClick={() => setShowCreateForm(true)} className="create-application-button">
          Creează o aplicație nouă
        </button>
      </div>

      <div className="applications-container">
        <div className="applications-in-progress">
          <h3>Aplicații în proces</h3>
          {filterApplications('pending').length === 0 ? (
            <p>Nu aveți aplicații în proces.</p>
          ) : (
            <div className="applications-list">
              {filterApplications('pending').map((application) => (
                <div key={application.id} className="application-card">
                  <div className="application-header">
                    <h4>{application.program.name}</h4>
                    <span className={`status-badge ${getStatusClass(application.status)}`}>
                      {getStatusLabel(application.status)}
                    </span>
                  </div>
                  <div className="application-details">
                    <p><strong>Universitate:</strong> {application.program.university.name}</p>
                    <p><strong>Locație:</strong> {application.program.university.location}</p>
                    <p><strong>Data aplicării:</strong> {new Date(application.createdAt).toLocaleDateString('ro-RO')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="applications-submitted">
          <h3>Aplicații trimise</h3>
          {filterApplications('approved').length === 0 && filterApplications('rejected').length === 0 ? (
            <p>Nu aveți aplicații trimise.</p>
          ) : (
            <div className="applications-list">
              {[...filterApplications('approved'), ...filterApplications('rejected')].map((application) => (
                <div key={application.id} className="application-card">
                  <div className="application-header">
                    <h4>{application.program.name}</h4>
                    <span className={`status-badge ${getStatusClass(application.status)}`}>
                      {getStatusLabel(application.status)}
                    </span>
                  </div>
                  <div className="application-details">
                    <p><strong>Universitate:</strong> {application.program.university.name}</p>
                    <p><strong>Locație:</strong> {application.program.university.location}</p>
                    <p><strong>Data aplicării:</strong> {new Date(application.createdAt).toLocaleDateString('ro-RO')}</p>
                    {application.notes && (
                      <p><strong>Note:</strong> {application.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateForm && (
        <CreateApplicationForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

export default ApplicationsSection; 