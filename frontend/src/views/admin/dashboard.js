import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import './dashboard.css';
import { API_BASE_URL, getAuthHeaders, handleApiError } from '../../config/api.config';
import DeleteDocumentModal from '../../components/DeleteDocumentModal';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
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
  const [showEditUniversityForm, setShowEditUniversityForm] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
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
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

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
            return [response.data];
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
        totalUsers: users.length,
        totalDocuments: documents.length,
        totalUniversities: universities.length,
        totalPrograms: programs.length,
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'pending').length,
        approvedApplications: applications.filter(app => app.status === 'approved').length,
        rejectedApplications: applications.filter(app => app.status === 'rejected').length
      });

    } catch (error) {
      console.error('Eroare generală la inițializarea dashboard-ului:', error);
      setError(`Eroare generală: ${error.message}`);
    }
  };

  useEffect(() => {
    initializeDashboard();
  }, [navigate, token, user?.role]);

  const getDocumentStatus = (userId) => {
    if (!userId) {
      console.warn('getDocumentStatus: userId is undefined or null');
      return getDefaultDocumentStatus();
    }

    const status = docStatus[userId];
    if (!status) {
      console.warn(`getDocumentStatus: Nu există status pentru utilizatorul ${userId}`);
      return getDefaultDocumentStatus();
    }

    console.log(`Document status for user ${userId}:`, JSON.stringify(status, null, 2));
    return status;
  };

  const getDefaultDocumentStatus = () => {
      return {
        passport: { exists: false, status: 'missing', uploadDate: null },
        diploma: { exists: false, status: 'missing', uploadDate: null },
        transcript: { exists: false, status: 'missing', uploadDate: null },
        cv: { exists: false, status: 'missing', uploadDate: null },
        other: { exists: false, status: 'missing', uploadDate: null },
        photo: { exists: false, status: 'missing', uploadDate: null },
        medical: { exists: false, status: 'missing', uploadDate: null },
        insurance: { exists: false, status: 'missing', uploadDate: null }
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
    const doc = documents.find(doc => doc.document_type === documentType && doc.user_id === userId);
    if (doc) {
      setDocumentToDelete(doc);
    }
  };

  const handleDocumentDeleteSuccess = () => {
    setDocuments(documents.filter(doc => doc.id !== documentToDelete.id));
    setDocumentToDelete(null);
  };

  const renderUserDocuments = () => {
    if (!documents || documents.length === 0) {
      return <p>Nu există documente încărcate.</p>;
    }

    const filteredDocs = documents.filter(doc => 
      doc && 
      doc.user_id && 
      doc.document_type && 
      doc.status
    );

    if (filteredDocs.length === 0) {
      return <p>Nu există documente valide pentru afișare.</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Utilizator</th>
              <th className="px-4 py-2 border">Tip Document</th>
              <th className="px-4 py-2 border">Data Încărcării</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map(doc => {
              const user = users.find(u => u && u.id === doc.user_id);
              const userName = user ? `${user.firstName} ${user.lastName}` : `User ID: ${doc.user_id}`;
              const docType = doc.document_type?.toLowerCase();
              const docStatus = doc.status?.toLowerCase();
              const uploadDate = doc.uploadDate || doc.created_at || 'Unknown';

              return (
                <tr key={`${doc.id}-${docType}`} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{userName}</td>
                  <td className="px-4 py-2 border">
                    {docType === 'passport' ? 'Passport' :
                     docType === 'diploma' ? 'Diploma' :
                     docType === 'transcript' ? 'Transcript' :
                     docType === 'cv' ? 'CV' :
                     docType === 'photo' ? 'Photo' :
                     docType === 'medical' ? 'Medical Certificate' :
                     docType === 'insurance' ? 'Insurance' :
                     'Other'}
                  </td>
                  <td className="px-4 py-2 border">
                    {new Date(uploadDate).toLocaleDateString('ro-RO')}
                  </td>
                  <td className="px-4 py-2 border">
                    {docStatus === 'pending' ? 'Pending' :
                     docStatus === 'approved' ? 'Approved' :
                     docStatus === 'rejected' ? 'Rejected' :
                     'Missing'}
                  </td>
                  <td className="px-4 py-2 border">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownloadDocument(doc.document_type, doc.user_id)}
                        disabled={!doc.id}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.document_type, doc.user_id)}
                        disabled={!doc.id}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
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
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toString().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.status === 'active') ||
      (filterStatus === 'inactive' && user.status === 'inactive');
    
    const matchesDateRange = (!filterUserDateRange.start || new Date(user.created_at) >= new Date(filterUserDateRange.start)) &&
                           (!filterUserDateRange.end || new Date(user.created_at) <= new Date(filterUserDateRange.end));
    
    return matchesSearch && matchesRole && matchesStatus && matchesDateRange;
  });

  const filteredDocuments = documents.filter(doc => {
    const user = users.find(u => u.id === doc.user_id);
    const matchesSearch = 
      (user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      doc.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterDocumentType === 'all' || doc.document_type === filterDocumentType;
    
    const matchesDateRange = (!filterDateRange.start || new Date(doc.created_at) >= new Date(filterDateRange.start)) &&
                           (!filterDateRange.end || new Date(doc.created_at) <= new Date(filterDateRange.end));
    
    return matchesSearch && matchesType && matchesDateRange;
  });

  const filteredUniversities = Array.isArray(universities) ? universities.filter(uni => {
    const matchesSearch = searchTerm === '' || 
      uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uni.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === '' || uni.type === filterType;
    const matchesLocation = filterLocation === '' || uni.location === filterLocation;
    
    const matchesRanking = (!filterRanking.min || uni.ranking >= parseInt(filterRanking.min)) &&
                         (!filterRanking.max || uni.ranking <= parseInt(filterRanking.max));
    
    const matchesTuitionFee = (!filterTuitionFee.min || 
                             (uni.tuitionFees?.bachelor && parseInt(uni.tuitionFees.bachelor) >= parseInt(filterTuitionFee.min))) &&
                            (!filterTuitionFee.max || 
                             (uni.tuitionFees?.bachelor && parseInt(uni.tuitionFees.bachelor) <= parseInt(filterTuitionFee.max)));
    
    return matchesSearch && matchesType && matchesLocation && matchesRanking && matchesTuitionFee;
  }) : [];

  const filteredPrograms = Array.isArray(programs) ? programs.filter(program => {
    const matchesSearch = searchTerm === '' || 
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDegree = filterDegree === 'all' || program.degree_type === filterDegree;
    const matchesLanguage = filterLanguage === '' || program.language === filterLanguage;
    
    const matchesTuitionFee = (!filterTuitionFee.min || program.tuition_fees >= parseInt(filterTuitionFee.min)) &&
                            (!filterTuitionFee.max || program.tuition_fees <= parseInt(filterTuitionFee.max));
    
    return matchesSearch && matchesDegree && matchesLanguage && matchesTuitionFee;
  }) : [];

  const filteredApplications = applications.filter(app => {
    const user = users.find(u => u.id === app.user_id);
    const matchesSearch = 
      (user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      app.program?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.university?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterApplicationStatus === 'all' || app.status === filterApplicationStatus;
    
    const matchesDateRange = (!filterApplicationDateRange.start || new Date(app.created_at) >= new Date(filterApplicationDateRange.start)) &&
                           (!filterApplicationDateRange.end || new Date(app.created_at) <= new Date(filterApplicationDateRange.end));
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const handleAddUniversity = async (e) => {
    e.preventDefault();
    try {
      // Generăm slug-ul din nume dacă nu există
      const universityData = {
        ...newUniversity,
        slug: newUniversity.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      };

      await axios.post(`${API_BASE_URL}/api/universities`, universityData, {
        headers: getAuthHeaders()
      });
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
      // Reload the list of universities
      const response = await axios.get(`${API_BASE_URL}/api/universities`, {
        headers: getAuthHeaders()
      });
      setUniversities(response.data);
      setSuccessMessage('University added successfully!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      console.error('Error adding university:', error);
      setError('Error adding university');
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
        [name]: value,
        // Generăm slug-ul automat din nume
        slug: name === 'name' ? value.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') : prev.slug
      }));
    }
  };

  const handleEditUniversity = (university) => {
    setEditingUniversity(university);
    setShowEditUniversityForm(true);
  };

  const handleEditUniversityChange = (e) => {
    const { name, value } = e.target;
    
    setEditingUniversity(prev => {
      const newState = { ...prev };
      
      if (name.startsWith('tuitionFees.')) {
        const field = name.split('.')[1];
        newState.tuitionFees = {
          ...newState.tuitionFees,
          [field]: value
        };
      } else if (name.startsWith('contactInfo.')) {
        const field = name.split('.')[1];
        newState.contactInfo = {
          ...newState.contactInfo,
          [field]: value
        };
      } else {
        newState[name] = value;
      }
      
      console.log('Updated state:', JSON.stringify(newState, null, 2));
      return newState;
    });
  };

  const handleUpdateUniversity = async (e) => {
    e.preventDefault();
    try {
      if (!editingUniversity || !editingUniversity.id) {
        throw new Error('Universitatea selectată nu este validă');
      }

      // Verificăm câmpurile obligatorii
      const requiredFields = ['name', 'type', 'location', 'website'];
      const missingFields = requiredFields.filter(field => !editingUniversity[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Required fields are missing: ${missingFields.join(', ')}`);
      }

      // Pregătim datele pentru trimitere
      const universityData = {
        name: String(editingUniversity.name).trim(),
        type: editingUniversity.type,
        description: editingUniversity.description ? String(editingUniversity.description).trim() : '',
        location: String(editingUniversity.location).trim(),
        image_url: editingUniversity.imageUrl ? String(editingUniversity.imageUrl).trim() : null,
        website: String(editingUniversity.website).trim(),
        ranking: editingUniversity.ranking ? String(editingUniversity.ranking).trim() : null,
        tuition_fees: {
          bachelor: editingUniversity.tuitionFees?.bachelor || null,
          master: editingUniversity.tuitionFees?.master || null,
          phd: editingUniversity.tuitionFees?.phd || null
        },
        contact_info: {
          email: editingUniversity.contactInfo?.email || null,
          phone: editingUniversity.contactInfo?.phone || null,
          address: editingUniversity.contactInfo?.address || null
        }
      };

      console.log('Data prepared for submission:', JSON.stringify(universityData, null, 2));

      const response = await axios.put(
        `${API_BASE_URL}/api/universities/${editingUniversity.id}`,
        universityData,
        { 
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Server response:', JSON.stringify(response.data, null, 2));

      if (response.data) {
        setUniversities(prevUniversities => 
          prevUniversities.map(university => 
            university.id === editingUniversity.id ? response.data : university
          )
        );
        
        setShowEditUniversityForm(false);
        setEditingUniversity(null);
        setSuccessMessage('University updated successfully!');
        setTimeout(() => setSuccessMessage(''), 2000);
      }
    } catch (error) {
      console.error('Error updating university:', error);
      console.error('Error details:', error.response?.data);
      setError('Error updating university: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteUniversity = async (universityId) => {
    if (window.confirm('Are you sure you want to delete this university?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/universities/${universityId}`, {
          headers: getAuthHeaders()
        });
        // Reload the list of universities
        const response = await axios.get(`${API_BASE_URL}/api/universities`, {
          headers: getAuthHeaders()
        });
        setUniversities(response.data);
      } catch (error) {
        console.error('Error deleting university:', error);
        setError('Error deleting university');
      }
    }
  };

  const handleOpenAddProgramForm = async () => {
    try {
      // Load the list of universities if we're not in the universities tab
      if (activeTab !== 'universities') {
        const response = await axios.get(`${API_BASE_URL}/api/universities`, {
          headers: getAuthHeaders()
        });
        setUniversities(response.data);
      }
      setShowAddProgramForm(true);
    } catch (error) {
      console.error('Error loading universities:', error);
      setError('Error loading university list');
    }
  };

  const handleEditProgram = async (program) => {
    try {
      if (!program || !program.id) {
        console.error('Invalid program:', program);
        throw new Error('Selected program is invalid');
      }

      console.log('Program selected for editing:', program);

      // Load the list of universities if we're not in the universities tab
      if (activeTab !== 'universities') {
        const response = await axios.get(`${API_BASE_URL}/api/universities`, {
          headers: getAuthHeaders()
        });
        console.log('Universities loaded:', response.data);
        setUniversities(response.data);
      }

      // Asigurăm-ne că programul are toate câmpurile necesare
      const programToEdit = {
        id: program.id,
        name: program.name || '',
        description: program.description || '',
        duration: program.duration || '',
        degree_type: program.degree_type || '',
        language: program.language || '',
        tuition_fees: program.tuition_fees || '',
        university_id: program.university_id || program.university?.id || ''
      };

      console.log('Program prepared for editing:', programToEdit);
      
      if (!programToEdit.id) {
        console.error('Missing ID in prepared program:', programToEdit);
        throw new Error('Program ID is missing from prepared data');
      }

      setEditingProgram(programToEdit);
      setShowEditProgramForm(true);
    } catch (error) {
      console.error('Error loading data for editing:', error);
      setError('Error loading data for editing: ' + (error.response?.data?.message || error.message));
    }
  };

  // Funcții de validare și formatare
  const validateRequiredFields = (data, requiredFields) => {
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      throw new Error(`Required fields are missing: ${missingFields.join(', ')}`);
    }
  };

  const validateNumber = (value, fieldName, min, max) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      throw new Error(`${fieldName} must be a valid number`);
    }
    if (min !== undefined && num < min) {
      throw new Error(`${fieldName} must be greater than or equal to ${min}`);
    }
    if (max !== undefined && num > max) {
      throw new Error(`${fieldName} must be less than or equal to ${max}`);
    }
    return num;
  };

  const validateDate = (dateString, fieldName, allowPast = false) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`${fieldName} is not a valid date`);
    }
    if (!allowPast && date < new Date()) {
      throw new Error(`${fieldName} cannot be in the past`);
    }
    return date.toISOString().split('T')[0];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  // Actualizare handleAddProgram cu noile validări
  const handleAddProgram = async (e) => {
    e.preventDefault();
    try {
      if (!token || !user || user.role !== 'admin') {
        setError('You do not have permission to add programs. Please log in as an administrator.');
        return;
      }

      console.log('Program data before validation:', newProgram);

      // Validare câmpuri obligatorii
      const requiredFields = {
        name: 'Program name',
        duration: 'Duration',
        degree_type: 'Degree type',
        language: 'Language',
        tuition_fees: 'Tuition fees',
        university_id: 'University'
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([field]) => !newProgram[field])
        .map(([_, label]) => label);

      if (missingFields.length > 0) {
        throw new Error(`Required fields are missing: ${missingFields.join(', ')}`);
      }

      // Validare și formatare date
      const programData = {
        name: String(newProgram.name).trim(),
        description: newProgram.description ? String(newProgram.description).trim() : '',
        duration: parseInt(newProgram.duration),
        degree_type: newProgram.degree_type,
        language: newProgram.language,
        tuition_fees: String(newProgram.tuition_fees).trim(),
        university_id: parseInt(newProgram.university_id),
        faculty: newProgram.faculty ? String(newProgram.faculty).trim() : null,
        credits: newProgram.credits ? parseInt(newProgram.credits) : null
      };

      // Validări suplimentare
      if (isNaN(programData.duration) || programData.duration < 1 || programData.duration > 6) {
        throw new Error('Program duration must be between 1 and 6 years');
      }

      if (isNaN(programData.university_id)) {
        throw new Error('University ID is not valid');
      }

      if (programData.credits && (isNaN(programData.credits) || programData.credits < 0)) {
        throw new Error('Credits must be a positive number');
      }

      console.log('Data prepared for submission:', JSON.stringify(programData, null, 2));

      const response = await axios.post(
        `${API_BASE_URL}/api/programs`,
        programData,
        { 
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Răspuns de la server:', JSON.stringify(response.data, null, 2));

      if (!response.data) {
        throw new Error('Invalid server response');
      }

      // Program added successfully, reload the list of programs
      try {
        const programsResponse = await axios.get(`${API_BASE_URL}/api/programs`, {
          headers: getAuthHeaders()
        });

        const updatedPrograms = extractData(programsResponse.data);
        if (updatedPrograms.length > 0) {
          setPrograms(updatedPrograms);
          // Close the modal and reset the form
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
          
          setSuccessMessage('Program added successfully!');
          setTimeout(() => setSuccessMessage(''), 2000);
        } else {
          console.warn('Failed to load programs after addition');
          // Add the new program manually to the existing list
          setPrograms(prevPrograms => [...prevPrograms, response.data]);
          setShowAddProgramForm(false);
          setSuccessMessage('Program added successfully!');
          setTimeout(() => setSuccessMessage(''), 2000);
        }
      } catch (error) {
        console.error('Error reloading programs:', error);
        // Add the new program manually to the existing list
        setPrograms(prevPrograms => [...prevPrograms, response.data]);
        setShowAddProgramForm(false);
        setSuccessMessage('Program added successfully!');
        setTimeout(() => setSuccessMessage(''), 2000);
      }

    } catch (error) {
      console.error('Detailed error adding program:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        }
      });
      
      let errorMessage = 'Error adding program: ';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'An unexpected error occurred';
      }
      
      setError(errorMessage);
    }
  };

  const handleProgramInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Program field change:', name, value);
    
    setNewProgram(prev => {
      const updatedProgram = {
        ...prev,
        [name]: value
      };
      console.log('Updated program state:', updatedProgram);
      return updatedProgram;
    });
  };

  const handleDeleteProgram = async (programId) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await axios.delete(`${API_BASE_URL}/programs/${programId}`, {
          headers: getAuthHeaders()
        });
        // Reload the list of programs
        const response = await axios.get(`${API_BASE_URL}/programs`, {
          headers: getAuthHeaders()
        });
        if (response.data && response.data.data) {
          setPrograms(response.data.data);
        }
        setSuccessMessage('Program deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 2000);
      } catch (error) {
        console.error('Error deleting program:', error);
        setError('Error deleting program: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleViewDocuments = (user) => {
    setSelectedUser(user);
    setShowUserDocuments(true);
  };

  const closeModals = () => {
    setShowUserDetails(false);
    setShowUserDocuments(false);
    setSelectedUser(null);
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
      const response = await axios.patch(
        `${API_BASE_URL}/applications/${applicationId}`,
        { status: newStatus },
        { headers: getAuthHeaders() }
      );

      if (response.status === 200) {
        setApplications(applications.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        ));
        setShowApplicationEdit(false);
        setSelectedApplication(null);
      }
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('An error occurred while updating the application status.');
    }
  };

  const handleUpdateProgram = async (e) => {
    e.preventDefault();
    try {
      if (!token || !user || user.role !== 'admin') {
        setError('You do not have permission to update programs. Please log in as an administrator.');
        return;
      }

      if (!editingProgram) {
        throw new Error('No program selected for editing');
      }

      console.log('Program data before update:', editingProgram);

      const programData = {
        name: String(editingProgram.name).trim(),
        description: editingProgram.description ? String(editingProgram.description).trim() : '',
        duration: parseInt(editingProgram.duration),
        degree_type: editingProgram.degree_type,
        language: editingProgram.language,
        tuition_fees: editingProgram.tuition_fees,
        university_id: parseInt(editingProgram.university_id),
        faculty: editingProgram.faculty ? String(editingProgram.faculty).trim() : null,
        credits: editingProgram.credits ? parseInt(editingProgram.credits) : null
      };

      console.log('Data prepared for update:', JSON.stringify(programData, null, 2));

      const response = await axios.put(
        `${API_BASE_URL}/programs/${editingProgram.id}`,
        programData,
        { 
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Server response:', JSON.stringify(response.data, null, 2));

      if (response.data) {
        // Reload the complete list of programs
        const programsResponse = await axios.get(`${API_BASE_URL}/programs`, {
          headers: getAuthHeaders()
        });
        
        if (programsResponse.data && programsResponse.data.data) {
          setPrograms(programsResponse.data.data);
        } else if (Array.isArray(programsResponse.data)) {
          setPrograms(programsResponse.data);
        }

        setShowEditProgramForm(false);
        setEditingProgram(null);
        setSuccessMessage('Program updated successfully!');
        setTimeout(() => setSuccessMessage(''), 2000);
      } else {
        throw new Error('Invalid server response');
      }
    } catch (error) {
      console.error('Detailed error updating program:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        }
      });
      
      let errorMessage = 'Error updating program: ';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
          errorMessage += 'An unexpected error occurred';
      }
      
      setError(errorMessage);
    }
  };

  if (error) {
    return (
      <div className="dashboard-page">
        
        <Navbar />
        <div className="dashboard-container">
          <div className="dashboard-content">
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              <p>{error}</p>
              <button 
                className="retry-button"
                onClick={() => {
                  setError(null);
                  initializeDashboard();
                }}
              >
                Reîncarcă
              </button>
            </div>
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
                <i className="fas fa-search search-icon"></i>
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
                          <th>Name</th>
                          <th>Type</th>
                          <th>Location</th>
                          <th>Website</th>
                          <th>Actions</th>
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
                                  Edit
                                </button>
                                <button 
                                  className="delete-button"
                                  onClick={() => handleDeleteUniversity(university.id)}
                                >
                                  Delete
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

                  {showEditUniversityForm && editingUniversity && (
                    <div className="modal show d-block" tabIndex="-1">
                      <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">Editează Universitatea</h5>
                            <button 
                              type="button" 
                              className="btn-close" 
                              onClick={() => {
                                setShowEditUniversityForm(false);
                                setEditingUniversity(null);
                              }}
                              style={{
                                position: 'absolute',
                                right: '10px',
                                top: '10px',
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                padding: '5px',
                                color: '#666'
                              }}
                            >
                              ×
                            </button>
                          </div>
                          <div className="modal-body">
                            <form onSubmit={handleUpdateUniversity}>
                              <div className="form-group mb-3">
                                <label>Nume</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="name"
                                  value={editingUniversity.name || ''}
                                  onChange={handleEditUniversityChange}
                                  required
                                />
                              </div>
                              <div className="form-group mb-3">
                                <label>Tip</label>
                                <select
                                  className="form-control"
                                  name="type"
                                  value={editingUniversity.type || ''}
                                  onChange={handleEditUniversityChange}
                                  required
                                >
                                  <option value="">Select Type</option>
                                  <option value="Public">Public</option>
                                  <option value="Privat">Private</option>
                                </select>
                              </div>
                              <div className="form-group mb-3">
                                <label>Descriere</label>
                                <textarea
                                  className="form-control"
                                  name="description"
                                  value={editingUniversity.description || ''}
                                  onChange={handleEditUniversityChange}
                                  rows="3"
                                />
                              </div>
                              <div className="form-group mb-3">
                                <label>Location</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="location"
                                  value={editingUniversity.location || ''}
                                  onChange={handleEditUniversityChange}
                                  required
                                />
                              </div>
                              <div className="form-group mb-3">
                                <label>Image URL</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="imageUrl"
                                  value={editingUniversity.imageUrl || ''}
                                  onChange={handleEditUniversityChange}
                                  placeholder="https://example.com/image.jpg"
                                />
                              </div>
                              <div className="form-group mb-3">
                                <label>Website</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="website"
                                  value={editingUniversity.website || ''}
                                  onChange={handleEditUniversityChange}
                                  required
                                />
                              </div>
                              <div className="form-group mb-3">
                                <label>Ranking</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="ranking"
                                  value={editingUniversity.ranking || ''}
                                  onChange={handleEditUniversityChange}
                                />
                              </div>
                              <div className="form-group mb-3">
                                <label>Tuition Fees</label>
                                <div className="row">
                                  <div className="col-md-4">
                                    <input
                                      type="text"
                                      className="form-control"
                                      name="tuitionFees.bachelor"
                                      value={editingUniversity.tuitionFees?.bachelor || ''}
                                      onChange={handleEditUniversityChange}
                                      placeholder="ex: 3000-4000 EUR/year"
                                      maxLength="20"
                                    />
                                    <small className="form-text text-muted">Bachelor (max 20 characters)</small>
                                  </div>
                                  <div className="col-md-4">
                                    <input
                                      type="text"
                                      className="form-control"
                                      name="tuitionFees.master"
                                      value={editingUniversity.tuitionFees?.master || ''}
                                      onChange={handleEditUniversityChange}
                                      placeholder="ex: 4000-5000 EUR/year"
                                      maxLength="20"
                                    />
                                    <small className="form-text text-muted">Master (max 20 characters)</small>
                                  </div>
                                  <div className="col-md-4">
                                    <input
                                      type="text"
                                      className="form-control"
                                      name="tuitionFees.phd"
                                      value={editingUniversity.tuitionFees?.phd || ''}
                                      onChange={handleEditUniversityChange}
                                      placeholder="ex: 5000-6000 EUR/year"
                                      maxLength="20"
                                    />
                                    <small className="form-text text-muted">PhD (max 20 characters)</small>
                                  </div>
                                </div>
                              </div>
                              <div className="form-group mb-3">
                                <label>Contact Info</label>
                                <div className="row">
                                  <div className="col-md-4">
                                    <input
                                      type="email"
                                      className="form-control"
                                      name="contactInfo.email"
                                      value={editingUniversity.contactInfo?.email || ''}
                                      onChange={handleEditUniversityChange}
                                      placeholder="Email"
                                    />
                                  </div>
                                  <div className="col-md-4">
                                    <input
                                      type="text"
                                      className="form-control"
                                      name="contactInfo.phone"
                                      value={editingUniversity.contactInfo?.phone || ''}
                                      onChange={handleEditUniversityChange}
                                      placeholder="Telefon"
                                    />
                                  </div>
                                  <div className="col-md-4">
                                    <input
                                      type="text"
                                      className="form-control"
                                      name="contactInfo.address"
                                      value={editingUniversity.contactInfo?.address || ''}
                                      onChange={handleEditUniversityChange}
                                      placeholder="Adresă"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditUniversityForm(false)}>
                                  Anulează
                                </button>
                                <button type="submit" className="btn btn-primary">
                                  Salvează
                                </button>
                              </div>
                            </form>
                          </div>
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
                              type="button" 
                              className="cancel-button"
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
                                setShowEditProgramForm(false);
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
                                    className="action-button view-button"
                                    onClick={() => handleViewUser(user)}
                                  >
                                    <i className="fas fa-eye"></i> View User
                                  </button>
                                  <button 
                                    className="action-button view-docs-button"
                                    onClick={() => handleViewDocuments(user)}
                                  >
                                    <i className="fas fa-file"></i> View Docs
                                  </button>
                                  <button 
                                    className="action-button delete-button"
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
                  {errors.documents ? (
                    <div className="error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      <p>{errors.documents}</p>
                      <button 
                        className="retry-button"
                        onClick={() => {
                          setErrors(prev => ({ ...prev, documents: null }));
                          setLoading(prev => ({ ...prev, documents: true }));
                          loadDocuments();
                        }}
                      >
                        Reîncearcă
                      </button>
                    </div>
                  ) : loading.documents ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p>Loading documents...</p>
                    </div>
                  ) : (
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>User</th>
                          <th>Document Type</th>
                          <th>Upload Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDocuments.map(doc => {
                          const user = users.find(u => u.id === doc.user_id);
                          const uploadDate = doc.created_at || doc.uploadDate;
                          const documentStatus = doc.status || 'pending';
                          
                          return (
                            <tr key={`${doc.id}_${doc.document_type}`}>
                              <td>{doc.id}</td>
                              <td>
                                {user ? (
                                  <span className="user-name">{user.name}</span>
                                ) : (
                                  <span className="unknown-user">
                                    Utilizator ID: {doc.user_id}
                                  </span>
                                )}
                              </td>
                              <td>
                                <span className="document-type">
                                  {doc.document_type.charAt(0).toUpperCase() + doc.document_type.slice(1)}
                                </span>
                              </td>
                              <td>{formatDate(uploadDate)}</td>
                              <td>
                                <span className={`status-badge status-${documentStatus}`}>
                                  {documentStatus === 'pending' ? 'In waiting' :
                                   documentStatus === 'approved' ? 'Approved' :
                                   documentStatus === 'rejected' ? 'Rejected' :
                                   documentStatus === 'missing' ? 'Missing' :
                                   documentStatus.charAt(0).toUpperCase() + documentStatus.slice(1)}
                                </span>
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button 
                                    className="action-button download-button"
                                    onClick={() => handleDownloadDocument(doc.document_type, doc.user_id)}
                                    title="Download document"
                                  >
                                    <i className="fas fa-download"></i>
                                    <span>Download</span>
                                  </button>
                                  <button 
                                    className="action-button delete-button"
                                    onClick={() => handleDeleteDocument(doc.document_type, doc.user_id)}
                                    title="Delete document"
                                  >
                                    <i className="fas fa-trash"></i>
                                    <span>Delete</span>
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
                                    className="action-button view-button"
                                    onClick={() => handleViewApplication(app)}
                                  >
                                    <i className="fas fa-eye"></i> View
                                  </button>
                                  <button 
                                    className="action-button edit-button"
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
                          <span className="detail-value">{new Date(selectedUser.created_at).toLocaleDateString('ro-RO')}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Last Update:</span>
                          <span className="detail-value">{new Date(selectedUser.updated_at).toLocaleDateString('ro-RO')}</span>
                        </div>
                      </div>

                      <div className="user-details-section">
                        <h3>Personal Information</h3>
                        <div className="detail-row">
                          <span className="detail-label">Date of Birth:</span>
                          <span className="detail-value">{selectedUser.date_of_birth ? new Date(selectedUser.date_of_birth).toLocaleDateString('en-US') : 'Not specified'}</span>
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
                                  ({new Date(docStatus.diploma.uploadDate).toLocaleDateString()})
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
                                  ({new Date(docStatus.transcript.uploadDate).toLocaleDateString()})
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
                                  ({new Date(docStatus.passport.uploadDate).toLocaleDateString()})
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
                                  ({new Date(docStatus.photo.uploadDate).toLocaleDateString()})
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
                          <span className="detail-value">{selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString('ro-RO') : 'Nespecificată'}</span>
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
                      {renderUserDocuments()}
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