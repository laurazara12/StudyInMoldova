import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../../../config/api.config';
import DeleteDocumentModal from '../../../components/DeleteDocumentModal';
import { FaCheckCircle, FaTimesCircle, FaTrash, FaEdit, FaClock, FaUsers, FaUserPlus, FaFileUpload, FaFileAlt, FaShieldAlt } from 'react-icons/fa';

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
      console.log('Loading documents...');
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/api/documents`, {
        headers: getAuthHeaders()
      });

      console.log('Server response documents:', response.data);

      if (!response.data) {
        throw new Error('No data received from server');
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error loading documents');
      }

      const documentsData = response.data.data || [];
      console.log(`Found ${documentsData.length} documents`);

      // Filtrăm documentele șterse
      const activeDocuments = documentsData.filter(doc => doc.status !== 'deleted');
      console.log(`Found ${activeDocuments.length} active documents out of ${documentsData.length} total`);

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

      console.log('Processed documents:', processedDocuments);
      setDocuments(processedDocuments);
      setFilteredDocuments(processedDocuments);

      // Actualizăm statisticile din răspunsul serverului
      if (response.data.status) {
        setDocumentStats(response.data.status);
      } else {
        // Fallback la calculul local dacă statisticile nu sunt în răspuns
        const statusCounts = {
          pending: processedDocuments.filter(doc => doc.status === 'pending').length,
          approved: processedDocuments.filter(doc => doc.status === 'approved').length,
          rejected: processedDocuments.filter(doc => doc.status === 'rejected').length
        };
        setDocumentStats(statusCounts);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Error loading documents: ' + error.message);
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
        throw new Error(response.data.message || 'Error approving document');
      }

      setSuccessMessage('Document approved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error approving document:', error);
      setError('An error occurred while approving the document. Please try again.');
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
        throw new Error(response.data.message || 'Error rejecting document');
      }

      setSuccessMessage('Document rejected successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error rejecting document:', error);
      setError('An error occurred while rejecting the document. Please try again.');
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
        setSuccessMessage('Document deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      if (error.response) {
        if (error.response.status === 404) {
          setError('Document not found');
        } else if (error.response.status === 403) {
          setError('You do not have permission to delete this document');
        } else {
          setError(error.response.data.message || 'Error deleting document');
        }
      } else {
        setError(error.message || 'Error communicating with server');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = (documentType, userId) => {
    // Implementați funcția de descărcare a documentului aici
    console.log(`Downloading document of type ${documentType} for user ${userId}`);
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
              placeholder="Search by user name or document type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-section documents-filter">
          <div className="filter-group">
            <label>Document Type:</label>
            <select
              value={filterDocumentType}
              onChange={(e) => setFilterDocumentType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All types</option>
              <option value="diploma">Diploma</option>
              <option value="transcript">Transcript</option>
              <option value="passport">Passport</option>
              <option value="photo">Photo</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Date:</label>
            <div className="date-range-inputs">
              <input
                type="date"
                value={filterDateRange.start}
                onChange={(e) => setFilterDateRange({...filterDateRange, start: e.target.value})}
                className="date-input"
              />
              <span>to</span>
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
            Reset Filters
          </button>
          <button 
            className="search-button"
            onClick={handleSearch}
          >
            Search
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

      <div className="documents-section">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading documents...</p>
          </div>
        ) : (
          <div className="documents-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map(doc => (
                  <tr key={doc.id}>
                    <td>{doc.id}</td>
                    <td>{doc.user_name || `User ID: ${doc.user_id}`}</td>
                    <td>{doc.document_type}</td>
                    <td>
                      <span className={`status-badge status-${doc.status}`}>
                        {doc.status === 'pending' ? 'Pending' :
                         doc.status === 'approved' ? 'Approved' :
                         doc.status === 'rejected' ? 'Rejected' :
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
                          <i className="fas fa-download"></i> Download
                        </button>
                        {doc.status === 'pending' && (
                          <>
                            <button 
                              className="btn-success"
                              onClick={() => handleConfirmDocument(doc)}
                            >
                              <i className="fas fa-check"></i> Approve
                            </button>
                            <button 
                              className="btn-delete"
                              onClick={() => handleRejectDocument(doc)}
                            >
                              <i className="fas fa-times"></i> Reject
                            </button>
                          </>
                        )}
                        <button 
                          className="btn-delete"
                          onClick={() => setDocumentToDelete(doc)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {documentToDelete && (
        <DeleteDocumentModal
          isOpen={!!documentToDelete}
          onClose={() => setDocumentToDelete(null)}
          document={documentToDelete}
          onDelete={(document) => {
            handleDocumentDelete(document.id, 'Document deleted by administrator.');
            setDocumentToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default DocumentsTab;
