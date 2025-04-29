import React from 'react';
import './document-counter.css';

const DocumentCounter = ({ documents, documentTypes }) => {
  const getPendingDocumentsCount = () => {
    return documents.filter(doc => doc.status === 'pending').length;
  };

  const getApprovedDocumentsCount = () => {
    return documents.filter(doc => doc.status === 'approved').length;
  };

  const getRejectedDocumentsCount = () => {
    return documents.filter(doc => doc.status === 'rejected').length;
  };

  const getUploadedDocumentsCount = () => {
    return documents.length;
  };

  return (
    <div className="document-counter">
      <div className="document-stats">
        <div className="document-stat">
          <span className="stat-label">Documente încărcate</span>
          <span className="stat-value">{getUploadedDocumentsCount()}/{documentTypes.length}</span>
        </div>
        <div className="document-stat">
          <span className="stat-label">În așteptare</span>
          <span className="stat-value">{getPendingDocumentsCount()}</span>
        </div>
        <div className="document-stat">
          <span className="stat-label">Aprobate</span>
          <span className="stat-value">{getApprovedDocumentsCount()}</span>
        </div>
        <div className="document-stat">
          <span className="stat-label">Respinse</span>
          <span className="stat-value">{getRejectedDocumentsCount()}</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentCounter; 