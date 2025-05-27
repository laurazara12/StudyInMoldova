import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getAuthHeaders, handleApiError } from '../../../config/api.config';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import DocumentCounter from '../../../components/document-counter';
import './documents-tab.css';

const documentTypes = [
  { id: 'diploma', name: 'Diploma', description: 'Diploma de bacalaureat sau echivalent' },
  { id: 'transcript', name: 'Transcript', description: 'Foaia matricolă cu notele' },
  { id: 'passport', name: 'Pașaport', description: 'Pașaport valid' },
  { id: 'photo', name: 'Fotografie', description: 'Fotografie recentă 3x4' },
  { id: 'medical', name: 'Certificat Medical', description: 'Certificat medical' },
  { id: 'insurance', name: 'Asigurare Medicală', description: 'Asigurare medicală' },
  { id: 'other', name: 'Alte Documente', description: 'Alte documente' },
  { id: 'cv', name: 'CV', description: 'Curriculum Vitae' }
];

const DocumentsTab = ({ userData }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({});
  const [buttonStates, setButtonStates] = useState({});

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    // Salvăm starea butoanelor în localStorage
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

      if (!response.data) {
        throw new Error('Nu s-au primit date de la server');
      }

      let documentsData = [];
      if (response.data.success && response.data.data) {
        documentsData = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      } else if (Array.isArray(response.data)) {
        documentsData = response.data;
      } else if (response.data.documents && Array.isArray(response.data.documents)) {
        documentsData = response.data.documents;
      }

      // Filtrăm documentele șterse și ne asigurăm că toate proprietățile necesare sunt prezente
      const processedDocuments = documentsData
        .filter(doc => doc && doc.status !== 'deleted')
        .map(doc => ({
          id: doc.id,
          document_type: doc.document_type,
          name: doc.name || doc.document_type,
          status: doc.status || 'pending',
          url: doc.url || doc.file_path,
          uploadDate: doc.uploadDate || doc.createdAt,
          createdAt: doc.createdAt
        }));

      setDocuments(processedDocuments);
    } catch (error) {
      console.error('Eroare la obținerea documentelor:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (docTypeId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Verificăm dimensiunea fișierului (10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error('Fișierul este prea mare. Dimensiunea maximă permisă este de 10MB.');
          return;
        }

        // Verificăm tipul fișierului
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
          toast.error('Tip de fișier neacceptat. Sunt acceptate doar fișiere PDF, JPG, JPEG și PNG.');
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
        throw new Error('Nu a fost selectat niciun fișier');
      }

      setUploadStatus(prev => ({
        ...prev,
        [docTypeId]: { ...prev[docTypeId], uploading: true }
      }));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', docTypeId);
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
        throw new Error('Nu s-a primit niciun răspuns de la server');
      }

      if (response.data.success) {
        const newDocument = {
          ...response.data.data,
          status: response.data.data?.status || 'pending',
          document_type: docTypeId,
          uploadDate: new Date(),
          createdAt: new Date()
        };
        
        // Actualizăm lista de documente
        setDocuments(prev => {
          const updatedDocs = prev.filter(doc => doc.document_type !== docTypeId);
          return [...updatedDocs, newDocument];
        });
        
        // Actualizăm starea butoanelor
        setButtonStates(prev => ({
          ...prev,
          [docTypeId]: {
            isDownloadActive: true,
            isDeleteActive: true
          }
        }));

        // Reîncărcăm toate documentele pentru a ne asigura că avem datele cele mai recente
        await fetchDocuments();

        toast.success('Document încărcat cu succes');
        setUploadStatus(prev => ({
          ...prev,
          [docTypeId]: { ...prev[docTypeId], uploaded: true }
        }));
      } else {
        throw new Error(response.data.message || 'Eroare la încărcarea documentului');
      }
    } catch (error) {
      console.error('Eroare la încărcarea documentului:', error);
      toast.error(error.message || 'A apărut o eroare la încărcarea documentului');
    } finally {
      setUploadStatus(prev => ({
        ...prev,
        [docTypeId]: { ...prev[docTypeId], uploading: false }
      }));
    }
  };

  const handleDownload = async (documentId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/documents/${documentId}/download`,
        {
          headers: getAuthHeaders(),
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'document.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Eroare la descărcarea documentului:', error);
      toast.error(handleApiError(error));
    }
  };

  const handleDelete = async (documentId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/documents/${documentId}`,
        { headers: getAuthHeaders() }
      );

      if (response.data?.success) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        toast.success('Document șters cu succes');
      } else {
        throw new Error(response.data.message || 'Eroare la ștergerea documentului');
      }
    } catch (error) {
      console.error('Eroare la ștergerea documentului:', error);
      toast.error(handleApiError(error));
    }
  };

  const getButtonState = (docTypeId) => {
    const savedStates = JSON.parse(localStorage.getItem('documentButtonStates') || '{}');
    return savedStates[docTypeId] || { isDownloadActive: false, isDeleteActive: false };
  };

  if (loading) {
    return (
      <div className="documents-section">
        <div className="loading">Se încarcă documentele...</div>
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
      <h2>Documentele Mele</h2>
      
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
                      document.status === 'pending' ? 'În procesare' :
                      document.status === 'approved' ? 'Aprobat' :
                      document.status === 'rejected' ? 'Respinse' :
                      document.status === 'deleted' ? 'Șters' : document.status
                    }</p>
                    <p>Încărcat: {new Date(document.uploadDate || document.createdAt).toLocaleDateString()}</p>
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
                      Descarcă
                    </button>
                    {document.status !== 'rejected' && (
                      <button 
                        className={`delete-button ${buttonState.isDeleteActive ? 'active' : ''}`}
                        onClick={() => handleDelete(document.id)}
                      >
                        Șterge
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {uploadStatusForType?.file && !uploadStatusForType?.uploaded && (
                      <button 
                        className="upload-button"
                        onClick={() => handleUpload(docType.id)}
                        disabled={uploadStatusForType.uploading}
                      >
                        {uploadStatusForType.uploading ? 'Se încarcă...' : 'Încarcă'}
                      </button>
                    )}
                    {!uploadStatusForType?.file && (
                      <button 
                        className="choose-button"
                        onClick={() => handleFileSelect(docType.id)}
                      >
                        Alege Fișier
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
