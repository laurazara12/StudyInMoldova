import React from 'react';
import styles from './application-details-modal.css';

const ApplicationDetailsModal = ({ application, onClose }) => {
  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'pending':
        return 'În procesare';
      case 'confirmed':
        return 'Trimisă și Confirmată';
      case 'rejected':
        return 'Respinse';
      case 'withdrawn':
        return 'Retrase';
      default:
        return status;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-modal-button" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h3>Detalii Aplicație</h3>
          <span className={`status-badge ${application.status}`}>
            {getStatusLabel(application.status)}
          </span>
        </div>

        <div className="modal-body">
          <div className="details-section">
            <h4>Program</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>Nume program:</label>
                <span>{application.program?.name || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Universitate:</label>
                <span>{application.program?.university?.name || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Facultate:</label>
                <span>{application.program?.faculty || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Grad:</label>
                <span>{application.program?.degree || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h4>Documente Încărcate</h4>
            {application.documents && application.documents.length > 0 ? (
              <ul className="documents-list">
                {application.documents.map(doc => (
                  <li key={doc.id} className="document-item">
                    <div className="document-info">
                      <span className="document-name">{doc.originalName || doc.filename}</span>
                      <span className="document-type">{doc.document_type}</span>
                    </div>
                    <span className={`document-status ${doc.status}`}>
                      {doc.status === 'pending' ? 'În procesare' :
                       doc.status === 'approved' ? 'Aprobat' :
                       doc.status === 'rejected' ? 'Respinse' : doc.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-documents">Nu există documente încărcate</p>
            )}
          </div>

          <div className="details-section">
            <h4>Informații Aplicație</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>Data aplicării:</label>
                <span>{new Date(application.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <label>Ultima actualizare:</label>
                <span>{new Date(application.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {application.notes && (
            <div className="details-section">
              <h4>Note</h4>
              <p className="application-notes">{application.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal; 