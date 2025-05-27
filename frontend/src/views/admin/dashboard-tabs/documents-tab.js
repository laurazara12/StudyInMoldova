import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../../../config/api.config';
import DeleteDocumentModal from '../../../components/DeleteDocumentModal';

const DocumentsTab = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDocumentType, setFilterDocumentType] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState({ start: '', end: '' });
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [documentStats, setDocumentStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      console.log('Începe încărcarea documentelor...');
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/api/documents`, {
        headers: getAuthHeaders()
      });

      console.log('Răspuns server documente:', response.data);

      if (!response.data) {
        throw new Error('Nu s-au primit date de la server');
      }

      let documentsData = [];
      if (response.data.success && response.data.data) {
        documentsData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        documentsData = response.data;
      } else if (response.data.documents && Array.isArray(response.data.documents)) {
        documentsData = response.data.documents;
      } else {
        throw new Error('Format invalid al datelor primite');
      }

      // Filtrăm documentele șterse
      const activeDocuments = documentsData.filter(doc => doc.status !== 'deleted');
      console.log(`S-au găsit ${activeDocuments.length} documente active din ${documentsData.length} total`);

      const processedDocuments = activeDocuments.map(doc => ({
        id: doc.id,
        document_type: doc.document_type,
        status: doc.status || 'pending',
        filename: doc.filename,
        originalName: doc.originalName,
        user_id: doc.user_id,
        createdAt: doc.createdAt,
        uploadDate: doc.uploadDate || doc.createdAt,
        file_path: doc.file_path
      }));

      console.log('Documente procesate:', processedDocuments);
      setDocuments(processedDocuments);
      setFilteredDocuments(processedDocuments);

      // Actualizăm statisticile
      const statusCounts = {
        pending: processedDocuments.filter(doc => doc.status === 'pending').length,
        approved: processedDocuments.filter(doc => doc.status === 'approved').length,
        rejected: processedDocuments.filter(doc => doc.status === 'rejected').length
      };

      console.log('Statistici documente:', statusCounts);
      setDocumentStats(statusCounts);
    } catch (error) {
      console.error('Eroare la încărcarea documentelor:', error);
      setError('Eroare la încărcarea documentelor: ' + error.message);
      setDocuments([]);
      setFilteredDocuments([]);
      setDocumentStats({ pending: 0, approved: 0, rejected: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDocument = async (document) => {
    try {
      // Actualizăm imediat interfața
      const updatedDocuments = documents.map(doc => 
        doc.id === document.id 
          ? { ...doc, status: 'approved' }
          : doc
      );
      
      setDocuments(updatedDocuments);
      setFilteredDocuments(updatedDocuments);

      // Actualizăm statisticile
      const statusCounts = {
        pending: updatedDocuments.filter(doc => doc.status === 'pending').length,
        approved: updatedDocuments.filter(doc => doc.status === 'approved').length,
        rejected: updatedDocuments.filter(doc => doc.status === 'rejected').length
      };
      setDocumentStats(statusCounts);

      // Facem request-ul către server
      const response = await axios.put(
        `${API_BASE_URL}/api/documents/${document.id}`,
        {
          status: 'approved',
          document_type: document.document_type,
          file_path: document.file_path,
          filename: document.filename,
          originalName: document.originalName,
          user_id: document.user_id,
          admin_message: 'Documentul dumneavoastră a fost aprobat de administrator.'
        },
        { headers: getAuthHeaders() }
      );

      if (!response.data.success) {
        // Dacă request-ul eșuează, revenim la starea anterioară
        const revertedDocuments = documents.map(doc => 
          doc.id === document.id 
            ? { ...doc, status: document.status }
            : doc
        );
        setDocuments(revertedDocuments);
        setFilteredDocuments(revertedDocuments);
        throw new Error(response.data.message || 'Eroare la aprobarea documentului');
      }

      setSuccessMessage('Document aprobat cu succes!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Eroare la aprobarea documentului:', error);
      setError('A apărut o eroare la aprobarea documentului. Vă rugăm să încercați din nou.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleRejectDocument = async (document) => {
    try {
      // Actualizăm imediat interfața
      const updatedDocuments = documents.map(doc => 
        doc.id === document.id 
          ? { ...doc, status: 'rejected' }
          : doc
      );
      
      setDocuments(updatedDocuments);
      setFilteredDocuments(updatedDocuments);

      // Actualizăm statisticile
      const statusCounts = {
        pending: updatedDocuments.filter(doc => doc.status === 'pending').length,
        approved: updatedDocuments.filter(doc => doc.status === 'approved').length,
        rejected: updatedDocuments.filter(doc => doc.status === 'rejected').length
      };
      setDocumentStats(statusCounts);

      // Facem request-ul către server
      const response = await axios.put(
        `${API_BASE_URL}/api/documents/${document.id}`,
        {
          status: 'rejected',
          document_type: document.document_type,
          file_path: document.file_path,
          filename: document.filename,
          originalName: document.originalName,
          user_id: document.user_id,
          admin_message: 'Documentul dumneavoastră a fost respins de administrator.'
        },
        { headers: getAuthHeaders() }
      );

      if (!response.data.success) {
        // Dacă request-ul eșuează, revenim la starea anterioară
        const revertedDocuments = documents.map(doc => 
          doc.id === document.id 
            ? { ...doc, status: document.status }
            : doc
        );
        setDocuments(revertedDocuments);
        setFilteredDocuments(revertedDocuments);
        throw new Error(response.data.message || 'Eroare la respingerea documentului');
      }

      setSuccessMessage('Document respins cu succes!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Eroare la respingerea documentului:', error);
      setError('A apărut o eroare la respingerea documentului. Vă rugăm să încercați din nou.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDocumentDelete = async (documentId, adminMessage) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.delete(`${API_BASE_URL}/api/documents/${documentId}`, {
        headers: getAuthHeaders(),
        data: {
          admin_message: adminMessage
        }
      });

      if (response.data.success) {
        // Actualizăm lista de documente cu noile date
        const updatedDocuments = response.data.data;
        setDocuments(updatedDocuments);
        setFilteredDocuments(updatedDocuments);
        setDocumentStats(response.data.status);
        setSuccessMessage('Document șters cu succes');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Eroare la ștergerea documentului:', error);
      if (error.response) {
        if (error.response.status === 404) {
          setError('Documentul nu a fost găsit');
        } else if (error.response.status === 403) {
          setError('Nu aveți permisiunea de a șterge acest document');
        } else {
          setError(error.response.data.message || 'Eroare la ștergerea documentului');
        }
      } else {
        setError(error.message || 'Eroare la comunicarea cu serverul');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = (documentType, userId) => {
    // Implementați funcția de descărcare a documentului aici
    console.log(`Descărcarea documentului de tip ${documentType} pentru utilizatorul ${userId}`);
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
    const filtered = documents.filter(doc => {
      const matchesSearch = searchTerm === '' || 
        doc.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.document_type?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterDocumentType === 'all' || doc.document_type === filterDocumentType;
      const matchesDateRange = (!filterDateRange.start || new Date(doc.uploadDate) >= new Date(filterDateRange.start)) &&
                             (!filterDateRange.end || new Date(doc.uploadDate) <= new Date(filterDateRange.end));
      return matchesSearch && matchesType && matchesDateRange;
    });
    setFilteredDocuments(filtered);
  };

  return (
    <div className="documents-tab">
      <div className="dashboard-filters">
        <div className="search-box">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Caută după nume utilizator sau tip document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-section documents-filter">
          <div className="filter-group">
            <label>Tip Document:</label>
            <select
              value={filterDocumentType}
              onChange={(e) => setFilterDocumentType(e.target.value)}
              className="filter-select"
            >
              <option value="all">Toate tipurile</option>
              <option value="diploma">Diplomă</option>
              <option value="transcript">Transcript</option>
              <option value="passport">Pașaport</option>
              <option value="photo">Fotografie</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Data:</label>
            <div className="date-range-inputs">
              <input
                type="date"
                value={filterDateRange.start}
                onChange={(e) => setFilterDateRange({...filterDateRange, start: e.target.value})}
                className="date-input"
              />
              <span>până la</span>
              <input
                type="date"
                value={filterDateRange.end}
                onChange={(e) => setFilterDateRange({...filterDateRange, end: e.target.value})}
                className="date-input"
              />
            </div>
          </div>
          <button 
            className="clear-filters-button"
            onClick={() => {
              setSearchTerm('');
              setFilterDocumentType('all');
              setFilterDateRange({ start: '', end: '' });
              setFilteredDocuments(documents);
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
          <p>Se încarcă documentele...</p>
        </div>
      ) : (
        <div className="documents-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Utilizator</th>
                <th>Tip</th>
                <th>Status</th>
                <th>Data încărcării</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map(doc => (
                <tr key={doc.id}>
                  <td>{doc.id}</td>
                  <td>{doc.user_name || `Utilizator ID: ${doc.user_id}`}</td>
                  <td>{doc.document_type}</td>
                  <td>
                    <span className={`status-badge status-${doc.status}`}>
                      {doc.status === 'pending' ? 'În așteptare' :
                       doc.status === 'approved' ? 'Aprobat' :
                       doc.status === 'rejected' ? 'Respinse' :
                       doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </td>
                  <td>{formatDate(doc.uploadDate || doc.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn1"
                        onClick={() => handleDownloadDocument(doc.document_type, doc.user_id)}
                      >
                        <i className="fas fa-download"></i> Descarcă
                      </button>
                      {doc.status === 'pending' && (
                        <>
                          <button 
                            className="btn-success"
                            onClick={() => handleConfirmDocument(doc)}
                          >
                            <i className="fas fa-check"></i> Aprobă
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => handleRejectDocument(doc)}
                          >
                            <i className="fas fa-times"></i> Respinge
                          </button>
                        </>
                      )}
                      <button 
                        className="btn-delete"
                        onClick={() => setDocumentToDelete(doc)}
                      >
                        <i className="fas fa-trash"></i> Șterge
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {documentToDelete && (
        <DeleteDocumentModal
          isOpen={!!documentToDelete}
          onClose={() => setDocumentToDelete(null)}
          document={documentToDelete}
          onDelete={(document) => {
            handleDocumentDelete(document.id, 'Documentul dumneavoastră a fost șters de administrator.');
            setDocumentToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default DocumentsTab;
