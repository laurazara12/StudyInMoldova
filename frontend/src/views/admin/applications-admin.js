import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import './applications-admin.css';

const ApplicationsAdmin = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/applications', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setApplications(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Eroare la încărcarea aplicațiilor');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus, adminNotes) => {
    try {
      await axios.put(
        `http://localhost:4000/api/applications/${applicationId}/status`,
        { status: newStatus, adminNotes },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      fetchApplications();
      setShowDetailsModal(false);
    } catch (err) {
      setError('Eroare la actualizarea statusului');
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = 
      app.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'under_review':
        return '#1E90FF';
      case 'approved':
        return '#32CD32';
      case 'rejected':
        return '#FF0000';
      default:
        return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'În așteptare';
      case 'under_review':
        return 'În revizuire';
      case 'approved':
        return 'Aprobată';
      case 'rejected':
        return 'Respinsă';
      default:
        return status;
    }
  };

  if (loading) {
    return <div className="applications-loading">Se încarcă aplicațiile...</div>;
  }

  if (error) {
    return <div className="applications-error">{error}</div>;
  }

  return (
    <div className="applications-admin-container">
      <Helmet>
        <title>Gestionare Aplicații - Dashboard Admin</title>
      </Helmet>

      <div className="applications-header">
        <h1>Gestionare Aplicații</h1>
        <div className="applications-filters">
          <input
            type="text"
            placeholder="Caută după nume sau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">Toate statusurile</option>
            <option value="pending">În așteptare</option>
            <option value="under_review">În revizuire</option>
            <option value="approved">Aprobate</option>
            <option value="rejected">Respinse</option>
          </select>
        </div>
      </div>

      <div className="applications-grid">
        {filteredApplications.map((application) => (
          <div
            key={application._id}
            className="application-card"
            onClick={() => {
              setSelectedApplication(application);
              setShowDetailsModal(true);
            }}
          >
            <div className="application-header">
              <h3>{application.program.name}</h3>
              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor(application.status) }}
              >
                {getStatusText(application.status)}
              </span>
            </div>
            <div className="application-info">
              <p><strong>Candidat:</strong> {application.user.name}</p>
              <p><strong>Email:</strong> {application.user.email}</p>
              <p><strong>Data aplicării:</strong> {new Date(application.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>

      {showDetailsModal && selectedApplication && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Detalii Aplicație</h2>
              <button
                className="close-button"
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="application-details">
                <h3>Informații Program</h3>
                <p><strong>Program:</strong> {selectedApplication.program.name}</p>
                <p><strong>Universitate:</strong> {selectedApplication.program.university}</p>
                <p><strong>Facultate:</strong> {selectedApplication.program.faculty}</p>
                <p><strong>Grad:</strong> {selectedApplication.program.degree}</p>
                <p><strong>Durată:</strong> {selectedApplication.program.duration} ani</p>
                <p><strong>Taxă:</strong> {selectedApplication.program.tuitionFee} MDL/an</p>

                <h3>Informații Candidat</h3>
                <p><strong>Nume:</strong> {selectedApplication.user.name}</p>
                <p><strong>Email:</strong> {selectedApplication.user.email}</p>

                <h3>Documente Încărcate</h3>
                <ul className="documents-list">
                  {selectedApplication.documents.map((doc, index) => (
                    <li key={index}>{doc}</li>
                  ))}
                </ul>

                <h3>Status Aplicație</h3>
                <div className="status-actions">
                  <select
                    value={selectedApplication.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      handleStatusUpdate(selectedApplication._id, newStatus);
                    }}
                    className="status-select"
                  >
                    <option value="pending">În așteptare</option>
                    <option value="under_review">În revizuire</option>
                    <option value="approved">Aprobată</option>
                    <option value="rejected">Respinsă</option>
                  </select>
                </div>

                <div className="admin-notes">
                  <h3>Note Admin</h3>
                  <textarea
                    value={selectedApplication.adminNotes || ''}
                    onChange={(e) => {
                      handleStatusUpdate(
                        selectedApplication._id,
                        selectedApplication.status,
                        e.target.value
                      );
                    }}
                    placeholder="Adaugă note pentru această aplicație..."
                    className="notes-textarea"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsAdmin; 