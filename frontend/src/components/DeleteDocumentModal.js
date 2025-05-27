import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../config/api.config';
import './DeleteDocumentModal.css';

const DeleteDocumentModal = ({ isOpen, onClose, document, onDelete }) => {
  const [adminMessage, setAdminMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      if (!document || !document.id) {
        throw new Error('Document invalid sau lipsă');
      }

      // Verificăm dacă documentul are toate câmpurile necesare
      const documentData = {
        id: document.id,
        document_type: document.document_type || document.type,
        file_path: document.file_path || document.filePath,
        filename: document.filename,
        originalName: document.originalName,
        user_id: document.user_id,
        status: document.status
      };

      console.log('Încercare ștergere document:', documentData);

      const response = await axios.delete(`${API_BASE_URL}/api/documents/${document.id}`, {
        headers: getAuthHeaders(),
        data: { 
          admin_message: adminMessage,
          document: documentData
        }
      });

      if (response.data.success) {
        console.log('Document șters cu succes:', response.data);
        onDelete(document);
        onClose();
        setShowConfirmation(false);
        setAdminMessage('');
      } else {
        throw new Error(response.data.message || 'Eroare la ștergerea documentului');
      }
    } catch (error) {
      console.error('Eroare la ștergerea documentului:', error);
      let errorMessage = 'Eroare la ștergerea documentului';
      
      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = 'Documentul nu a fost găsit în baza de date';
            break;
          case 401:
            errorMessage = 'Nu aveți permisiunea de a șterge acest document';
            break;
          case 403:
            errorMessage = 'Nu aveți permisiunea de a șterge acest document';
            break;
          case 400:
            errorMessage = error.response.data.message || 'Documentul nu poate fi șters';
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNext = () => {
    setError(null);
    setShowConfirmation(true);
  };

  const handleBack = () => {
    setError(null);
    setShowConfirmation(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {!showConfirmation ? (
          <>
            <div className="modal-warning">
              <span className="warning-icon">⚠️</span>
              <h3>Ștergere Document</h3>
            </div>
            <p className="modal-message">
              Sunteți pe cale să ștergeți acest document. Doriți să adăugați un mesaj de notificare? (opțional)
            </p>
            <div className="form-group">
              <textarea
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                placeholder="Exemplu: Acest document a fost șters deoarece a încălcat politica X."
                rows="4"
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={onClose}
                disabled={isDeleting}
              >
                Anulează
              </button>
              <button 
                className="next-button"
                onClick={handleNext}
                disabled={isDeleting}
              >
                Următorul
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="modal-warning">
              <span className="warning-icon">❓</span>
              <h3>Confirmare Ștergere</h3>
            </div>
            <p className="modal-message">
              Sunteți sigur că doriți să ștergeți acest document?
            </p>
            {adminMessage && (
              <div className="admin-message-preview">
                <p>Mesajul de notificare care va fi trimis utilizatorului:</p>
                <p className="message-content">{adminMessage}</p>
              </div>
            )}
            {error && <div className="error-message">{error}</div>}
            <div className="modal-actions">
              <button 
                className="back-button"
                onClick={handleBack}
                disabled={isDeleting}
              >
                Înapoi
              </button>
              <button 
                className="delete-button"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Se șterge...' : 'Șterge'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeleteDocumentModal; 