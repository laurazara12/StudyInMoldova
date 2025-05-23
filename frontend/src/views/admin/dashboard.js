import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import universityService from '../../services/universityService';

import './dashboard.css';
import '../../style.css';

import { API_BASE_URL, getAuthHeaders, handleApiError } from '../../config/api.config';
import DeleteDocumentModal from '../../components/DeleteDocumentModal';

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
  const [activeTab, setActiveTab] = useState('users');
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
    duration: '',
    degree_type: '',
    language: '',
    tuition_fees: '',
    university_id: '',
    faculty: '',
    credits: ''
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
      console.log('Încercare aprobare document:', document);
      
      const response = await axios.put(
        `${API_BASE_URL}/api/documents/${document.id}`,
        {
          status: 'approved',
          document_type: document.document_type,
          file_path: document.file_path,
          filename: document.filename,
          originalName: document.originalName,
          user_id: document.user_id
        },
        { headers: getAuthHeaders() }
      );

      console.log('Răspuns server la aprobare:', response);

      if (response.data.success) {
        setSuccessMessage('Document aprobat cu succes!');
        setTimeout(() => setSuccessMessage(''), 3000);

        // Actualizăm lista de documente
        const updatedDocumentsResponse = await axios.get(`${API_BASE_URL}/api/documents`, {
          headers: getAuthHeaders()
        });
        
        if (updatedDocumentsResponse.data && updatedDocumentsResponse.data.data) {
          setDocuments(updatedDocumentsResponse.data.data);
        }
      }
    } catch (error) {
      console.error('Eroare la aprobarea documentului:', error);
      let errorMessage = 'A apărut o eroare la aprobarea documentului. ';
      
      if (error.response?.status === 404) {
        errorMessage += 'Documentul nu a fost găsit.';
      } else if (error.response?.status === 401) {
        errorMessage += 'Nu aveți permisiunea de a aproba documentul.';
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += 'Vă rugăm să încercați din nou.';
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleRejectDocument = async (document) => {
    try {
      console.log('Încercare respingere document:', document);
      
      const response = await axios.put(
        `${API_BASE_URL}/api/documents/${document.id}`,
        {
          status: 'rejected',
          document_type: document.document_type,
          file_path: document.file_path,
          filename: document.filename,
          originalName: document.originalName,
          user_id: document.user_id
        },
        { headers: getAuthHeaders() }
      );

      console.log('Răspuns server la respingere:', response);

      if (response.data.success) {
        setSuccessMessage('Document respins cu succes!');
        setTimeout(() => setSuccessMessage(''), 3000);

        // Actualizăm lista de documente
        const updatedDocumentsResponse = await axios.get(`${API_BASE_URL}/api/documents`, {
          headers: getAuthHeaders()
        });
        
        if (updatedDocumentsResponse.data && updatedDocumentsResponse.data.data) {
          setDocuments(updatedDocumentsResponse.data.data);
        }
      }
    } catch (error) {
      console.error('Eroare la respingerea documentului:', error);
      let errorMessage = 'A apărut o eroare la respingerea documentului. ';
      
      if (error.response?.status === 404) {
        errorMessage += 'Documentul nu a fost găsit.';
      } else if (error.response?.status === 401) {
        errorMessage += 'Nu aveți permisiunea de a respinge documentul.';
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += 'Vă rugăm să încercați din nou.';
      }
      
      setError(errorMessage);
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

  const initializeDashboard = async () => {
    try {
      if (!token || !checkAdminAccess()) {
        navigate('/sign-in');
        return;
      }

      console.log('Inițializare dashboard cu token:', token);
      const headers = getAuthHeaders();
      console.log('Headers for requests:', headers);

      // Funcție pentru a gestiona erorile individual pentru fiecare cerere
      const handleSectionError = (section, error) => {
        console.error(`Eroare la încărcarea ${section}:`, error);
        setErrors(prev => ({
          ...prev,
          [section]: `Error loading ${section}: ${error.message}`
        }));
        setLoading(prev => ({
          ...prev,
          [section]: false
        }));
      };

      // Funcție pentru a actualiza datele unei secțiuni
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
        }
        setLoading(prev => ({
          ...prev,
          [section]: false
        }));
      };

      // Funcție pentru extragerea datelor din răspuns
      const extractData = (response) => {
        console.log('Raw response from server:', response);
        
        if (!response) {
          console.error('Null or undefined response');
          return [];
        }

        if (Array.isArray(response)) {
          console.log('Response is an array');
          return response;
        }

        if (response.data) {
          console.log('Response contains data:', response.data);
          if (Array.isArray(response.data)) {
            return response.data;
          }
          if (response.data.data && Array.isArray(response.data.data)) {
            return response.data.data;
          }
          if (typeof response.data === 'object') {
            console.log('Response is an object:', response.data);
            return response.data.data || [];
          }
        }

        console.error('Unexpected response format:', response);
        return [];
      };

      // Încărcăm datele pentru fiecare secțiune independent
      const loadUsers = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/auth/users`, { 
            headers,
            validateStatus: function (status) {
              return status < 500;
            }
          });
          
          if (response.status === 200) {
            const usersData = extractData(response);
            updateSectionData('users', usersData);
          } else {
            throw new Error(`Error getting users: ${response.status}`);
          }
        } catch (error) {
          handleSectionError('users', error);
        }
      };

      const loadDocuments = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/documents`, { 
            headers,
            validateStatus: function (status) {
              return status < 500;
            }
          });
          
          if (response.status === 200) {
            const documentsData = extractData(response);
            updateSectionData('documents', documentsData);
          } else {
            throw new Error(`Error getting documents: ${response.status}`);
          }
        } catch (error) {
          handleSectionError('documents', error);
        }
      };

      const loadUniversities = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/universities`, { 
            headers,
            validateStatus: function (status) {
              return status < 500;
            }
          });
          
          if (response.status === 200) {
            const universitiesData = extractData(response);
            updateSectionData('universities', universitiesData);
          } else {
            throw new Error(`Error getting universities: ${response.status}`);
          }
        } catch (error) {
          handleSectionError('universities', error);
        }
      };

      const loadPrograms = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/programs`, { 
            headers,
            validateStatus: function (status) {
              return status < 500;
            }
          });
          
          if (response.status === 200) {
            const programsData = extractData(response);
            updateSectionData('programs', programsData);
          } else {
            throw new Error(`Error getting programs: ${response.status}`);
          }
        } catch (error) {
          handleSectionError('programs', error);
        }
      };

      const loadApplications = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/applications`, { 
            headers,
            validateStatus: function (status) {
              return status < 500;
            }
          });
          
          if (response.status === 200) {
            const applicationsData = extractData(response);
            updateSectionData('applications', applicationsData);
          } else {
            throw new Error(`Error getting applications: ${response.status}`);
          }
        } catch (error) {
          handleSectionError('applications', error);
        }
      };

      // Încărcăm toate secțiunile în paralel
      await Promise.all([
        loadUsers(),
        loadDocuments(),
        loadUniversities(),
        loadPrograms(),
        loadApplications()
      ]);

      // Actualizăm statisticile doar dacă avem date valide
      setStatistics({
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalDocuments: Array.isArray(documents) ? documents.length : 0,
        totalUniversities: Array.isArray(universities) ? universities.length : 0,
        totalPrograms: Array.isArray(programs) ? programs.length : 0,
        totalApplications: Array.isArray(applications) ? applications.length : 0,
        pendingApplications: Array.isArray(applications) ? applications.filter(app => app.status === 'pending').length : 0,
        approvedApplications: Array.isArray(applications) ? applications.filter(app => app.status === 'approved').length : 0,
        rejectedApplications: Array.isArray(applications) ? applications.filter(app => app.status === 'rejected').length : 0
      });

    } catch (error) {
      console.error('Eroare generală la inițializarea dashboard-ului:', error);
      setError(`Eroare generală: ${error.message}`);
    }
  };

  useEffect(() => {
    initializeDashboard();
  }, [navigate, token, user?.role]);

  useEffect(() => {
    if (Array.isArray(documents)) {
      let filtered = [...documents];

      // Filtrare după tipul documentului
      if (filterDocumentType !== 'all') {
        filtered = filtered.filter(doc => doc.document_type === filterDocumentType);
      }

      // Filtrare după status
      if (filterStatus !== 'all') {
        filtered = filtered.filter(doc => doc.status === filterStatus);
      }

      // Filtrare după intervalul de date
      if (filterDateRange.start) {
        filtered = filtered.filter(doc => new Date(doc.created_at) >= new Date(filterDateRange.start));
      }
      if (filterDateRange.end) {
        filtered = filtered.filter(doc => new Date(doc.created_at) <= new Date(filterDateRange.end));
      }

      // Filtrare după termenul de căutare
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(doc => 
          doc.document_type.toLowerCase().includes(searchLower) ||
          doc.originalName.toLowerCase().includes(searchLower) ||
          doc.filename.toLowerCase().includes(searchLower)
        );
      }

      setFilteredDocuments(filtered);
    }
  }, [documents, filterDocumentType, filterStatus, filterDateRange, searchTerm]);

  useEffect(() => {
    if (Array.isArray(users)) {
      let filtered = [...users];

      // Filtrare după rol
      if (filterRole !== 'all') {
        filtered = filtered.filter(user => user.role === filterRole);
      }

      // Filtrare după status
      if (filterStatus !== 'all') {
        filtered = filtered.filter(user => user.is_active === (filterStatus === 'active'));
      }

      // Filtrare după intervalul de date
      if (filterUserDateRange.start) {
        filtered = filtered.filter(user => new Date(user.created_at) >= new Date(filterUserDateRange.start));
      }
      if (filterUserDateRange.end) {
        filtered = filtered.filter(user => new Date(user.created_at) <= new Date(filterUserDateRange.end));
      }

      // Filtrare după termenul de căutare
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(user => 
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.id?.toString().includes(searchTerm)
        );
      }

      setFilteredUsers(filtered);
    }
  }, [users, filterRole, filterStatus, filterUserDateRange, searchTerm]);

  useEffect(() => {
    if (!universities) return;

    let result = [...universities];

    // Filtrare după tip
    if (filterType) {
      result = result.filter(uni => uni.type.toLowerCase() === filterType.toLowerCase());
    }

    // Filtrare după locație
    if (filterLocation) {
      result = result.filter(uni => uni.location === filterLocation);
    }

    // Filtrare după ranking
    if (filterRanking.min) {
      result = result.filter(uni => uni.ranking >= parseInt(filterRanking.min));
    }
    if (filterRanking.max) {
      result = result.filter(uni => uni.ranking <= parseInt(filterRanking.max));
    }

    // Filtrare după taxă de școlarizare
    if (filterTuitionFee.min) {
      result = result.filter(uni => {
        const minFee = Math.min(
          uni.tuitionFees?.bachelor || Infinity,
          uni.tuitionFees?.master || Infinity,
          uni.tuitionFees?.phd || Infinity
        );
        return minFee >= parseInt(filterTuitionFee.min);
      });
    }
    if (filterTuitionFee.max) {
      result = result.filter(uni => {
        const maxFee = Math.max(
          uni.tuitionFees?.bachelor || 0,
          uni.tuitionFees?.master || 0,
          uni.tuitionFees?.phd || 0
        );
        return maxFee <= parseInt(filterTuitionFee.max);
      });
    }

    // Filtrare după dată
    if (filterUniversityDateRange.start) {
      result = result.filter(uni => new Date(uni.createdAt) >= new Date(filterUniversityDateRange.start));
    }
    if (filterUniversityDateRange.end) {
      result = result.filter(uni => new Date(uni.createdAt) <= new Date(filterUniversityDateRange.end));
    }

    // Căutare după nume
    if (searchTerm) {
      result = result.filter(uni => 
        uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUniversities(result);
  }, [universities, filterType, filterLocation, filterRanking, filterTuitionFee, filterUniversityDateRange, searchTerm]);

  useEffect(() => {
    if (Array.isArray(applications)) {
      let filtered = [...applications];

      // Filtrare după status
      if (filterApplicationStatus !== 'all') {
        filtered = filtered.filter(app => app.status === filterApplicationStatus);
      }

      // Filtrare după intervalul de date
      if (filterApplicationDateRange.start) {
        filtered = filtered.filter(app => new Date(app.created_at) >= new Date(filterApplicationDateRange.start));
      }
      if (filterApplicationDateRange.end) {
        filtered = filtered.filter(app => new Date(app.created_at) <= new Date(filterApplicationDateRange.end));
      }

      // Filtrare după termenul de căutare
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(app => {
          const user = users.find(u => u.id === app.user_id);
          return (
            (user?.name?.toLowerCase().includes(searchLower)) ||
            (app.program?.name?.toLowerCase().includes(searchLower)) ||
            (app.university?.name?.toLowerCase().includes(searchLower))
          );
        });
      }

      setFilteredApplications(filtered);
    }
  }, [applications, filterApplicationStatus, filterApplicationDateRange, searchTerm, users]);

  const getDocumentStatus = (userId) => {
    try {
      // Verificăm dacă documents există și este un array
      if (!Array.isArray(documents)) {
        console.warn('Documents nu este un array:', documents);
        return getDefaultDocumentStatus();
      }

      // Găsim toate documentele pentru acest utilizator
      const userDocuments = documents.filter(doc => doc.user_id === userId);
      
      if (!userDocuments || userDocuments.length === 0) {
        return getDefaultDocumentStatus();
      }

      // Creăm un obiect cu statusul pentru fiecare tip de document
      const status = {
        diploma: { exists: false, status: 'missing', uploadDate: null },
        transcript: { exists: false, status: 'missing', uploadDate: null },
        passport: { exists: false, status: 'missing', uploadDate: null },
        photo: { exists: false, status: 'missing', uploadDate: null },
        medical: { exists: false, status: 'missing', uploadDate: null },
        insurance: { exists: false, status: 'missing', uploadDate: null },
        other: { exists: false, status: 'missing', uploadDate: null }
      };

      // Actualizăm statusul pentru fiecare document încărcat
      userDocuments.forEach(doc => {
        if (doc && doc.document_type) {
          const docType = doc.document_type.toLowerCase();
          if (status[docType]) {
            status[docType] = {
              exists: true,
              status: doc.status || 'pending',
              uploadDate: doc.created_at || doc.uploadDate
            };
          }
        }
      });

      return status;
    } catch (error) {
      console.warn(`getDocumentStatus: Eroare la procesarea documentelor pentru utilizatorul ${userId}`, error);
      return getDefaultDocumentStatus();
    }
  };

  const getDefaultDocumentStatus = () => {
    return {
      diploma: { exists: false, status: 'missing', uploadDate: null },
      transcript: { exists: false, status: 'missing', uploadDate: null },
      passport: { exists: false, status: 'missing', uploadDate: null },
      photo: { exists: false, status: 'missing', uploadDate: null },
      medical: { exists: false, status: 'missing', uploadDate: null },
      insurance: { exists: false, status: 'missing', uploadDate: null },
      other: { exists: false, status: 'missing', uploadDate: null }
    };
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/users/${userId}`, {
        headers: getAuthHeaders()
      });

      if (response.status === 200) {
        setUsers(users.filter(user => user.id !== userId));
        setDeleteConfirmation(null);
      }
    } catch (err) {
      const error = handleApiError(err);
      console.error('Error deleting user:', error);
      setError(error.message);
    }
  };

  const confirmDelete = (userId) => {
    setDeleteConfirmation(userId);
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleDownloadDocument = async (documentType, userId) => {
    try {
      // Find the specific document for this user and type
      const doc = documents.find(doc => doc.document_type === documentType && doc.user_id === userId);
      if (!doc) {
        console.error('Document not found for type:', documentType, 'and user:', userId);
        return;
      }

      console.log('Attempting to download document:', {
        documentId: doc.id,
        documentType: documentType,
        userId: userId
      });

      const response = await axios({
        url: `${API_BASE_URL}/api/documents/download/${doc.id}`,
        method: 'GET',
        responseType: 'blob',
        headers: getAuthHeaders()
      });

      const contentType = response.headers['content-type'];
      const fileName = doc.originalName || doc.filename || `${documentType}.pdf`;

      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const error = handleApiError(err);
      console.error('Error downloading document:', {
        error: error,
        documentType: documentType,
        userId: userId
      });
      setError(error.message);
    }
  };

  const handleDeleteDocument = async (documentType, userId) => {
    try {
      console.log('Încercare ștergere document:', { documentType, userId });
      
    const doc = documents.find(doc => doc.document_type === documentType && doc.user_id === userId);
      if (!doc) {
        throw new Error('Documentul nu a fost găsit în lista locală');
      }

      const response = await axios.delete(
        `${API_BASE_URL}/api/documents/admin/${doc.id}`,
        { 
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Răspuns server la ștergere:', response);

      if (response.data.success) {
        // Actualizăm lista de documente
        setDocuments(documents.filter(d => d.id !== doc.id));
        
        setSuccessMessage('Document șters cu succes!');
        setTimeout(() => setSuccessMessage(''), 3000);

        // Reîncărcăm lista de documente
        const updatedDocumentsResponse = await axios.get(`${API_BASE_URL}/api/documents`, {
          headers: getAuthHeaders()
        });
        
        if (updatedDocumentsResponse.data && updatedDocumentsResponse.data.data) {
          setDocuments(updatedDocumentsResponse.data.data);
        }
      }
    } catch (error) {
      console.error('Eroare detaliată la ștergerea documentului:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        documentType,
        userId,
        url: `${API_BASE_URL}/api/documents/admin/${doc?.id}`,
        headers: getAuthHeaders()
      });

      let errorMessage = 'A apărut o eroare la ștergerea documentului. ';
      
      if (error.response?.status === 404) {
        errorMessage += 'Documentul nu a fost găsit în baza de date.';
      } else if (error.response?.status === 401) {
        errorMessage += 'Nu aveți permisiunea de a șterge documentul.';
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += 'Vă rugăm să încercați din nou.';
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDocumentDeleteSuccess = () => {
    setDocuments(documents.filter(doc => doc.id !== documentToDelete.id));
    setDocumentToDelete(null);
  };

  const handleUpdateDocumentStatus = async (userId, documentType, newStatus) => {
    try {
      // Găsim documentul specific pentru acest utilizator și tip
      const document = documents.find(doc => 
        doc.user_id === userId && doc.document_type === documentType
      );

      if (!document) {
        throw new Error('Documentul nu a fost găsit');
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/documents/${document.id}`,
        { 
          document_type: documentType,
          status: newStatus,
          file_path: document.file_path,
          filename: document.filename,
          originalName: document.originalName
        },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        // Actualizăm starea locală
        setDocuments(prevDocuments => 
          prevDocuments.map(doc => 
            doc.id === document.id 
              ? { ...doc, status: newStatus }
              : doc
          )
        );
        
        // Reîncărcăm documentele pentru a ne asigura că avem datele actualizate
        await loadDocuments();
      }
    } catch (error) {
      console.error('Error updating document status:', error);
      setError('Eroare la actualizarea statusului documentului');
    }
  };

  const renderUserDocuments = (user) => {
    const userDocStatus = getDocumentStatus(user.id);
    const userDocuments = documents.filter(doc => doc.user_id === user.id);
    
    return (
      <div className="user-documents-content">
        <div className="user-info">
          <h3>Informații Utilizator</h3>
          <p><strong>Nume:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Rol:</strong> {user.role === 'admin' ? 'Administrator' : 'Utilizator'}</p>
        </div>

        <div className="documents-list">
          <h3>Documente Utilizator</h3>
          <table className="documents-table">
            <thead>
              <tr>
                <th>Tip Document</th>
                <th>Status</th>
                <th>Data Încărcării</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {userDocuments.map(doc => (
                <tr key={doc.id}>
                  <td>{doc.document_type}</td>
                  <td>
                    <span className={`status-badge status-${doc.status}`}>
                      {doc.status === 'pending' ? 'În așteptare' :
                       doc.status === 'approved' ? 'Aprobat' :
                       doc.status === 'rejected' ? 'Respins' :
                       doc.status}
                    </span>
                  </td>
                  <td>{formatDate(doc.created_at)}</td>
                  <td>
                    <div className="action-buttons">
              <button
                        className="view-button"
                        onClick={() => handleDownloadDocument(doc.document_type, doc.user_id)}
              >
                        Descarcă
              </button>
                      {doc.status === 'pending' && (
                        <>
                          <button
                            className="approve-button"
                            onClick={() => handleConfirmDocument(doc)}
                          >
                            Aprobă
                          </button>
                          <button
                            className="reject-button"
                            onClick={() => handleRejectDocument(doc)}
                          >
                            Respinge
                          </button>
                        </>
                      )}
                      <button
                        className="delete-button"
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
      </div>
    );
  };

  const handleViewDocuments = (user) => {
    setSelectedUser(user);
    setShowUserDocuments(true);
    const userDocuments = documents.filter(doc => doc.user_id === user.id);
    setFilteredDocuments(userDocuments);
  };

  const closeModals = () => {
    setShowUserDetails(false);
    setShowUserDocuments(false);
    setSelectedUser(null);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
    // Obținem statusul documentelor pentru utilizatorul selectat
    const docStatus = getDocumentStatus(user.id);
    setDocStatus(docStatus);
  };

  const handleOpenAddProgramForm = () => {
    setShowAddProgramForm(true);
    setNewProgram({
      name: '',
      description: '',
      duration: '',
      degree_type: '',
      language: '',
      tuition_fees: '',
      university_id: '',
      faculty: '',
      credits: ''
    });
  };

  const handleEditUniversity = (university) => {
    console.log('Universitate pentru editare:', university);
    
    // Asigurăm-ne că avem toate câmpurile necesare cu valori implicite
    const formattedUniversity = {
      id: university.id,
      name: university.name || '',
      type: university.type || '',
      description: university.description || '',
      location: university.location || '',
      image_url: university.image_url || '',
      website: university.website || '',
      ranking: university.ranking || '',
      tuition_fees: {
        bachelor: university.tuitionFees?.bachelor || university.tuition_fees?.bachelor || '',
        master: university.tuitionFees?.master || university.tuition_fees?.master || '',
        phd: university.tuitionFees?.phd || university.tuition_fees?.phd || ''
      },
      contact_info: {
        email: university.contactInfo?.email || university.contact_info?.email || '',
        phone: university.contactInfo?.phone || university.contact_info?.phone || '',
        address: university.contactInfo?.address || university.contact_info?.address || ''
      }
    };

    setEditingUniversity(formattedUniversity);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUniversity(null);
  };

  const handleEditUniversityChange = (e) => {
    const { name, value } = e.target;
    console.log('Modificare câmp:', name, value);
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditingUniversity(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditingUniversity(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdateUniversity = async (e) => {
    e.preventDefault();
    console.log('Încercare actualizare universitate:', editingUniversity);
    
    try {
      const universityData = {
        name: editingUniversity.name,
        type: editingUniversity.type,
        description: editingUniversity.description,
        location: editingUniversity.location,
        image_url: editingUniversity.image_url,
        website: editingUniversity.website,
        ranking: editingUniversity.ranking || '',
        tuition_fees: {
          bachelor: editingUniversity.tuition_fees?.bachelor || '',
          master: editingUniversity.tuition_fees?.master || '',
          phd: editingUniversity.tuition_fees?.phd || ''
        },
        contact_info: {
          email: editingUniversity.contact_info?.email || '',
          phone: editingUniversity.contact_info?.phone || '',
          address: editingUniversity.contact_info?.address || ''
        }
      };

      console.log('Date trimise la server:', universityData);

      const response = await axios.put(
        `${API_BASE_URL}/api/universities/${editingUniversity.id}`,
        universityData,
        { 
          headers: getAuthHeaders(),
          validateStatus: function (status) {
            return status < 500;
          }
        }
      );

      console.log('Răspuns complet de la server:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });

      if (response.status === 200 || response.status === 201) {
        // Actualizăm lista de universități
        const updatedUniversities = universities.map(uni => 
          uni.id === editingUniversity.id ? { 
            ...uni, 
            ...universityData,
            tuitionFees: universityData.tuition_fees // Asigurăm că taxele sunt actualizate corect
          } : uni
        );
        setUniversities(updatedUniversities);
        
        setSuccessMessage('Universitatea a fost actualizată cu succes!');
        setTimeout(() => setSuccessMessage(''), 3000);

        // Reîncărcăm lista completă
        const refreshResponse = await axios.get(`${API_BASE_URL}/api/universities`, {
          headers: getAuthHeaders()
        });
        
        if (refreshResponse.data) {
          const processedData = refreshResponse.data.map(uni => ({
            ...uni,
            ranking: uni.ranking || '',
            tuitionFees: uni.tuition_fees || {
              bachelor: '',
              master: '',
              phd: ''
            }
          }));
          setUniversities(processedData);
        }
        
        handleCloseModal();
      } else {
        throw new Error(response.data.message || 'Eroare la actualizarea universității');
      }
    } catch (error) {
      console.error('Eroare la actualizarea universității:', error);
      setError('A apărut o eroare la actualizarea universității. Vă rugăm să încercați din nou.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDeleteUniversity = async (id) => {
    if (!window.confirm('Sigur doriți să ștergeți această universitate?')) {
      return;
    }

    try {
      await universityService.deleteUniversity(id);
      
      // Actualizăm lista de universități
      const updatedUniversities = universities.filter(uni => uni.id !== id);
      setUniversities(updatedUniversities);
      
      setSuccessMessage('Universitatea a fost ștearsă cu succes!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Eroare la ștergerea universității:', error);
      setError('A apărut o eroare la ștergerea universității. Vă rugăm să încercați din nou.');
      setTimeout(() => setError(null), 5000);
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

  const handleAddUniversity = async (e) => {
    e.preventDefault();
    
    try {
      const universityData = {
        name: newUniversity.name,
        type: newUniversity.type,
        description: newUniversity.description,
        location: newUniversity.location,
        image_url: newUniversity.imageUrl,
        website: newUniversity.website,
        ranking: newUniversity.ranking || '',
        tuition_fees: {
          bachelor: newUniversity.tuitionFees.bachelor || '',
          master: newUniversity.tuitionFees.master || '',
          phd: newUniversity.tuitionFees.phd || ''
        },
        contact_info: {
          email: newUniversity.contactInfo.email || '',
          phone: newUniversity.contactInfo.phone || '',
          address: newUniversity.contactInfo.address || ''
        }
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/universities`,
        universityData,
        { 
          headers: getAuthHeaders(),
          validateStatus: function (status) {
            return status < 500;
          }
        }
      );

      if (response.status === 201) {
        // Adăugăm noua universitate la lista existentă
        setUniversities(prev => [...prev, response.data]);
        setShowAddUniversityForm(false);
        setSuccessMessage('Universitatea a fost adăugată cu succes!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Resetăm formularul
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
          contactInfo: {
            email: '',
            phone: '',
            address: ''
          }
        });
      } else {
        throw new Error(`Error adding university: ${response.status}`);
      }
    } catch (error) {
      console.error('Eroare la adăugarea universității:', error);
      setError('A apărut o eroare la adăugarea universității. Vă rugăm să încercați din nou.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleAddProgram = async (e) => {
    e.preventDefault();
    try {
      // Formatăm datele programului înainte de trimitere
      const formattedProgram = {
        ...newProgram,
        tuition_fees: newProgram.tuition_fees.toString(),
        duration: parseInt(newProgram.duration),
        credits: parseInt(newProgram.credits) || null
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/programs`,
        formattedProgram,
        { 
          headers: getAuthHeaders(),
          validateStatus: function (status) {
            return status < 500;
          }
        }
      );

      if (response.status === 201 || response.data.success) {
        setSuccessMessage('Program adăugat cu succes!');
        setShowAddProgramForm(false);
        setNewProgram({
          name: '',
          description: '',
          duration: '',
          degree_type: '',
          language: '',
          tuition_fees: '',
          university_id: '',
          faculty: '',
          credits: ''
        });
        
        // Reîncărcăm lista de programe
        const programsResponse = await axios.get(`${API_BASE_URL}/api/programs`, {
          headers: getAuthHeaders()
        });
        
        if (programsResponse.data && programsResponse.data.data) {
          setPrograms(programsResponse.data.data);
        }
      } else {
        throw new Error(response.data.message || 'Eroare la adăugarea programului');
      }
    } catch (error) {
      console.error('Eroare la adăugarea programului:', error);
      let errorMessage = 'A apărut o eroare la adăugarea programului. ';
      
      if (error.response?.status === 401) {
        errorMessage += 'Nu aveți permisiunea de a adăuga programe.';
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += 'Vă rugăm să încercați din nou.';
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleEditProgram = (program) => {
    // Formatăm datele programului pentru editare
    const formattedProgram = {
      ...program,
      duration: program.duration.toString(),
      credits: program.credits?.toString() || '',
      tuition_fees: program.tuition_fees?.toString() || ''
    };
    setEditingProgram(formattedProgram);
    setShowEditProgramForm(true);
  };

  const handleDeleteProgram = async (programId) => {
    if (!window.confirm('Sigur doriți să ștergeți acest program?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/programs/${programId}`,
        { 
          headers: getAuthHeaders(),
          validateStatus: function (status) {
            return status < 500;
          }
        }
      );

      if (response.status === 200 || response.data.success) {
        setSuccessMessage('Program șters cu succes!');
        setPrograms(programs.filter(program => program.id !== programId));
      } else {
        throw new Error(response.data.message || 'Eroare la ștergerea programului');
      }
    } catch (error) {
      console.error('Eroare la ștergerea programului:', error);
      setError('A apărut o eroare la ștergerea programului. Vă rugăm să încercați din nou.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUpdateProgram = async (e) => {
    e.preventDefault();
    try {
      // Formatăm datele programului înainte de trimitere
      const formattedProgram = {
        ...editingProgram,
        duration: parseInt(editingProgram.duration),
        credits: parseInt(editingProgram.credits) || null
      };

      const response = await axios.put(
        `${API_BASE_URL}/api/programs/${editingProgram.id}`,
        formattedProgram,
        { 
          headers: getAuthHeaders(),
          validateStatus: function (status) {
            return status < 500;
          }
        }
      );

      if (response.status === 200 || response.data.success) {
        setSuccessMessage('Program actualizat cu succes!');
        setShowEditProgramForm(false);
        setEditingProgram(null);
        
        // Reîncărcăm lista de programe
        const programsResponse = await axios.get(`${API_BASE_URL}/api/programs`, {
          headers: getAuthHeaders()
        });
        
        if (programsResponse.data && programsResponse.data.data) {
          setPrograms(programsResponse.data.data);
        }
      } else {
        throw new Error(response.data.message || 'Eroare la actualizarea programului');
      }
    } catch (error) {
      console.error('Eroare la actualizarea programului:', error);
      setError('A apărut o eroare la actualizarea programului. Vă rugăm să încercați din nou.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleProgramInputChange = (e) => {
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
                  onClick={() => setActiveTab('documents')}
                >
                  Documents
                </button>
                <button 
                  className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  Users
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
                <button 
                  className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('applications')}
                >
                  Applications
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
                    <div className="modal-overlay">
                      <div className="modal-content program-modal">
                        <h2>Add New Program</h2>
                        <form onSubmit={handleAddProgram} className="program-form">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Program Name:</label>
                              <input
                                type="text"
                                name="name"
                                value={newProgram.name}
                                onChange={handleProgramInputChange}
                                placeholder="Enter the program name"
                                required
                                className="form-input"
                              />
                            </div>

                            <div className="form-group">
                              <label>Degree:</label>
                              <select
                                name="degree_type"
                                value={newProgram.degree_type}
                                onChange={handleProgramInputChange}
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
                              <label>Faculty:</label>
                              <input
                                type="text"
                                name="faculty"
                                value={newProgram.faculty}
                                onChange={handleProgramInputChange}
                                placeholder="Enter the faculty name"
                                className="form-input"
                              />
                            </div>

                            <div className="form-group">
                              <label>Credits:</label>
                              <input
                                type="number"
                                name="credits"
                                value={newProgram.credits}
                                onChange={handleProgramInputChange}
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
                                value={newProgram.duration}
                                onChange={handleProgramInputChange}
                                placeholder="Number of years"
                                required
                                className="form-input"
                              />
                            </div>

                            <div className="form-group">
                              <label>Teaching Language:</label>
                              <select
                                name="language"
                                value={newProgram.language}
                                onChange={handleProgramInputChange}
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
                              value={newProgram.description}
                              onChange={handleProgramInputChange}
                              placeholder="Descrieți programul de studiu"
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
                                value={newProgram.tuition_fees}
                                onChange={handleProgramInputChange}
                                placeholder="ex: 3000-4000 EUR/year"
                                required
                                className="form-input"
                              />
                            </div>

                            <div className="form-group">
                              <label>University:</label>
                              <select
                                name="university_id"
                                value={newProgram.university_id}
                                onChange={handleProgramInputChange}
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
                              className="btn-grey-2"
                              onClick={() => {
                                setShowAddProgramForm(false);
                                setNewProgram({
                                  name: '',
                                  description: '',
                                  duration: '',
                                  degree_type: '',
                                  language: '',
                                  tuition_fees: '',
                                  university_id: '',
                                  faculty: '',
                                  credits: ''
                                });
                              }}
                            >
                              Anulează
                            </button>
                            <button 
                              className="btn-success"
                              type="submit"
                            >
                              Add Program
                            </button>
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
                          <td>{formatDate(doc.created_at)}</td>
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