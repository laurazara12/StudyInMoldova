import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../../config/api.config';
import './create-application.css';

const CreateApplication = ({ application, onClose }) => {
  const [savedPrograms, setSavedPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(application?.program || null);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState(application?.documents?.map(doc => doc.id) || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(application?.status || null);
  const [applicationId, setApplicationId] = useState(application?.id || null);
  const [showWithdrawConfirmation, setShowWithdrawConfirmation] = useState(false);
  const [applications, setApplications] = useState({
    drafts: [],
    pending: [],
    sent: [],
    rejected: [],
    withdrawn: []
  });

  useEffect(() => {
    fetchSavedPrograms();
    fetchUploadedDocuments();
    fetchApplications();
  }, []);

  const fetchSavedPrograms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/saved-programs`, {
        headers: getAuthHeaders()
      });
      if (response.data && response.data.success) {
        setSavedPrograms(response.data.data);
      } else {
        setError('Eroare la încărcarea programelor salvate');
      }
    } catch (err) {
      console.error('Eroare la încărcarea programelor:', err);
      setError('Eroare la încărcarea programelor salvate');
    }
  };

  const fetchUploadedDocuments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/documents/user-documents`, {
        headers: getAuthHeaders()
      });
      
      if (response.data && response.data.success) {
        const documents = response.data.data || [];
        const validDocuments = documents.filter(doc => 
          doc && doc.id && doc.document_type && doc.status !== 'deleted'
        );
        setUploadedDocuments(validDocuments);
      } else {
        console.error('Format invalid al răspunsului:', response.data);
        setError('Nu s-au putut încărca documentele. Vă rugăm să încercați din nou.');
        setUploadedDocuments([]);
      }
    } catch (err) {
      console.error('Eroare la încărcarea documentelor:', err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Eroare la încărcarea documentelor';
      setError(errorMessage);
      setUploadedDocuments([]);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/applications`, {
        headers: getAuthHeaders()
      });

      if (response.data && response.data.success && response.data.data) {
        const { drafts, pending, sent, rejected, withdrawn } = response.data.data;
        
        // Verificăm și setăm fiecare categorie, asigurându-ne că sunt array-uri
        setApplications({
          drafts: Array.isArray(drafts) ? drafts : [],
          pending: Array.isArray(pending) ? pending : [],
          sent: Array.isArray(sent) ? sent : [],
          rejected: Array.isArray(rejected) ? rejected : [],
          withdrawn: Array.isArray(withdrawn) ? withdrawn : []
        });
      } else {
        console.error('Format răspuns neașteptat:', response.data);
        setError('Format răspuns neașteptat de la server');
        // Setăm starea inițială în caz de eroare
        setApplications({
          drafts: [],
          pending: [],
          sent: [],
          rejected: [],
          withdrawn: []
        });
      }
    } catch (error) {
      console.error('Eroare la încărcarea aplicațiilor:', error);
      setError('Eroare la încărcarea aplicațiilor');
      // Setăm starea inițială în caz de eroare
      setApplications({
        drafts: [],
        pending: [],
        sent: [],
        rejected: [],
        withdrawn: []
      });
    }
  };

  const handleProgramSelect = (program) => {
    setSelectedProgram(program);
  };

  const handleDocumentSelect = (documentId) => {
    setSelectedDocuments(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId);
      }
      return [...prev, documentId];
    });
  };

  const handleSaveDraft = async () => {
    if (!selectedProgram) {
      setError('Vă rugăm să selectați un program');
      return;
    }

    setLoading(true);
    try {
      const endpoint = applicationId ? 
        `${API_BASE_URL}/api/applications/${applicationId}` : 
        `${API_BASE_URL}/api/applications/draft`;
      const method = applicationId ? 'put' : 'post';
      
      const response = await axios[method](endpoint, {
        programId: selectedProgram.id,
        documentIds: selectedDocuments,
        status: 'draft'
      }, {
        headers: getAuthHeaders()
      });

      if (response.data && response.data.success) {
        if (!applicationId) {
          setApplicationId(response.data.data.id);
        }
        setApplicationStatus('draft');
        setSuccessMessage('Aplicația a fost salvată ca draft');
        setError(null);
        if (onClose) onClose();
      } else {
        setError('Eroare la salvarea aplicației');
      }
    } catch (err) {
      console.error('Eroare la salvarea draft-ului:', err);
      setError('Eroare la salvarea aplicației');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProgram) {
      setError('Vă rugăm să selectați un program');
      return;
    }

    setLoading(true);
    try {
      const endpoint = applicationId ? 
        `${API_BASE_URL}/api/applications/${applicationId}` : 
        `${API_BASE_URL}/api/applications`;
      const method = applicationId ? 'put' : 'post';
      
      const response = await axios[method](endpoint, {
        programId: selectedProgram.id,
        documentIds: selectedDocuments,
        status: 'pending'
      }, {
        headers: getAuthHeaders()
      });

      if (response.data && response.data.success) {
        setApplicationStatus('pending');
        setSuccessMessage('Aplicația a fost trimisă spre procesare!');
        setError(null);
        if (onClose) onClose();
      } else {
        setError('Eroare la trimiterea aplicației');
      }
    } catch (err) {
      console.error('Eroare la trimiterea aplicației:', err);
      setError('Eroare la trimiterea aplicației');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!applicationId) {
      setError('ID-ul aplicației lipsește');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/applications/${applicationId}/withdraw`,
        {},
        { headers: getAuthHeaders() }
      );

      if (response.data && response.data.success) {
        if (applicationStatus === 'confirmed') {
          setSuccessMessage('Aplicația a fost ștearsă definitiv.');
          await fetchApplications();
        } else {
          setApplicationStatus('draft');
          setSuccessMessage('Aplicația a fost retrasă și salvată ca draft. O puteți modifica și retrimite mai târziu.');
          await fetchApplications();
        }
        setShowWithdrawConfirmation(false);
        if (onClose) {
          onClose();
        }
      } else {
        throw new Error(response.data?.message || 'Nu s-a putut retrage aplicația');
      }
    } catch (error) {
      console.error('Eroare la retragerea aplicației:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'A apărut o eroare la retragerea aplicației. Vă rugăm să încercați din nou.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'pending':
        return 'În procesare';
      case 'confirmed':
        return 'Trimisă și Confirmată';
      case 'rejected':
        return 'Respinse';
      case 'withdrawn':
        return 'Retrase';
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
      case 'confirmed':
        return 'status-confirmed';
      case 'rejected':
        return 'status-rejected';
      case 'withdrawn':
        return 'status-withdrawn';
      default:
        return '';
    }
  };

  const canEdit = !applicationStatus || applicationStatus === 'draft';
  const canWithdraw = ['pending', 'confirmed'].includes(applicationStatus);

  const getWithdrawMessage = () => {
    if (applicationStatus === 'confirmed') {
      return 'Sunteți sigur că doriți să ștergeți definitiv această aplicație? Această acțiune nu poate fi anulată.';
    }
    return 'Sunteți sigur că doriți să retrageți această aplicație? O veți putea modifica și retrimite mai târziu.';
  };

  return (
    <div className="create-application-container">
      <div className="status-badges">
        <div className={`status-badge ${getStatusClass(applicationStatus)}`}>
          Status: {getStatusLabel(applicationStatus)}
        </div>
      </div>
      <h2>{application ? 'Editare Aplicație' : 'Creare Aplicație Nouă'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="program-selection">
        <h3>Selectați Programul</h3>
        {savedPrograms && savedPrograms.length > 0 ? (
          <div className="programs-grid">
            {savedPrograms.map(program => (
              <div
                key={program.id}
                className={`program-card ${selectedProgram?.id === program.id ? 'selected' : ''}`}
                onClick={() => canEdit && handleProgramSelect(program)}
              >
                <h4>{program.name}</h4>
                <p>{program.university}</p>
                <p>{program.field}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-programs-message">
            <p>Nu aveți programe salvate în profilul dumneavoastră. Pentru a putea crea o aplicație, vă rugăm să salvați cel puțin un program din lista de programe disponibile.</p>
            <button 
              className="browse-programs-button"
              onClick={() => window.location.href = '/programs'}
            >
              Caută Programe
            </button>
          </div>
        )}
      </div>

      {selectedProgram && (
        <div className="document-selection">
          <h3>Selectați Documentele</h3>
          {uploadedDocuments && uploadedDocuments.length > 0 ? (
            <div className="documents-grid">
              {uploadedDocuments.map(doc => (
                <div
                  key={doc.id}
                  className={`document-card ${selectedDocuments.includes(doc.id) ? 'selected' : ''}`}
                  onClick={() => canEdit && handleDocumentSelect(doc.id)}
                >
                  <h4>{doc.name}</h4>
                  <p>{doc.type}</p>
                  {doc.status && <p className={`status-${doc.status}`}>Status: {doc.status}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-documents-message">
              <p>Nu aveți documente încărcate în profilul dumneavoastră. Pentru a putea crea o aplicație, vă rugăm să încărcați cel puțin un document în secțiunea "Documentele Mele".</p>
              <button 
                className="upload-documents-button"
                onClick={() => window.location.href = '/profile/documents'}
              >
                Mergi la Documentele Mele
              </button>
            </div>
          )}
        </div>
      )}

      <div className="button-group">
        {canEdit && (
          <>
            <button
              className="save-draft-button"
              onClick={handleSaveDraft}
              disabled={loading || !selectedProgram}
            >
              {loading ? 'Se salvează...' : 'Salvează ca Draft'}
            </button>

            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={loading || !selectedProgram || selectedDocuments.length === 0}
            >
              {loading ? 'Se trimite...' : 'Trimite spre Procesare'}
            </button>
          </>
        )}

        {canWithdraw && (
          <>
            <button
              className={`withdraw-button ${applicationStatus === 'confirmed' ? 'delete' : ''}`}
              onClick={() => setShowWithdrawConfirmation(true)}
              disabled={loading}
            >
              {applicationStatus === 'confirmed' ? 'Șterge Aplicația' : 'Retrage Aplicația'}
            </button>

            {showWithdrawConfirmation && (
              <div className="confirmation-modal">
                <div className="confirmation-content">
                  <h3>Confirmare {applicationStatus === 'confirmed' ? 'Ștergere' : 'Retragere'}</h3>
                  <p>{getWithdrawMessage()}</p>
                  <div className="confirmation-buttons">
                    <button
                      className="cancel-button"
                      onClick={() => setShowWithdrawConfirmation(false)}
                    >
                      Anulează
                    </button>
                    <button
                      className={`confirm-withdraw-button ${applicationStatus === 'confirmed' ? 'delete' : ''}`}
                      onClick={handleWithdraw}
                      disabled={loading}
                    >
                      {loading ? 'Se procesează...' : 'Confirmă'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CreateApplication; 