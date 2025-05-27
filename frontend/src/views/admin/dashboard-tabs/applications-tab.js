import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../../../config/api.config';

const ApplicationsTab = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [filterApplicationStatus, setFilterApplicationStatus] = useState('all');
  const [filterApplicationDateRange, setFilterApplicationDateRange] = useState({ start: '', end: '' });
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [showApplicationEdit, setShowApplicationEdit] = useState(false);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [statistics, setStatistics] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      console.log('Începe încărcarea aplicațiilor...');
      const response = await axios.get(`${API_BASE_URL}/api/applications`, {
        headers: getAuthHeaders()
      });

      console.log('Răspuns server aplicații:', response.data);

      if (!response.data) {
        throw new Error('Nu s-au primit date de la server');
      }

      let applicationsData;
      if (response.data.success && response.data.data) {
        if (response.data.data.all) {
          applicationsData = response.data.data.all;
        } else if (response.data.data.grouped) {
          applicationsData = Object.values(response.data.data.grouped).flat();
        } else if (Array.isArray(response.data.data)) {
          applicationsData = response.data.data;
        } else {
          throw new Error('Format invalid al datelor primite: structură neașteptată');
        }
      } else if (Array.isArray(response.data)) {
        applicationsData = response.data;
      } else {
        throw new Error('Format invalid al datelor primite: răspuns neașteptat');
      }

      if (!Array.isArray(applicationsData)) {
        throw new Error('Format invalid al datelor primite: datele nu sunt un array');
      }

      console.log('Aplicații procesate:', applicationsData);
      setApplications(applicationsData);
      setFilteredApplications(applicationsData);

      // Actualizăm statisticile
      if (response.data.status) {
        setStatistics({
          totalApplications: response.data.total || applicationsData.length,
          pendingApplications: response.data.status.pending || 0,
          approvedApplications: response.data.status.sent || 0,
          rejectedApplications: response.data.status.rejected || 0
        });
      }

    } catch (error) {
      console.error('Eroare la încărcarea aplicațiilor:', error);
      setError('A apărut o eroare la încărcarea aplicațiilor. Vă rugăm să încercați din nou.');
      setApplications([]);
      setFilteredApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowApplicationDetails(true);
  };

  const handleEditApplication = (application) => {
    setSelectedApplication(application);
    setShowApplicationEdit(true);
  };

  const handleUpdateApplicationStatus = async (applicationId, newStatus) => {
    try {
      // Verificăm dacă aplicația există în lista locală
      const application = applications.find(app => app && app.id === applicationId);
      if (!application) {
        setError('Aplicația nu a fost găsită');
        return;
      }

      setLoading(true);
      setError(null);

      console.log('Actualizare status aplicație:', {
        applicationId,
        newStatus,
        currentNotes: application.notes || ''
      });

      const response = await axios.patch(
        `${API_BASE_URL}/api/applications/${applicationId}/status`,
        {
          status: newStatus,
          notes: application.notes || ''
        },
        { 
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        // Reîncărcăm lista de aplicații
        await loadApplications();
        
        // Închidem modalul și resetăm starea
        setShowApplicationEdit(false);
        setSelectedApplication(null);
        
        // Afișăm mesaj de succes
        setSuccessMessage('Statusul aplicației a fost actualizat cu succes!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response.data.message || 'Eroare la actualizarea statusului aplicației');
      }
    } catch (error) {
      console.error('Eroare la actualizarea statusului aplicației:', error);
      setError(error.response?.data?.message || 'Eroare la actualizarea statusului aplicației');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const handleSearch = () => {
    const filtered = applications.filter(app => {
      const matchesSearch = searchTerm === '' || 
        app.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.program_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterApplicationStatus === 'all' || app.status === filterApplicationStatus;
      const matchesDateRange = (!filterApplicationDateRange.start || new Date(app.created_at) >= new Date(filterApplicationDateRange.start)) &&
                             (!filterApplicationDateRange.end || new Date(app.created_at) <= new Date(filterApplicationDateRange.end));
      return matchesSearch && matchesStatus && matchesDateRange;
    });
    setFilteredApplications(filtered);
  };

  return (
    <div className="applications-tab">
      <div className="dashboard-filters">
        <div className="search-box">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Caută după nume utilizator sau program..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-section applications-filter">
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filterApplicationStatus}
              onChange={(e) => setFilterApplicationStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Toate statusurile</option>
              <option value="pending">În așteptare</option>
              <option value="approved">Aprobat</option>
              <option value="rejected">Respinse</option>
              <option value="under_review">În revizuire</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Data:</label>
            <div className="date-range-inputs">
              <input 
                type="date" 
                className="date-input" 
                value={filterApplicationDateRange?.start || ''} 
                onChange={e => setFilterApplicationDateRange({...filterApplicationDateRange, start: e.target.value})} 
              />
              <span>până la</span>
              <input 
                type="date" 
                className="date-input" 
                value={filterApplicationDateRange?.end || ''} 
                onChange={e => setFilterApplicationDateRange({...filterApplicationDateRange, end: e.target.value})} 
              />
            </div>
          </div>
          <button 
            className="clear-filters-button"
            onClick={() => {
              setSearchTerm('');
              setFilterApplicationStatus('all');
              setFilterApplicationDateRange({ start: '', end: '' });
              setFilteredApplications(applications);
            }}
          >
            Resetează filtrele
          </button>
          <button 
            className="search-button"
            onClick={handleSearch}
          >
            Caută
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="alert-success">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Se încarcă aplicațiile...</p>
        </div>
      ) : (
        <div className="applications-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Utilizator</th>
                <th>Program</th>
                <th>Universitate</th>
                <th>Data aplicării</th>
                <th>Status</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map(app => (
                <tr key={app.id}>
                  <td>{app.id}</td>
                  <td>
                    <span className="user-name">{app.user_name || `Utilizator ID: ${app.user_id}`}</span>
                  </td>
                  <td>{app.program?.name || 'N/A'}</td>
                  <td>{app.program?.university?.name || 'N/A'}</td>
                  <td>{formatDate(app.created_at)}</td>
                  <td>
                    <span className={`status-badge status-${app.status}`}>
                      {app.status === 'pending' ? 'În așteptare' :
                       app.status === 'approved' ? 'Aprobat' :
                       app.status === 'rejected' ? 'Respinse' :
                       app.status === 'under_review' ? 'În revizuire' :
                       app.status === 'withdrawn' ? 'Retras' :
                       app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn1"
                        onClick={() => handleViewApplication(app)}
                      >
                        <i className="fas fa-eye"></i> Vizualizare
                      </button>
                      <button 
                        className="btn-grey"
                        onClick={() => handleEditApplication(app)}
                      >
                        <i className="fas fa-edit"></i> Editare
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showApplicationDetails && selectedApplication && (
        <div className="modal">
          <div className="modal-content">
            <h2>Detalii Aplicație</h2>
            <div className="application-details">
              <p><strong>ID:</strong> {selectedApplication.id}</p>
              <p><strong>Utilizator:</strong> {selectedApplication.user_name || `ID: ${selectedApplication.user_id}`}</p>
              <p><strong>Program:</strong> {selectedApplication.program?.name || 'N/A'}</p>
              <p><strong>Universitate:</strong> {selectedApplication.program?.university?.name || 'N/A'}</p>
              <p><strong>Data aplicării:</strong> {formatDate(selectedApplication.created_at)}</p>
              <p><strong>Status:</strong> {selectedApplication.status}</p>
              {selectedApplication.notes && (
                <p><strong>Note:</strong> {selectedApplication.notes}</p>
              )}
            </div>
            <button 
              className="close-button"
              onClick={() => {
                setShowApplicationDetails(false);
                setSelectedApplication(null);
              }}
            >
              Închide
            </button>
          </div>
        </div>
      )}

      {showApplicationEdit && selectedApplication && (
        <div className="modal">
          <div className="modal-content">
            <h2>Editare Aplicație</h2>
            <div className="application-edit">
              <div className="form-group">
                <label>Status:</label>
                <select
                  value={selectedApplication.status}
                  onChange={(e) => setSelectedApplication({
                    ...selectedApplication,
                    status: e.target.value
                  })}
                  className="form-select"
                >
                  <option value="pending">În așteptare</option>
                  <option value="approved">Aprobat</option>
                  <option value="rejected">Respinse</option>
                  <option value="under_review">În revizuire</option>
                </select>
              </div>
              <div className="form-group">
                <label>Note:</label>
                <textarea
                  value={selectedApplication.notes || ''}
                  onChange={(e) => setSelectedApplication({
                    ...selectedApplication,
                    notes: e.target.value
                  })}
                  className="form-textarea"
                  rows="4"
                />
              </div>
              <div className="button-group">
                <button
                  className="save-button"
                  onClick={() => handleUpdateApplicationStatus(selectedApplication.id, selectedApplication.status)}
                >
                  Salvează
                </button>
                <button
                  className="cancel-button"
                  onClick={() => {
                    setShowApplicationEdit(false);
                    setSelectedApplication(null);
                  }}
                >
                  Anulează
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsTab;
