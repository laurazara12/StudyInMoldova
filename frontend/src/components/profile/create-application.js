import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './create-application.css';

const CreateApplication = () => {
  const [savedPrograms, setSavedPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [applicationId, setApplicationId] = useState(null);

  useEffect(() => {
    fetchSavedPrograms();
    fetchUploadedDocuments();
    checkExistingApplication();
  }, []);

  const checkExistingApplication = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/applications/current`);
      if (response.data) {
        setApplicationId(response.data.id);
        setApplicationStatus(response.data.status);
        setSelectedProgram(response.data.program);
        setSelectedDocuments(response.data.documents.map(doc => doc.id));
      }
    } catch (err) {
      console.error('Eroare la verificarea aplicației existente:', err);
    }
  };

  const fetchSavedPrograms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/saved-programs`);
      setSavedPrograms(response.data);
    } catch (err) {
      setError('Eroare la încărcarea programelor salvate');
    }
  };

  const fetchUploadedDocuments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/documents`);
      setUploadedDocuments(response.data);
    } catch (err) {
      setError('Eroare la încărcarea documentelor');
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
      const endpoint = applicationId ? `/api/applications/${applicationId}` : '/api/applications/draft';
      const method = applicationId ? 'put' : 'post';
      
      const response = await axios[method](endpoint, {
        programId: selectedProgram.id,
        documentIds: selectedDocuments,
        status: 'draft'
      });

      if (!applicationId) {
        setApplicationId(response.data.id);
      }
      setApplicationStatus('draft');
      setSuccessMessage('Aplicația a fost salvată ca draft');
      setError(null);
    } catch (err) {
      setError('Eroare la salvarea aplicației');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProgram || selectedDocuments.length === 0) {
      setError('Vă rugăm să selectați un program și cel puțin un document');
      return;
    }

    setLoading(true);
    try {
      const endpoint = applicationId ? `/api/applications/${applicationId}` : '/api/applications';
      const method = applicationId ? 'put' : 'post';
      
      await axios[method](endpoint, {
        programId: selectedProgram.id,
        documentIds: selectedDocuments,
        status: 'submitted'
      });

      setApplicationStatus('submitted');
      setSuccessMessage('Aplicația a fost trimisă cu succes!');
      setError(null);
    } catch (err) {
      setError('Eroare la trimiterea aplicației');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!applicationId) return;

    setLoading(true);
    try {
      await axios.put(`/api/applications/${applicationId}/withdraw`);
      setApplicationStatus('withdrawn');
      setSuccessMessage('Aplicația a fost retrasă cu succes');
      setError(null);
    } catch (err) {
      setError('Eroare la retragerea aplicației');
    } finally {
      setLoading(false);
    }
  };

  const canEdit = !applicationStatus || applicationStatus === 'draft';
  const canWithdraw = applicationStatus === 'submitted';

  return (
    <div className="create-application-container">
      <h2>Creare Aplicație Nouă</h2>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {applicationStatus && (
        <div className="status-badge">
          Status: {applicationStatus === 'draft' ? 'Draft' : 
                  applicationStatus === 'submitted' ? 'Trimisă' : 
                  applicationStatus === 'withdrawn' ? 'Retrasă' : applicationStatus}
        </div>
      )}

      <div className="program-selection">
        <h3>Selectați Programul</h3>
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
      </div>

      {selectedProgram && (
        <div className="document-selection">
          <h3>Selectați Documentele</h3>
          <div className="documents-grid">
            {uploadedDocuments.map(doc => (
              <div
                key={doc.id}
                className={`document-card ${selectedDocuments.includes(doc.id) ? 'selected' : ''}`}
                onClick={() => canEdit && handleDocumentSelect(doc.id)}
              >
                <h4>{doc.name}</h4>
                <p>{doc.type}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="button-group">
        {canEdit && (
          <button
            className="save-draft-button"
            onClick={handleSaveDraft}
            disabled={loading || !selectedProgram}
          >
            {loading ? 'Se salvează...' : 'Salvează ca Draft'}
          </button>
        )}

        {canEdit && (
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={loading || !selectedProgram || selectedDocuments.length === 0}
          >
            {loading ? 'Se trimite...' : 'Trimite Aplicația'}
          </button>
        )}

        {canWithdraw && (
          <button
            className="withdraw-button"
            onClick={handleWithdraw}
            disabled={loading}
          >
            {loading ? 'Se retrage...' : 'Retrage Aplicația'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateApplication; 