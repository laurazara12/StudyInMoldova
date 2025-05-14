import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import './create-application.css';

const CreateApplication = () => {
  const [programs, setPrograms] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchPrograms();
    fetchUserDocuments();
  }, []);

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/programs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrograms(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Eroare la încărcarea programelor');
      setLoading(false);
    }
  };

  const fetchUserDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/documents/user-documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(response.data.data);
    } catch (err) {
      setError('Eroare la încărcarea documentelor');
    }
  };

  const handleProgramChange = (e) => {
    setSelectedProgram(e.target.value);
  };

  const handleDocumentChange = (documentId) => {
    setSelectedDocuments(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId);
      }
      return [...prev, documentId];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:4000/api/applications', {
        program: selectedProgram,
        documents: selectedDocuments
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setSelectedProgram('');
      setSelectedDocuments([]);
    } catch (err) {
      setError('Eroare la crearea aplicației');
    }
  };

  if (loading) {
    return <div className="loading">Se încarcă...</div>;
  }

  return (
    <div className="create-application-container">
      <Helmet>
        <title>Creare Aplicație - Study In Moldova</title>
      </Helmet>

      <div className="create-application-header">
        <h1>Creare Aplicație</h1>
        <p>Completează formularul pentru a aplica la programul dorit</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Aplicația a fost creată cu succes!</div>}

      <form onSubmit={handleSubmit} className="application-form">
        <div className="form-group">
          <label htmlFor="program">Selectează Programul:</label>
          <select
            id="program"
            value={selectedProgram}
            onChange={handleProgramChange}
            required
          >
            <option value="">Selectează un program</option>
            {programs.map(program => (
              <option key={program._id} value={program._id}>
                {program.name} - {program.university.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Selectează Documentele Necesare:</label>
          <div className="documents-grid">
            {documents.map(doc => (
              <div key={doc._id} className="document-item">
                <input
                  type="checkbox"
                  id={doc._id}
                  checked={selectedDocuments.includes(doc._id)}
                  onChange={() => handleDocumentChange(doc._id)}
                />
                <label htmlFor={doc._id}>
                  {doc.type} - {doc.status === 'approved' ? 'Aprobat' : 'În așteptare'}
                </label>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="submit-button">
          Trimite Aplicația
        </button>
      </form>
    </div>
  );
};

export default CreateApplication; 