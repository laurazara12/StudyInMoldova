import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import Notifications from '../../components/notifications';
import universityService from '../../services/universityService';

import './dashboard.css';
import '../../style.css';

import { API_BASE_URL, getAuthHeaders, handleApiError } from '../../config/api.config';
import DeleteDocumentModal from '../../components/DeleteDocumentModal';
import { FaCheckCircle, FaTimesCircle, FaTrash, FaEdit, FaClock, FaUsers, FaUserPlus, FaFileUpload, FaFileAlt, FaShieldAlt } from 'react-icons/fa';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState({
    users: true,
    documents: true,
    universities: true,
    programs: true,
    applications: true
  });
  const [errors, setErrors] = useState({
    users: null,
    documents: null,
    universities: null,
    programs: null,
    applications: null
  });
  const [error, setError] = useState(null);
  const [docStatus, setDocStatus] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showUserDocuments, setShowUserDocuments] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDocumentType, setFilterDocumentType] = useState('all');
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterDegree, setFilterDegree] = useState('all');
  const [filterFaculty, setFilterFaculty] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState({ start: '', end: '' });
  const [filterCredits, setFilterCredits] = useState({ min: '', max: '' });
  const [filterTuitionFee, setFilterTuitionFee] = useState({ min: '', max: '' });
  const [filterRanking, setFilterRanking] = useState({ min: '', max: '' });
  const [showAddUniversityForm, setShowAddUniversityForm] = useState(false);
  const [showAddProgramForm, setShowAddProgramForm] = useState(false);
  const [showEditProgramForm, setShowEditProgramForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
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
    description: '',
    university_id: '',
    duration: '',
    degree: '',
    language: '',
    tuition_fee: '',
    start_date: '',
    application_deadline: ''
  });
  const [sortBy, setSortBy] = useState('name');
  const [successMessage, setSuccessMessage] = useState("");
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [filterUserDateRange, setFilterUserDateRange] = useState({ start: '', end: '' });
  const [applications, setApplications] = useState([]);
  const [filterApplicationStatus, setFilterApplicationStatus] = useState('all');
  const [filterApplicationDateRange, setFilterApplicationDateRange] = useState({ start: '', end: '' });
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [showApplicationEdit, setShowApplicationEdit] = useState(false);
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalDocuments: 0,
    totalUniversities: 0,
    totalPrograms: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0
  });
  const [filterUniversityDateRange, setFilterUniversityDateRange] = useState({ start: '', end: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [errorNotifications, setErrorNotifications] = useState(null);

  // Adăugăm funcția getDocumentStatus
  const getDocumentStatus = (userId) => {
    const userDocuments = documents.filter(doc => doc.user_id === userId);
    
    const getStatus = (type) => {
      const doc = userDocuments.find(d => d.document_type === type);
      if (!doc) {
        return {
          exists: false,
          status: 'missing',
          uploadDate: null
        };
      }
      return {
        exists: true,
        status: doc.status || 'pending',
        uploadDate: doc.createdAt || doc.uploadDate
      };
    };

    return {
      diploma: getStatus('diploma'),
      transcript: getStatus('transcript'),
      passport: getStatus('passport'),
      photo: getStatus('photo')
    };
  };

  // Adăugăm useEffect pentru încărcarea inițială
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        console.log('Inițializare dashboard...');
        
        // Verificăm accesul de admin
        if (!checkAdminAccess()) {
          return;
        }

        // Încărcăm datele pentru tab-ul activ
        switch(activeTab) {
          case 'users':
            await loadUsers();
            break;
          case 'documents':
            await loadDocuments();
            break;
          case 'universities':
            await loadUniversities();
            break;
          case 'programs':
            await loadPrograms();
            break;
          case 'applications':
            await loadApplications();
            break;
          case 'notifications':
            await loadNotifications();
            break;
          default:
            // Pentru tab-ul overview, încărcăm toate datele
            await Promise.all([
              loadUsers(),
              loadDocuments(),
              loadUniversities(),
              loadPrograms(),
              loadApplications()
            ]);
            break;
        }
      } catch (error) {
        console.error('Eroare la inițializarea dashboard-ului:', error);
        setError('A apărut o eroare la încărcarea datelor. Vă rugăm să reîncercați.');
      }
    };

    initializeDashboard();
  }, [activeTab]); // Reîncărcăm datele când se schimbă tab-ul

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
    
    // Resetăm toate filtrele când schimbăm tab-ul
    setFilterRole('all');
    setFilterDocumentType('all');
    setFilterType('');
    setFilterLocation('');
    setFilterDegree('all');
    setFilterFaculty('');
    setFilterLanguage('');
    setFilterStatus('all');
    setFilterDateRange({ start: '', end: '' });
    setFilterCredits({ min: '', max: '' });
    setFilterTuitionFee({ min: '', max: '' });
    setFilterRanking({ min: '', max: '' });
    setFilterUserDateRange({ start: '', end: '' });
    setFilterApplicationStatus('all');
    setFilterApplicationDateRange({ start: '', end: '' });
    setFilterUniversityDateRange({ start: '', end: '' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const handleConfirmDocument = async (document) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/documents/${document.id}`,
        {
          status: 'approved',
          document_type: document.document_type,
          file_path: document.file_path,
          filename: document.filename,
          originalName: document.originalName,
          user_id: document.user_id,
          admin_message: 'Documentul dumneavoastră a fost aprobat de administrator.'
        },
        { headers: getAuthHeaders() }
      );

      // Reîncărcăm lista completă de documente indiferent de eroarea de notificare
      const documentsResponse = await axios.get(`${API_BASE_URL}/api/documents`, {
        headers: getAuthHeaders()
      });
      
      if (documentsResponse.data.success) {
        const updatedDocuments = documentsResponse.data.documents || [];
        setDocuments(updatedDocuments);
        setFilteredDocuments(updatedDocuments);
        setSuccessMessage('Document aprobat cu succes!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Eroare la aprobarea documentului:', error);
      // Încercăm să reîncărcăm documentele chiar dacă a apărut o eroare
      try {
        const documentsResponse = await axios.get(`${API_BASE_URL}/api/documents`, {
          headers: getAuthHeaders()
        });
        
        if (documentsResponse.data.success) {
          const updatedDocuments = documentsResponse.data.documents || [];
          setDocuments(updatedDocuments);
          setFilteredDocuments(updatedDocuments);
        }
      } catch (reloadError) {
        console.error('Eroare la reîncărcarea documentelor:', reloadError);
      }
      
      setError('A apărut o eroare la aprobarea documentului. Vă rugăm să încercați din nou.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleRejectDocument = async (document) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/documents/${document.id}`,
        {
          status: 'rejected',
          document_type: document.document_type,
          file_path: document.file_path,
          filename: document.filename,
          originalName: document.originalName,
          user_id: document.user_id,
          admin_message: 'Documentul dumneavoastră a fost respins de administrator.'
        },
        { headers: getAuthHeaders() }
      );

      // Reîncărcăm lista completă de documente indiferent de eroarea de notificare
      const documentsResponse = await axios.get(`${API_BASE_URL}/api/documents`, {
        headers: getAuthHeaders()
      });
      
      if (documentsResponse.data.success) {
        const updatedDocuments = documentsResponse.data.documents || [];
        setDocuments(updatedDocuments);
        setFilteredDocuments(updatedDocuments);
        setSuccessMessage('Document respins cu succes!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Eroare la respingerea documentului:', error);
      // Încercăm să reîncărcăm documentele chiar dacă a apărut o eroare
      try {
        const documentsResponse = await axios.get(`${API_BASE_URL}/api/documents`, {
          headers: getAuthHeaders()
        });
        
        if (documentsResponse.data.success) {
          const updatedDocuments = documentsResponse.data.documents || [];
          setDocuments(updatedDocuments);
          setFilteredDocuments(updatedDocuments);
        }
      } catch (reloadError) {
        console.error('Eroare la reîncărcarea documentelor:', reloadError);
      }
      
      setError('A apărut o eroare la respingerea documentului. Vă rugăm să încercați din nou.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const checkAdminAccess = () => {
    if (!user || user.role !== 'admin') {
      navigate('/sign-in');
      return false;
    }
    return true;
  };

  const handleSectionError = (section, error) => {
    console.error(`Eroare la încărcarea ${section}:`, error);
    setErrors(prev => ({
      ...prev,
      [section]: `Eroare la încărcarea ${section}: ${error.message}`
    }));
    setLoading(prev => ({
      ...prev,
      [section]: false
    }));
  };

  const updateSectionData = (section, data) => {
    switch(section) {
      case 'users':
        setUsers(data);
        break;
      case 'documents':
        setDocuments(data);
        break;
      case 'universities':
        setUniversities(data);
        break;
      case 'programs':
        setPrograms(data);
        break;
      case 'applications':
        setApplications(data);
        break;
      case 'total':
        setStatistics(prev => ({
          ...prev,
          totalApplications: data
        }));
        break;
      case 'status':
        setStatistics(prev => ({
          ...prev,
          pendingApplications: data.pending || 0,
          approvedApplications: data.sent || 0,
          rejectedApplications: data.rejected || 0
        }));
        break;
    }
    setLoading(prev => ({
      ...prev,
      [section]: false
    }));
  };

  // Actualizăm funcțiile de încărcare pentru a gestiona corect starea de loading
  const loadUsers = async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      console.log('Începe încărcarea utilizatorilor...');
      const response = await axios.get(`${API_BASE_URL}/api/auth/users`, { 
        headers: getAuthHeaders()
      });
      
      console.log('Răspuns server utilizatori:', response.data);
      
      if (!response.data) {
        throw new Error('Nu s-au primit date de la server');
      }

      let usersData;
      if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        usersData = response.data.data;
      } else if (response.data.users && Array.isArray(response.data.users)) {
        usersData = response.data.users;
      } else {
        throw new Error('Format invalid al datelor primite');
      }

      console.log('Utilizatori procesați:', usersData);
      setUsers(usersData);
      setFilteredUsers(usersData);
      updateSectionData('users', usersData);
    } catch (error) {
      console.error('Eroare la încărcarea utilizatorilor:', error);
      handleSectionError('users', error);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(prev => ({ ...prev, documents: true }));
      console.log('Începe încărcarea documentelor...');
      const response = await axios.get(`${API_BASE_URL}/api/documents`, {
        headers: getAuthHeaders()
      });
      
      console.log('Răspuns server documente:', response.data);
      
      if (!response.data) {
        throw new Error('Nu s-au primit date de la server');
      }

      let documentsData;
      if (Array.isArray(response.data)) {
        documentsData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        documentsData = response.data.data;
      } else if (response.data.documents && Array.isArray(response.data.documents)) {
        documentsData = response.data.documents;
      } else {
        throw new Error('Format invalid al datelor primite');
      }

      console.log('Documente procesate:', documentsData);
      setDocuments(documentsData);
      setFilteredDocuments(documentsData);
      updateSectionData('documents', documentsData);
    } catch (error) {
      console.error('Eroare la încărcarea documentelor:', error);
      handleSectionError('documents', error);
    } finally {
      setLoading(prev => ({ ...prev, documents: false }));
    }
  };

  const loadUniversities = async () => {
    try {
      setLoading(prev => ({ ...prev, universities: true }));
      console.log('Începe încărcarea universităților...');
      const response = await axios.get(`${API_BASE_URL}/api/universities`, {
        headers: getAuthHeaders()
      });
      
      console.log('Răspuns server universități:', response.data);
      
      if (!response.data) {
        throw new Error('Nu s-au primit date de la server');
      }

      let universitiesData;
      if (Array.isArray(response.data)) {
        universitiesData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        universitiesData = response.data.data;
      } else if (response.data.universities && Array.isArray(response.data.universities)) {
        universitiesData = response.data.universities;
      } else {
        throw new Error('Format invalid al datelor primite');
      }

      console.log('Universități procesate:', universitiesData);
      setUniversities(universitiesData);
      setFilteredUniversities(universitiesData);
      updateSectionData('universities', universitiesData);
    } catch (error) {
      console.error('Eroare la încărcarea universităților:', error);
      handleSectionError('universities', error);
    } finally {
      setLoading(prev => ({ ...prev, universities: false }));
    }
  };

  const loadPrograms = async () => {
    try {
      setLoading(prev => ({ ...prev, programs: true }));
      console.log('Începe încărcarea programelor...');
      const response = await axios.get(`${API_BASE_URL}/api/programs`, {
        headers: getAuthHeaders()
      });

      console.log('Răspuns server programe:', JSON.stringify(response.data, null, 2));

      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Format invalid al răspunsului de la server');
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Eroare la preluarea programelor');
      }

      const { data, total } = response.data;

      if (!Array.isArray(data)) {
        throw new Error('Format invalid al datelor primite');
      }

      // Formatăm datele
      const formattedData = data.map(program => ({
        id: program.id,
        name: program.name,
        description: program.description,
        duration: program.duration,
        degree_type: program.degree_type,
        language: program.language,
        tuition_fees: program.tuition_fees,
        credits: program.credits,
        faculty: program.faculty,
        university: program.university ? {
          id: program.university.id,
          name: program.university.name,
          image_url: program.university.image_url,
          location: program.university.location,
          website: program.university.website
        } : null,
        createdAt: program.createdAt,
        updatedAt: program.updatedAt
      }));

      // Formatăm totalul
      const formattedTotal = typeof total === 'number' ? total : formattedData.length;

      // Actualizăm starea
      updateSectionData('programs', formattedData);
      updateSectionData('total', formattedTotal);

      console.log('Programe încărcate cu succes:', {
        total: formattedTotal,
        count: formattedData.length
      });
    } catch (error) {
      console.error('Eroare la încărcarea programelor:', error);
      handleSectionError('programs', error);
    } finally {
      setLoading(prev => ({ ...prev, programs: false }));
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(prev => ({ ...prev, applications: true }));
      console.log('Începe încărcarea aplicațiilor...');
      const response = await axios.get(`${API_BASE_URL}/api/applications`, {
        headers: getAuthHeaders()
      });

      console.log('Răspuns server aplicații:', JSON.stringify(response.data, null, 2));

      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Format invalid al răspunsului de la server');
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Eroare la preluarea aplicațiilor');
      }

      const { data, total, status } = response.data;

      if (!data || typeof data !== 'object') {
        throw new Error('Format invalid al datelor primite');
      }

      // Verificăm și formatăm datele
      const formattedData = {
        drafts: Array.isArray(data.drafts) ? data.drafts : [],
        pending: Array.isArray(data.pending) ? data.pending : [],
        sent: Array.isArray(data.sent) ? data.sent : [],
        rejected: Array.isArray(data.rejected) ? data.rejected : [],
        withdrawn: Array.isArray(data.withdrawn) ? data.withdrawn : []
      };

      // Verificăm și formatăm statisticile
      const formattedStatus = {
        drafts: typeof status?.drafts === 'number' ? status.drafts : formattedData.drafts.length,
        pending: typeof status?.pending === 'number' ? status.pending : formattedData.pending.length,
        sent: typeof status?.sent === 'number' ? status.sent : formattedData.sent.length,
        rejected: typeof status?.rejected === 'number' ? status.rejected : formattedData.rejected.length,
        withdrawn: typeof status?.withdrawn === 'number' ? status.withdrawn : formattedData.withdrawn.length
      };

      // Verificăm totalul
      const formattedTotal = typeof total === 'number' ? total : Object.values(formattedData).reduce((acc, arr) => acc + arr.length, 0);

      // Actualizăm starea
      updateSectionData('applications', formattedData);
      updateSectionData('total', formattedTotal);
      updateSectionData('status', formattedStatus);

      console.log('Aplicații încărcate cu succes:', {
        total: formattedTotal,
        status: formattedStatus
      });
    } catch (error) {
      console.error('Eroare la încărcarea aplicațiilor:', error);
      handleSectionError('applications', error);
    } finally {
      setLoading(prev => ({ ...prev, applications: false }));
    }
  };

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      setErrorNotifications(null);
      
      console.log('Începe încărcarea notificărilor...');
      
      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Eroare la încărcarea notificărilor');
      }
      
      const data = await response.json();
      console.log('Răspuns server notificări:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Eroare la încărcarea notificărilor');
      }
      
      if (!Array.isArray(data.data)) {
        console.error('Format invalid al datelor primite:', data);
        throw new Error('Format invalid al datelor primite');
      }
      
      // Procesăm notificările pentru a asigura formatul corect
      const processedNotifications = data.data.map(notification => ({
        ...notification,
        type: notification.type || 'general',
        title: notification.title || 'Notificare nouă',
        message: notification.message || '',
        admin_message: notification.admin_message || null,
        is_read: notification.is_read || false,
        is_admin_notification: notification.is_admin_notification || false
      }));
      
      console.log('Notificări procesate:', processedNotifications);
      setNotifications(processedNotifications);
    } catch (error) {
      console.error('Eroare la încărcarea notificărilor:', error);
      console.error('Eroare generală la inițializarea dashboard-ului:', error);
      handleSectionError('general', error);
    }
  };

  // Adăugăm funcția handleOpenAddProgramForm
  const handleOpenAddProgramForm = () => {
    setShowAddProgramForm(true);
    setNewProgram({
      name: '',
      description: '',
      university_id: '',
      duration: '',
      degree: '',
      language: '',
      tuition_fee: '',
      start_date: '',
      application_deadline: ''
    });
  };

  // Adăugăm funcția handleCloseAddProgramForm
  const handleCloseAddProgramForm = () => {
    setShowAddProgramForm(false);
  };

  // Adăugăm funcția handleAddProgram
  const handleAddProgram = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/programs`, newProgram, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setPrograms([...programs, response.data.data]);
        handleCloseAddProgramForm();
        setSuccessMessage('Programul a fost adăugat cu succes!');
      }
    } catch (error) {
      console.error('Eroare la adăugarea programului:', error);
      setError(error.response?.data?.message || 'Eroare la adăugarea programului');
    }
  };

  // Adăugăm funcția handleNewProgramChange
  const handleNewProgramChange = (e) => {
    const { name, value } = e.target;
    setNewProgram(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <div className="header-content">
              <h1>Admin Dashboard</h1>
              <nav className="dashboard-nav">
                <button 
                  className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
                  onClick={() => handleTabChange('documents')}
                >
                  Documents
                </button>
                <button 
                  className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => handleTabChange('users')}
                >
                  Users
                </button>
                <button 
                  className={`tab-button ${activeTab === 'universities' ? 'active' : ''}`}
                  onClick={() => handleTabChange('universities')}
                >
                  Universities
                </button>
                <button 
                  className={`tab-button ${activeTab === 'programs' ? 'active' : ''}`}
                  onClick={() => handleTabChange('programs')}
                >
                  Programs
                </button>
                <button 
                  className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
                  onClick={() => handleTabChange('applications')}
                >
                  Applications
                </button>
                <button 
                  className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => handleTabChange('notifications')}
                >
                  Notifications
                </button>
              </nav>
            </div>
          </div>

          <div className="dashboard-filters">
            <div className="search-box">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  className="search-input"
                  placeholder={activeTab === 'users' 
                    ? "Search by name, email or ID..." 
                    : activeTab === 'documents' ? "Search by user name or document type..." : "Search by university name..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {activeTab === 'users' ? (
              <div className="filter-section users-filter">
                <div className="filter-group">
                  <label>Role:</label>
                  <select 
                    className="filter-select"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Status:</label>
                  <select 
                    className="filter-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Date:</label>
                  <div className="date-range-inputs">
                    <input 
                      type="date" 
                      className="date-input" 
                      value={filterUserDateRange.start}
                      onChange={(e) => setFilterUserDateRange({...filterUserDateRange, start: e.target.value})}
                    />
                    <span>to</span>
                    <input 
                      type="date" 
                      className="date-input" 
                      value={filterUserDateRange.end}
                      onChange={(e) => setFilterUserDateRange({...filterUserDateRange, end: e.target.value})}
                    />
                  </div>
                </div>
                <button 
                  className="clear-filters-button"
                  onClick={() => {
                    setFilterRole('all');
                    setFilterStatus('all');
                    setFilterUserDateRange({ start: '', end: '' });
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : activeTab === 'documents' ? (
              <div className="filter-section documents-filter">
                <div className="filter-group">
                  <label>Document Type:</label>
                  <select
                    value={filterDocumentType}
                    onChange={(e) => setFilterDocumentType(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Types</option>
                    <option value="diploma">Diploma</option>
                    <option value="transcript">Transcript</option>
                    <option value="passport">Passport</option>
                    <option value="photo">Photo</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Date Range:</label>
                  <div className="date-range-inputs">
                    <input
                      type="date"
                      value={filterDateRange.start}
                      onChange={(e) => setFilterDateRange({...filterDateRange, start: e.target.value})}
                      className="date-input"
                    />
                    <span>to</span>
                    <input
                      type="date"
                      value={filterDateRange.end}
                      onChange={(e) => setFilterDateRange({...filterDateRange, end: e.target.value})}
                      className="date-input"
                    />
                  </div>
                </div>
                <button 
                  className="clear-filters-button"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterDocumentType('all');
                    setFilterDateRange({ start: '', end: '' });
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : activeTab === 'universities' ? (
              <div className="filter-section universities-filter">
                <div className="filter-group">
                  <label>Type:</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Types</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Location:</label>
                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Locations</option>
                    <option value="Chișinău">Chișinău</option>
                    <option value="Bălți">Bălți</option>
                    <option value="Cahul">Cahul</option>
                    <option value="Comrat">Comrat</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Ranking Range:</label>
                  <div className="range-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filterRanking.min}
                      onChange={(e) => setFilterRanking({...filterRanking, min: e.target.value})}
                      className="range-input"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filterRanking.max}
                      onChange={(e) => setFilterRanking({...filterRanking, max: e.target.value})}
                      className="range-input"
                    />
                  </div>
                </div>
                <div className="filter-group">
                  <label>Tuition Fee Range:</label>
                  <div className="range-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filterTuitionFee.min}
                      onChange={(e) => setFilterTuitionFee({...filterTuitionFee, min: e.target.value})}
                      className="range-input"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filterTuitionFee.max}
                      onChange={(e) => setFilterTuitionFee({...filterTuitionFee, max: e.target.value})}
                      className="range-input"
                    />
                  </div>
                </div>
                <div className="filter-group">
                  <label>Date:</label>
                  <div className="date-range-inputs">
                    <input
                      type="date"
                      className="date-input"
                      value={filterUniversityDateRange.start}
                      onChange={e => setFilterUniversityDateRange({...filterUniversityDateRange, start: e.target.value})}
                    />
                    <span>to</span>
                    <input
                      type="date"
                      className="date-input"
                      value={filterUniversityDateRange.end}
                      onChange={e => setFilterUniversityDateRange({...filterUniversityDateRange, end: e.target.value})}
                    />
                  </div>
                </div>
                <div className="filter-group">
                  <label>Sort:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                    <option value="location">Location (A-Z)</option>
                    <option value="type">Type (A-Z)</option>
                    <option value="ranking">Ranking (Low-High)</option>
                    <option value="ranking_desc">Ranking (High-Low)</option>
                    <option value="tuition">Tuition Fee (Low-High)</option>
                    <option value="tuition_desc">Tuition Fee (High-Low)</option>
                  </select>
                </div>
                <button
                  className="clear-filters-button"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('');
                    setFilterLocation('');
                    setFilterRanking({ min: '', max: '' });
                    setFilterTuitionFee({ min: '', max: '' });
                    setFilterUniversityDateRange({ start: '', end: '' });
                    setSortBy('name');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : activeTab === 'programs' ? (
              <div className="filter-section programs-filter">
                <div className="filter-group">
                  <label>Grad:</label>
                  <select
                    value={filterDegree}
                    onChange={(e) => setFilterDegree(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Degrees</option>
                    <option value="Bachelor">Bachelor</option>
                    <option value="Master">Master</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Limbă:</label>
                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Languages</option>
                    <option value="Romanian">Romanian</option>
                    <option value="English">English</option>
                    <option value="Russian">Russian</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Tuition Fee:</label>
                  <div className="range-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filterTuitionFee.min}
                      onChange={(e) => setFilterTuitionFee(prev => ({ ...prev, min: e.target.value }))}
                      className="range-input"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filterTuitionFee.max}
                      onChange={(e) => setFilterTuitionFee(prev => ({ ...prev, max: e.target.value }))}
                      className="range-input"
                    />
                  </div>
                </div>
                <button 
                  className="clear-filters-button"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterDegree('all');
                    setFilterLanguage('');
                    setFilterTuitionFee({ min: '', max: '' });
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : activeTab === 'applications' ? (
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
                    <input type="date" className="date-input" value={filterApplicationDateRange?.start || ''} onChange={e => setFilterApplicationDateRange({...filterApplicationDateRange, start: e.target.value})} />
                    <span>to</span>
                    <input type="date" className="date-input" value={filterApplicationDateRange?.end || ''} onChange={e => setFilterApplicationDateRange({...filterApplicationDateRange, end: e.target.value})} />
                  </div>
                </div>
                <button className="clear-filters-button" onClick={() => setFilterApplicationDateRange({ start: '', end: '' })}>Clear</button>
              </div>
            ) : null}
          </div>

          {loading.users || loading.documents || loading.universities || loading.programs || loading.applications ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'universities' && (
                <>
                  <div className="dashboard-actions">
                    <button 
                      className="btn1"
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
                  <div className="dashboard-table-container">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Nume</th>
                          <th>Tip</th>
                          <th>Locație</th>
                          <th>Ranking</th>
                          <th>Taxe de școlarizare</th>
                          <th>Acțiuni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUniversities.map(university => (
                          <tr key={university.id}>
                            <td>{university.name || 'N/A'}</td>
                            <td>{university.type || 'N/A'}</td>
                            <td>{university.location || 'N/A'}</td>
                            <td>{university.ranking || 'N/A'}</td>
                            <td>
                              {(() => {
                                const fees = university.tuitionFees || university.tuition_fees || {};
                                return (
                                  <div>
                                    <div>Bachelor: {fees.bachelor ? `${fees.bachelor} EUR` : 'N/A'}</div>
                                    <div>Master: {fees.master ? `${fees.master} EUR` : 'N/A'}</div>
                                    <div>PhD: {fees.phd ? `${fees.phd} EUR` : 'N/A'}</div>
                                  </div>
                                );
                              })()}
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="btn-grey"
                                  onClick={() => handleEditUniversity(university)}
                                >
                                  <i className="fas fa-edit"></i> Editează
                                </button>
                                <button 
                                  className="btn-delete"
                                  onClick={() => handleDeleteUniversity(university.id)}
                                >
                                  <i className="fas fa-trash"></i> Șterge
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
                            <label>Image URL or relative path:</label>
                            <input
                              type="text"
                              name="imageUrl"
                              value={newUniversity.imageUrl}
                              onChange={handleUniversityInputChange}
                              placeholder="URL or relative path (ex: /images/universities/example.jpg)"
                              required
                            />
                            <small className="form-text text-muted">
                              You can enter either a complete URL (ex: https://example.com/image.jpg) 
                              or a relative path in the project (ex: /images/universities/example.jpg)
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

                  {isModalOpen && (
                    <div className="modal-overlay">
                      <div className="modal-content">
                        <div className="modal-header" style={{ position: 'relative' }}>
                          <h2>Editare Universitate</h2>
                          <button 
                            className="close-button" 
                            onClick={handleCloseModal}
                            style={{
                              position: 'absolute',
                              right: '10px',
                              top: '10px',
                              background: 'none',
                              border: 'none',
                              fontSize: '24px',
                              cursor: 'pointer',
                              padding: '5px 10px',
                              color: '#666',
                              zIndex: 1000
                            }}
                          >×</button>
                        </div>
                        <div className="modal-body">
                          {editingUniversity && (
                            <form onSubmit={handleUpdateUniversity} className="university-form">
                              <div className="form-group">
                                <label>Nume:</label>
                                <input
                                  type="text"
                                  name="name"
                                  value={editingUniversity.name || ''}
                                  onChange={handleEditUniversityChange}
                                  placeholder="Introduceți numele universității"
                                  required
                                  className="form-input"
                                />
                              </div>
                              <div className="form-group">
                                <label>Tip:</label>
                                <select
                                  name="type"
                                  value={editingUniversity.type || ''}
                                  onChange={handleEditUniversityChange}
                                  required
                                  className="form-select"
                                >
                                  <option value="">Selectați tipul</option>
                                  <option value="Public">Public</option>
                                  <option value="Private">Privat</option>
                                </select>
                              </div>
                              <div className="form-group">
                                <label>Descriere:</label>
                                <textarea
                                  name="description"
                                  value={editingUniversity.description || ''}
                                  onChange={handleEditUniversityChange}
                                  placeholder="Introduceți descrierea universității"
                                  required
                                  className="form-textarea"
                                />
                              </div>
                              <div className="form-group">
                                <label>Locație:</label>
                                <select
                                  name="location"
                                  value={editingUniversity.location || ''}
                                  onChange={handleEditUniversityChange}
                                  required
                                  className="form-select"
                                >
                                  <option value="">Selectați locația</option>
                                  <option value="Chișinău">Chișinău</option>
                                  <option value="Bălți">Bălți</option>
                                  <option value="Cahul">Cahul</option>
                                  <option value="Comrat">Comrat</option>
                                </select>
                              </div>
                              <div className="form-group">
                                <label>URL Imagine:</label>
                                <input
                                  type="text"
                                  name="image_url"
                                  value={editingUniversity.image_url || ''}
                                  onChange={handleEditUniversityChange}
                                  placeholder="Introduceți URL-ul imaginii"
                                  className="form-input"
                                />
                              </div>
                              <div className="form-group">
                                <label>Website:</label>
                                <input
                                  type="url"
                                  name="website"
                                  value={editingUniversity.website || ''}
                                  onChange={handleEditUniversityChange}
                                  placeholder="Introduceți adresa website-ului"
                                  required
                                  className="form-input"
                                />
                              </div>
                              <div className="form-group">
                                <label>Clasament:</label>
                                <input
                                  type="text"
                                  name="ranking"
                                  value={editingUniversity.ranking || ''}
                                  onChange={handleEditUniversityChange}
                                  placeholder="Introduceți clasamentul"
                                  className="form-input"
                                />
                              </div>
                              <div className="form-group">
                                <label>Taxe de Studii:</label>
                                <div className="nested-form">
                                  <div className="form-group">
                                    <label>Licență:</label>
                                    <input
                                      type="text"
                                      name="tuition_fees.bachelor"
                                      value={editingUniversity.tuition_fees?.bachelor || ''}
                                      onChange={handleEditUniversityChange}
                                      placeholder="Introduceți taxa de studii pentru licență"
                                      className="form-input"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>Master:</label>
                                    <input
                                      type="text"
                                      name="tuition_fees.master"
                                      value={editingUniversity.tuition_fees?.master || ''}
                                      onChange={handleEditUniversityChange}
                                      placeholder="Introduceți taxa de studii pentru master"
                                      className="form-input"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>Doctorat:</label>
                                    <input
                                      type="text"
                                      name="tuition_fees.phd"
                                      value={editingUniversity.tuition_fees?.phd || ''}
                                      onChange={handleEditUniversityChange}
                                      placeholder="Introduceți taxa de studii pentru doctorat"
                                      className="form-input"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="form-group">
                                <label>Informații de Contact:</label>
                                <div className="nested-form">
                                  <div className="form-group">
                                    <label>Email:</label>
                                    <input
                                      type="email"
                                      name="contact_info.email"
                                      value={editingUniversity.contact_info?.email || ''}
                                      onChange={handleEditUniversityChange}
                                      placeholder="Introduceți adresa de email"
                                      className="form-input"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>Telefon:</label>
                                    <input
                                      type="text"
                                      name="contact_info.phone"
                                      value={editingUniversity.contact_info?.phone || ''}
                                      onChange={handleEditUniversityChange}
                                      placeholder="Introduceți numărul de telefon"
                                      className="form-input"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>Adresă:</label>
                                    <input
                                      type="text"
                                      name="contact_info.address"
                                      value={editingUniversity.contact_info?.address || ''}
                                      onChange={handleEditUniversityChange}
                                      placeholder="Introduceți adresa"
                                      className="form-input"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button 
                                  type="button" 
                                  className="cancel-button" 
                                  onClick={handleCloseModal}
                                  style={{
                                    padding: '8px 16px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    background: '#fff',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Anulează
                                </button>
                                <button 
                                  type="submit" 
                                  className="save-button"
                                  style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    background: '#4CAF50',
                                    color: 'white',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Salvează
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'programs' && (
                <>
                  <div className="dashboard-actions">
                    <button 
                      className="btn1"
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
                          <th>ID</th>
                          <th>Name</th>
                          <th>Degree</th>
                          <th>Duration</th>
                          <th>Language</th>
                          <th>Tuition Fee</th>
                          <th>University</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {programs.map(program => (
                          <tr key={program.id}>
                            <td>{program.id}</td>
                            <td>{program.name}</td>
                            <td>{program.degree_type}</td>
                            <td>{program.duration}</td>
                            <td>{program.language}</td>
                            <td>{program.tuition_fees}</td>
                            <td>{program.university?.name || program.University?.name || 'N/A'}</td>
                            <td>
                              <div className="action-buttons">
                                <button onClick={() => handleEditProgram(program)} className="edit-button">
                                  Editează
                                </button>
                                <button onClick={() => handleDeleteProgram(program.id)} className="delete-button">
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {showAddProgramForm && (
                    <div className="modal">
                      <div className="modal-content">
                        <h2>Adaugă Program Nou</h2>
                        <form onSubmit={handleAddProgram}>
                          <div className="form-group">
                            <label>Nume Program:</label>
                            <input
                              type="text"
                              name="name"
                              value={newProgram.name}
                              onChange={handleNewProgramChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Descriere:</label>
                            <textarea
                              name="description"
                              value={newProgram.description}
                              onChange={handleNewProgramChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Universitate:</label>
                            <select
                              name="university_id"
                              value={newProgram.university_id}
                              onChange={handleNewProgramChange}
                              required
                            >
                              <option value="">Selectează universitatea</option>
                              {universities.map(uni => (
                                <option key={uni.id} value={uni.id}>{uni.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Durată (ani):</label>
                            <input
                              type="number"
                              name="duration"
                              value={newProgram.duration}
                              onChange={handleNewProgramChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Grad:</label>
                            <select
                              name="degree"
                              value={newProgram.degree}
                              onChange={handleNewProgramChange}
                              required
                            >
                              <option value="">Selectează gradul</option>
                              <option value="Bachelor">Bachelor</option>
                              <option value="Master">Master</option>
                              <option value="PhD">PhD</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Limbă:</label>
                            <input
                              type="text"
                              name="language"
                              value={newProgram.language}
                              onChange={handleNewProgramChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Taxă Școlară:</label>
                            <input
                              type="number"
                              name="tuition_fee"
                              value={newProgram.tuition_fee}
                              onChange={handleNewProgramChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Data de început:</label>
                            <input
                              type="date"
                              name="start_date"
                              value={newProgram.start_date}
                              onChange={handleNewProgramChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Termen limită aplicare:</label>
                            <input
                              type="date"
                              name="application_deadline"
                              value={newProgram.application_deadline}
                              onChange={handleNewProgramChange}
                              required
                            />
                          </div>
                          <div className="button-group">
                            <button type="submit" className="save-button">Salvează</button>
                            <button type="button" onClick={handleCloseAddProgramForm} className="cancel-button">Anulează</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {showEditProgramForm && editingProgram && (
                    <div className="modal-overlay">
                      <div className="modal-content program-modal">
                        <h2>Edit Program</h2>
                        <form onSubmit={handleUpdateProgram} className="program-form">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Program Name:</label>
                              <input
                                type="text"
                                name="name"
                                value={editingProgram.name}
                                onChange={(e) => setEditingProgram({
                                  ...editingProgram,
                                  name: e.target.value
                                })}
                                placeholder="Enter the program name"
                                required
                                className="form-input"
                              />
                            </div>

                            <div className="form-group">
                              <label>Degree:</label>
                              <select
                                name="degree_type"
                                value={editingProgram.degree_type}
                                onChange={(e) => setEditingProgram({
                                  ...editingProgram,
                                  degree_type: e.target.value
                                })}
                                required
                                className="form-select"
                              >
                                <option value="">Select Degree</option>
                                <option value="Bachelor">Bachelor</option>
                                <option value="Master">Master</option>
                                <option value="PhD">PhD</option>
                              </select>
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Facultate:</label>
                              <input
                                type="text"
                                name="faculty"
                                value={editingProgram.faculty || ''}
                                onChange={(e) => setEditingProgram({
                                  ...editingProgram,
                                  faculty: e.target.value
                                })}
                                placeholder="Enter the faculty name"
                                className="form-input"
                              />
                            </div>

                            <div className="form-group">
                              <label>Credits:</label>
                              <input
                                type="number"
                                name="credits"
                                value={editingProgram.credits || ''}
                                onChange={(e) => setEditingProgram({
                                  ...editingProgram,
                                  credits: e.target.value
                                })}
                                placeholder="Enter the number of credits"
                                className="form-input"
                              />
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Duration (years):</label>
                              <input
                                type="number"
                                name="duration"
                                min="1"
                                max="6"
                                value={editingProgram.duration}
                                onChange={(e) => setEditingProgram({
                                  ...editingProgram,
                                  duration: e.target.value
                                })}
                                placeholder="Number of years"
                                required
                                className="form-input"
                              />
                            </div>

                            <div className="form-group">
                              <label>Teaching Language:</label>
                              <select
                                name="language"
                                value={editingProgram.language}
                                onChange={(e) => setEditingProgram({
                                  ...editingProgram,
                                  language: e.target.value
                                })}
                                required
                                className="form-select"
                              >
                                <option value="">Select Language</option>
                                <option value="Romanian">Romanian</option>
                                <option value="English">English</option>
                                <option value="Russian">Russian</option>
                              </select>
                            </div>
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
                              placeholder="Describe the study program"
                              className="form-textarea"
                              rows="4"
                            />
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Tuition Fee:</label>
                              <input
                                type="text"
                                name="tuition_fees"
                                maxLength="50"
                                value={editingProgram.tuition_fees}
                                onChange={(e) => setEditingProgram({
                                  ...editingProgram,
                                  tuition_fees: e.target.value
                                })}
                                placeholder="ex: 3000-4000 EUR/year"
                                required
                                className="form-input"
                              />
                            </div>

                            <div className="form-group">
                              <label>University:</label>
                              <select
                                name="university_id"
                                value={editingProgram.university_id}
                                onChange={(e) => setEditingProgram({
                                  ...editingProgram,
                                  university_id: e.target.value
                                })}
                                required
                                className="form-select"
                              >
                                <option value="">Select University</option>
                                {Array.isArray(universities) ? universities.map(university => (
                                  <option key={university.id} value={university.id}>
                                    {university.name}
                                  </option>
                                )) : []}
                              </select>
                            </div>
                          </div>

                          <div className="modal-buttons">
                            <button
                              type="button"
                              className="cancel-button"
                              onClick={() => {
                                setShowAddProgramForm(false);
                                setEditingProgram(null);
                              }}
                            >
                              Anulează
                            </button>
                            <button type="submit" className="confirm-button">
                              Save Changes
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
                  {errors.users ? (
                    <div className="error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      <p>{errors.users}</p>
                      <button 
                        className="retry-button"
                        onClick={() => {
                          setErrors(prev => ({ ...prev, users: null }));
                          setLoading(prev => ({ ...prev, users: true }));
                          loadUsers();
                        }}
                      >
                        Reîncearcă
                      </button>
                    </div>
                  ) : loading.users ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p>Se încarcă utilizatorii...</p>
                    </div>
                  ) : (
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>ID</th>
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
                          const docStatus = getDocumentStatus(user.id);
                          return (
                            <tr key={user.id}>
                              <td>{user.id}</td>
                              <td>{user.displayName}</td>
                              <td>{user.email}</td>
                              <td>{user.role === 'admin' ? 'Administrator' : 'Utilizator'}</td>
                              <td>
                                <span className={`status-${docStatus.diploma.status}`}>
                                  {docStatus.diploma.exists ? 'Încărcat' : 'Lipsește'}
                                  {docStatus.diploma.uploadDate && (
                                    <span className="upload-date">
                                      ({new Date(docStatus.diploma.uploadDate).toLocaleDateString()})
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td>
                                <span className={`status-${docStatus.transcript.status}`}>
                                  {docStatus.transcript.exists ? 'Încărcat' : 'Lipsește'}
                                  {docStatus.transcript.uploadDate && (
                                    <span className="upload-date">
                                      ({new Date(docStatus.transcript.uploadDate).toLocaleDateString()})
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td>
                                <span className={`status-${docStatus.passport.status}`}>
                                  {docStatus.passport.exists ? 'Încărcat' : 'Lipsește'}
                                  {docStatus.passport.uploadDate && (
                                    <span className="upload-date">
                                      ({new Date(docStatus.passport.uploadDate).toLocaleDateString()})
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td>
                                <span className={`status-${docStatus.photo.status}`}>
                                  {docStatus.photo.exists ? 'Încărcat' : 'Lipsește'}
                                  {docStatus.photo.uploadDate && (
                                    <span className="upload-date">
                                      ({new Date(docStatus.photo.uploadDate).toLocaleDateString()})
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button 
                                    className="btn1"
                                    onClick={() => handleViewUser(user)}
                                  >
                                    <i className="fas fa-eye"></i> View User
                                  </button>
                                  <button 
                                    className="btn2"
                                    onClick={() => handleViewDocuments(user)}
                                  >
                                    <i className="fas fa-file"></i> Vezi Documente
                                  </button>
                                  <button 
                                    className="btn-delete"
                                    onClick={() => confirmDelete(user.id)}
                                  >
                                    <i className="fas fa-trash"></i> Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              ) : activeTab === 'documents' ? (
                <div className="documents-table-container">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>User</th>
                        <th>Type</th>
                          <th>Status</th>
                        <th>Upload Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                      {filteredDocuments.map(doc => (
                        <tr key={doc.id}>
                              <td>{doc.id}</td>
                          <td>{users.find(u => u.id === doc.user_id)?.name || 'N/A'}</td>
                          <td>{doc.document_type}</td>
                          <td>
                            <span className={`status-badge status-${doc.status}`}>
                              {doc.status}
                                  </span>
                              </td>
                          <td>{formatDate(doc.uploadDate || doc.createdAt)}</td>
                              <td>
                                <div className="action-buttons">
                                  <button 
                                className="btn1"
                                    onClick={() => handleDownloadDocument(doc.document_type, doc.user_id)}
                                  >
                                Descarcă
                                  </button>
                                  {doc.status === 'pending' && (
                                    <>
                                      <button 
                                    className="btn-success"
                                    onClick={() => handleConfirmDocument(doc)}
                                      >
                                    Aprobă
                                      </button>
                                      <button 
                                    className="btn-delete"
                                    onClick={() => handleRejectDocument(doc)}
                                      >
                                    Respinge
                                      </button>
                                    </>
                                  )}
                                  <button 
                                className="btn-delete"
                                onClick={() => setDocumentToDelete(doc)}
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
              ) : activeTab === 'applications' ? (
                <div className="applications-table-container">
                  {errors.applications ? (
                    <div className="error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      <p>{errors.applications}</p>
                      <button 
                        className="retry-button"
                        onClick={() => {
                          setErrors(prev => ({ ...prev, applications: null }));
                          setLoading(prev => ({ ...prev, applications: true }));
                          loadApplications();
                        }}
                      >
                        Reîncearcă
                      </button>
                    </div>
                  ) : loading.applications ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p>Loading applications...</p>
                    </div>
                  ) : (
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
                        {filteredApplications.map(app => {
                          const user = users.find(u => u.id === app.user_id);
                          return (
                            <tr key={app.id}>
                              <td>{app.id}</td>
                              <td>
                                {user ? (
                                  <span className="user-name">{user.name}</span>
                                ) : (
                                  <span className="unknown-user">
                                    Utilizator ID: {app.user_id}
                                  </span>
                                )}
                              </td>
                              <td>{app.program?.name || 'N/A'}</td>
                              <td>{app.university?.name || 'N/A'}</td>
                              <td>{formatDate(app.created_at)}</td>
                              <td>
                                <span className={`status-badge status-${app.status}`}>
                                  {app.status === 'pending' ? 'In Waiting' :
                                   app.status === 'approved' ? 'Approved' :
                                   app.status === 'rejected' ? 'Rejected' :
                                   app.status === 'under_review' ? 'In Review' :
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
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              ) : activeTab === 'notifications' ? (
                <div className="notifications-container">
                  {loadingNotifications ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p>Se încarcă notificările...</p>
                    </div>
                  ) : errorNotifications ? (
                    <div className="error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      <p>{errorNotifications}</p>
                      <button 
                        className="retry-button"
                        onClick={loadNotifications}
                      >
                        Reîncearcă
                      </button>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="no-notifications">
                      <p>Nu există notificări</p>
                    </div>
                  ) : (
                    <div className="notifications-list">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`notification-item ${notification.is_read ? 'read' : 'unread'} ${notification.is_admin_notification ? 'admin' : ''}`}
                        >
                          <div className="notification-icon">
                            {notification.type === 'document_approved' && <FaCheckCircle />}
                            {notification.type === 'document_rejected' && <FaTimesCircle />}
                            {notification.type === 'document_deleted' && <FaTrash />}
                            {notification.type === 'document_updated' && <FaEdit />}
                            {notification.type === 'document_expired' && <FaClock />}
                            {notification.type === 'team' && <FaUsers />}
                            {notification.type === 'new_user' && <FaUserPlus />}
                            {notification.type === 'new_document' && <FaFileUpload />}
                            {notification.type === 'new_application' && <FaFileAlt />}
                          </div>
                          <div className="notification-content">
                            <p>{notification.message}</p>
                            {notification.admin_message && (
                              <p className="admin-message">{notification.admin_message}</p>
                            )}
                            <span className="notification-date">
                              {new Date(notification.createdAt).toLocaleDateString('ro-RO', {
                                day: 'numeric',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <div className="notification-header">
                              <span className="notification-title">{notification.title}</span>
                              <span className="notification-date">{formatDate(notification.created_at)}</span>
                            </div>
                            <p className="notification-message">{notification.message}</p>
                            {notification.is_admin_notification && (
                              <div className="admin-message">
                                <FaShieldAlt /> Notificare administrativă
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {showUserDetails && selectedUser && (
                <div className="modal-overlay">
                  <div className="modal-content user-details-modal">
                    <div className="modal-header">
                      <h2>User Details</h2>
                      <button className="close-button" onClick={closeModals}>
                        <span className="close-x">×</span>
                      </button>
                    </div>
                    <div className="user-details-content">
                      <div className="user-details-section">
                        <h3>Basic Information</h3>
                        <div className="detail-row">
                          <span className="detail-label">ID:</span>
                          <span className="detail-value">{selectedUser.id}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Name:</span>
                          <span className="detail-value">{selectedUser.name}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Email:</span>
                          <span className="detail-value">{selectedUser.email}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Role:</span>
                          <span className="detail-value">{selectedUser.role === 'admin' ? 'Administrator' : 'User'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Registration Date:</span>
                          <span className="detail-value">{formatDate(selectedUser.created_at)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Last Update:</span>
                          <span className="detail-value">{formatDate(selectedUser.updated_at)}</span>
                        </div>
                      </div>

                      <div className="user-details-section">
                        <h3>Personal Information</h3>
                        <div className="detail-row">
                          <span className="detail-label">Date of Birth:</span>
                          <span className="detail-value">{selectedUser.date_of_birth ? formatDate(selectedUser.date_of_birth) : 'Not specified'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Country of Origin:</span>
                          <span className="detail-value">{selectedUser.country_of_origin || 'Not specified'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Nationality:</span>
                          <span className="detail-value">{selectedUser.nationality || 'Not specified'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Phone Number:</span>
                          <span className="detail-value">{selectedUser.phone || 'Not specified'}</span>
                        </div>
                      </div>

                      <div className="user-details-section">
                        <h3>Document Status</h3>
                        <div className="document-status-grid">
                          <div className="document-status-item">
                            <span className="status-label">Diploma:</span>
                            <span className={`status-value ${docStatus.diploma.status}`}>
                              {docStatus.diploma.exists ? 'Uploaded' : 'Missing'}
                              {docStatus.diploma.uploadDate && (
                                <span className="upload-date">
                                  ({formatDate(docStatus.diploma.uploadDate)})
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="document-status-item">
                            <span className="status-label">Transcript:</span>
                            <span className={`status-value ${docStatus.transcript.status}`}>
                              {docStatus.transcript.exists ? 'Încărcat' : 'Lipsește'}
                              {docStatus.transcript.uploadDate && (
                                <span className="upload-date">
                                  ({formatDate(docStatus.transcript.uploadDate)})
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="document-status-item">
                            <span className="status-label">Pașaport:</span>
                            <span className={`status-value ${docStatus.passport.status}`}>
                              {docStatus.passport.exists ? 'Încărcat' : 'Lipsește'}
                              {docStatus.passport.uploadDate && (
                                <span className="upload-date">
                                  ({formatDate(docStatus.passport.uploadDate)})
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="document-status-item">
                            <span className="status-label">Fotografie:</span>
                            <span className={`status-value ${docStatus.photo.status}`}>
                              {docStatus.photo.exists ? 'Încărcat' : 'Lipsește'}
                              {docStatus.photo.uploadDate && (
                                <span className="upload-date">
                                  ({formatDate(docStatus.photo.uploadDate)})
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="user-details-section">
                        <h3>Recent Activities</h3>
                        <div className="detail-row">
                          <span className="detail-label">Last Login:</span>
                          <span className="detail-value">{selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Nespecificată'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Account Status:</span>
                          <span className="detail-value">{selectedUser.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showUserDocuments && selectedUser && (
                <div className="modal-overlay">
                  <div className="modal-content documents-modal">
                    <div className="modal-header">
                      <h2>User Documents</h2>
                      <button className="close-button" onClick={closeModals}>
                        <span className="close-x">×</span>
                      </button>
                    </div>
                    <div className="user-documents">
                      {renderUserDocuments(selectedUser)}
                    </div>
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

              {documentToDelete && (
                <DeleteDocumentModal
                  isOpen={!!documentToDelete}
                  onClose={() => setDocumentToDelete(null)}
                  document={documentToDelete}
                  onDelete={handleDocumentDeleteSuccess}
                />
              )}

              {showApplicationDetails && selectedApplication && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h2>Application Details</h2>
                      <button className="close-button" onClick={() => {
                        setShowApplicationDetails(false);
                        setSelectedApplication(null);
                      }}>
                        <span className="close-x">×</span>
                      </button>
                    </div>
                    <div className="application-details">
                      <div className="detail-row">
                        <span className="detail-label">Application ID:</span>
                        <span className="detail-value">{selectedApplication.id}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">User:</span>
                        <span className="detail-value">
                          {users.find(u => u.id === selectedApplication.user_id)?.name || 'N/A'}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Program:</span>
                        <span className="detail-value">{selectedApplication.program?.name || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">University:</span>
                        <span className="detail-value">{selectedApplication.university?.name || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Application Date:</span>
                        <span className="detail-value">{formatDate(selectedApplication.created_at)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Status:</span>
                        <span className={`status-badge status-${selectedApplication.status}`}>
                          {selectedApplication.status === 'pending' ? 'In Waiting' :
                           selectedApplication.status === 'approved' ? 'Approved' :
                           selectedApplication.status === 'rejected' ? 'Rejected' :
                           selectedApplication.status === 'under_review' ? 'In Review' :
                           selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                        </span>
                      </div>
                      {selectedApplication.notes && (
                        <div className="detail-row">
                          <span className="detail-label">Notes:</span>
                          <span className="detail-value">{selectedApplication.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {showApplicationEdit && selectedApplication && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h2>Edit Application</h2>
                      <button className="close-button" onClick={() => {
                        setShowApplicationEdit(false);
                        setSelectedApplication(null);
                      }}>
                        <span className="close-x">×</span>
                      </button>
                    </div>
                    <div className="application-edit">
                      <div className="form-group">
                        <label>Status:</label>
                        <select
                          value={selectedApplication.status}
                          onChange={(e) => handleUpdateApplicationStatus(selectedApplication.id, e.target.value)}
                          className="form-select"
                        >
                          <option value="pending">In Waiting</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="under_review">In Review</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Note:</label>
                        <textarea
                          value={selectedApplication.notes || ''}
                          onChange={(e) => setSelectedApplication({...selectedApplication, notes: e.target.value})}
                          className="form-textarea"
                          rows="4"
                        />
                      </div>
                      <div className="modal-buttons">
                        <button
                          className="cancel-button"
                          onClick={() => {
                            setShowApplicationEdit(false);
                            setSelectedApplication(null);
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          className="confirm-button"
                          onClick={() => handleUpdateApplicationStatus(selectedApplication.id, selectedApplication.status)}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard; 