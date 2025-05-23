import React, { useEffect, useState } from 'react';
import DocumentCounter from '../../components/document-counter';
import './documents-section.css';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../../config';

const DocumentsSection = ({
  documents: initialDocuments,
  documentTypes,
  uploadStatus,
  handleFileSelect,
  handleUpload,
  handleDownload,
  onDocumentsUpdate
}) => {
  const [documents, setDocuments] = useState(initialDocuments);
  const [buttonStates, setButtonStates] = useState({});

  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  useEffect(() => {
    // Salvăm starea butoanelor în localStorage
    const saveButtonState = () => {
      const newButtonStates = {};
      documentTypes.forEach(docType => {
        const document = documents.find(d => d.document_type === docType.id);
        if (document && document.status !== 'deleted') {
          newButtonStates[docType.id] = {
            isDownloadActive: true,
            isDeleteActive: true
          };
        }
      });
      setButtonStates(newButtonStates);
      localStorage.setItem('documentButtonStates', JSON.stringify(newButtonStates));
    };

    saveButtonState();
  }, [documents, documentTypes]);

  const getButtonState = (docTypeId) => {
    const savedStates = JSON.parse(localStorage.getItem('documentButtonStates') || '{}');
    return savedStates[docTypeId] || { isDownloadActive: false, isDeleteActive: false };
  };

  const handleDelete = async (documentId) => {
    try {
      const document = documents.find(doc => doc.id === documentId);
      if (!document) {
        toast.error('Documentul nu a fost găsit');
        return;
      }

      // Confirmare pentru ștergere
      const confirmMessage = document.status === 'approved' 
        ? 'Această acțiune va șterge definitiv documentul aprobat. Doriți să continuați?'
        : document.status === 'rejected'
        ? 'Această acțiune va șterge definitiv documentul respins. Doriți să continuați?'
        : 'Sunteți sigur că doriți să ștergeți acest document?';

      if (!window.confirm(confirmMessage)) {
        return;
      }

      const response = await axios.delete(`${API_BASE_URL}/api/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        // Actualizează lista de documente după ștergere
        const updatedDocuments = documents.filter(doc => doc.id !== documentId);
        setDocuments(updatedDocuments);
        
        // Actualizează starea butonului
        const newButtonStates = { ...buttonStates };
        delete newButtonStates[`delete_${documentId}`];
        setButtonStates(newButtonStates);
        
        // Salvează starea actualizată
        localStorage.setItem('documentButtonStates', JSON.stringify(newButtonStates));
        
        // Notifică componenta părinte despre actualizare
        if (onDocumentsUpdate) {
          onDocumentsUpdate(updatedDocuments);
        }
        
        toast.success(response.data.message || 'Document șters cu succes');
      } else {
        toast.error(response.data.message || 'Eroare la ștergerea documentului');
      }
    } catch (error) {
      console.error('Eroare la ștergerea documentului:', error);
      
      let errorMessage = 'Eroare la ștergerea documentului';
      
      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = 'Documentul nu a fost găsit';
            break;
          case 403:
            errorMessage = 'Nu aveți permisiunea de a șterge acest document';
            break;
          case 401:
            errorMessage = 'Sesiunea a expirat. Vă rugăm să vă autentificați din nou';
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <div className="documents-section">
      <h2>Documente</h2>
      
      <DocumentCounter 
        documents={documents}
        documentTypes={documentTypes}
      />

      <div className="documents-grid">
        {documentTypes.map((docType) => {
          const document = documents.find(d => d.document_type === docType.id);
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
                    <p>Status: {document.status}</p>
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
                    <button 
                      className={`delete-button ${buttonState.isDeleteActive ? 'active' : ''}`}
                      onClick={() => handleDelete(document.id)}
                    >
                      Șterge
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

export default DocumentsSection;

 