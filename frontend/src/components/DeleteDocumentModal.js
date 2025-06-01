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
        throw new Error('Invalid or missing document');
      }

      // Check if document has all required fields
      const documentData = {
        id: document.id,
        document_type: document.document_type || document.type,
        file_path: document.file_path || document.filePath,
        filename: document.filename,
        originalName: document.originalName,
        user_id: document.user_id,
        status: document.status
      };

      console.log('Attempting to delete document:', documentData);

      const response = await axios.delete(`${API_BASE_URL}/api/documents/${document.id}`, {
        headers: getAuthHeaders(),
        data: { 
          admin_message: adminMessage,
          document: documentData
        }
      });

      if (response.data.success) {
        console.log('Document successfully deleted:', response.data);
        onDelete(document);
        onClose();
        setShowConfirmation(false);
        setAdminMessage('');
      } else {
        throw new Error(response.data.message || 'Error deleting document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      let errorMessage = 'Error deleting document';
      
      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = 'Document not found in database';
            break;
          case 401:
            errorMessage = 'You do not have permission to delete this document';
            break;
          case 403:
            errorMessage = 'You do not have permission to delete this document';
            break;
          case 400:
            errorMessage = error.response.data.message || 'Document cannot be deleted';
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
              <h3>Delete Document</h3>
            </div>
            <p className="modal-message">
              You are about to delete this document. Would you like to add a notification message? (optional)
            </p>
            <div className="form-group">
              <textarea
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                placeholder="Example: This document was deleted because it violated policy X."
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
                Cancel
              </button>
              <button 
                className="next-button"
                onClick={handleNext}
                disabled={isDeleting}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="modal-warning">
              <span className="warning-icon">❓</span>
              <h3>Confirm Deletion</h3>
            </div>
            <p className="modal-message">
              Are you sure you want to delete this document?
            </p>
            {adminMessage && (
              <div className="admin-message-preview">
                <p>Notification message that will be sent to the user:</p>
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
                Back
              </button>
              <button 
                className="delete-button"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeleteDocumentModal; 