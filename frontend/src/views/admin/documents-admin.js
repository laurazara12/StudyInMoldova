import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../../config/api.config';
import './documents-admin.css';

const DocumentsAdmin = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/documents/all`, {
        headers: getAuthHeaders()
      });
      setDocuments(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Eroare la încărcarea documentelor');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (documentId, newStatus) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/documents/${documentId}/status`,
        { status: newStatus },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        await fetchDocuments();
      } else {
        throw new Error(response.data.message || 'Eroare la actualizarea statusului');
      }
    } catch (err) {
      setError('Eroare la actualizarea statusului documentului');
      console.error('Error updating document status:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#16a34a';
      case 'rejected':
        return '#dc2626';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Aprobat';
      case 'rejected':
        return 'Respins';
      case 'pending':
        return 'În așteptare';
      default:
        return status;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true;
    return doc.status === filter;
  });

  const stats = {
    total: documents.length,
    pending: documents.filter(doc => doc.status === 'pending').length,
    approved: documents.filter(doc => doc.status === 'approved').length,
    rejected: documents.filter(doc => doc.status === 'rejected').length
  };

  if (loading) {
    return <div className="loading">Se încarcă documentele...</div>;
  }

  return (
    <div className="documents-admin-container">
      <div className="documents-admin-header">
        <h2>Administrare Documente</h2>
        <div className="documents-stats">
          <div className="stat-item">
            <span className="stat-label">Total</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">În așteptare</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Aprobate</span>
            <span className="stat-value">{stats.approved}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Respinse</span>
            <span className="stat-value">{stats.rejected}</span>
          </div>
        </div>
      </div>

      <div className="documents-filters">
        <button 
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Toate
        </button>
        <button 
          className={`filter-button ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          În așteptare
        </button>
        <button 
          className={`filter-button ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Aprobate
        </button>
        <button 
          className={`filter-button ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Respinse
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="documents-grid">
        {filteredDocuments.map(doc => (
          <div key={doc._id} className="document-card">
            <div className="document-header">
              <h3>{doc.document_type}</h3>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(doc.status) }}
              >
                {getStatusText(doc.status)}
              </span>
            </div>
            
            <div className="document-details">
              <p><strong>Utilizator:</strong> {doc.user?.name || 'N/A'}</p>
              <p><strong>Data încărcării:</strong> {new Date(doc.uploadDate).toLocaleDateString('ro-RO')}</p>
              <p><strong>Tip fișier:</strong> {doc.file_path.split('.').pop().toUpperCase()}</p>
            </div>

            <div className="document-actions">
              <button
                className="download-button"
                onClick={() => window.open(`${API_BASE_URL}/documents/download/${doc._id}`, '_blank')}
              >
                Descarcă
              </button>
              
              {doc.status === 'pending' && (
                <div className="status-actions">
                  <button
                    className="approve-button"
                    onClick={() => handleStatusChange(doc._id, 'approved')}
                  >
                    Aprobă
                  </button>
                  <button
                    className="reject-button"
                    onClick={() => handleStatusChange(doc._id, 'rejected')}
                  >
                    Respinge
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentsAdmin; 