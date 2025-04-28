import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import './styles.css';
import { API_BASE_URL, getAuthHeaders, handleApiError } from '../../config/api.config';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDocumentType, setFilterDocumentType] = useState('all');
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [showAddUniversityForm, setShowAddUniversityForm] = useState(false);
  const [showEditUniversityForm, setShowEditUniversityForm] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [showAddProgramForm, setShowAddProgramForm] = useState(false);
  const [showEditProgramForm, setShowEditProgramForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [newUniversity, setNewUniversity] = useState({
    name: '',
    type: 'Public',
    description: '',
    location: '',
    imageUrl: '',
    website: '',
    ranking: '',
    tuitionFees: {
      bachelor: '',
      master: '',
      phd: ''
    },
    programs: [],
    contactInfo: {
      email: '',
      phone: '',
      address: ''
    }
  });
  const [newProgram, setNewProgram] = useState({
    name: '',
    faculty: '',
    degree: 'Bachelor',
    credits: '',
    languages: [],
    description: '',
    duration: '',
    tuitionFee: '',
    universityId: ''
  });
  const [sortBy, setSortBy] = useState('name');
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    let isMounted = true;

    const checkAdminAccess = () => {
      if (!user || user.role !== 'admin') {
        navigate('/sign-in');
        return false;
      }
      return true;
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/users`, {
          headers: getAuthHeaders()
        });
        
        if (!isMounted) return;

        if (response.data && Array.isArray(response.data)) {
          const sortedUsers = response.data.sort((a, b) => b.id - a.id);
          setUsers(sortedUsers);
        } else {
          setError('Formatul datelor primite este invalid');
        }
      } catch (err) {
        if (!isMounted) return;
        const error = handleApiError(err);
        setError(error.message);
        if (error.status === 401) {
          navigate('/sign-in');
        }
      }
    };

    const fetchDocuments = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/documents`, {
          headers: getAuthHeaders()
        });

        if (!isMounted) return;

        if (response.data && Array.isArray(response.data)) {
          setDocuments(response.data);
        }
      } catch (err) {
        if (!isMounted) return;
        const error = handleApiError(err);
        console.error('Eroare la încărcarea documentelor:', error);
      }
    };

    const fetchUniversities = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/universities`, {
          headers: getAuthHeaders()
        });
        if (isMounted) {
          setUniversities(response.data);
        }
      } catch (error) {
        const apiError = handleApiError(error);
        console.error('Eroare la încărcarea universităților:', apiError);
      }
    };

    const fetchPrograms = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/programs`, {
          headers: getAuthHeaders()
        });
        if (isMounted) {
          setPrograms(response.data);
        }
      } catch (error) {
        const apiError = handleApiError(error);
        console.error('Eroare la încărcarea programelor:', apiError);
      }
    };

    const handleError = (err) => {
      if (!isMounted) return;

      if (err.response) {
        if (err.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/sign-in');
        } else if (err.response.status === 403) {
          navigate('/profile');
        } else if (err.response.status === 500) {
          const errorMessage = err.response.data.message || 'Vă rugăm să încercați din nou mai târziu.';
          setError(`Eroare server: ${errorMessage}`);
        } else {
          setError(err.response.data.message || 'Eroare la încărcarea datelor');
        }
      } else if (err.request) {
        setError('Nu s-a putut conecta la server. Verificați conexiunea la internet.');
      } else {
        setError('A apărut o eroare neașteptată. Vă rugăm să încercați din nou.');
      }
    };

    const initializeDashboard = async () => {
      if (!checkAdminAccess()) return;

      try {
        await Promise.all([fetchUsers(), fetchDocuments()]);
      } catch (err) {
        console.error('Eroare la inițializarea dashboard-ului:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (activeTab === 'universities') {
      fetchUniversities();
    } else if (activeTab === 'programs') {
      fetchPrograms();
    }

    initializeDashboard();

    return () => {
      isMounted = false;
    };
  }, [navigate, token, user?.role, activeTab]);

  const getDocumentStatus = (userUUID) => {
    const userDocuments = documents.filter(doc => doc.user_uuid === userUUID);
    console.log('Documente pentru utilizatorul', userUUID, ':', userDocuments);
    
    const requiredDocuments = ['diploma', 'transcript', 'passport', 'photo'];
    const status = {};

    requiredDocuments.forEach(docType => {
      const hasDocument = userDocuments.some(doc => doc.document_type === docType);
      console.log('Verificare document', docType, ':', hasDocument);
      status[docType] = hasDocument ? 'Uploaded' : 'Missing';
    });

    return status;
  };

  const handleDeleteUser = async (userUUID) => {
    try {
      console.log('Încercare de ștergere pentru utilizatorul:', userUUID);
      const response = await axios.delete(`http://localhost:4000/api/auth/users/${userUUID}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Răspuns de la server:', response.data);

      if (response.status === 200) {
        setUsers(users.filter(user => user.uuid !== userUUID));
        setDeleteConfirmation(null);
      }
    } catch (err) {
      console.error('Eroare la ștergerea utilizatorului:', err);
      if (err.response) {
        console.log('Răspuns de eroare:', err.response.data);
        setError(err.response.data.message || 'Nu s-a putut șterge utilizatorul');
      } else if (err.request) {
        console.log('Nu s-a primit răspuns de la server');
        setError('Nu s-a putut conecta la server. Verificați conexiunea la internet.');
      } else {
        console.log('Eroare la configurarea cererii:', err.message);
        setError('Eroare la ștergerea utilizatorului. Vă rugăm să încercați din nou.');
      }
    }
  };

  const confirmDelete = (userUUID) => {
    setDeleteConfirmation(userUUID);
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleDownloadDocument = async (documentType, userUUID) => {
    try {
      const response = await axios({
        url: `http://localhost:4000/api/documents/download/${documentType}`,
        method: 'GET',
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Obținem tipul MIME din header-ul Content-Type
      const contentType = response.headers['content-type'];
      
      // Găsim documentul în lista de documente pentru a obține numele original
      const doc = documents.find(doc => doc.document_type === documentType && doc.user_uuid === userUUID);
      let fileName;

      if (doc && doc.file_path) {
        // Extragem numele original al fișierului din calea completă
        fileName = doc.file_path.split('/').pop();
      } else {
        // Dacă nu avem numele original, folosim numele documentului cu extensia corectă
        const fileExtension = contentType === 'image/png' ? '.png' : 
                            contentType === 'image/jpeg' || contentType === 'image/jpg' ? '.jpg' : 
                            contentType === 'application/pdf' ? '.pdf' : '.pdf';
        fileName = `${documentType}${fileExtension}`;
      }

      // Creăm blob-ul cu tipul MIME corect
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      
      // Creăm link-ul de descărcare
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Eroare la descărcarea documentului:', err);
      alert('Eroare la descărcarea documentului');
    }
  };

  const handleDeleteDocument = async (documentType, userUUID) => {
    if (!window.confirm('Sigur doriți să ștergeți acest document?')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:4000/api/documents/${documentType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Actualizăm lista de documente
        setDocuments(documents.filter(doc => 
          !(doc.document_type === documentType && doc.user_uuid === userUUID)
        ));
        alert('Document șters cu succes!');
      }
    } catch (err) {
      console.error('Eroare la ștergerea documentului:', err);
      alert('Eroare la ștergerea documentului');
    }
  };

  const renderUserDocuments = (userUUID) => {
    const userDocuments = documents.filter(doc => doc.user_uuid === userUUID);
    
    if (userDocuments.length === 0) {
      return <p>Nu există documente încărcate</p>;
    }

    return (
      <div className="user-documents">
        <div className="user-documents-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tip Document</th>
                <th>Data Încărcării</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {userDocuments.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.id}</td>
                  <td>{doc.document_type}</td>
                  <td>{new Date(doc.created_at).toLocaleDateString('en-US')}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleDownloadDocument(doc.document_type, userUUID)}
                        className="download-button"
                      >
                        Descarcă
                      </button>
                      <button 
                        onClick={() => handleDeleteDocument(doc.document_type, userUUID)}
                        className="delete-button"
                      >
                        Șterge
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.uuid.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const filteredDocuments = documents.filter(doc => {
    const user = users.find(u => u.uuid === doc.user_uuid);
    const matchesSearch = 
      (user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      doc.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterDocumentType === 'all' || doc.document_type === filterDocumentType;
    
    return matchesSearch && matchesType;
  });

  const filteredUniversities = universities.filter(uni => {
    const matchesSearch = searchTerm === '' || 
      uni.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === '' || 
      uni.type.toLowerCase() === filterType.toLowerCase();
    
    const matchesLocation = filterLocation === '' || 
      uni.location.toLowerCase().includes(filterLocation.toLowerCase());
    
    return matchesSearch && matchesType && matchesLocation;
  });

  const handleAddUniversity = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/api/universities', newUniversity);
      setShowAddUniversityForm(false);
      setNewUniversity({
        name: '',
        type: 'Public',
        description: '',
        location: '',
        imageUrl: '',
        website: '',
        ranking: '',
        tuitionFees: {
          bachelor: '',
          master: '',
          phd: ''
        },
        programs: [],
        contactInfo: {
          email: '',
          phone: '',
          address: ''
        }
      });
      // Reîncărcăm lista de universități
      const response = await axios.get('http://localhost:4000/api/universities');
      setUniversities(response.data);
      setSuccessMessage('Universitatea a fost adăugată cu succes!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      console.error('Eroare la adăugarea universității:', error);
      setError('Eroare la adăugarea universității');
    }
  };

  const handleUniversityInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewUniversity(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setNewUniversity(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEditUniversity = (university) => {
    setEditingUniversity(university);
    setShowEditUniversityForm(true);
  };

  const handleUpdateUniversity = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:4000/api/universities/${editingUniversity.id}`, editingUniversity);
      setShowEditUniversityForm(false);
      setEditingUniversity(null);
      // Reîncărcăm lista de universități
      const response = await axios.get('http://localhost:4000/api/universities');
      setUniversities(response.data);
      setSuccessMessage('Universitatea a fost modificată cu succes!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      console.error('Eroare la actualizarea universității:', error);
      setError('Eroare la actualizarea universității');
    }
  };

  const handleDeleteUniversity = async (universityId) => {
    if (window.confirm('Sigur doriți să ștergeți această universitate?')) {
      try {
        await axios.delete(`http://localhost:4000/api/universities/${universityId}`);
        // Reîncărcăm lista de universități
        const response = await axios.get('http://localhost:4000/api/universities');
        setUniversities(response.data);
      } catch (error) {
        console.error('Eroare la ștergerea universității:', error);
        setError('Eroare la ștergerea universității');
      }
    }
  };

  const handleOpenAddProgramForm = async () => {
    try {
      // Încărcăm lista de universități dacă nu suntem în tab-ul universities
      if (activeTab !== 'universities') {
        const response = await axios.get(`${API_BASE_URL}/universities`, {
          headers: getAuthHeaders()
        });
        setUniversities(response.data);
      }
      setShowAddProgramForm(true);
    } catch (error) {
      console.error('Eroare la încărcarea universităților:', error);
      setError('Eroare la încărcarea listei de universități');
    }
  };

  const handleEditProgram = async (program) => {
    try {
      // Încărcăm lista de universități dacă nu suntem în tab-ul universities
      if (activeTab !== 'universities') {
        const response = await axios.get(`${API_BASE_URL}/universities`, {
          headers: getAuthHeaders()
        });
        setUniversities(response.data);
      }
      setEditingProgram(program);
      setShowEditProgramForm(true);
    } catch (error) {
      console.error('Eroare la încărcarea universităților:', error);
      setError('Eroare la încărcarea listei de universități');
    }
  };

  const handleAddProgram = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/programs`, newProgram, {
        headers: getAuthHeaders()
      });
      setShowAddProgramForm(false);
      setNewProgram({
        name: '',
        faculty: '',
        degree: 'Bachelor',
        credits: '',
        languages: [],
        description: '',
        duration: '',
        tuitionFee: '',
        universityId: ''
      });
      // Reîncărcăm lista de programe
      const response = await axios.get(`${API_BASE_URL}/programs`, {
        headers: getAuthHeaders()
      });
      setPrograms(response.data);
      setSuccessMessage('Programul a fost adăugat cu succes!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      console.error('Eroare la adăugarea programului:', error);
      setError('Eroare la adăugarea programului');
    }
  };

  const handleProgramInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'languages') {
      setNewProgram(prev => ({
        ...prev,
        languages: value.split(',').map(lang => lang.trim())
      }));
    } else {
      setNewProgram(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdateProgram = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/programs/${editingProgram.id}`, editingProgram, {
        headers: getAuthHeaders()
      });
      setShowEditProgramForm(false);
      setEditingProgram(null);
      // Reîncărcăm lista de programe
      const response = await axios.get(`${API_BASE_URL}/programs`, {
        headers: getAuthHeaders()
      });
      setPrograms(response.data);
      setSuccessMessage('Programul a fost modificat cu succes!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      console.error('Eroare la actualizarea programului:', error);
      setError('Eroare la actualizarea programului');
    }
  };

  const handleDeleteProgram = async (programId) => {
    if (window.confirm('Sigur doriți să ștergeți acest program?')) {
      try {
        await axios.delete(`${API_BASE_URL}/programs/${programId}`, {
          headers: getAuthHeaders()
        });
        // Reîncărcăm lista de programe
        const response = await axios.get(`${API_BASE_URL}/programs`, {
          headers: getAuthHeaders()
        });
        setPrograms(response.data);
        setSuccessMessage('Programul a fost șters cu succes!');
        setTimeout(() => setSuccessMessage(''), 2000);
      } catch (error) {
        console.error('Eroare la ștergerea programului:', error);
        setError('Eroare la ștergerea programului');
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="dashboard-container">
          <div className="dashboard-content">
            <div className="loading">Loading...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="dashboard-container">
          <div className="dashboard-content">
            <div className="error">{error}</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1>Admin Dashboard</h1>
            <div className="tab-buttons">
              <button 
                className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                Users
              </button>
              <button 
                className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveTab('documents')}
              >
                Documents
              </button>
              <button 
                className={`tab-button ${activeTab === 'universities' ? 'active' : ''}`}
                onClick={() => setActiveTab('universities')}
              >
                Universities
              </button>
              <button 
                className={`tab-button ${activeTab === 'programs' ? 'active' : ''}`}
                onClick={() => setActiveTab('programs')}
              >
                Programs
              </button>
            </div>
          </div>

          <div className="dashboard-filters">
            <div className="search-box">
              <div className="search-input-wrapper">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder={activeTab === 'users' 
                    ? "Caută după nume, email sau UUID..." 
                    : activeTab === 'documents' ? "Caută după nume utilizator sau tip document..." : "Caută după nume universități..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {activeTab === 'users' ? (
              <div className="filter-box">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Toate rolurile</option>
                  <option value="admin">Administratori</option>
                  <option value="user">Utilizatori</option>
                </select>
              </div>
            ) : activeTab === 'documents' ? (
              <div className="filter-box">
                <select
                  value={filterDocumentType}
                  onChange={(e) => setFilterDocumentType(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Toate tipurile</option>
                  <option value="diploma">Diplomă</option>
                  <option value="transcript">Transcript</option>
                  <option value="passport">Pașaport</option>
                  <option value="photo">Fotografie</option>
                </select>
              </div>
            ) : (
              <div className="filter-section universities-filter">
                <div className="filter-group">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Toate tipurile</option>
                    <option value="public">Public</option>
                    <option value="private">Privat</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Locație:</label>
                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Toate locațiile</option>
                    <option value="Chișinău">Chișinău</option>
                    <option value="Bălți">Bălți</option>
                    <option value="Cahul">Cahul</option>
                    <option value="Comrat">Comrat</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Sortare:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="name">Nume (A-Z)</option>
                    <option value="name_desc">Nume (Z-A)</option>
                    <option value="location">Locație (A-Z)</option>
                    <option value="type">Tip (A-Z)</option>
                  </select>
                </div>
                <button 
                  className="clear-filters-button"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('');
                    setFilterLocation('');
                    setSortBy('name');
                  }}
                >
                  Curăță Filtrele
                </button>
              </div>
            )}
          </div>

          {activeTab === 'universities' && (
            <>
              <div className="dashboard-actions">
                <button 
                  className="add-button"
                  onClick={() => setShowAddUniversityForm(true)}
                >
                  Add University
                </button>
              </div>
              {successMessage && (
                <div className="alert-success" style={{marginBottom: '1rem', color: '#388e3c', background: '#e8f5e9', border: '1px solid #388e3c', borderRadius: '6px', padding: '0.7rem', textAlign: 'center', fontWeight: 600}}>
                  {successMessage}
                </div>
              )}
              <div className="universities-table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Nume</th>
                      <th>Tip</th>
                      <th>Locație</th>
                      <th>Website</th>
                      <th>Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUniversities.map(university => (
                      <tr key={university.id}>
                        <td>{university.name}</td>
                        <td>{university.type}</td>
                        <td>{university.location}</td>
                        <td>
                          <a href={university.website} target="_blank" rel="noopener noreferrer">
                            {university.website}
                          </a>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="edit-button"
                              onClick={() => handleEditUniversity(university)}
                            >
                              Editează
                            </button>
                            <button 
                              className="delete-button"
                              onClick={() => handleDeleteUniversity(university.id)}
                            >
                              Șterge
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {showAddUniversityForm && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h2>Add New University</h2>
                    <form onSubmit={handleAddUniversity}>
                      <div className="form-group">
                        <label>Name:</label>
                        <input
                          type="text"
                          name="name"
                          value={newUniversity.name}
                          onChange={handleUniversityInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Type:</label>
                        <select
                          name="type"
                          value={newUniversity.type}
                          onChange={handleUniversityInputChange}
                          required
                        >
                          <option value="Public">Public</option>
                          <option value="Private">Private</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Description:</label>
                        <textarea
                          name="description"
                          value={newUniversity.description}
                          onChange={handleUniversityInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Location:</label>
                        <input
                          type="text"
                          name="location"
                          value={newUniversity.location}
                          onChange={handleUniversityInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Image URL sau cale relativă:</label>
                        <input
                          type="text"
                          name="imageUrl"
                          value={newUniversity.imageUrl}
                          onChange={handleUniversityInputChange}
                          placeholder="URL sau cale relativă (ex: /images/universities/example.jpg)"
                          required
                        />
                        <small className="form-text text-muted">
                          Puteți introduce fie un URL complet (ex: https://example.com/image.jpg) 
                          fie o cale relativă în proiect (ex: /images/universities/example.jpg)
                        </small>
                      </div>

                      <div className="form-group">
                        <label>Website:</label>
                        <input
                          type="url"
                          name="website"
                          value={newUniversity.website}
                          onChange={handleUniversityInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Ranking:</label>
                        <input
                          type="text"
                          name="ranking"
                          value={newUniversity.ranking}
                          onChange={handleUniversityInputChange}
                        />
                      </div>

                      <div className="form-group">
                        <label>Tuition Fees:</label>
                        <div className="nested-form-group">
                          <input
                            type="text"
                            name="tuitionFees.bachelor"
                            placeholder="Bachelor"
                            value={newUniversity.tuitionFees.bachelor}
                            onChange={handleUniversityInputChange}
                          />
                          <input
                            type="text"
                            name="tuitionFees.master"
                            placeholder="Master"
                            value={newUniversity.tuitionFees.master}
                            onChange={handleUniversityInputChange}
                          />
                          <input
                            type="text"
                            name="tuitionFees.phd"
                            placeholder="PhD"
                            value={newUniversity.tuitionFees.phd}
                            onChange={handleUniversityInputChange}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Contact Info:</label>
                        <div className="nested-form-group">
                          <input
                            type="email"
                            name="contactInfo.email"
                            placeholder="Email"
                            value={newUniversity.contactInfo.email}
                            onChange={handleUniversityInputChange}
                          />
                          <input
                            type="tel"
                            name="contactInfo.phone"
                            placeholder="Phone"
                            value={newUniversity.contactInfo.phone}
                            onChange={handleUniversityInputChange}
                          />
                          <input
                            type="text"
                            name="contactInfo.address"
                            placeholder="Address"
                            value={newUniversity.contactInfo.address}
                            onChange={handleUniversityInputChange}
                          />
                        </div>
                      </div>

                      <div className="modal-buttons">
                        <button 
                          type="button" 
                          className="cancel-button"
                          onClick={() => setShowAddUniversityForm(false)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="confirm-button">
                          Add University
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {showEditUniversityForm && editingUniversity && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h2>Editează Universitatea</h2>
                    <form onSubmit={handleUpdateUniversity}>
                      <div className="form-group">
                        <label>Nume:</label>
                        <input
                          type="text"
                          name="name"
                          value={editingUniversity.name}
                          onChange={(e) => setEditingUniversity({
                            ...editingUniversity,
                            name: e.target.value
                          })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Tip:</label>
                        <select
                          name="type"
                          value={editingUniversity.type}
                          onChange={(e) => setEditingUniversity({
                            ...editingUniversity,
                            type: e.target.value
                          })}
                          required
                        >
                          <option value="Public">Public</option>
                          <option value="Private">Private</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Descriere:</label>
                        <textarea
                          name="description"
                          value={editingUniversity.description}
                          onChange={(e) => setEditingUniversity({
                            ...editingUniversity,
                            description: e.target.value
                          })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Locație:</label>
                        <input
                          type="text"
                          name="location"
                          value={editingUniversity.location}
                          onChange={(e) => setEditingUniversity({
                            ...editingUniversity,
                            location: e.target.value
                          })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>URL Imagine:</label>
                        <input
                          type="url"
                          name="imageUrl"
                          value={editingUniversity.imageUrl}
                          onChange={(e) => setEditingUniversity({
                            ...editingUniversity,
                            imageUrl: e.target.value
                          })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Website:</label>
                        <input
                          type="url"
                          name="website"
                          value={editingUniversity.website}
                          onChange={(e) => setEditingUniversity({
                            ...editingUniversity,
                            website: e.target.value
                          })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Ranking:</label>
                        <input
                          type="text"
                          name="ranking"
                          value={editingUniversity.ranking}
                          onChange={(e) => setEditingUniversity({
                            ...editingUniversity,
                            ranking: e.target.value
                          })}
                        />
                      </div>

                      <div className="nested-form-group">
                        <h3>Taxe de Școlarizare</h3>
                        <div className="form-group">
                          <label>Licență:</label>
                          <input
                            type="text"
                            name="tuitionFees.bachelor"
                            value={editingUniversity.tuitionFees?.bachelor || ''}
                            onChange={(e) => setEditingUniversity({
                              ...editingUniversity,
                              tuitionFees: {
                                ...editingUniversity.tuitionFees,
                                bachelor: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Master:</label>
                          <input
                            type="text"
                            name="tuitionFees.master"
                            value={editingUniversity.tuitionFees?.master || ''}
                            onChange={(e) => setEditingUniversity({
                              ...editingUniversity,
                              tuitionFees: {
                                ...editingUniversity.tuitionFees,
                                master: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Doctorat:</label>
                          <input
                            type="text"
                            name="tuitionFees.phd"
                            value={editingUniversity.tuitionFees?.phd || ''}
                            onChange={(e) => setEditingUniversity({
                              ...editingUniversity,
                              tuitionFees: {
                                ...editingUniversity.tuitionFees,
                                phd: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>

                      <div className="nested-form-group">
                        <h3>Informații de Contact</h3>
                        <div className="form-group">
                          <label>Email:</label>
                          <input
                            type="email"
                            name="contactInfo.email"
                            value={editingUniversity.contactInfo?.email || ''}
                            onChange={(e) => setEditingUniversity({
                              ...editingUniversity,
                              contactInfo: {
                                ...editingUniversity.contactInfo,
                                email: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Telefon:</label>
                          <input
                            type="tel"
                            name="contactInfo.phone"
                            value={editingUniversity.contactInfo?.phone || ''}
                            onChange={(e) => setEditingUniversity({
                              ...editingUniversity,
                              contactInfo: {
                                ...editingUniversity.contactInfo,
                                phone: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Adresă:</label>
                          <input
                            type="text"
                            name="contactInfo.address"
                            value={editingUniversity.contactInfo?.address || ''}
                            onChange={(e) => setEditingUniversity({
                              ...editingUniversity,
                              contactInfo: {
                                ...editingUniversity.contactInfo,
                                address: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>

                      <div className="modal-buttons">
                        <button type="submit" className="confirm-button">
                          Salvează Modificările
                        </button>
                        <button
                          type="button"
                          className="cancel-button"
                          onClick={() => {
                            setShowEditUniversityForm(false);
                            setEditingUniversity(null);
                          }}
                        >
                          Anulează
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'programs' && (
            <>
              <div className="dashboard-actions">
                <button 
                  className="add-button"
                  onClick={handleOpenAddProgramForm}
                >
                  Add Program
                </button>
              </div>
              {successMessage && (
                <div className="alert-success" style={{marginBottom: '1rem', color: '#388e3c', background: '#e8f5e9', border: '1px solid #388e3c', borderRadius: '6px', padding: '0.7rem', textAlign: 'center', fontWeight: 600}}>
                  {successMessage}
                </div>
              )}
              <div className="programs-table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Nume</th>
                      <th>Facultate</th>
                      <th>Grad</th>
                      <th>Credite</th>
                      <th>Limbă</th>
                      <th>Durată</th>
                      <th>Taxă</th>
                      <th>Universitate</th>
                      <th>Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map(program => (
                      <tr key={program.id}>
                        <td>{program.name}</td>
                        <td>{program.faculty}</td>
                        <td>{program.degree}</td>
                        <td>{program.credits}</td>
                        <td>{Array.isArray(program.languages) ? program.languages.join(', ') : program.languages}</td>
                        <td>{program.duration}</td>
                        <td>{program.tuitionFee}</td>
                        <td>{program.university?.name || 'N/A'}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="edit-button"
                              onClick={() => handleEditProgram(program)}
                            >
                              Editează
                            </button>
                            <button 
                              className="delete-button"
                              onClick={() => handleDeleteProgram(program.id)}
                            >
                              Șterge
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {showAddProgramForm && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h2>Add New Program</h2>
                    <form onSubmit={handleAddProgram}>
                      <div className="form-group">
                        <label>Name:</label>
                        <input
                          type="text"
                          name="name"
                          value={newProgram.name}
                          onChange={handleProgramInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Faculty:</label>
                        <input
                          type="text"
                          name="faculty"
                          value={newProgram.faculty}
                          onChange={handleProgramInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Degree:</label>
                        <select
                          name="degree"
                          value={newProgram.degree}
                          onChange={handleProgramInputChange}
                          required
                        >
                          <option value="Bachelor">Bachelor</option>
                          <option value="Master">Master</option>
                          <option value="PhD">PhD</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Credits:</label>
                        <input
                          type="number"
                          name="credits"
                          value={newProgram.credits}
                          onChange={handleProgramInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Languages (comma-separated):</label>
                        <input
                          type="text"
                          name="languages"
                          value={Array.isArray(newProgram.languages) ? newProgram.languages.join(', ') : newProgram.languages}
                          onChange={handleProgramInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Description:</label>
                        <textarea
                          name="description"
                          value={newProgram.description}
                          onChange={handleProgramInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Duration:</label>
                        <input
                          type="text"
                          name="duration"
                          value={newProgram.duration}
                          onChange={handleProgramInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Tuition Fee:</label>
                        <input
                          type="number"
                          name="tuitionFee"
                          value={newProgram.tuitionFee}
                          onChange={handleProgramInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>University:</label>
                        <select
                          name="universityId"
                          value={newProgram.universityId}
                          onChange={handleProgramInputChange}
                          required
                        >
                          <option value="">Select University</option>
                          {universities.map(university => (
                            <option key={university.id} value={university.id}>
                              {university.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="modal-buttons">
                        <button 
                          type="button" 
                          className="cancel-button"
                          onClick={() => setShowAddProgramForm(false)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="confirm-button">
                          Add Program
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {showEditProgramForm && editingProgram && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h2>Editează Programul</h2>
                    <form onSubmit={handleUpdateProgram}>
                      <div className="form-group">
                        <label>Nume:</label>
                        <input
                          type="text"
                          name="name"
                          value={editingProgram.name}
                          onChange={(e) => setEditingProgram({
                            ...editingProgram,
                            name: e.target.value
                          })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Facultate:</label>
                        <input
                          type="text"
                          name="faculty"
                          value={editingProgram.faculty}
                          onChange={(e) => setEditingProgram({
                            ...editingProgram,
                            faculty: e.target.value
                          })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Grad:</label>
                        <select
                          name="degree"
                          value={editingProgram.degree}
                          onChange={(e) => setEditingProgram({
                            ...editingProgram,
                            degree: e.target.value
                          })}
                          required
                        >
                          <option value="Bachelor">Bachelor</option>
                          <option value="Master">Master</option>
                          <option value="PhD">PhD</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Credite:</label>
                        <input
                          type="number"
                          name="credits"
                          value={editingProgram.credits}
                          onChange={(e) => setEditingProgram({
                            ...editingProgram,
                            credits: e.target.value
                          })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Limbi (separate prin virgulă):</label>
                        <input
                          type="text"
                          name="languages"
                          value={Array.isArray(editingProgram.languages) ? editingProgram.languages.join(', ') : editingProgram.languages}
                          onChange={(e) => setEditingProgram({
                            ...editingProgram,
                            languages: e.target.value.split(',').map(lang => lang.trim())
                          })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Descriere:</label>
                        <textarea
                          name="description"
                          value={editingProgram.description}
                          onChange={(e) => setEditingProgram({
                            ...editingProgram,
                            description: e.target.value
                          })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Durată:</label>
                        <input
                          type="text"
                          name="duration"
                          value={editingProgram.duration}
                          onChange={(e) => setEditingProgram({
                            ...editingProgram,
                            duration: e.target.value
                          })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Taxă de școlarizare:</label>
                        <input
                          type="number"
                          name="tuitionFee"
                          value={editingProgram.tuitionFee}
                          onChange={(e) => setEditingProgram({
                            ...editingProgram,
                            tuitionFee: e.target.value
                          })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Universitate:</label>
                        <select
                          name="universityId"
                          value={editingProgram.universityId}
                          onChange={(e) => setEditingProgram({
                            ...editingProgram,
                            universityId: e.target.value
                          })}
                          required
                        >
                          <option value="">Selectează Universitatea</option>
                          {universities.map(university => (
                            <option key={university.id} value={university.id}>
                              {university.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="modal-buttons">
                        <button type="submit" className="confirm-button">
                          Salvează Modificările
                        </button>
                        <button
                          type="button"
                          className="cancel-button"
                          onClick={() => {
                            setShowEditProgramForm(false);
                            setEditingProgram(null);
                          }}
                        >
                          Anulează
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'users' ? (
            <div className="users-table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>UUID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Diploma</th>
                    <th>Transcript</th>
                    <th>Passport</th>
                    <th>Photo</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => {
                    const docStatus = getDocumentStatus(user.uuid);
                    return (
                      <tr key={user.uuid}>
                        <td>{user.uuid}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role === 'admin' ? 'Administrator' : 'User'}</td>
                        <td>
                          <div className="document-cell">
                            <span className={docStatus.diploma === 'Uploaded' ? 'status-success' : 'status-missing'}>
                              {docStatus.diploma}
                            </span>
                            {docStatus.diploma === 'Uploaded' && (
                              <div className="document-actions">
                                <button 
                                  className="download-button"
                                  onClick={() => handleDownloadDocument('diploma', user.uuid)}
                                >
                                  <i className="fas fa-download"></i>
                                </button>
                                <button 
                                  className="delete-button"
                                  onClick={() => handleDeleteDocument('diploma', user.uuid)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="document-cell">
                            <span className={docStatus.transcript === 'Uploaded' ? 'status-success' : 'status-missing'}>
                              {docStatus.transcript}
                            </span>
                            {docStatus.transcript === 'Uploaded' && (
                              <div className="document-actions">
                                <button 
                                  className="download-button"
                                  onClick={() => handleDownloadDocument('transcript', user.uuid)}
                                >
                                  <i className="fas fa-download"></i>
                                </button>
                                <button 
                                  className="delete-button"
                                  onClick={() => handleDeleteDocument('transcript', user.uuid)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="document-cell">
                            <span className={docStatus.passport === 'Uploaded' ? 'status-success' : 'status-missing'}>
                              {docStatus.passport}
                            </span>
                            {docStatus.passport === 'Uploaded' && (
                              <div className="document-actions">
                                <button 
                                  className="download-button"
                                  onClick={() => handleDownloadDocument('passport', user.uuid)}
                                >
                                  <i className="fas fa-download"></i>
                                </button>
                                <button 
                                  className="delete-button"
                                  onClick={() => handleDeleteDocument('passport', user.uuid)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="document-cell">
                            <span className={docStatus.photo === 'Uploaded' ? 'status-success' : 'status-missing'}>
                              {docStatus.photo}
                            </span>
                            {docStatus.photo === 'Uploaded' && (
                              <div className="document-actions">
                                <button 
                                  className="download-button"
                                  onClick={() => handleDownloadDocument('photo', user.uuid)}
                                >
                                  <i className="fas fa-download"></i>
                                </button>
                                <button 
                                  className="delete-button"
                                  onClick={() => handleDeleteDocument('photo', user.uuid)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          {user.role !== 'admin' && (
                            <div className="action-buttons">
                              <button 
                                className="view-documents-button"
                                onClick={() => setSelectedUser(user)}
                              >
                                <i className="fas fa-eye"></i> View Docs
                              </button>
                              <button 
                                className="delete-button"
                                onClick={() => confirmDelete(user.uuid)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'documents' ? (
            <div className="documents-table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Document Type</th>
                    <th>Upload Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map(doc => {
                    const user = users.find(u => u.uuid === doc.user_uuid);
                    return (
                      <tr key={`${doc.user_uuid}_${doc.document_type}`}>
                        <td>{doc.id}</td>
                        <td>{user ? user.name : 'Unknown'}</td>
                        <td>{doc.document_type}</td>
                        <td>{new Date(doc.created_at).toLocaleDateString('en-US')}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="download-button"
                              onClick={() => handleDownloadDocument(doc.document_type, doc.user_uuid)}
                            >
                              Download
                            </button>
                            <button 
                              className="delete-button"
                              onClick={() => handleDeleteDocument(doc.document_type, doc.user_uuid)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}

          {selectedUser && (
            <div className="modal-overlay">
              <div className="modal-content documents-modal">
                <div className="modal-header">
                  <h3>Documente pentru {selectedUser.name}</h3>
                  <button className="close-button" onClick={() => setSelectedUser(null)}>
                    Închide
                  </button>
                </div>
                {renderUserDocuments(selectedUser.uuid)}
              </div>
            </div>
          )}

          {deleteConfirmation && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-warning">
                  <span className="warning-icon">⚠️</span>
                  <h3>WARNING!</h3>
                </div>
                <p className="modal-message">
                  You are about to delete this user. 
                  <strong>This action cannot be undone!</strong>
                </p>
                <p className="modal-details">
                  All user data, including uploaded documents, will be permanently deleted.
                </p>
                <div className="modal-buttons">
                  <button 
                    className="cancel-button"
                    onClick={cancelDelete}
                  >
                    Cancel
                  </button>
                  <button 
                    className="confirm-button"
                    onClick={() => handleDeleteUser(deleteConfirmation)}
                  >
                    Yes, delete user
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard; 