import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './application-tab.css';
import { API_BASE_URL, getAuthHeaders } from '../../../config/api.config';

const ApplicationTab = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [userRole, setUserRole] = useState('user'); // 'user' sau 'admin'
  const [userDocuments, setUserDocuments] = useState([]); // Lista documentelor utilizatorului
  const [newApplication, setNewApplication] = useState({
    program_id: '',
    motivation_letter: '',
    selectedDocuments: [], // Documente selectate din lista existentă
    is_paid: false, // Starea plății
    errors: {
      program: '',
      documents: '',
      motivation_letter: '',
      payment: ''
    }
  });
  const [savedPrograms, setSavedPrograms] = useState([]);

  useEffect(() => {
    loadUserApplications();
    loadPrograms();
    checkUserRole();
    loadUserDocuments();
    loadSavedPrograms(); // Adăugăm încărcarea programelor salvate
  }, []);

  const checkUserRole = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/role`, {
        headers: getAuthHeaders()
      });
      if (response.data.role === 'admin') {
        setUserRole('admin');
      }
    } catch (error) {
      console.error('Eroare la verificarea rolului:', error);
    }
  };

  const loadPrograms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/programs`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setPrograms(response.data.data);
      }
    } catch (error) {
      console.error('Eroare la încărcarea programelor:', error);
    }
  };

  const loadUserApplications = async () => {
    try {
      setLoading(true);
      const endpoint = userRole === 'admin' 
        ? `${API_BASE_URL}/api/applications` 
        : `${API_BASE_URL}/api/applications/user`;

      const response = await axios.get(endpoint, {
        headers: getAuthHeaders()
      });

      if (!response.data || !response.data.success) {
        throw new Error('Nu s-au primit date valide de la server');
      }

      const applicationsData = response.data.data;
      
      if (!Array.isArray(applicationsData)) {
        console.error('Date invalide primite:', applicationsData);
        throw new Error('Format invalid al datelor primite: datele nu sunt un array');
      }

      // Asigurăm-ne că fiecare aplicație are toate câmpurile necesare
      const processedApplications = applicationsData.map(app => ({
        ...app,
        documents: app.documents || [],
        program: app.program || {},
        created_at: app.created_at || new Date().toISOString(),
        status: app.status || 'draft',
        is_paid: app.is_paid || false
      }));

      console.log('Aplicații procesate:', processedApplications);
      setApplications(processedApplications);
    } catch (error) {
      console.error('Eroare la încărcarea aplicațiilor:', error);
      setError('A apărut o eroare la încărcarea aplicațiilor. Vă rugăm să încercați din nou.');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserDocuments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/documents/user-documents`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setUserDocuments(response.data.data);
      }
    } catch (error) {
      console.error('Eroare la încărcarea documentelor:', error);
    }
  };

  const loadSavedPrograms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/saved-programs`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setSavedPrograms(response.data.data);
      }
    } catch (error) {
      console.error('Eroare la încărcarea programelor salvate:', error);
    }
  };

  const validateApplication = () => {
    const errors = {
      program: '',
      documents: '',
      motivation_letter: '',
      payment: ''
    };
    let isValid = true;

    if (newApplication.program_id && !newApplication.program_id) {
      errors.program = 'Selected program is not valid';
      isValid = false;
    }

    if (newApplication.motivation_letter && !newApplication.motivation_letter.trim()) {
      errors.motivation_letter = 'Motivation letter cannot be empty';
      isValid = false;
    }

    setNewApplication(prev => ({
      ...prev,
      errors
    }));

    return isValid;
  };

  const validateForSubmission = (application) => {
    if (!application.is_paid) {
      setError('You need to pay the application fee to submit the application');
      return false;
    }
    return true;
  };

  const handleSubmitApplication = async (applicationId) => {
    const application = applications.find(app => app.id === applicationId);
    
    if (!validateForSubmission(application)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.patch(
        `${API_BASE_URL}/api/applications/${applicationId}/status`,
        {
          status: 'submitted'
        },
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        setSuccessMessage('Application submitted successfully!');
        setShowApplicationDetails(false);
        setSelectedApplication(null);
        await loadUserApplications();
      } else {
        throw new Error(response.data.message || 'Error submitting application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setError(error.response?.data?.message || 'An error occurred while submitting the application');
    } finally {
      setLoading(false);
    }
  };

  const handleEditApplication = async (application) => {
    try {
      console.log('Starting application edit:', application);
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${API_BASE_URL}/api/applications/${application.id}`,
        {
          headers: getAuthHeaders()
        }
      );

      console.log('Server response:', response.data);

      if (response.data.success) {
        const fullApplication = response.data.data;
        console.log('Loaded application data:', fullApplication);
        
        setSelectedApplication(fullApplication);
        
        const formData = {
          program_id: fullApplication.program_id,
          motivation_letter: fullApplication.motivation_letter || '',
          selectedDocuments: fullApplication.documents?.map(doc => doc.id) || [],
          is_paid: fullApplication.is_paid || false,
          errors: {
            program: '',
            documents: '',
            motivation_letter: '',
            payment: ''
          }
        };
        
        console.log('Form data:', formData);
        setNewApplication(formData);
        
        setShowCreateForm(true);
        setShowApplicationDetails(false);
        
        console.log('State after setting:', {
          selectedApplication: fullApplication,
          newApplication: formData,
          showCreateForm: true
        });
      } else {
        throw new Error('Could not load application data');
      }
    } catch (error) {
      console.error('Error loading application data:', error);
      setError('An error occurred while loading application data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Modificăm useEffect-ul pentru a gestiona selecția documentelor
  useEffect(() => {
    if (showCreateForm && selectedApplication) {
      console.log('Formular deschis cu datele:', {
        selectedApplication,
        newApplication
      });

      // Selectăm automat documentele existente
      if (selectedApplication.documents && selectedApplication.documents.length > 0) {
        const documentIds = selectedApplication.documents.map(doc => doc.id);
        console.log('Documente existente pentru selecție:', documentIds);
        
        setNewApplication(prev => ({
          ...prev,
          selectedDocuments: documentIds
        }));
      }
    }
  }, [showCreateForm, selectedApplication]);

  const handleCreateApplication = async (e) => {
    e.preventDefault();
    
    if (!validateApplication()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!selectedApplication) {
        const existingApplication = applications.find(app => 
          app.program_id === parseInt(newApplication.program_id)
        );

        if (existingApplication) {
          setError(`You already have an application for this program (${existingApplication.program?.name}). You can edit the existing one.`);
          setLoading(false);
          return;
        }
      }

      const applicationData = {
        program_id: newApplication.program_id ? parseInt(newApplication.program_id) : selectedApplication?.program_id,
        motivation_letter: newApplication.motivation_letter || selectedApplication?.motivation_letter || '',
        status: selectedApplication?.status || 'draft',
        application_date: selectedApplication?.created_at || new Date().toISOString(),
        document_ids: newApplication.selectedDocuments.length > 0 
          ? newApplication.selectedDocuments.map(id => parseInt(id))
          : selectedApplication?.documents?.map(doc => parseInt(doc.id)) || [],
        is_paid: selectedApplication?.is_paid || false
      };

      console.log('Data sent to server:', applicationData);

      let response;
      if (selectedApplication) {
        response = await axios.put(
          `${API_BASE_URL}/api/applications/${selectedApplication.id}/update`,
          applicationData,
          {
            headers: {
              ...getAuthHeaders(),
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/api/applications`,
          applicationData,
          {
            headers: {
              ...getAuthHeaders(),
              'Content-Type': 'application/json'
            }
          }
        );
      }

      if (response.data.success) {
        setSuccessMessage(selectedApplication ? 'Application updated successfully!' : 'Application created successfully!');
        setShowCreateForm(false);
        setNewApplication({
          program_id: '',
          motivation_letter: '',
          selectedDocuments: [],
          is_paid: false,
          errors: {
            program: '',
            documents: '',
            motivation_letter: '',
            payment: ''
          }
        });
        setSelectedApplication(null);
        await loadUserApplications();
      } else {
        throw new Error(response.data.message || (selectedApplication ? 'Error updating application' : 'Error creating application'));
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.data?.message?.includes('already exists')) {
        setError('You already have an application for this program. Please edit the existing one.');
      } else {
        setError(error.response?.data?.message || (selectedApplication ? 'An error occurred while updating the application' : 'An error occurred while creating the application'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Modificăm și partea de render pentru documente
  const renderDocumentsSection = () => (
    <div className="form-group">
      <label>Required Documents: <span className="required">*</span></label>
      <div className="documents-selection">
        {!userDocuments || userDocuments.length === 0 ? (
          <p className="no-documents">You don't have any documents uploaded yet. Please upload documents in the profile section.</p>
        ) : (
          <div className="documents-list">
            {userDocuments.map((doc) => {
              const isSelected = newApplication.selectedDocuments.includes(doc.id);
              console.log(`Document ${doc.id} is selected:`, isSelected);
              
              return (
                <div key={doc.id} className="document-item">
                  <label className="document-checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleDocumentSelection(doc.id)}
                    />
                    <span className="document-name">{doc.name || doc.document_type}</span>
                  </label>
                  {doc.url && (
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="document-preview"
                    >
                      <i className="fas fa-eye"></i> View
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {newApplication.errors.documents && (
          <span className="error-message">{newApplication.errors.documents}</span>
        )}
      </div>
    </div>
  );

  // Modificăm funcția toggleDocumentSelection pentru a adăuga log-uri
  const toggleDocumentSelection = (docId) => {
    console.log('Toggle document:', docId);
    setNewApplication(prev => {
      const isSelected = prev.selectedDocuments.includes(docId);
      const newSelectedDocuments = isSelected
        ? prev.selectedDocuments.filter(id => id !== docId)
        : [...prev.selectedDocuments, docId];

      console.log('Selected documents after toggle:', newSelectedDocuments);

      return {
        ...prev,
        selectedDocuments: newSelectedDocuments,
        errors: {
          ...prev.errors,
          documents: newSelectedDocuments.length === 0 ? 'Please select at least one document' : ''
        }
      };
    });
  };

  const handleUpdateApplicationStatus = async (applicationId, newStatus, adminNotes = '') => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.patch(
        `${API_BASE_URL}/api/applications/${applicationId}/status`,
        {
          status: newStatus,
          notes: adminNotes
        },
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        setSuccessMessage('Application status updated successfully!');
        setShowApplicationDetails(false);
        setSelectedApplication(null);
        await loadUserApplications();
      } else {
        throw new Error(response.data.message || 'Error updating status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.response?.data?.message || 'An error occurred while updating the status');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewApplication(prev => ({
      ...prev,
      documents: [...prev.documents, ...files],
      errors: {
        ...prev.errors,
        documents: files.length > 0 ? '' : 'Please upload at least one document'
      }
    }));
  };

  const removeDocument = (index) => {
    setNewApplication(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
      errors: {
        ...prev.errors,
        documents: prev.documents.length <= 1 ? 'Please upload at least one document' : ''
      }
    }));
  };

  const handleViewApplication = (application) => {
    const fullApplication = {
      ...application,
      documents: application.documents || [],
      program: application.program || {},
      created_at: application.created_at || new Date().toISOString(),
      status: application.status || 'draft',
      is_paid: application.is_paid || false
    };
    setSelectedApplication(fullApplication);
    setShowApplicationDetails(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getStatusLabel = (status) => {
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
      case 'withdrawn':
        return 'Withdrawn';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'status-unknown';

    switch (status) {
      case 'draft':
        return 'status-draft';
      case 'submitted':
        return 'status-submitted';
      case 'under_review':
        return 'status-under-review';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'withdrawn':
        return 'status-withdrawn';
      default:
        return 'status-unknown';
    }
  };

  const canDeleteApplication = (application) => {
    if (userRole === 'admin') return true;
    return application.status === 'draft' && !application.submitted_at;
  };

  const handleDeleteApplication = async (applicationId) => {
    const application = applications.find(app => app.id === applicationId);
    
    if (!canDeleteApplication(application)) {
      setError('You cannot delete this application');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.delete(
        `${API_BASE_URL}/api/applications/${applicationId}`,
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        setSuccessMessage('Application deleted successfully!');
        setShowApplicationDetails(false);
        setSelectedApplication(null);
        await loadUserApplications();
      } else {
        throw new Error(response.data.message || 'Error deleting application');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      setError(error.response?.data?.message || 'An error occurred while deleting the application');
    } finally {
      setLoading(false);
    }
  };

  const canWithdrawApplication = (application) => {
    if (userRole === 'admin') return false;
    return ['submitted', 'under_review'].includes(application.status);
  };

  const handleWithdrawApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.patch(
        `${API_BASE_URL}/api/applications/${applicationId}/status`,
        {
          status: 'withdrawn',
          notes: 'Application withdrawn by user'
        },
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        setSuccessMessage('Application withdrawn successfully!');
        setShowApplicationDetails(false);
        setSelectedApplication(null);
        await loadUserApplications();
      } else {
        throw new Error(response.data.message || 'Error withdrawing application');
      }
    } catch (error) {
      console.error('Error withdrawing application:', error);
      setError(error.response?.data?.message || 'An error occurred while withdrawing the application');
    } finally {
      setLoading(false);
    }
  };

  const canSubmitApplication = (application) => {
    if (userRole === 'admin') return false;
    return application.status === 'draft' && application.is_paid;
  };

  const canEditApplication = (application) => {
    if (userRole === 'admin') return false;
    return application.status === 'draft' || !application.submitted_at;
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      let paymentData = {};

      if (selectedApplication) {
        paymentData = {
          program_id: parseInt(selectedApplication.program_id),
          motivation_letter: selectedApplication.motivation_letter || '',
          document_ids: selectedApplication.documents?.map(doc => parseInt(doc.id)) || []
        };
      } else {
        paymentData = {
          program_id: newApplication.program_id ? parseInt(newApplication.program_id) : null,
          motivation_letter: newApplication.motivation_letter || '',
          document_ids: newApplication.selectedDocuments.map(id => parseInt(id))
        };
      }

      if (!paymentData.program_id) {
        throw new Error('Program is required');
      }

      if (!paymentData.motivation_letter) {
        throw new Error('Motivation letter is required');
      }

      console.log('Payment data sent:', paymentData);

      const response = await axios.post(
        `${API_BASE_URL}/api/payments/create-checkout-session`,
        paymentData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        localStorage.setItem('currentPaymentSession', response.data.session_id);
        window.location.href = response.data.url;
      } else {
        throw new Error(response.data.message || 'Error creating payment session');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError(error.response?.data?.message || error.message || 'An error occurred while processing the payment');
    } finally {
      setLoading(false);
    }
  };

  // Verificăm dacă avem un parametru de plată în URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      setSuccessMessage('Payment processed successfully!');
      // Reîncărcăm aplicațiile pentru a actualiza starea plății
      loadUserApplications();
    } else if (paymentStatus === 'canceled') {
      setError('Plata a fost anulată. Puteți încerca din nou.');
    }
  }, []);

  return (
    <div className="application-tab">
      <div className="application-section">
        <h2>{userRole === 'admin' ? 'All Applications' : 'My Applications'}</h2>
        {userRole === 'user' && (
          <button 
            className="btn1"
            onClick={() => setShowCreateForm(true)}
          >
            <i className="fas fa-plus"></i> Create New Application
          </button>
        )}
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

      <div className="application-stats">
        <div className="application-stat">
          Drafts
          <span className="stat-value status-draft">{applications.filter(app => app.status === 'draft').length}</span>
        </div>
        <div className="application-stat">
          Submitted
          <span className="stat-value status-submitted">{applications.filter(app => app.status === 'submitted').length}</span>
        </div>
        <div className="application-stat">
          Under Review
          <span className="stat-value status-under-review">{applications.filter(app => app.status === 'under_review').length}</span>
        </div>
        <div className="application-stat">
          Approved
          <span className="stat-value status-approved">{applications.filter(app => app.status === 'approved').length}</span>
        </div>
        <div className="application-stat">
          Rejected
          <span className="stat-value status-rejected">{applications.filter(app => app.status === 'rejected').length}</span>
        </div>
        <div className="application-stat">
          Withdrawn
          <span className="stat-value status-withdrawn">{applications.filter(app => app.status === 'withdrawn').length}</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="no-applications">
          <p>No applications found.</p>
        </div>
      ) : (
        <div className="applications-table-container">
          <table className="profile-table">
            <thead>
              <tr>
                {userRole === 'admin' && <th>User</th>}
                <th>Program</th>
                <th>University</th>
                <th>Application Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  {userRole === 'admin' && (
                    <td>{app.user_name || `User ID: ${app.user_id}`}</td>
                  )}
                  <td>{app.program?.name || 'N/A'}</td>
                  <td>{app.program?.university?.name || 'N/A'}</td>
                  <td>{formatDate(app.created_at)}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(app.status)}`}>
                      {getStatusLabel(app.status)}
                    </span>
                  </td>
                  <td>
                    <span className={`payment-status ${app.is_paid ? 'paid' : 'unpaid'}`}>
                      {app.is_paid ? (
                        <i className="fas fa-check-circle"></i>
                      ) : (
                        <i className="fas fa-times-circle"></i>
                      )}
                      {app.is_paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-view"
                      onClick={() => handleViewApplication(app)}
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                    {canEditApplication(app) && (
                      <button 
                        className="btn-edit"
                        onClick={() => handleEditApplication(app)}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{selectedApplication ? 'Edit Application' : 'Create New Application'}</h2>
            <form onSubmit={handleCreateApplication} className="application-form">
              <div className="form-group">
                <label>Program: <span className="required">*</span></label>
                <select
                  value={newApplication.program_id || ''}
                  onChange={(e) => {
                    console.log('Selected program:', e.target.value);
                    setNewApplication({
                      ...newApplication,
                      program_id: e.target.value,
                      errors: {
                        ...newApplication.errors,
                        program: ''
                      }
                    });
                  }}
                  className={`form-select ${newApplication.errors.program ? 'error' : ''}`}
                >
                  <option value="">Select a program</option>
                  {savedPrograms.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name} - {program.university?.name}
                    </option>
                  ))}
                </select>
                {newApplication.errors.program && (
                  <span className="error-message">{newApplication.errors.program}</span>
                )}
              </div>

              <div className="form-group">
                <label>Motivation Letter: <span className="required">*</span></label>
                <textarea
                  value={newApplication.motivation_letter || ''}
                  onChange={(e) => {
                    console.log('Updated motivation letter:', e.target.value);
                    setNewApplication({
                      ...newApplication,
                      motivation_letter: e.target.value,
                      errors: {
                        ...newApplication.errors,
                        motivation_letter: ''
                      }
                    });
                  }}
                  className={`form-textarea ${newApplication.errors.motivation_letter ? 'error' : ''}`}
                  rows="6"
                  placeholder="Write your motivation letter..."
                />
                {newApplication.errors.motivation_letter && (
                  <span className="error-message">{newApplication.errors.motivation_letter}</span>
                )}
              </div>

              {renderDocumentsSection()}

              <div className="form-group">
                <label>Application Payment:</label>
                <div className="payment-section">
                  {newApplication.is_paid ? (
                    <div className="payment-status success">
                      <i className="fas fa-check-circle"></i> Payment completed
                    </div>
                  ) : (
                    <div className="payment-status">
                      <p>Application fee: 100 MDL</p>
                      <button
                        type="button"
                        className="btn-pay"
                        onClick={handlePayment}
                        disabled={loading}
                      >
                        <i className="fas fa-credit-card"></i> Pay now
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-info">
                <p><span className="required">*</span> Required fields</p>
              </div>

              <div className="button-group">
                <button 
                  type="submit" 
                  className="btn-submit"
                >
                  {selectedApplication ? 'Update Application' : 'Save Application'}
                </button>
                {selectedApplication && selectedApplication.status === 'draft' && selectedApplication.is_paid && (
                  <button
                    type="button"
                    className="btn-submit-application"
                    onClick={() => {
                      if (!selectedApplication.is_paid) {
                        setError('You need to pay the application fee to submit the application');
                        return;
                      }
                      handleSubmitApplication(selectedApplication.id);
                    }}
                    disabled={!selectedApplication.program_id || !selectedApplication.motivation_letter || !selectedApplication.documents || selectedApplication.documents.length === 0}
                  >
                    <i className="fas fa-paper-plane"></i> Submit Application
                    {!selectedApplication.is_paid && (
                      <span className="payment-required">(Payment required)</span>
                    )}
                  </button>
                )}
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewApplication({
                      program_id: '',
                      motivation_letter: '',
                      selectedDocuments: [],
                      is_paid: false,
                      errors: {
                        program: '',
                        documents: '',
                        motivation_letter: '',
                        payment: ''
                      }
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showApplicationDetails && selectedApplication && (
        <div className="modal">
          <div className="modal-content">
            <h2>Application Details</h2>
            <div className="application-details">
              {userRole === 'admin' && (
                <p><strong>User:</strong> {selectedApplication.user_name || `ID: ${selectedApplication.user_id}`}</p>
              )}
              <p><strong>Program:</strong> {selectedApplication.program?.name || 'N/A'}</p>
              <p><strong>University:</strong> {selectedApplication.program?.university?.name || 'N/A'}</p>
              <p><strong>Application Date:</strong> {formatDate(selectedApplication.created_at)}</p>
              <p><strong>Status:</strong> {getStatusLabel(selectedApplication.status)}</p>
              <p>
                <strong>Payment Status:</strong>
                <span className={`payment-status ${selectedApplication.is_paid ? 'paid' : 'unpaid'}`}>
                  {selectedApplication.is_paid ? (
                    <i className="fas fa-check-circle"></i>
                  ) : (
                    <i className="fas fa-times-circle"></i>
                  )}
                  {selectedApplication.is_paid ? 'Paid' : 'Unpaid'}
                </span>
              </p>
              
              {selectedApplication.motivation_letter && (
                <div className="motivation-letter-section">
                  <h3>Motivation Letter</h3>
                  <div className="motivation-letter-content">
                    <p>{selectedApplication.motivation_letter}</p>
                  </div>
                </div>
              )}

              {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                <div className="documents-section">
                  <h3>Uploaded Documents</h3>
                  <div className="documents-list">
                    {selectedApplication.documents.map((doc, index) => (
                      <div key={index} className="document-item">
                        <div className="document-info">
                          <span className="document-type">
                            <i className="fas fa-file-alt"></i> {doc.document_type}
                          </span>
                          <span className="document-status">
                            <i className={`fas fa-circle ${doc.status === 'approved' ? 'status-approved' : doc.status === 'rejected' ? 'status-rejected' : 'status-pending'}`}></i>
                            {doc.status === 'approved' ? 'Approved' : doc.status === 'rejected' ? 'Rejected' : 'Pending'}
                          </span>
                        </div>
                        <div className="document-actions">
                          <a 
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-view-document"
                          >
                            <i className="fas fa-eye"></i> View
                          </a>
                          <span className="document-name">{doc.originalName || doc.filename}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedApplication.notes && (
                <div className="admin-notes">
                  <h3>Admin Notes</h3>
                  <div className="notes-content">
                    <p>{selectedApplication.notes}</p>
                  </div>
                </div>
              )}

              <div className="action-buttons">
                {!selectedApplication.is_paid && canEditApplication(selectedApplication) && (
                  <button
                    className="btn-pay"
                    onClick={() => handlePayment()}
                    disabled={loading}
                  >
                    <i className="fas fa-credit-card"></i> Pay 100 MDL
                  </button>
                )}
                
                {canDeleteApplication(selectedApplication) && (
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteApplication(selectedApplication.id)}
                  >
                    <i className="fas fa-trash"></i> Delete Application
                  </button>
                )}
                
                {canEditApplication(selectedApplication) && (
                  <button
                    className="btn-edit"
                    onClick={() => handleEditApplication(selectedApplication)}
                  >
                    <i className="fas fa-edit"></i> Edit Application
                  </button>
                )}

                {selectedApplication.status === 'draft' && (
                  <button
                    className="btn-submit-application"
                    onClick={() => {
                      if (!selectedApplication.is_paid) {
                        setError('You need to pay the application fee to submit the application');
                        return;
                      }
                      handleSubmitApplication(selectedApplication.id);
                    }}
                    disabled={!selectedApplication.program_id || !selectedApplication.motivation_letter || !selectedApplication.documents || selectedApplication.documents.length === 0}
                  >
                    <i className="fas fa-paper-plane"></i> Submit Application
                    {!selectedApplication.is_paid && (
                      <span className="payment-required">(Payment required)</span>
                    )}
                  </button>
                )}
                
                {canWithdrawApplication(selectedApplication) && (
                  <button
                    className="btn-withdraw"
                    onClick={() => handleWithdrawApplication(selectedApplication.id)}
                  >
                    <i className="fas fa-undo"></i> Withdraw Application
                  </button>
                )}
              </div>

              {userRole === 'admin' && selectedApplication.status === 'submitted' && (
                <div className="admin-actions">
                  <h3>Admin Actions</h3>
                  <div className="form-group">
                    <label>Notes:</label>
                    <textarea
                      className="form-textarea"
                      rows="4"
                      placeholder="Add notes for the applicant..."
                      value={selectedApplication.adminNotes || ''}
                      onChange={(e) => setSelectedApplication({
                        ...selectedApplication,
                        adminNotes: e.target.value
                      })}
                    />
                  </div>
                  <div className="button-group">
                    <button
                      className="btn-approve"
                      onClick={() => handleUpdateApplicationStatus(
                        selectedApplication.id,
                        'approved',
                        selectedApplication.adminNotes
                      )}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleUpdateApplicationStatus(
                        selectedApplication.id,
                        'rejected',
                        selectedApplication.adminNotes
                      )}
                    >
                      Reject
                    </button>
                    <button
                      className="btn-review"
                      onClick={() => handleUpdateApplicationStatus(
                        selectedApplication.id,
                        'under_review',
                        selectedApplication.adminNotes
                      )}
                    >
                      Put Under Review
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button 
              className="close-button"
              onClick={() => {
                setShowApplicationDetails(false);
                setSelectedApplication(null);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationTab; 