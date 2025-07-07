import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../../../config/api.config';

const ApplicationsTab = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [filterApplicationStatus, setFilterApplicationStatus] = useState('all');
  const [filterApplicationDateRange, setFilterApplicationDateRange] = useState({ start: '', end: '' });
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [showApplicationEdit, setShowApplicationEdit] = useState(false);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [statistics, setStatistics] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      console.log('Loading applications...');
      const response = await axios.get(`${API_BASE_URL}/api/applications`, {
        headers: getAuthHeaders()
      });

      console.log('Server response applications:', response.data);

      if (!response.data) {
        throw new Error('No data received from server');
      }

      let applicationsData;
      if (response.data.success && response.data.data) {
        if (response.data.data.all) {
          applicationsData = response.data.data.all;
        } else if (response.data.data.grouped) {
          applicationsData = Object.values(response.data.data.grouped).flat();
        } else if (Array.isArray(response.data.data)) {
          applicationsData = response.data.data;
        } else {
          throw new Error('Invalid data format received: unexpected structure');
        }
      } else if (Array.isArray(response.data)) {
        applicationsData = response.data;
      } else {
        throw new Error('Invalid data format received: unexpected response');
      }

      if (!Array.isArray(applicationsData)) {
        throw new Error('Invalid data format received: data is not an array');
      }

      // Filtrează doar aplicațiile plătite
      const paidApplications = applicationsData.filter(app => app.is_paid === true);
      console.log('Processed paid applications:', paidApplications);
      setApplications(paidApplications);
      setFilteredApplications(paidApplications);

      // Actualizăm statisticile doar pentru aplicațiile plătite
      const stats = {
        totalApplications: paidApplications.length,
        draftApplications: paidApplications.filter(app => app.status === 'draft').length,
        submittedApplications: paidApplications.filter(app => app.status === 'submitted').length,
        pendingApplications: paidApplications.filter(app => app.status === 'pending').length,
        approvedApplications: paidApplications.filter(app => app.status === 'approved').length,
        rejectedApplications: paidApplications.filter(app => app.status === 'rejected').length,
        underReviewApplications: paidApplications.filter(app => app.status === 'under_review').length,
        withdrawnApplications: paidApplications.filter(app => app.status === 'withdrawn').length
      };

      setStatistics(stats);

    } catch (error) {
      console.error('Error loading applications:', error);
      setError('An error occurred while loading applications. Please try again.');
      setApplications([]);
      setFilteredApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowApplicationDetails(true);
  };

  const handleEditApplication = (application) => {
    setSelectedApplication(application);
    setShowApplicationEdit(true);
  };

  const handleUpdateApplicationStatus = async (applicationId, newStatus) => {
    try {
      // Verificăm dacă aplicația există în lista locală
      const application = applications.find(app => app && app.id === applicationId);
      if (!application) {
        setError('Application not found');
        return;
      }

      setLoading(true);
      setError(null);

      console.log('Updating application status:', {
        applicationId,
        newStatus,
        currentNotes: application.notes || ''
      });

      const response = await axios.patch(
        `${API_BASE_URL}/api/applications/${applicationId}/status`,
        {
          status: newStatus,
          notes: selectedApplication.notes || ''
        },
        { 
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        // Reîncărcăm lista de aplicații
        await loadApplications();
        
        // Închidem modalul și resetăm starea
        setShowApplicationEdit(false);
        setSelectedApplication(null);
        
        // Afișăm mesaj de succes
        setSuccessMessage('Application status was successfully updated!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response.data.message || 'Error updating application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      setError(error.response?.data?.message || 'Error updating application status');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Data invalidă:', dateString);
        return dateString || 'Invalid Date';
      }
      return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Eroare la formatat data:', error, dateString);
      return dateString || 'Invalid Date';
    }
  };

  const handleSearch = () => {
    const filtered = applications.filter(app => {
      const matchesSearch = searchTerm === '' || 
        app.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.program_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterApplicationStatus === 'all' || app.status === filterApplicationStatus;
      const appDate = app.application_date || app.createdAt || app.created_at;
      const matchesDateRange = (!filterApplicationDateRange.start || new Date(appDate) >= new Date(filterApplicationDateRange.start)) &&
                             (!filterApplicationDateRange.end || new Date(appDate) <= new Date(filterApplicationDateRange.end));
      return matchesSearch && matchesStatus && matchesDateRange;
    });
    setFilteredApplications(filtered);
  };

  // Descărcare document cu request autenticat (ca în documents-tab.js)
  const handleDownloadDocument = async (documentId, originalName) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/documents/admin/download/${documentId}`,
        {
          headers: getAuthHeaders(),
          responseType: 'blob',
        }
      );
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Eroare la descărcarea documentului:', error);
      alert('Eroare la descărcarea documentului!');
    }
  };

  return (
    <div className="applications-tab">
      <div className="application-stats">
        <div className="application-stat">
          Drafts
          <span className="stat-value status-draft">{statistics.draftApplications || 0}</span>
        </div>
        <div className="application-stat">
          Submitted
          <span className="stat-value status-submitted">{statistics.submittedApplications || 0}</span>
        </div>
        <div className="application-stat">
          Under Review
          <span className="stat-value status-under-review">{statistics.underReviewApplications || 0}</span>
        </div>
        <div className="application-stat">
          Approved
          <span className="stat-value status-approved">{statistics.approvedApplications || 0}</span>
        </div>
        <div className="application-stat">
          Rejected
          <span className="stat-value status-rejected">{statistics.rejectedApplications || 0}</span>
        </div>
        <div className="application-stat">
          Withdrawn
          <span className="stat-value status-withdrawn">{statistics.withdrawnApplications || 0}</span>
        </div>
      </div>

      <div className="dashboard-filters">
        <div className="search-box">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search by user name or program..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-section applications-filter">
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filterApplicationStatus}
              onChange={(e) => setFilterApplicationStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="under_review">Under Review</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Date:</label>
            <div className="date-range-inputs">
              <input 
                type="date" 
                className="date-input" 
                value={filterApplicationDateRange?.start || ''} 
                onChange={e => setFilterApplicationDateRange({...filterApplicationDateRange, start: e.target.value})} 
              />
              <span>to</span>
              <input 
                type="date" 
                className="date-input" 
                value={filterApplicationDateRange?.end || ''} 
                onChange={e => setFilterApplicationDateRange({...filterApplicationDateRange, end: e.target.value})} 
              />
            </div>
          </div>
          <button 
            className="clear-filters-button"
            onClick={() => {
              setSearchTerm('');
              setFilterApplicationStatus('all');
              setFilterApplicationDateRange({ start: '', end: '' });
              setFilteredApplications(applications);
            }}
          >
            Reset Filters
          </button>
          <button 
            className="clear-filters-button"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="alert-success">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading applications...</p>
        </div>
      ) : (
        <div className="applications-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Program</th>
                <th>University</th>
                <th>Application Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map(app => (
                <tr key={app.id}>
                  <td>{app.id}</td>
                  <td>
                    <span className="user-name">{app.user_name || `User ID: ${app.user_id}`}</span>
                  </td>
                  <td>{app.program?.name || 'N/A'}</td>
                  <td>{app.program?.university?.name || 'N/A'}</td>
                  <td>{formatDate(app.application_date || app.createdAt || app.created_at)}</td>
                  <td>
                    <span className={`status-badge status-${app.status}`}>
                      {app.status === 'pending' ? 'Pending' :
                       app.status === 'approved' ? 'Approved' :
                       app.status === 'rejected' ? 'Rejected' :
                       app.status === 'under_review' ? 'Under Review' :
                       app.status === 'withdrawn' ? 'Withdrawn' :
                       app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn1"
                        onClick={() => handleViewApplication(app)}
                      >
                        <i className="fas fa-eye"></i> View
                      </button>
                      <button 
                        className="btn-grey"
                        onClick={() => handleEditApplication(app)}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showApplicationDetails && selectedApplication && (
        <div className="modal-overlay">
          <div className="modal-content user-details-modal">
            <div className="modal-header">
              <h2>Application Details</h2>
              <button className="close-button" onClick={() => { setShowApplicationDetails(false); setSelectedApplication(null); }}>
                <span className="close-x">×</span>
              </button>
            </div>
            <div className="user-details-content">
              {/* Section 1: Basic Information */}
              <div className="user-details-section">
                <h3>Basic Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Application ID:</span>
                  <span className="detail-value">{selectedApplication.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Application Date:</span>
                  <span className="detail-value">{formatDate(selectedApplication.application_date || selectedApplication.createdAt || selectedApplication.created_at)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">{getStatusLabel(selectedApplication.status)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Notes:</span>
                  <span className="detail-value">{selectedApplication.notes || 'N/A'}</span>
                </div>
              </div>

              {/* Section 2: User */}
              <div className="user-details-section">
                <h3>User</h3>
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedApplication.user?.name || selectedApplication.user_name || `ID: ${selectedApplication.user_id}`}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedApplication.user?.email || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">User ID:</span>
                  <span className="detail-value">{selectedApplication.user_id || 'N/A'}</span>
                </div>
              </div>

              {/* Section 3: Program */}
              <div className="user-details-section">
                <h3>Program</h3>
                <div className="detail-row">
                  <span className="detail-label">Program:</span>
                  <span className="detail-value">{selectedApplication.program?.name || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">University:</span>
                  <span className="detail-value">{selectedApplication.program?.university?.name || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{selectedApplication.program?.description ? (selectedApplication.program.description.length > 120 ? selectedApplication.program.description.slice(0, 120) + '...' : selectedApplication.program.description) : 'N/A'}</span>
                </div>
              </div>

              {/* Section 4: Payment */}
              <div className="user-details-section">
                <h3>Payment</h3>
                <div className="detail-row">
                  <span className="detail-label">Payment Status:</span>
                  <span className="detail-value">{selectedApplication.payment_status || (selectedApplication.is_paid ? 'Paid' : 'Unpaid')}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment ID:</span>
                  <span className="detail-value">{selectedApplication.payment_id || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Date:</span>
                  <span className="detail-value">{formatDate(selectedApplication.payment_date)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Amount Paid:</span>
                  <span className="detail-value">{selectedApplication.payment_amount ? `${selectedApplication.payment_amount} ${selectedApplication.payment_currency || ''}` : 'N/A'}</span>
                </div>
              </div>

              {/* Section 5: Motivation Letter */}
              <div className="user-details-section">
                <h3>Motivation Letter</h3>
                <div className="detail-row">
                  <span className="detail-value">{selectedApplication.motivation_letter || 'No motivation letter provided.'}</span>
                </div>
              </div>

              {/* Section 6: Attached Documents */}
              <div className="user-details-section">
                <h3>Attached Documents</h3>
                <div className="documents-list">
                  {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                    selectedApplication.documents.map((doc, index) => (
                      <div key={index} className="document-item">
                        <div className="document-info">
                          <span className="document-type">
                            <i className="fas fa-file-alt"></i> {doc.document_type}
                          </span>
                        </div>
                        <div className="document-actions">
                          <span className="document-name">{doc.originalName || doc.filename}</span>
                          <button 
                            className="btn1 download-button"
                            onClick={() => handleDownloadDocument(doc.id, doc.originalName || doc.filename)}
                          >
                            <i className="fas fa-download"></i> Download
                          </button>
                          <span className={`document-status`}>
                            <i className={`fas fa-circle ${doc.status === 'approved' ? 'status-approved' : doc.status === 'rejected' ? 'status-rejected' : 'status-pending'}`}></i>
                            {doc.status === 'approved' ? 'Approved' : doc.status === 'rejected' ? 'Rejected' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-documents">No attached documents</p>
                  )}
                </div>
              </div>

              {/* Section 7: Admin Notes */}
              {selectedApplication.notes && (
                <div className="user-details-section">
                  <h3>Admin Notes</h3>
                  <div className="detail-row">
                    <span className="detail-value">{selectedApplication.notes}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showApplicationEdit && selectedApplication && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ position: 'relative' }}>
            <button 
              className="close-button"
              onClick={() => {
                setShowApplicationEdit(false);
                setSelectedApplication(null);
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2>Edit Application</h2>
            <div className="application-edit">
              <div className="form-group">
                <label>Status:</label>
                <select
                  value={selectedApplication.status}
                  onChange={(e) => setSelectedApplication({
                    ...selectedApplication,
                    status: e.target.value
                  })}
                  className="form-select"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="under_review">Under Review</option>
                </select>
              </div>
              <div className="form-group">
                <label>Note:</label>
                <textarea
                  value={selectedApplication.notes || ''}
                  onChange={(e) => setSelectedApplication({
                    ...selectedApplication,
                    notes: e.target.value
                  })}
                  className="form-textarea"
                  rows="4"
                />
              </div>
              <div className="button-group">
                <button
                  className="save-button"
                  onClick={() => handleUpdateApplicationStatus(selectedApplication.id, selectedApplication.status)}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper for status label
function getStatusLabel(status) {
  if (!status) return 'Unknown';
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'submitted':
      return 'Submitted';
    case 'under_review':
      return 'Under Review';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'pending':
      return 'Pending';
    case 'withdrawn':
      return 'Withdrawn';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

export default ApplicationsTab;
