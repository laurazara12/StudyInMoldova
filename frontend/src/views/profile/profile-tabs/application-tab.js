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
  const [userRole, setUserRole] = useState('user'); // 'user' or 'admin'
  const [userDocuments, setUserDocuments] = useState([]); // List of user documents
  const [newApplication, setNewApplication] = useState({
    program_id: '',
    motivation_letter: '',
    selectedDocuments: [], // Documents selected from existing list
    is_paid: false, // Payment status
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
    loadSavedPrograms(); // Add loading of saved programs
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
      console.error('Error checking role:', error);
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
      console.error('Error loading programs:', error);
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
        throw new Error('No valid data received from server');
      }

      const applicationsData = response.data.data;
      
      if (!Array.isArray(applicationsData)) {
        console.error('Invalid data received:', applicationsData);
        throw new Error('Invalid data format: data is not an array');
      }

      // Ensure each application has all required fields
      const processedApplications = applicationsData.map(app => ({
        ...app,
        documents: app.documents || [],
        program: app.program || {},
        created_at: app.created_at || new Date().toISOString(),
        status: app.status || 'draft',
        is_paid: app.payment_status === 'paid' || app.is_paid || false,
        payment_status: app.payment_status || 'unpaid',
        payment_date: app.payment_date || null,
        payment_amount: app.payment_amount || null,
        payment_currency: app.payment_currency || null
      }));

      console.log('Processed applications:', processedApplications);
      setApplications(processedApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
      setError('An error occurred while loading applications. Please try again.');
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
      console.error('Error loading documents:', error);
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
      console.error('Error loading saved programs:', error);
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
    console.log('Starting submission for application:', applicationId);
    const application = applications.find(app => app.id === applicationId);
    
    if (!application) {
      console.error('Application not found:', applicationId);
      setError('Application not found');
      return;
    }

    console.log('Found application:', application);

    if (!application.is_paid) {
      console.error('Application not paid:', application);
      setError('You cannot submit the application without paying the application fee. Please make the payment first.');
      return;
    }

    if (!application.program_id || !application.motivation_letter || !application.documents || application.documents.length === 0) {
      console.error('Missing required fields:', {
        program_id: application.program_id,
        has_motivation_letter: !!application.motivation_letter,
        documents_count: application.documents?.length
      });
      setError('Please make sure all required fields are filled and documents are attached before submitting.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Sending submission request to:', `${API_BASE_URL}/api/applications/${applicationId}/status`);
      
      const response = await axios.put(
        `${API_BASE_URL}/api/applications/${applicationId}/status`,
        {
          status: 'submitted',
          notes: 'Application submitted by user'
        },
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Submission response:', response.data);

      if (response.data.success) {
        setSuccessMessage('Application submitted successfully!');
        setShowApplicationDetails(false);
        setShowCreateForm(false); // Close the create/edit form modal
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

  // Modify useEffect to handle document selection
  useEffect(() => {
    if (showCreateForm && selectedApplication) {
      console.log('Form opened with data:', {
        selectedApplication,
        newApplication
      });

      // Automatically select existing documents
      if (selectedApplication.documents && selectedApplication.documents.length > 0) {
        const documentIds = selectedApplication.documents.map(doc => doc.id);
        console.log('Existing documents for selection:', documentIds);
        
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

      const applicationData = {
        program_id: newApplication.program_id ? parseInt(newApplication.program_id) : selectedApplication?.program_id,
        motivation_letter: newApplication.motivation_letter || selectedApplication?.motivation_letter || '',
        status: 'draft',
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
      setError(error.response?.data?.message || (selectedApplication ? 'An error occurred while updating the application' : 'An error occurred while creating the application'));
    } finally {
      setLoading(false);
    }
  };

  // Modify the render part for documents
  const renderDocumentsSection = () => (
    <div className="form-group">
      <label>Required Documents: <span className="required">*</span></label>
      <p className="documents-help-text">Please select the necessary documents for the selected program</p>
      <div className="documents-selection">
        {!userDocuments || userDocuments.length === 0 ? (
          <p className="no-documents">You don't have any documents uploaded yet. Please upload documents in the profile section.</p>
        ) : (
          <div className="documents-list">
            {userDocuments.map((doc) => {
              const isSelected = newApplication.selectedDocuments.includes(doc.id);
              console.log(`Document ${doc.id} is selected:`, isSelected);
              
              return (
                <>
                <label className="document-checkbox">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleDocumentSelection(doc.id)}
                />
                <span> </span>
                <span className="document-name">{doc.name || doc.document_type}</span>
                </label>
              
                </>
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

  // Modify toggleDocumentSelection function to add logs
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
      // Check if application ID is valid
      if (!applicationId || isNaN(parseInt(applicationId))) {
        throw new Error('Invalid application ID');
      }

      setLoading(true);
      setError(null);

      console.log('Starting status update:', {
        applicationId,
        newStatus,
        adminNotes
      });

      const response = await axios.patch(
        `${API_BASE_URL}/api/applications/${applicationId}/status`,
        {
          status: newStatus,
          notes: adminNotes
        },
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Server response:', response.data);

      if (response.data && response.data.success) {
        setSuccessMessage('Application status updated successfully!');
        setShowApplicationDetails(false);
        setSelectedApplication(null);
        await loadUserApplications();
      } else {
        throw new Error(response.data?.message || 'Error updating status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      
      // Check error type and display specific message
      if (error.response) {
        if (error.response.status === 404) {
          setError('Application not found. Please refresh the page.');
        } else if (error.response.status === 403) {
          setError('You do not have permission to update this application.');
        } else {
          setError(error.response.data?.message || 'An error occurred while updating the application status.');
        }
      } else if (error.request) {
        setError('Could not communicate with the server. Please check your internet connection.');
      } else {
        setError(error.message || 'An unexpected error occurred.');
      }
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

      const deleteResponse = await axios.delete(
        `${API_BASE_URL}/api/applications/${applicationId}`,
        {
          headers: getAuthHeaders()
        }
      );

      if (deleteResponse.data.success) {
        setSuccessMessage('Application deleted successfully!');
        setShowApplicationDetails(false);
        setSelectedApplication(null);
        await loadUserApplications();
      } else {
        throw new Error(deleteResponse.data.message || 'Error deleting application');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      if (error.response?.status === 404) {
        setError('Application not found. It may have been already deleted.');
      } else if (error.response?.status === 500) {
        setError('This application cannot be deleted because it has associated records (documents, payments, etc.). Please withdraw the application instead.');
      } else {
        setError(error.response?.data?.message || 'An error occurred while deleting the application');
      }
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

      const response = await axios.put(
        `${API_BASE_URL}/api/applications/${applicationId}/withdraw`,
        {},
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
    return application.status === 'draft';
  };

  const handlePayment = async (application) => {
    try {
      setLoading(true);
      setError(null);

      // Verificăm dacă avem aplicația selectată
      if (!application) {
        throw new Error('Selectează o aplicație înainte de a efectua plata');
      }

      // Verificăm dacă aplicația există și nu este deja plătită
      if (application.is_paid) {
        throw new Error('Această aplicație a fost deja plătită');
      }

      console.log('Încep procesul de plată pentru aplicația:', application.id);

      // Găsim programul selectat din lista de programe
      const selectedProgram = programs.find(p => p.id === application.program_id);
      if (!selectedProgram) {
        throw new Error('Programul selectat nu a fost găsit');
      }

      const paymentData = {
        application_id: application.id,
        program_id: application.program_id,
        amount: selectedProgram.tuition_fees,
        motivation_letter: application.motivation_letter || '',
        document_ids: application.documents?.map(doc => doc.id) || []
      };

      console.log('Date plată:', paymentData);

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

      console.log('Răspuns server pentru sesiunea de plată:', response.data);

      if (!response.data) {
        throw new Error('Nu s-a primit răspuns de la server');
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Eroare la crearea sesiunii de plată');
      }

      if (!response.data.url) {
        throw new Error('Lipsește URL-ul de plată din răspunsul serverului');
      }

      // Salvăm sesiunea de plată și id-ul aplicației
      localStorage.setItem('currentPaymentSession', response.data.session_id);
      localStorage.setItem('paymentApplicationId', application.id);
      
      console.log('Redirecționare către pagina de plată:', response.data.url);
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Eroare la procesarea plății:', error);
      setError(error.response?.data?.message || error.message || 'A apărut o eroare la procesarea plății');
    } finally {
      setLoading(false);
    }
  };

  // Modify effect for processing payment platform response
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      const applicationId = localStorage.getItem('paymentApplicationId');
      if (applicationId) {
        const processPaymentSuccess = async () => {
          try {
            // Validate ID
            if (!applicationId || isNaN(parseInt(applicationId))) {
              throw new Error('Invalid application ID');
            }

            // Check current application status
            const response = await axios.get(
              `${API_BASE_URL}/api/applications/${applicationId}`,
              {
                headers: getAuthHeaders()
              }
            );

            if (!response.data || !response.data.success) {
              throw new Error('Could not verify application status');
            }

            const application = response.data.data;
            
            // Check if application is already paid
            if (application.is_paid) {
              setSuccessMessage('Payment has already been processed successfully!');
            } else {
              setSuccessMessage('Payment processed successfully!');
            }

            // Clear localStorage and URL
            localStorage.removeItem('paymentApplicationId');
            localStorage.removeItem('currentPaymentSession');
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Reload applications to reflect new state
            await loadUserApplications();
            
            // Close details modal if open
            setShowApplicationDetails(false);
            setSelectedApplication(null);

          } catch (error) {
            console.error('Error processing payment:', error);
            setError('An error occurred while verifying payment status. Please contact support.');
          }
        };
        
        processPaymentSuccess();
      }
    } else if (paymentStatus === 'canceled') {
      const applicationId = localStorage.getItem('paymentApplicationId');
      if (applicationId) {
        console.log('Payment canceled for application:', applicationId);
        
        // Clear localStorage and URL
        localStorage.removeItem('paymentApplicationId');
        localStorage.removeItem('currentPaymentSession');
        window.history.replaceState({}, document.title, window.location.pathname);
        
        setError('Payment was canceled. You can try again.');
      }
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
            style={{ margin: '20px 0' }}
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
                      {app.is_paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn2"
                      onClick={() => handleViewApplication(app)}
                      style={{ marginRight: '10px' }}
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                    {canEditApplication(app) && (
                      <button 
                        className="btn1"
                        onClick={() => handleEditApplication(app)}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                    )}
                    {canEditApplication(app) && !app.is_paid && (
                      <button
                        className="btn1"
                        style={{ marginLeft: '10px' }}
                        onClick={() => handlePayment(app)}
                      >
                        <i className="fas fa-credit-card"></i> Pay 100 MDL
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

              <div className="form-info">
                <p><span className="required">*</span> Required fields</p>
              </div>

              <div className="button-group">
                <button 
                  type="submit" 
                  className="btn1"
                >
                  {selectedApplication ? 'Update Application' : 'Save Application'}
                </button>
                {selectedApplication && selectedApplication.status === 'draft' && (
                  <button
                    type="button"
                    className="btn1"
                    onClick={() => {
                      if (!selectedApplication.is_paid) {
                        setError('You need to pay the application fee to submit the application');
                        return;
                      }
                      handleSubmitApplication(selectedApplication.id);
                    }}
                    disabled={
                      !selectedApplication.program_id || 
                      !selectedApplication.motivation_letter || 
                      !selectedApplication.documents || 
                      selectedApplication.documents.length === 0 ||
                      !selectedApplication.is_paid ||
                      loading
                    }
                  >
                    <i className="fas fa-paper-plane"></i> Submit Application
                    {!selectedApplication.is_paid && (
                      <span className="payment-required">(Payment required)</span>
                    )}
                  </button>
                )}
              </div>
            </form>
            <button 
              className="close-button"
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
                setSelectedApplication(null);
              }}
            >
              <i className="fas fa-times"></i>
            </button>
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
                  {selectedApplication.is_paid ? 'Paid' : 'Unpaid'}
                </span>
              </p>
              
              <div className="motivation-letter-section">
                <h3>Motivation Letter</h3>
                <div className="motivation-letter-content">
                  <p>{selectedApplication.motivation_letter || 'No motivation letter provided'}</p>
                </div>
              </div>

              <div className="documents-section">
                <h3>Attached Documents</h3>
                <div className="documents-list">
                  {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                    selectedApplication.documents.map((doc, index) => (
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
                            className="btn2"
                          >
                            <i className="fas fa-eye"></i> View
                          </a>
                          <span className="document-name">{doc.originalName || doc.filename}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-documents">No documents attached</p>
                  )}
                </div>
              </div>

              {selectedApplication.notes && (
                <div className="admin-notes">
                  <h3>Admin Notes</h3>
                  <div className="notes-content">
                    <p>{selectedApplication.notes}</p>
                  </div>
                </div>
              )}

              <div className="action-buttons">
                
                
                {canDeleteApplication(selectedApplication) && (
                  <button
                    className="btn2"
                    onClick={() => handleDeleteApplication(selectedApplication.id)}
                  >
                    <i className="fas fa-trash"></i> Delete Application
                  </button>
                )}
                
                {canEditApplication(selectedApplication) && (
                  <button
                    className="btn1"
                    onClick={() => handleEditApplication(selectedApplication)}
                  >
                    <i className="fas fa-edit"></i> Edit Application
                  </button>
                )}

                {selectedApplication.status === 'draft' && (
                  <button
                    className="btn1"
                    onClick={() => {
                      if (!selectedApplication.is_paid) {
                        setError('You need to pay the application fee to submit the application');
                        return;
                      }
                      handleSubmitApplication(selectedApplication.id);
                    }}
                    disabled={
                      !selectedApplication.program_id || 
                      !selectedApplication.motivation_letter || 
                      !selectedApplication.documents || 
                      selectedApplication.documents.length === 0 ||
                      !selectedApplication.is_paid ||
                      loading
                    }
                  >
                    <i className="fas fa-paper-plane"></i> Submit Application
                    {!selectedApplication.is_paid && (
                      <span className="payment-required">(Payment required)</span>
                    )}
                  </button>
                )}
                
                {canWithdrawApplication(selectedApplication) && (
                  <button
                    className="btn2"
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
                      className="btn1"
                      onClick={() => handleUpdateApplicationStatus(
                        selectedApplication.id,
                        'approved',
                        selectedApplication.adminNotes
                      )}
                    >
                      Approve
                    </button>
                    <button
                      className="btn2"
                      onClick={() => handleUpdateApplicationStatus(
                        selectedApplication.id,
                        'rejected',
                        selectedApplication.adminNotes
                      )}
                    >
                      Reject
                    </button>
                    <button
                      className="btn2"
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
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationTab; 