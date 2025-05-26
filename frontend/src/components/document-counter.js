import React from 'react';
import './document-counter.css';

const DocumentCounter = ({ documents = [], documentTypes = [] }) => {
  const getPendingDocumentsCount = () => {
    return documents.filter(doc => doc && doc.status === 'pending').length;
  };

  const getApprovedDocumentsCount = () => {
    return documents.filter(doc => doc && doc.status === 'approved').length;
  };

  const getRejectedDocumentsCount = () => {
    return documents.filter(doc => doc && doc.status === 'rejected').length;
  };

  const getUploadedDocumentsCount = () => {
    return documents.filter(doc => doc && doc.status !== 'deleted').length;
  };

  const getTotalDocumentsCount = () => {
    return documentTypes.length;
  };

  return (
    <div className="document-counter">
      <div className="document-stats">
        <div className="document-stat">
          <span className="stat-label">Documente încărcate</span>
          <span className="stat-value">{getUploadedDocumentsCount()}/{getTotalDocumentsCount()}</span>
        </div>
        <div className="document-stat">
          <span className="stat-label">În așteptare</span>
          <span className="stat-value status-pending">{getPendingDocumentsCount()}</span>
        </div>
        <div className="document-stat">
          <span className="stat-label">Aprobate</span>
          <span className="stat-value status-approved">{getApprovedDocumentsCount()}</span>
        </div>
        <div className="document-stat">
          <span className="stat-label">Respinse</span>
          <span className="stat-value status-rejected">{getRejectedDocumentsCount()}</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentCounter; 