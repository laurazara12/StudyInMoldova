import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getAuthHeaders, handleApiError } from '../../../config/api.config';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import DocumentCounter from './components/document-counter';
import './documents-tab.css';

const documentTypes = [
  { id: 'diploma', name: 'Diploma', description: 'Bachelor\'s degree or equivalent' },
  { id: 'transcript', name: 'Transcript', description: 'Grade transcript' },
  { id: 'passport', name: 'Passport', description: 'Valid passport' },
  { id: 'photo', name: 'Photo', description: 'Recent 3x4 photo' },
  { id: 'medical', name: 'Medical Certificate', description: 'Medical certificate' },
  { id: 'insurance', name: 'Medical Insurance', description: 'Medical insurance' },
  { id: 'other', name: 'Other Documents', description: 'Other documents' },
  { id: 'cv', name: 'CV', description: 'Curriculum Vitae' }
];

const DocumentsTab = ({ userData }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({});
  const [buttonStates, setButtonStates] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [documentStats, setDocumentStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    // Save button states in localStorage
    const saveButtonState = () => {
      const newButtonStates = {};
      documentTypes.forEach(docType => {
        const document = documents.find(d => d && d.document_type === docType.id);
        if (document && document.status !== 'deleted') {
          newButtonStates[docType.id] = {
            isDownloadActive: true,
            isDeleteActive: document.status !== 'rejected'
          };
        }
      });
      setButtonStates(newButtonStates);
      localStorage.setItem('documentButtonStates', JSON.stringify(newButtonStates));
    };

    saveButtonState();
  }, [documents]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/api/documents/user-documents`, {
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
        createdAt: doc.createdAt,
        uploadDate: doc.uploadDate || doc.createdAt,
        file_path: doc.file_path
      }));

      console.log('Processed documents:', processedDocuments);
      setDocuments(processedDocuments);

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
      setDocumentStats({ pending: 0, approved: 0, rejected: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (docTypeId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error('File is too large. Maximum allowed size is 10MB.');
          return;
        }

        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        if (!allowedTypes.includes(file.type)) {
          toast.error('Unsupported file type. Only PDF, JPG, JPEG, PNG, DOC, DOCX, XLS and XLSX files are accepted.');
          return;
        }
        
        setUploadStatus(prev => ({
          ...prev,
          [docTypeId]: {
            file,
            uploading: false,
            uploaded: false,
            progress: 0
          }
        }));
      }
    };

    input.click();
  };

  const handleUpload = async (docTypeId) => {
    try {
      const file = uploadStatus[docTypeId]?.file;
      if (!file) {
        throw new Error('No file selected');
      }

      setUploadStatus(prev => ({
        ...prev,
        [docTypeId]: { ...prev[docTypeId], uploading: true }
      }));

      const formData = new FormData();
      formData.append('document_type', docTypeId);
      formData.append('file', file);
      formData.append('status', 'pending');

      const response = await axios.post(
        `${API_BASE_URL}/api/documents/upload`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadStatus(prev => ({
              ...prev,
              [docTypeId]: { ...prev[docTypeId], progress }
            }));
          }
        }
      );

      if (!response || !response.data) {
        throw new Error('No response received from server');
      }

      if (response.data.success) {
        const newDocument = {
          ...response.data.data,
          status: response.data.data?.status || 'pending',
          document_type: docTypeId,
          uploadDate: new Date(),
          createdAt: new Date()
        };
        
        // Update documents list
        setDocuments(prev => {
          const updatedDocs = prev.filter(doc => doc.document_type !== docTypeId);
          return [...updatedDocs, newDocument];
        });
        
        // Update button states
        setButtonStates(prev => ({
          ...prev,
          [docTypeId]: {
            isDownloadActive: true,
            isDeleteActive: true
          }
        }));


        await fetchDocuments();

        toast.success('Document uploaded successfully');
        setUploadStatus(prev => ({
          ...prev,
          [docTypeId]: { ...prev[docTypeId], uploaded: true }
        }));
      } else {
        throw new Error(response.data.message || 'Error uploading document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(error.message || 'An error occurred while uploading the document');
    } finally {
      setUploadStatus(prev => ({
        ...prev,
        [docTypeId]: { ...prev[docTypeId], uploading: false }
      }));
    }
  };

  const handleDownload = async (documentId) => {
    try {
      const doc = documents.find(doc => doc.id === documentId);
      const fileName = doc?.originalName || 'document';
  
      const response = await axios.get(
        `${API_BASE_URL}/api/documents/${documentId}`,
        {
          headers: getAuthHeaders(),
          responseType: 'blob',
        }
      );
  
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
  
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error(handleApiError(error));
    }
  };
  

  const handleDocumentDelete = async (documentId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete the document?');
    if (!confirmDelete) return;
    try {
      setLoading(true);
      setError(null);

      const response = await axios.delete(`${API_BASE_URL}/api/documents/${documentId}`, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        await fetchDocuments();
        setSuccessMessage('Document deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(response.data.message || 'Error deleting document');
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

  const getButtonState = (docTypeId) => {
    const savedStates = JSON.parse(localStorage.getItem('documentButtonStates') || '{}');
    return savedStates[docTypeId] || { isDownloadActive: false, isDeleteActive: false };
  };

  if (loading) {
    return (
      <div className="documents-section">
        <div className="loading">Loading documents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="documents-section">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="documents-section">
      <h2>My Documents</h2>
      
      <DocumentCounter 
        documents={documents}
        documentTypes={documentTypes}
      />

      <div className="documents-grid">
        {documentTypes.map((docType) => {
          const document = documents?.find(d => d?.document_type === docType.id) || null;
          const uploadStatusForType = uploadStatus[docType.id];
          const isDocumentValid = document && document.status !== 'deleted';
          const buttonState = getButtonState(docType.id);
          
          return (
            <div key={docType.id} className="document-item">
              <div className="document-info">
                <h3>{docType.name}</h3>
                <p>{docType.description}</p>
                {isDocumentValid && (
                  <>
                    <p className={`status-${document.status}`}>Status: {
                      document.status === 'pending' ? 'Processing' :
                      document.status === 'approved' ? 'Approved' :
                      document.status === 'rejected' ? 'Rejected' :
                      document.status === 'deleted' ? 'Deleted' : document.status
                    }</p>
                    <p>Uploaded: {new Date(document.uploadDate || document.createdAt).toLocaleDateString()}</p>
                  </>
                )}
              </div>
              <div className="document-actions">
                {isDocumentValid ? (
                  <>
                    <button 
                      className={`download-button ${buttonState.isDownloadActive ? 'active' : ''}`}
                      onClick={() => handleDownload(document.id)}
                    >
                      Download
                    </button>
                    <button 
                      className={`delete-button ${buttonState.isDeleteActive ? 'active' : ''}`}
                      onClick={() => handleDocumentDelete(document.id)}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    {uploadStatusForType?.file && !uploadStatusForType?.uploaded && (
                      <button 
                        className="upload-button"
                        onClick={() => handleUpload(docType.id)}
                        disabled={uploadStatusForType.uploading}
                      >
                        {uploadStatusForType.uploading ? 'Uploading...' : 'Upload'}
                      </button>
                    )}
                    {!uploadStatusForType?.file && (
                      <button 
                        className="choose-button"
                        onClick={() => handleFileSelect(docType.id)}
                      >
                        Choose File
                      </button>
                    )}
                  </>
                )}
              </div>
              {uploadStatusForType?.uploading && (
                <div className="upload-progress">
                  <div 
                    className="progress-bar"
                    style={{ width: `${uploadStatusForType.progress}%` }}
                  ></div>
                  <span>{uploadStatusForType.progress}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentsTab;
