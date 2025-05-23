import React from 'react';
import DocumentCounter from '../../components/document-counter';
import './documents-section.css';

const DocumentsSection = ({
  documents,
  documentTypes,
  uploadStatus,
  handleFileSelect,
  handleUpload,
  handleDownload,
  handleDelete
}) => {
  return (
    <div className="documents-section">
      <h2>Documents</h2>
      
      <DocumentCounter 
        documents={documents}
        documentTypes={documentTypes}
      />

      <div className="documents-grid">
        {documentTypes.map((docType) => {
          const document = documents.find(d => d.document_type === docType.id);
          const uploadStatusForType = uploadStatus[docType.id];
          const isDocumentValid = document && document.status !== 'deleted';
          
          return (
            <div key={docType.id} className="document-item">
              <div className="document-info">
                <h3>{docType.name}</h3>
                <p>{docType.description}</p>
                {isDocumentValid && (
                  <>
                    <p>Status: {document.status}</p>
                    <p>Uploaded: {new Date(document.uploadDate).toLocaleDateString()}</p>
                  </>
                )}
              </div>
              <div className="document-actions">
                {isDocumentValid ? (
                  <>
                    <button 
                      className="download-button"
                      onClick={() => handleDownload(docType.id)}
                    >
                      Download
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => handleDelete(docType.id)}
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
                        onClick={() => {
                          handleFileSelect(docType.id);
                        }}
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

export default DocumentsSection;

 