import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../config/api.config';
import './DeleteDocumentModal.css';

const DeleteDocumentModal = ({ isOpen, onClose, document, onDelete }) => {
  const [adminMessage, setAdminMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await axios.delete(`${API_BASE_URL}/api/documents/admin/${document.id}`, {
        headers: getAuthHeaders(),
        data: { admin_message: adminMessage }
      });

      if (response.data.success) {
        onDelete();
        onClose();
        setShowConfirmation(false);
        setAdminMessage('');
      } else {
        alert(response.data.message || 'Eroare la ștergerea documentului');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      const errorMessage = error.response?.data?.message || 'Eroare la ștergerea documentului';
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNext = () => {
    setShowConfirmation(true);
  };

  const handleBack = () => {
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
              You are about to delete this user's document. Would you like to add a notification message? (optional)
            </p>
            <div className="form-group">
              <textarea
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                placeholder="Example: This document was deleted because it violated policy X."
                rows="4"
              />
            </div>
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