import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../../config/api.config';
import './applications-section.css';
import CreateApplication from './create-application';
import ApplicationDetailsModal from './application-details-modal';

const ApplicationsSection = () => {
  const [applications, setApplications] = useState({
    drafts: [],
    pending: [],
    sent: [],
    rejected: [],
    withdrawn: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState({
    drafts: 0,
    pending: 0,
    sent: 0,
    rejected: 0,
    withdrawn: 0
  });
  const [activeTab, setActiveTab] = useState('drafts');

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

      if (response.data && response.data.success && response.data.data) {
        const { applications, total, status } = response.data.data;
        setApplications(applications);
        setTotal(total);
        setStatus(status);
      } else {
        console.error('Format răspuns neașteptat:', response.data);
        setError('Format răspuns neașteptat de la server');
        setApplications({
          drafts: [],
          pending: [],
          sent: [],
          rejected: [],
          withdrawn: []
        });
        setTotal(0);
        setStatus({
          drafts: 0,
          pending: 0,
          sent: 0,
          rejected: 0,
          withdrawn: 0
        });
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
      setApplications({
        drafts: [],
        pending: [],
        sent: [],
        rejected: [],
        withdrawn: []
      });
      setTotal(0);
      setStatus({
        drafts: 0,
        pending: 0,
        sent: 0,
        rejected: 0,
        withdrawn: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApplication = () => {
    setSelectedApplication(null);
    setShowCreateForm(true);
  };

  const handleEditApplication = (application) => {
    setSelectedApplication(application);
    setShowCreateForm(true);
  };

  const handleWithdrawApplication = async (applicationId) => {
    try {
      console.log('Încercare retragere aplicație:', {
        applicationId,
        url: `${API_BASE_URL}/api/applications/${applicationId}/withdraw`
      });

      const response = await axios.put(
        `${API_BASE_URL}/api/applications/${applicationId}/withdraw`,
        {},
        {
          headers: getAuthHeaders()
        }
      );

      console.log('Răspuns retragere aplicație:', response.data);

      if (response.data.success) {
        setSuccessMessage('Aplicația a fost retrasă cu succes');
        setError(null);
        // Reîmprospătează lista de aplicații
        fetchApplications();
      } else {
        setError(response.data.message || 'Eroare la retragerea aplicației');
        setSuccessMessage(null);
      }
    } catch (err) {
      console.error('Eroare la retragerea aplicației:', err);
      
      if (err.response) {
        console.error('Detalii eroare:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });

        switch (err.response.status) {
          case 404:
            setError('Aplicația nu a fost găsită. Vă rugăm să reîncărcați pagina.');
            break;
          case 400:
            setError(err.response.data.message || 'Aplicația nu poate fi retrasă în starea actuală.');
            break;
          case 401:
            setError('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
            break;
          default:
            setError(err.response.data.message || 'Eroare la retragerea aplicației. Vă rugăm să încercați din nou.');
        }
      } else if (err.request) {
        console.error('Nu s-a primit răspuns de la server:', err.request);
        setError('Nu s-a putut comunica cu serverul. Vă rugăm să verificați conexiunea la internet.');
      } else {
        console.error('Eroare la configurarea cererii:', err.message);
        setError('Eroare la procesarea cererii. Vă rugăm să încercați din nou.');
      }
      
      setSuccessMessage(null);
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateForm(false);
    setShowDetailsModal(false);
    setSelectedApplication(null);
    fetchApplications();
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'pending':
        return 'În procesare';
      case 'approved':
        return 'Aprobată';
      case 'rejected':
        return 'Respinsă';
      case 'withdrawn':
        return 'Retrasă';
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'draft':
        return 'status-draft';
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'withdrawn':
        return 'status-withdrawn';
      default:
        return '';
    }
  };

  const getFilteredApplications = (section) => {
    switch (section) {
      case 'drafts':
        return applications.drafts;
      case 'processing':
        return applications.pending;
      case 'sent':
        return applications.sent;
      default:
        return [];
    }
  };

  const getApplicationsForSection = (section) => {
    switch (section) {
      case 'drafts':
        return applications.drafts;
      case 'processing':
        return applications.pending;
      case 'sent':
        return applications.sent;
      default:
        return [];
    }
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
        <button className="create-application-button" onClick={handleCreateApplication}>
          Creare Aplicație Nouă
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="applications-stats">
        <div className="stat-item">
          <span className="stat-label">Total aplicații:</span>
          <span className="stat-value">{total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">În procesare:</span>
          <span className="stat-value">{status.pending}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Trimise:</span>
          <span className="stat-value">{status.sent}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Draft-uri:</span>
          <span className="stat-value">{status.drafts}</span>
        </div>
      </div>

      <div className="applications-tabs">
        <button 
          className={`tab-button ${activeTab === 'drafts' ? 'active' : ''}`}
          onClick={() => setActiveTab('drafts')}
        >
          Draft-uri ({status.drafts})
        </button>
        <button 
          className={`tab-button ${activeTab === 'processing' ? 'active' : ''}`}
          onClick={() => setActiveTab('processing')}
        >
          În procesare ({status.pending})
        </button>
        <button 
          className={`tab-button ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          Trimise ({status.sent})
        </button>
      </div>

      <div className="applications-list">
        {loading ? (
          <div className="loading">Se încarcă...</div>
        ) : (
          <>
            {getApplicationsForSection(activeTab).length === 0 ? (
              <div className="no-applications">
                Nu există aplicații în această secțiune
              </div>
            ) : (
              getApplicationsForSection(activeTab).map(app => (
                <div key={app.id} className="application-card">
                  <div className="application-header">
                    <h3>{app.program?.name || 'Program necunoscut'}</h3>
                    <span className={`status-badge ${app.status}`}>
                      {getStatusLabel(app.status)}
                    </span>
                  </div>
                  <div className="application-details">
                    <p><strong>Universitate:</strong> {app.program?.university?.name || 'N/A'}</p>
                    <p><strong>Facultate:</strong> {app.program?.faculty || 'N/A'}</p>
                    <p><strong>Data aplicării:</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="application-actions">
                    <button 
                      className="view-details-btn"
                      onClick={() => handleViewDetails(app)}
                    >
                      Vezi detalii
                    </button>
                    {app.status === 'pending' && (
                      <button 
                        className="withdraw-btn"
                        onClick={() => handleWithdrawApplication(app.id)}
                      >
                        Retrage aplicația
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {showCreateForm && (
        <CreateApplication onClose={handleCloseModal} />
      )}

      {showDetailsModal && selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
};

export default ApplicationsSection; 