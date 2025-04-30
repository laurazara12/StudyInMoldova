import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../config/api.config';
import './DeleteDocumentModal.css';

const DeleteDocumentModal = ({ isOpen, onClose, document, onDelete }) => {
  const [adminMessage, setAdminMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`${API_BASE_URL}/api/documents/${document.id}`, {
        headers: getAuthHeaders(),
        data: { admin_message: adminMessage }
      });
      onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Eroare la ștergerea documentului');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Ștergere Document</h2>
        <p>Ești sigur că dorești să ștergi acest document?</p>
        <div className="form-group">
          <label htmlFor="adminMessage">Mesaj pentru utilizator (opțional):</label>
          <textarea
            id="adminMessage"
            value={adminMessage}
            onChange={(e) => setAdminMessage(e.target.value)}
            placeholder="Introduceți un mesaj pentru utilizator..."
            rows="4"
          />
        </div>
        <div className="modal-actions">
          <button 
            className="cancel-button"
            onClick={onClose}
            disabled={isDeleting}
          >
            Anulează
          </button>
          <button 
            className="delete-button"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Se șterge...' : 'Șterge'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDocumentModal; 