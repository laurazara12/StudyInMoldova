import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './application-tab.css';
import { API_BASE_URL, getAuthHeaders } from '../../../config/api.config';

const ApplicationTab = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [userRole, setUserRole] = useState('user'); // 'user' sau 'admin'
  const [userDocuments, setUserDocuments] = useState([]); // Lista documentelor utilizatorului
  const [newApplication, setNewApplication] = useState({
    program_id: '',
    motivation_letter: '',
    selectedDocuments: [], // Documente selectate din lista existentă
    errors: {
      program: '',
      documents: '',
      motivation_letter: ''
    }
  });
  const [savedPrograms, setSavedPrograms] = useState([]);

  useEffect(() => {
    loadUserApplications();
    loadPrograms();
    checkUserRole();
    loadUserDocuments();
    loadSavedPrograms(); // Adăugăm încărcarea programelor salvate
  }, []);

  const checkUserRole = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/role`, {
        headers: getAuthHeaders()
      });
      if (response.data.role === 'admin') {
        setUserRole('admin');
      }
    } catch (error) {
      console.error('Eroare la verificarea rolului:', error);
    }
  };

  const loadPrograms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/programs`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setPrograms(response.data.data);
      }
    } catch (error) {
      console.error('Eroare la încărcarea programelor:', error);
    }
  };

  const loadUserApplications = async () => {
    try {
      setLoading(true);
      const endpoint = userRole === 'admin' 
        ? `${API_BASE_URL}/api/applications` 
        : `${API_BASE_URL}/api/applications/user`;

      const response = await axios.get(endpoint, {
        headers: getAuthHeaders()
      });

      if (!response.data || !response.data.success) {
        throw new Error('Nu s-au primit date valide de la server');
      }

      const applicationsData = response.data.data;
      
      if (!Array.isArray(applicationsData)) {
        console.error('Date invalide primite:', applicationsData);
        throw new Error('Format invalid al datelor primite: datele nu sunt un array');
      }

      console.log('Aplicații procesate:', applicationsData);
      setApplications(applicationsData);
    } catch (error) {
      console.error('Eroare la încărcarea aplicațiilor:', error);
      setError('A apărut o eroare la încărcarea aplicațiilor. Vă rugăm să încercați din nou.');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserDocuments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/documents/user-documents`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setUserDocuments(response.data.data);
      }
    } catch (error) {
      console.error('Eroare la încărcarea documentelor:', error);
    }
  };

  const loadSavedPrograms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/saved-programs`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setSavedPrograms(response.data.data);
      }
    } catch (error) {
      console.error('Eroare la încărcarea programelor salvate:', error);
    }
  };

  const validateApplication = () => {
    const errors = {
      program: '',
      documents: '',
      motivation_letter: ''
    };
    let isValid = true;

    if (!newApplication.program_id) {
      errors.program = 'Vă rugăm să selectați un program';
      isValid = false;
    }

    if (newApplication.selectedDocuments.length === 0) {
      errors.documents = 'Vă rugăm să selectați cel puțin un document';
      isValid = false;
    }

    if (!newApplication.motivation_letter.trim()) {
      errors.motivation_letter = 'Vă rugăm să scrieți o scrisoare de motivație';
      isValid = false;
    }

    setNewApplication(prev => ({
      ...prev,
      errors
    }));

    return isValid;
  };

  const handleCreateApplication = async (e) => {
    e.preventDefault();
    
    if (!validateApplication()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('program_id', newApplication.program_id);
      formData.append('motivation_letter', newApplication.motivation_letter);
      
      // Adăugăm ID-urile documentelor selectate
      newApplication.selectedDocuments.forEach(docId => {
        formData.append('document_ids[]', docId);
      });

      const response = await axios.post(
        `${API_BASE_URL}/api/applications`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setSuccessMessage('Aplicația a fost trimisă cu succes!');
        setShowCreateForm(false);
        setNewApplication({
          program_id: '',
          motivation_letter: '',
          selectedDocuments: [],
          errors: {
            program: '',
            documents: '',
            motivation_letter: ''
          }
        });
        await loadUserApplications();
      } else {
        throw new Error(response.data.message || 'Eroare la trimiterea aplicației');
      }
    } catch (error) {
      console.error('Eroare la crearea aplicației:', error);
      setError(error.response?.data?.message || 'A apărut o eroare la trimiterea aplicației');
    } finally {
      setLoading(false);
    }
  };

  const toggleDocumentSelection = (docId) => {
    setNewApplication(prev => {
      const isSelected = prev.selectedDocuments.includes(docId);
      const newSelectedDocuments = isSelected
        ? prev.selectedDocuments.filter(id => id !== docId)
        : [...prev.selectedDocuments, docId];

      return {
        ...prev,
        selectedDocuments: newSelectedDocuments,
        errors: {
          ...prev.errors,
          documents: newSelectedDocuments.length === 0 ? 'Vă rugăm să selectați cel puțin un document' : ''
        }
      };
    });
  };

  const handleUpdateApplicationStatus = async (applicationId, newStatus, adminNotes = '') => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.patch(
        `${API_BASE_URL}/api/applications/${applicationId}/status`,
        {
          status: newStatus,
          notes: adminNotes
        },
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        setSuccessMessage('Statusul aplicației a fost actualizat cu succes!');
        setShowApplicationDetails(false);
        setSelectedApplication(null);
        await loadUserApplications();
      } else {
        throw new Error(response.data.message || 'Eroare la actualizarea statusului');
      }
    } catch (error) {
      console.error('Eroare la actualizarea statusului:', error);
      setError(error.response?.data?.message || 'A apărut o eroare la actualizarea statusului');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewApplication(prev => ({
      ...prev,
      documents: [...prev.documents, ...files],
      errors: {
        ...prev.errors,
        documents: files.length > 0 ? '' : 'Vă rugăm să încărcați cel puțin un document'
      }
    }));
  };

  const removeDocument = (index) => {
    setNewApplication(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
      errors: {
        ...prev.errors,
        documents: prev.documents.length <= 1 ? 'Vă rugăm să încărcați cel puțin un document' : ''
      }
    }));
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowApplicationDetails(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data invalidă';
      return date.toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Eroare la formatarea datei:', error);
      return 'Data invalidă';
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Necunoscut';

    switch (status) {
      case 'draft':
        return 'Ciornă';
      case 'submitted':
        return 'Trimisă';
      case 'under_review':
        return 'În revizuire';
      case 'approved':
        return 'Aprobată';
      case 'rejected':
        return 'Respinse';
      case 'withdrawn':
        return 'Retrasă';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'status-unknown';

    switch (status) {
      case 'draft':
        return 'status-draft';
      case 'submitted':
        return 'status-submitted';
      case 'under_review':
        return 'status-under-review';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'withdrawn':
        return 'status-withdrawn';
      default:
        return 'status-unknown';
    }
  };

  const canDeleteApplication = (application) => {
    // Adminii pot șterge orice aplicație
    if (userRole === 'admin') return true;
    
    // Utilizatorii pot șterge doar aplicațiile în draft care nu au fost trimise niciodată
    return application.status === 'draft' && !application.submitted_at;
  };

  const handleDeleteApplication = async (applicationId) => {
    const application = applications.find(app => app.id === applicationId);
    
    if (!canDeleteApplication(application)) {
      setError('Nu puteți șterge această aplicație');
      return;
    }

    if (!window.confirm('Sigur doriți să ștergeți această aplicație?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.delete(
        `${API_BASE_URL}/api/applications/${applicationId}`,
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        setSuccessMessage('Aplicația a fost ștearsă cu succes!');
        setShowApplicationDetails(false);
        setSelectedApplication(null);
        await loadUserApplications();
      } else {
        throw new Error(response.data.message || 'Eroare la ștergerea aplicației');
      }
    } catch (error) {
      console.error('Eroare la ștergerea aplicației:', error);
      setError(error.response?.data?.message || 'A apărut o eroare la ștergerea aplicației');
    } finally {
      setLoading(false);
    }
  };

  const canWithdrawApplication = (application) => {
    // Doar utilizatorul poate retrage propria aplicație
    if (userRole === 'admin') return false;
    
    // Poate fi retrasă doar dacă este în una din stările: submitted, under_review
    return ['submitted', 'under_review'].includes(application.status);
  };

  const handleWithdrawApplication = async (applicationId) => {
    if (!window.confirm('Sigur doriți să retrageți această aplicație?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.patch(
        `${API_BASE_URL}/api/applications/${applicationId}/status`,
        {
          status: 'withdrawn',
          notes: 'Aplicație retrasă de utilizator'
        },
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        setSuccessMessage('Aplicația a fost retrasă cu succes!');
        setShowApplicationDetails(false);
        setSelectedApplication(null);
        await loadUserApplications();
      } else {
        throw new Error(response.data.message || 'Eroare la retragerea aplicației');
      }
    } catch (error) {
      console.error('Eroare la retragerea aplicației:', error);
      setError(error.response?.data?.message || 'A apărut o eroare la retragerea aplicației');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="application-tab">
      <div className="application-section">
        <h2>{userRole === 'admin' ? 'Toate aplicațiile' : 'Aplicațiile mele'}</h2>
        {userRole === 'user' && (
          <button 
            className="btn1"
            onClick={() => setShowCreateForm(true)}
          >
            <i className="fas fa-plus"></i> Creare aplicație nouă
          </button>
        )}
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

      <div className="application-stats">
        <div className="application-stat">
          Ciorne
          <span className="stat-value status-draft">{applications.filter(app => app.status === 'draft').length}</span>
        </div>
        <div className="application-stat">
          Trimise
          <span className="stat-value status-submitted">{applications.filter(app => app.status === 'submitted').length}</span>
        </div>
        <div className="application-stat">
          În revizuire
          <span className="stat-value status-under-review">{applications.filter(app => app.status === 'under_review').length}</span>
        </div>
        <div className="application-stat">
          Aprobate
          <span className="stat-value status-approved">{applications.filter(app => app.status === 'approved').length}</span>
        </div>
        <div className="application-stat">
          Respinse
          <span className="stat-value status-rejected">{applications.filter(app => app.status === 'rejected').length}</span>
        </div>
        <div className="application-stat">
          Retrase
          <span className="stat-value status-withdrawn">{applications.filter(app => app.status === 'withdrawn').length}</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Se încarcă aplicațiile...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="no-applications">
          <p>Nu există aplicații.</p>
        </div>
      ) : (
        <div className="applications-table-container">
          <table className="profile-table">
            <thead>
              <tr>
                {userRole === 'admin' && <th>Utilizator</th>}
                <th>Program</th>
                <th>Universitate</th>
                <th>Data aplicării</th>
                <th>Status</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  {userRole === 'admin' && (
                    <td>{app.user_name || `Utilizator ID: ${app.user_id}`}</td>
                  )}
                  <td>{app.program?.name || 'N/A'}</td>
                  <td>{app.program?.university?.name || 'N/A'}</td>
                  <td>{formatDate(app.created_at)}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(app.status)}`}>
                      {getStatusLabel(app.status)}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-view"
                      onClick={() => handleViewApplication(app)}
                    >
                      <i className="fas fa-eye"></i> Vizualizare
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Creare aplicație nouă</h2>
            <form onSubmit={handleCreateApplication} className="application-form">
              <div className="form-group">
                <label>Program: <span className="required">*</span></label>
                <select
                  value={newApplication.program_id}
                  onChange={(e) => setNewApplication({
                    ...newApplication,
                    program_id: e.target.value,
                    errors: {
                      ...newApplication.errors,
                      program: ''
                    }
                  })}
                  className={`form-select ${newApplication.errors.program ? 'error' : ''}`}
                >
                  <option value="">Selectează un program</option>
                  {savedPrograms.length > 0 ? (
                    savedPrograms.map(program => (
                      <option key={program.id} value={program.id}>
                        {program.name} - {program.university?.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Nu aveți programe salvate</option>
                  )}
                </select>
                {newApplication.errors.program && (
                  <span className="error-message">{newApplication.errors.program}</span>
                )}
                {savedPrograms.length === 0 && (
                  <p className="info-message">
                    Pentru a crea o aplicație, trebuie să salvați mai întâi un program din lista de programe.
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Scrisoare de motivație: <span className="required">*</span></label>
                <textarea
                  value={newApplication.motivation_letter}
                  onChange={(e) => setNewApplication({
                    ...newApplication,
                    motivation_letter: e.target.value,
                    errors: {
                      ...newApplication.errors,
                      motivation_letter: ''
                    }
                  })}
                  className={`form-textarea ${newApplication.errors.motivation_letter ? 'error' : ''}`}
                  rows="6"
                  placeholder="Scrieți scrisoarea de motivație..."
                />
                {newApplication.errors.motivation_letter && (
                  <span className="error-message">{newApplication.errors.motivation_letter}</span>
                )}
              </div>

              <div className="form-group">
                <label>Documente necesare: <span className="required">*</span></label>
                <div className="documents-selection">
                  {!userDocuments || userDocuments.length === 0 ? (
                    <p className="no-documents">Nu aveți documente încărcate. Vă rugăm să încărcați documentele în secțiunea de profil.</p>
                  ) : (
                    <div className="documents-list">
                      {userDocuments.map((doc, index) => (
                        <div key={`doc-${doc.id}-${index}`} className="document-item">
                          <label className="document-checkbox">
                            <input
                              type="checkbox"
                              checked={newApplication.selectedDocuments.includes(doc.id)}
                              onChange={() => toggleDocumentSelection(doc.id)}
                            />
                            <span className="document-name">{doc.name || doc.document_type}</span>
                          </label>
                          {doc.url && (
                            <a 
                              href={doc.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="document-preview"
                            >
                              <i className="fas fa-eye"></i> Vizualizare
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {newApplication.errors.documents && (
                    <span className="error-message">{newApplication.errors.documents}</span>
                  )}
                </div>
              </div>

              <div className="form-info">
                <p><span className="required">*</span> Câmpuri obligatorii</p>
              </div>

              <div className="button-group">
                <button type="submit" className="btn-submit">
                  Trimite aplicația
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewApplication({
                      program_id: '',
                      motivation_letter: '',
                      selectedDocuments: [],
                      errors: {
                        program: '',
                        documents: '',
                        motivation_letter: ''
                      }
                    });
                  }}
                >
                  Anulează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showApplicationDetails && selectedApplication && (
        <div className="modal">
          <div className="modal-content">
            <h2>Detalii Aplicație</h2>
            <div className="application-details">
              {userRole === 'admin' && (
                <p><strong>Utilizator:</strong> {selectedApplication.user_name || `ID: ${selectedApplication.user_id}`}</p>
              )}
              <p><strong>Program:</strong> {selectedApplication.program?.name || 'N/A'}</p>
              <p><strong>Universitate:</strong> {selectedApplication.program?.university?.name || 'N/A'}</p>
              <p><strong>Data aplicării:</strong> {formatDate(selectedApplication.created_at)}</p>
              <p><strong>Status:</strong> {getStatusLabel(selectedApplication.status)}</p>
              
              {selectedApplication.motivation_letter && (
                <div className="motivation-letter">
                  <p><strong>Scrisoare de motivație:</strong></p>
                  <p>{selectedApplication.motivation_letter}</p>
                </div>
              )}

              {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                <div className="documents">
                  <p><strong>Documente încărcate:</strong></p>
                  <ul>
                    {selectedApplication.documents.map((doc, index) => (
                      <li key={index}>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          {doc.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedApplication.notes && (
                <div className="admin-notes">
                  <p><strong>Note administrator:</strong></p>
                  <p>{selectedApplication.notes}</p>
                </div>
              )}

              <div className="action-buttons">
                {canDeleteApplication(selectedApplication) && (
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteApplication(selectedApplication.id)}
                  >
                    <i className="fas fa-trash"></i> Șterge aplicația
                  </button>
                )}
                
                {canWithdrawApplication(selectedApplication) && (
                  <button
                    className="btn-withdraw"
                    onClick={() => handleWithdrawApplication(selectedApplication.id)}
                  >
                    <i className="fas fa-undo"></i> Retrage aplicația
                  </button>
                )}
              </div>

              {userRole === 'admin' && selectedApplication.status === 'submitted' && (
                <div className="admin-actions">
                  <h3>Acțiuni administrator</h3>
                  <div className="form-group">
                    <label>Note:</label>
                    <textarea
                      className="form-textarea"
                      rows="4"
                      placeholder="Adăugați note pentru aplicant..."
                      value={selectedApplication.adminNotes || ''}
                      onChange={(e) => setSelectedApplication({
                        ...selectedApplication,
                        adminNotes: e.target.value
                      })}
                    />
                  </div>
                  <div className="button-group">
                    <button
                      className="btn-approve"
                      onClick={() => handleUpdateApplicationStatus(
                        selectedApplication.id,
                        'approved',
                        selectedApplication.adminNotes
                      )}
                    >
                      Aprobă
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleUpdateApplicationStatus(
                        selectedApplication.id,
                        'rejected',
                        selectedApplication.adminNotes
                      )}
                    >
                      Respinge
                    </button>
                    <button
                      className="btn-review"
                      onClick={() => handleUpdateApplicationStatus(
                        selectedApplication.id,
                        'under_review',
                        selectedApplication.adminNotes
                      )}
                    >
                      Pune în revizuire
                    </button>
                  </div>
                </div>
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
    </div>
  );
};

export default ApplicationTab; 