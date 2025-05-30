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

    // Verificăm doar dacă câmpurile modificate sunt valide
    if (newApplication.program_id && !newApplication.program_id) {
      errors.program = 'Programul selectat nu este valid';
      isValid = false;
    }

    if (newApplication.motivation_letter && !newApplication.motivation_letter.trim()) {
      errors.motivation_letter = 'Scrisoarea de motivație nu poate fi goală';
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
      setError('Trebuie să plătiți taxa de aplicare pentru a trimite aplicația');
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
        setSuccessMessage('Aplicația a fost trimisă cu succes!');
        setShowApplicationDetails(false);
        setSelectedApplication(null);
        await loadUserApplications();
      } else {
        throw new Error(response.data.message || 'Eroare la trimiterea aplicației');
      }
    } catch (error) {
      console.error('Eroare la trimiterea aplicației:', error);
      setError(error.response?.data?.message || 'A apărut o eroare la trimiterea aplicației');
    } finally {
      setLoading(false);
    }
  };

  const handleEditApplication = async (application) => {
    try {
      console.log('Începe editarea aplicației:', application);
      setLoading(true);
      setError(null);

      // Încărcăm datele complete ale aplicației
      const response = await axios.get(
        `${API_BASE_URL}/api/applications/${application.id}`,
        {
          headers: getAuthHeaders()
        }
      );

      console.log('Răspuns de la server:', response.data);

      if (response.data.success) {
        const fullApplication = response.data.data;
        console.log('Date aplicație încărcate:', fullApplication);
        
        // Setăm aplicația selectată
        setSelectedApplication(fullApplication);
        
        // Setăm datele în formular
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
        
        console.log('Date pentru formular:', formData);
        setNewApplication(formData);
        
        // Afișăm formularul și închidem detaliile dacă sunt deschise
        setShowCreateForm(true);
        setShowApplicationDetails(false);
        
        // Verificăm dacă datele au fost setate corect
        console.log('Starea după setare:', {
          selectedApplication: fullApplication,
          newApplication: formData,
          showCreateForm: true
        });
      } else {
        throw new Error('Nu s-au putut încărca datele aplicației');
      }
    } catch (error) {
      console.error('Eroare la încărcarea datelor aplicației:', error);
      setError('A apărut o eroare la încărcarea datelor aplicației. Vă rugăm să încercați din nou.');
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

      // Verificăm dacă există deja o aplicație pentru acest program, dar doar pentru aplicații noi
      if (!selectedApplication) {
        const existingApplication = applications.find(app => 
          app.program_id === parseInt(newApplication.program_id)
        );

        if (existingApplication) {
          setError(`Aveți deja o aplicație pentru acest program (${existingApplication.program?.name}). Puteți să o editați pe cea existentă.`);
          setLoading(false);
          return;
        }
      }

      // Pregătim datele pentru trimitere conform modelului din backend
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

      console.log('Date trimise către server:', applicationData);

      let response;
      if (selectedApplication) {
        // Editare aplicație existentă
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
        // Creare aplicație nouă
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
        setSuccessMessage(selectedApplication ? 'Aplicația a fost actualizată cu succes!' : 'Aplicația a fost creată cu succes!');
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
        throw new Error(response.data.message || (selectedApplication ? 'Eroare la actualizarea aplicației' : 'Eroare la crearea aplicației'));
      }
    } catch (error) {
      console.error('Eroare:', error);
      if (error.response?.data?.message?.includes('deja există')) {
        setError('Aveți deja o aplicație pentru acest program. Vă rugăm să o editați pe cea existentă.');
      } else {
        setError(error.response?.data?.message || (selectedApplication ? 'A apărut o eroare la actualizarea aplicației' : 'A apărut o eroare la crearea aplicației'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Modificăm și partea de render pentru documente
  const renderDocumentsSection = () => (
    <div className="form-group">
      <label>Documente necesare: <span className="required">*</span></label>
      <div className="documents-selection">
        {!userDocuments || userDocuments.length === 0 ? (
          <p className="no-documents">Nu aveți documente încărcate. Vă rugăm să încărcați documentele în secțiunea de profil.</p>
        ) : (
          <div className="documents-list">
            {userDocuments.map((doc) => {
              const isSelected = newApplication.selectedDocuments.includes(doc.id);
              console.log(`Document ${doc.id} este selectat:`, isSelected);
              
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
                      <i className="fas fa-eye"></i> Vizualizare
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

      console.log('Documente selectate după toggle:', newSelectedDocuments);

      return {
        ...prev,
        selectedDocuments: newSelectedDocuments,
        errors: {
          ...prev.errors,
          documents: newSelectedDocuments.length === 0 ? 'Vă rugăm să selectați cel puțin un document' : ''
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
        setSuccessMessage('Statusul aplicației a fost actualizat cu succes!');
        setShowApplicationDetails(false);
        setSelectedApplication(null);
        await loadUserApplications();
      } else {
        throw new Error(response.data.message || 'Eroare la actualizarea statusului');
      }
    } catch (error) {
      console.error('Eroare la actualizarea statusului:', error);
      setError(error.response?.data?.message || 'A apărut o eroare la actualizarea statusului');
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
        documents: files.length > 0 ? '' : 'Vă rugăm să încărcați cel puțin un document'
      }
    }));
  };

  const removeDocument = (index) => {
    setNewApplication(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
      errors: {
        ...prev.errors,
        documents: prev.documents.length <= 1 ? 'Vă rugăm să încărcați cel puțin un document' : ''
      }
    }));
  };

  const handleViewApplication = (application) => {
    // Asigurăm-ne că avem toate datele necesare
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
      if (isNaN(date.getTime())) return 'Data invalidă';
      return date.toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Eroare la formatarea datei:', error);
      return 'Data invalidă';
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Necunoscut';

    switch (status) {
      case 'draft':
        return 'Ciornă';
      case 'submitted':
        return 'Trimisă';
      case 'under_review':
        return 'În revizuire';
      case 'approved':
        return 'Aprobată';
      case 'rejected':
        return 'Respinse';
      case 'withdrawn':
        return 'Retrasă';
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
    // Adminii pot șterge orice aplicație
    if (userRole === 'admin') return true;
    
    // Utilizatorii pot șterge doar aplicațiile în draft care nu au fost trimise niciodată
    return application.status === 'draft' && !application.submitted_at;
  };

  const handleDeleteApplication = async (applicationId) => {
    const application = applications.find(app => app.id === applicationId);
    
    if (!canDeleteApplication(application)) {
      setError('Nu puteți șterge această aplicație');
      return;
    }

    if (!window.confirm('Sigur doriți să ștergeți această aplicație?')) {
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
        setSuccessMessage('Aplicația a fost ștearsă cu succes!');
        setShowApplicationDetails(false);
        setSelectedApplication(null);
        await loadUserApplications();
      } else {
        throw new Error(response.data.message || 'Eroare la ștergerea aplicației');
      }
    } catch (error) {
      console.error('Eroare la ștergerea aplicației:', error);
      setError(error.response?.data?.message || 'A apărut o eroare la ștergerea aplicației');
    } finally {
      setLoading(false);
    }
  };

  const canWithdrawApplication = (application) => {
    // Doar utilizatorul poate retrage propria aplicație
    if (userRole === 'admin') return false;
    
    // Poate fi retrasă doar dacă este în una din stările: submitted, under_review
    return ['submitted', 'under_review'].includes(application.status);
  };

  const handleWithdrawApplication = async (applicationId) => {
    if (!window.confirm('Sigur doriți să retrageți această aplicație?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.patch(
        `${API_BASE_URL}/api/applications/${applicationId}/status`,
        {
          status: 'withdrawn',
          notes: 'Aplicație retrasă de utilizator'
        },
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        setSuccessMessage('Aplicația a fost retrasă cu succes!');
        setShowApplicationDetails(false);
        setSelectedApplication(null);
        await loadUserApplications();
      } else {
        throw new Error(response.data.message || 'Eroare la retragerea aplicației');
      }
    } catch (error) {
      console.error('Eroare la retragerea aplicației:', error);
      setError(error.response?.data?.message || 'A apărut o eroare la retragerea aplicației');
    } finally {
      setLoading(false);
    }
  };

  const canSubmitApplication = (application) => {
    // Doar utilizatorul poate trimite propria aplicație
    if (userRole === 'admin') return false;
    
    // Poate fi trimisă doar dacă este în starea draft și a fost plătită
    return application.status === 'draft' && application.is_paid;
  };

  const canEditApplication = (application) => {
    // Doar utilizatorul poate edita propria aplicație
    if (userRole === 'admin') return false;
    
    // Poate fi editată doar dacă este în starea draft sau nu a fost trimisă niciodată
    return application.status === 'draft' || !application.submitted_at;
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      let paymentData = {};

      // Dacă avem o aplicație selectată, folosim datele ei
      if (selectedApplication) {
        paymentData = {
          program_id: parseInt(selectedApplication.program_id),
          motivation_letter: selectedApplication.motivation_letter || '',
          document_ids: selectedApplication.documents?.map(doc => parseInt(doc.id)) || []
        };
      } else {
        // Pentru o aplicație nouă, folosim datele din newApplication
        paymentData = {
          program_id: newApplication.program_id ? parseInt(newApplication.program_id) : null,
          motivation_letter: newApplication.motivation_letter || '',
          document_ids: newApplication.selectedDocuments.map(id => parseInt(id))
        };
      }

      // Verificăm dacă avem toate datele necesare
      if (!paymentData.program_id) {
        throw new Error('Programul este obligatoriu');
      }

      if (!paymentData.motivation_letter) {
        throw new Error('Scrisoarea de motivație este obligatorie');
      }

      console.log('Date trimise pentru plată:', paymentData);

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
        throw new Error(response.data.message || 'Eroare la crearea sesiunii de plată');
      }
    } catch (error) {
      console.error('Eroare la procesarea plății:', error);
      setError(error.response?.data?.message || error.message || 'A apărut o eroare la procesarea plății');
    } finally {
      setLoading(false);
    }
  };

  // Verificăm dacă avem un parametru de plată în URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      setSuccessMessage('Plata a fost procesată cu succes!');
      // Reîncărcăm aplicațiile pentru a actualiza starea plății
      loadUserApplications();
    } else if (paymentStatus === 'canceled') {
      setError('Plata a fost anulată. Puteți încerca din nou.');
    }
  }, []);

  return (
    <div className="application-tab">
      <div className="application-section">
        <h2>{userRole === 'admin' ? 'Toate aplicațiile' : 'Aplicațiile mele'}</h2>
        {userRole === 'user' && (
          <button 
            className="btn1"
            onClick={() => setShowCreateForm(true)}
          >
            <i className="fas fa-plus"></i> Creare aplicație nouă
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
          Ciorne
          <span className="stat-value status-draft">{applications.filter(app => app.status === 'draft').length}</span>
        </div>
        <div className="application-stat">
          Trimise
          <span className="stat-value status-submitted">{applications.filter(app => app.status === 'submitted').length}</span>
        </div>
        <div className="application-stat">
          În revizuire
          <span className="stat-value status-under-review">{applications.filter(app => app.status === 'under_review').length}</span>
        </div>
        <div className="application-stat">
          Aprobate
          <span className="stat-value status-approved">{applications.filter(app => app.status === 'approved').length}</span>
        </div>
        <div className="application-stat">
          Respinse
          <span className="stat-value status-rejected">{applications.filter(app => app.status === 'rejected').length}</span>
        </div>
        <div className="application-stat">
          Retrase
          <span className="stat-value status-withdrawn">{applications.filter(app => app.status === 'withdrawn').length}</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Se încarcă aplicațiile...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="no-applications">
          <p>Nu există aplicații.</p>
        </div>
      ) : (
        <div className="applications-table-container">
          <table className="profile-table">
            <thead>
              <tr>
                {userRole === 'admin' && <th>Utilizator</th>}
                <th>Program</th>
                <th>Universitate</th>
                <th>Data aplicării</th>
                <th>Status</th>
                <th>Plata</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  {userRole === 'admin' && (
                    <td>{app.user_name || `Utilizator ID: ${app.user_id}`}</td>
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
                      {app.is_paid ? 'Plătită' : 'Neplătită'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-view"
                      onClick={() => handleViewApplication(app)}
                    >
                      <i className="fas fa-eye"></i> Vizualizare
                    </button>
                    {canEditApplication(app) && (
                      <button 
                        className="btn-edit"
                        onClick={() => handleEditApplication(app)}
                      >
                        <i className="fas fa-edit"></i> Editează
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
            <h2>{selectedApplication ? 'Editare aplicație' : 'Creare aplicație nouă'}</h2>
            <form onSubmit={handleCreateApplication} className="application-form">
              <div className="form-group">
                <label>Program: <span className="required">*</span></label>
                <select
                  value={newApplication.program_id || ''}
                  onChange={(e) => {
                    console.log('Program selectat:', e.target.value);
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
                  <option value="">Selectează un program</option>
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
                <label>Scrisoare de motivație: <span className="required">*</span></label>
                <textarea
                  value={newApplication.motivation_letter || ''}
                  onChange={(e) => {
                    console.log('Scrisoare de motivație actualizată:', e.target.value);
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
                  placeholder="Scrieți scrisoarea de motivație..."
                />
                {newApplication.errors.motivation_letter && (
                  <span className="error-message">{newApplication.errors.motivation_letter}</span>
                )}
              </div>

              {renderDocumentsSection()}

              <div className="form-group">
                <label>Plata aplicației:</label>
                <div className="payment-section">
                  {newApplication.is_paid ? (
                    <div className="payment-status success">
                      <i className="fas fa-check-circle"></i> Plata a fost efectuată
                    </div>
                  ) : (
                    <div className="payment-status">
                      <p>Taxa de aplicare: 100 MDL</p>
                      <button
                        type="button"
                        className="btn-pay"
                        onClick={handlePayment}
                        disabled={loading}
                      >
                        <i className="fas fa-credit-card"></i> Plătește acum
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-info">
                <p><span className="required">*</span> Câmpuri obligatorii</p>
              </div>

              <div className="button-group">
                <button 
                  type="submit" 
                  className="btn-submit"
                >
                  {selectedApplication ? 'Actualizează aplicația' : 'Salvează aplicația'}
                </button>
                {selectedApplication && selectedApplication.status === 'draft' && selectedApplication.is_paid && (
                  <button
                    type="button"
                    className="btn-submit-application"
                    onClick={() => {
                      if (!selectedApplication.is_paid) {
                        setError('Trebuie să plătiți taxa de aplicare pentru a trimite aplicația');
                        return;
                      }
                      handleSubmitApplication(selectedApplication.id);
                    }}
                    disabled={!selectedApplication.program_id || !selectedApplication.motivation_letter || !selectedApplication.documents || selectedApplication.documents.length === 0}
                  >
                    <i className="fas fa-paper-plane"></i> Trimite aplicația
                    {!selectedApplication.is_paid && (
                      <span className="payment-required">(Plată necesară)</span>
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
                  Anulează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showApplicationDetails && selectedApplication && (
        <div className="modal">
          <div className="modal-content">
            <h2>Detalii Aplicație</h2>
            <div className="application-details">
              {userRole === 'admin' && (
                <p><strong>Utilizator:</strong> {selectedApplication.user_name || `ID: ${selectedApplication.user_id}`}</p>
              )}
              <p><strong>Program:</strong> {selectedApplication.program?.name || 'N/A'}</p>
              <p><strong>Universitate:</strong> {selectedApplication.program?.university?.name || 'N/A'}</p>
              <p><strong>Data aplicării:</strong> {formatDate(selectedApplication.created_at)}</p>
              <p><strong>Status:</strong> {getStatusLabel(selectedApplication.status)}</p>
              <p>
                <strong>Stare plată:</strong>
                <span className={`payment-status ${selectedApplication.is_paid ? 'paid' : 'unpaid'}`}>
                  {selectedApplication.is_paid ? (
                    <i className="fas fa-check-circle"></i>
                  ) : (
                    <i className="fas fa-times-circle"></i>
                  )}
                  {selectedApplication.is_paid ? 'Plătită' : 'Neplătită'}
                </span>
              </p>
              
              {selectedApplication.motivation_letter && (
                <div className="motivation-letter">
                  <p><strong>Scrisoare de motivație:</strong></p>
                  <p>{selectedApplication.motivation_letter}</p>
                </div>
              )}

              {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                <div className="documents">
                  <p><strong>Documente încărcate:</strong></p>
                  <ul>
                    {selectedApplication.documents.map((doc, index) => (
                      <li key={index}>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          {doc.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedApplication.notes && (
                <div className="admin-notes">
                  <p><strong>Note administrator:</strong></p>
                  <p>{selectedApplication.notes}</p>
                </div>
              )}

              <div className="action-buttons">
                {!selectedApplication.is_paid && canEditApplication(selectedApplication) && (
                  <button
                    className="btn-pay"
                    onClick={() => handlePayment()}
                    disabled={loading}
                  >
                    <i className="fas fa-credit-card"></i> Plătește 100 MDL
                  </button>
                )}
                
                {canDeleteApplication(selectedApplication) && (
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteApplication(selectedApplication.id)}
                  >
                    <i className="fas fa-trash"></i> Șterge aplicația
                  </button>
                )}
                
                {canEditApplication(selectedApplication) && (
                  <button
                    className="btn-edit"
                    onClick={() => handleEditApplication(selectedApplication)}
                  >
                    <i className="fas fa-edit"></i> Editează aplicația
                  </button>
                )}

                {selectedApplication.status === 'draft' && (
                  <button
                    className="btn-submit-application"
                    onClick={() => {
                      if (!selectedApplication.is_paid) {
                        setError('Trebuie să plătiți taxa de aplicare pentru a trimite aplicația');
                        return;
                      }
                      handleSubmitApplication(selectedApplication.id);
                    }}
                    disabled={!selectedApplication.program_id || !selectedApplication.motivation_letter || !selectedApplication.documents || selectedApplication.documents.length === 0}
                  >
                    <i className="fas fa-paper-plane"></i> Trimite aplicația
                    {!selectedApplication.is_paid && (
                      <span className="payment-required">(Plată necesară)</span>
                    )}
                  </button>
                )}
                
                {canWithdrawApplication(selectedApplication) && (
                  <button
                    className="btn-withdraw"
                    onClick={() => handleWithdrawApplication(selectedApplication.id)}
                  >
                    <i className="fas fa-undo"></i> Retrage aplicația
                  </button>
                )}
              </div>

              {userRole === 'admin' && selectedApplication.status === 'submitted' && (
                <div className="admin-actions">
                  <h3>Acțiuni administrator</h3>
                  <div className="form-group">
                    <label>Note:</label>
                    <textarea
                      className="form-textarea"
                      rows="4"
                      placeholder="Adăugați note pentru aplicant..."
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
                      Aprobă
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleUpdateApplicationStatus(
                        selectedApplication.id,
                        'rejected',
                        selectedApplication.adminNotes
                      )}
                    >
                      Respinge
                    </button>
                    <button
                      className="btn-review"
                      onClick={() => handleUpdateApplicationStatus(
                        selectedApplication.id,
                        'under_review',
                        selectedApplication.adminNotes
                      )}
                    >
                      Pune în revizuire
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
              Închide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationTab; 