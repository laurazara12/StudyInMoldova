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
    universities: true
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
    if (!checkAdminAccess()) return;

    try {
      setError(null);
      setLoading(prev => ({ ...prev, users: true, documents: true, universities: true, applications: true }));

      // Încărcăm toate datele în paralel
      const [usersResponse, documentsResponse, universitiesResponse, programsResponse, applicationsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/auth/users`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/api/documents`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/api/universities`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/api/programs`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/api/applications`, { headers: getAuthHeaders() })
      ]);

      // Procesăm utilizatorii
      if (Array.isArray(usersResponse.data)) {
        console.log('Date utilizatori primite:', usersResponse.data);
        const processedUsers = usersResponse.data.map(user => {
          console.log('Procesare utilizator:', user);
          return {
            ...user,
            displayName: user.name || user.email
          };
        });
        setUsers(processedUsers);
      }

      // Procesăm documentele
      if (documentsResponse.data) {
        const documents = Array.isArray(documentsResponse.data) 
          ? documentsResponse.data 
          : documentsResponse.data.data || [];

        // Inițializăm statusul pentru toți utilizatorii
        const statusByUser = {};
        usersResponse.data.forEach(user => {
          if (user && user.id) {
            statusByUser[user.id] = {
              passport: { exists: false, status: 'missing', uploadDate: null },
              diploma: { exists: false, status: 'missing', uploadDate: null },
              transcript: { exists: false, status: 'missing', uploadDate: null },
              cv: { exists: false, status: 'missing', uploadDate: null },
              other: { exists: false, status: 'missing', uploadDate: null },
              photo: { exists: false, status: 'missing', uploadDate: null },
              medical: { exists: false, status: 'missing', uploadDate: null },
              insurance: { exists: false, status: 'missing', uploadDate: null }
            };
          }
        });

        // Procesăm documentele
        const processedDocuments = documents.reduce((acc, doc) => {
          if (!doc || !doc.user_id || !doc.document_type) {
            return acc;
          }

          const userId = doc.user_id;
          const documentType = doc.document_type.toLowerCase();

          // Verificăm dacă documentul există deja
          const existingDocIndex = acc.findIndex(d => 
            d.user_id === userId && d.document_type === documentType
          );

          if (existingDocIndex === -1) {
            const processedDoc = {
              ...doc,
              user_id: userId,
              document_type: documentType,
              status: (doc.status || 'pending').toLowerCase(),
              created_at: doc.created_at || doc.uploadDate || doc.createdAt || new Date().toISOString(),
              uploadDate: doc.uploadDate || doc.created_at || doc.createdAt || new Date().toISOString()
            };
            acc.push(processedDoc);

            // Actualizăm statusul pentru acest document
            if (statusByUser[userId] && statusByUser[userId][documentType]) {
              statusByUser[userId][documentType] = {
                exists: true,
                status: processedDoc.status,
                id: processedDoc.id,
                uploadDate: processedDoc.uploadDate
              };
            }
          }
          return acc;
        }, []);

        setDocuments(processedDocuments);
        setDocStatus(statusByUser);
      }

      // Procesăm universitățile și programele
      if (Array.isArray(universitiesResponse.data)) {
        setUniversities(universitiesResponse.data);
      }

      // Procesăm programele
      if (programsResponse.data && programsResponse.data.data) {
        console.log('Programe primite:', programsResponse.data.data);
        setPrograms(programsResponse.data.data);
      } else if (Array.isArray(programsResponse.data)) {
        console.log('Programe primite (array):', programsResponse.data);
        setPrograms(programsResponse.data);
      } else {
        console.error('Format invalid pentru programe:', programsResponse.data);
        setPrograms([]);
      }

      // Procesăm aplicațiile
      if (Array.isArray(applicationsResponse.data)) {
        setApplications(applicationsResponse.data);
      }

    } catch (err) {
      console.error('Error initializing dashboard:', err);
      setError('A apărut o eroare la încărcarea datelor. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(prev => ({ ...prev, users: false, documents: false, universities: false, applications: false }));
    }
  };

  useEffect(() => {
    initializeDashboard();
  }, [navigate, token, user?.role]);

  const getDocumentStatus = (userId) => {
    if (!userId) {
      console.warn('getDocumentStatus: userId este undefined sau null');
      return getDefaultDocumentStatus();
    }

    const status = docStatus[userId];
    if (!status) {
      console.warn(`getDocumentStatus: Nu există status pentru utilizatorul ${userId}`);
      return getDefaultDocumentStatus();
    }

    console.log(`Status documente pentru utilizatorul ${userId}:`, JSON.stringify(status, null, 2));
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
        url: `${API_BASE_URL}/documents/download/${doc.id}`,
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
              const userName = user ? `${user.firstName} ${user.lastName}` : `Utilizator ID: ${doc.user_id}`;
              const docType = doc.document_type?.toLowerCase();
              const docStatus = doc.status?.toLowerCase();
              const uploadDate = doc.uploadDate || doc.created_at || 'Necunoscută';

              return (
                <tr key={`${doc.id}-${docType}`} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{userName}</td>
                  <td className="px-4 py-2 border">
                    {docType === 'passport' ? 'Pașaport' :
                     docType === 'diploma' ? 'Diplomă' :
                     docType === 'transcript' ? 'Adeverință' :
                     docType === 'cv' ? 'CV' :
                     docType === 'photo' ? 'Fotografie' :
                     docType === 'medical' ? 'Certificat Medical' :
                     docType === 'insurance' ? 'Asigurare' :
                     'Altele'}
                  </td>
                  <td className="px-4 py-2 border">
                    {new Date(uploadDate).toLocaleDateString('ro-RO')}
                  </td>
                  <td className="px-4 py-2 border">
                    {docStatus === 'pending' ? 'În așteptare' :
                     docStatus === 'approved' ? 'Aprobat' :
                     docStatus === 'rejected' ? 'Respins' :
                     'Lipsește'}
                  </td>
                  <td className="px-4 py-2 border">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownloadDocument(doc.document_type, doc.user_id)}
                        disabled={!doc.id}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                      >
                        Descarcă
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.document_type, doc.user_id)}
                        disabled={!doc.id}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                      >
                        Șterge
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
      // Reload the list of universities
      const response = await axios.get('http://localhost:4000/api/universities');
      setUniversities(response.data);
      setSuccessMessage('Universitatea a fost adăugată cu succes!');
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
        [name]: value
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
      
      console.log('Starea actualizată:', JSON.stringify(newState, null, 2));
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
        throw new Error(`Câmpurile obligatorii lipsesc: ${missingFields.join(', ')}`);
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

      console.log('Datele pregătite pentru trimitere:', JSON.stringify(universityData, null, 2));

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

      console.log('Răspuns de la server:', JSON.stringify(response.data, null, 2));

      if (response.data) {
        setUniversities(prevUniversities => 
          prevUniversities.map(university => 
            university.id === editingUniversity.id ? response.data : university
          )
        );
        
        setShowEditUniversityForm(false);
        setEditingUniversity(null);
        setSuccessMessage('Universitatea a fost actualizată cu succes!');
        setTimeout(() => setSuccessMessage(''), 2000);
      }
    } catch (error) {
      console.error('Eroare la actualizarea universității:', error);
      console.error('Detalii eroare:', error.response?.data);
      setError('Eroare la actualizarea universității: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteUniversity = async (universityId) => {
    if (window.confirm('Sigur doriți să ștergeți această universitate?')) {
      try {
        await axios.delete(`http://localhost:4000/api/universities/${universityId}`);
        // Reload the list of universities
        const response = await axios.get('http://localhost:4000/api/universities');
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
        console.error('Program invalid:', program);
        throw new Error('Programul selectat nu este valid');
      }

      console.log('Programul selectat pentru editare:', program);

      // Load the list of universities if we're not in the universities tab
      if (activeTab !== 'universities') {
        const response = await axios.get(`${API_BASE_URL}/api/universities`, {
          headers: getAuthHeaders()
        });
        console.log('Universități încărcate:', response.data);
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

      console.log('Programul pregătit pentru editare:', programToEdit);
      
      if (!programToEdit.id) {
        console.error('ID lipsă din programul pregătit:', programToEdit);
        throw new Error('ID-ul programului lipsește din datele pregătite');
      }

      setEditingProgram(programToEdit);
      setShowEditProgramForm(true);
    } catch (error) {
      console.error('Eroare la încărcarea datelor pentru editare:', error);
      setError('Eroare la încărcarea datelor pentru editare: ' + (error.response?.data?.message || error.message));
    }
  };

  // Funcții de validare și formatare
  const validateRequiredFields = (data, requiredFields) => {
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      throw new Error(`Câmpurile obligatorii lipsesc: ${missingFields.join(', ')}`);
    }
  };

  const validateNumber = (value, fieldName, min, max) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      throw new Error(`${fieldName} trebuie să fie un număr valid`);
    }
    if (min !== undefined && num < min) {
      throw new Error(`${fieldName} trebuie să fie mai mare sau egal cu ${min}`);
    }
    if (max !== undefined && num > max) {
      throw new Error(`${fieldName} trebuie să fie mai mic sau egal cu ${max}`);
    }
    return num;
  };

  const validateDate = (dateString, fieldName, allowPast = false) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`${fieldName} nu este o dată validă`);
    }
    if (!allowPast && date < new Date()) {
      throw new Error(`${fieldName} nu poate fi în trecut`);
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
      console.error('Eroare la formatarea datei:', error);
      return 'N/A';
    }
  };

  // Actualizare handleAddProgram cu noile validări
  const handleAddProgram = async (e) => {
    e.preventDefault();
    try {
      if (!token || !user || user.role !== 'admin') {
        setError('Nu aveți permisiunea de a adăuga programe. Vă rugăm să vă autentificați ca administrator.');
        return;
      }

      console.log('Datele programului înainte de validare:', newProgram);

      const requiredFields = {
        name: 'Numele programului',
        duration: 'Durata',
        degree_type: 'Tipul de diplomă',
        language: 'Limba de predare',
        tuition_fees: 'Taxa de școlarizare',
        university_id: 'Universitatea'
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([field]) => !newProgram[field])
        .map(([_, label]) => label);

      if (missingFields.length > 0) {
        throw new Error(`Câmpurile obligatorii lipsesc: ${missingFields.join(', ')}`);
      }

      const programData = {
        name: String(newProgram.name).trim(),
        description: newProgram.description ? String(newProgram.description).trim() : '',
        duration: parseInt(newProgram.duration),
        degree_type: newProgram.degree_type,
        language: newProgram.language,
        tuition_fees: newProgram.tuition_fees,
        university_id: parseInt(newProgram.university_id),
        faculty: newProgram.faculty ? String(newProgram.faculty).trim() : null,
        credits: newProgram.credits ? parseInt(newProgram.credits) : null
      };

      console.log('Datele pregătite pentru trimitere:', JSON.stringify(programData, null, 2));

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

      if (response.data && response.data.id) {
        // Programul a fost adăugat cu succes, reîncărcăm lista de programe
        const programsResponse = await axios.get(`${API_BASE_URL}/api/programs`, {
          headers: getAuthHeaders()
        });
        if (Array.isArray(programsResponse.data)) {
          setPrograms(programsResponse.data);
        } else if (programsResponse.data && programsResponse.data.data) {
          setPrograms(programsResponse.data.data);
        }
      } else {
        throw new Error(response.data?.message || 'Eroare la adăugarea programului');
      }
    } catch (error) {
      console.error('Eroare detaliată la adăugarea programului:', {
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
      
      const errorMessage = error.response?.data?.message || error.message;
      console.error('Eroare la adăugarea programului:', error);
      setError(`Eroare la adăugarea programului: ${errorMessage}`);
    }
  };

  const handleProgramInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Modificare câmp program:', name, value);
    
    setNewProgram(prev => {
      const updatedProgram = {
        ...prev,
        [name]: value
      };
      console.log('Starea actualizată a programului:', updatedProgram);
      return updatedProgram;
    });
  };

  const handleDeleteProgram = async (programId) => {
    if (window.confirm('Sigur doriți să ștergeți acest program?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/programs/${programId}`, {
          headers: getAuthHeaders()
        });
        // Reîncărcăm lista de programe
        const response = await axios.get(`${API_BASE_URL}/api/programs`, {
          headers: getAuthHeaders()
        });
        if (response.data && response.data.data) {
          setPrograms(response.data.data);
        }
        setSuccessMessage('Programul a fost șters cu succes!');
        setTimeout(() => setSuccessMessage(''), 2000);
      } catch (error) {
        console.error('Error deleting program:', error);
        setError('Eroare la ștergerea programului: ' + (error.response?.data?.message || error.message));
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
        `${API_BASE_URL}/api/applications/${applicationId}`,
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
      setError('A apărut o eroare la actualizarea statusului aplicației.');
    }
  };

  const handleUpdateProgram = async (e) => {
    e.preventDefault();
    try {
      if (!token || !user || user.role !== 'admin') {
        setError('Nu aveți permisiunea de a actualiza programe. Vă rugăm să vă autentificați ca administrator.');
        return;
      }

      if (!editingProgram) {
        throw new Error('Nu există program selectat pentru editare');
      }

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

      console.log('Datele pregătite pentru actualizare:', JSON.stringify(programData, null, 2));

      const response = await axios.put(
        `${API_BASE_URL}/api/programs/${editingProgram.id}`,
        programData,
        { 
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Răspuns de la server:', JSON.stringify(response.data, null, 2));

      if (response.data && response.data.success) {
        // Reîncărcăm lista completă de programe
        const programsResponse = await axios.get(`${API_BASE_URL}/api/programs`, {
          headers: getAuthHeaders()
        });
        
        if (programsResponse.data && programsResponse.data.data) {
          setPrograms(programsResponse.data.data);
        }

        setShowEditProgramForm(false);
        setEditingProgram(null);
        setSuccessMessage('Program actualizat cu succes!');
        setTimeout(() => setSuccessMessage(''), 2000);
      } else {
        throw new Error(response.data?.message || 'Eroare la actualizarea programului');
      }
    } catch (error) {
      console.error('Eroare detaliată la actualizarea programului:', {
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
      
      const errorMessage = error.response?.data?.message || error.message;
      console.error('Eroare la actualizarea programului:', error);
      setError(`Eroare la actualizarea programului: ${errorMessage}`);
    }
  };

  if (error) {
    return (
      <div className="dashboard-page">
        <style>
          {`
            .action-buttons {
              display: flex;
              gap: 8px;
              justify-content: center;
            }
            
            .action-button {
              padding: 6px 12px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 5px;
              transition: all 0.3s ease;
            }
            
            .action-button i {
              font-size: 14px;
            }
            
            .view-button {
              background-color: #4CAF50;
              color: white;
            }
            
            .view-button:hover {
              background-color: #45a049;
            }
            
            .view-docs-button {
              background-color: #2196F3;
              color: white;
            }
            
            .view-docs-button:hover {
              background-color: #0b7dda;
            }
            
            .delete-button {
              background-color: #f44336;
              color: white;
            }
            
            .delete-button:hover {
              background-color: #da190b;
            }
          `}
        </style>
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
      <style>
        {`
          .action-buttons {
            display: flex;
            gap: 8px;
            justify-content: center;
          }
          
          .action-button {
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: all 0.3s ease;
          }
          
          .action-button i {
            font-size: 14px;
          }
          
          .view-button {
            background-color: #4CAF50;
            color: white;
          }
          
          .view-button:hover {
            background-color: #45a049;
          }
          
          .view-docs-button {
            background-color: #2196F3;
            color: white;
          }
          
          .view-docs-button:hover {
            background-color: #0b7dda;
          }
          
          .delete-button {
            background-color: #f44336;
            color: white;
          }
          
          .delete-button:hover {
            background-color: #da190b;
          }

          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
          }

          .modal-content {
            background-color: white;
            border-radius: 8px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            padding: 2rem;
          }

          .program-modal {
            max-height: 80vh;
            overflow-y: auto;
          }

          .program-form {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .form-row {
            display: flex;
            gap: 1rem;
            width: 100%;
          }

          .form-group {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .form-group label {
            font-weight: 500;
            color: #333;
          }

          .form-input, .form-select {
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
            width: 100%;
          }

          .form-input:focus, .form-select:focus {
            outline: none;
            border-color: #4a90e2;
            box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
          }

          .modal-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #eee;
          }

          .cancel-button, .confirm-button {
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
          }

          .cancel-button {
            background-color: #f0f0f0;
            color: #555;
          }

          .cancel-button:hover {
            background-color: #e0e0e0;
          }

          .confirm-button {
            background-color: #4a90e2;
            color: white;
          }

          .confirm-button:hover {
            background-color: #357abd;
          }

          @media (max-width: 768px) {
            .form-row {
              flex-direction: column;
              gap: 1rem;
            }

            .modal-content {
              width: 95%;
              padding: 1.5rem;
            }
          }

          .user-name {
            font-weight: 500;
            color: #333;
          }

          .unknown-user {
            color: #666;
            font-style: italic;
          }

          .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
          }

          .status-pending {
            background-color: #fff3cd;
            color: #856404;
          }

          .status-approved {
            background-color: #d4edda;
            color: #155724;
          }

          .status-rejected {
            background-color: #f8d7da;
            color: #721c24;
          }

          .status-missing {
            background-color: #e2e3e5;
            color: #383d41;
          }

          .document-type {
            font-weight: 500;
            color: #2196F3;
          }
        `}
      </style>
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
                  Aplicații
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
                  Clear
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
                    <option value="all">Toate gradele</option>
                    <option value="Bachelor">Licență</option>
                    <option value="Master">Master</option>
                    <option value="PhD">Doctorat</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Limbă:</label>
                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Toate limbile</option>
                    <option value="Romanian">Română</option>
                    <option value="English">Engleză</option>
                    <option value="Russian">Rusă</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Taxă de școlarizare:</label>
                  <div className="range-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filterTuitionFee.min}
                      onChange={(e) => setFilterTuitionFee(prev => ({ ...prev, min: e.target.value }))}
                      className="filter-input"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filterTuitionFee.max}
                      onChange={(e) => setFilterTuitionFee(prev => ({ ...prev, max: e.target.value }))}
                      className="filter-input"
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
                  Resetează filtrele
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
                    <option value="all">Toate Statusurile</option>
                    <option value="pending">În Așteptare</option>
                    <option value="approved">Aprobate</option>
                    <option value="rejected">Respinse</option>
                    <option value="under_review">În Revizuire</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Interval Dată:</label>
                  <div className="date-range-inputs">
                    <input
                      type="date"
                      value={filterApplicationDateRange.start}
                      onChange={(e) => setFilterApplicationDateRange({...filterApplicationDateRange, start: e.target.value})}
                      className="date-input"
                    />
                    <span>până la</span>
                    <input
                      type="date"
                      value={filterApplicationDateRange.end}
                      onChange={(e) => setFilterApplicationDateRange({...filterApplicationDateRange, end: e.target.value})}
                      className="date-input"
                    />
                  </div>
                </div>
                <button 
                  className="clear-filters-button"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterApplicationStatus('all');
                    setFilterApplicationDateRange({ start: '', end: '' });
                  }}
                >
                  Resetează Filtrele
                </button>
              </div>
            ) : null}
          </div>

          {loading.users || loading.documents || loading.universities ? (
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
                            <button type="button" className="btn-close" onClick={() => setShowEditUniversityForm(false)}></button>
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
                                  <option value="">Selectează tipul</option>
                                  <option value="Public">Public</option>
                                  <option value="Privat">Privat</option>
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
                                <label>Locație</label>
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
                                <label>URL Imagine</label>
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
                                <label>Clasament</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="ranking"
                                  value={editingUniversity.ranking || ''}
                                  onChange={handleEditUniversityChange}
                                />
                              </div>
                              <div className="form-group mb-3">
                                <label>Taxe de Școlarizare</label>
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
                                    <small className="form-text text-muted">Licență (max 20 caractere)</small>
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
                                    <small className="form-text text-muted">Master (max 20 caractere)</small>
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
                                    <small className="form-text text-muted">Doctorat (max 20 caractere)</small>
                                  </div>
                                </div>
                              </div>
                              <div className="form-group mb-3">
                                <label>Informații de Contact</label>
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
                          <th>Nume</th>
                          <th>Grad</th>
                          <th>Durată</th>
                          <th>Limbă</th>
                          <th>Taxă</th>
                          <th>Universitate</th>
                          <th>Acțiuni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {programs.map(program => (
                          <tr key={program.id}>
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
                      <div className="modal-content program-modal">
                        <h2>Adaugă Program Nou</h2>
                        <form onSubmit={handleAddProgram} className="program-form">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Nume Program:</label>
                              <input
                                type="text"
                                name="name"
                                value={newProgram.name}
                                onChange={handleProgramInputChange}
                                placeholder="Introduceți numele programului"
                                required
                                className="form-input"
                              />
                            </div>

                            <div className="form-group">
                              <label>Grad:</label>
                              <select
                                name="degree_type"
                                value={newProgram.degree_type}
                                onChange={handleProgramInputChange}
                                required
                                className="form-select"
                              >
                                <option value="">Selectează gradul</option>
                                <option value="Bachelor">Licență</option>
                                <option value="Master">Master</option>
                                <option value="PhD">Doctorat</option>
                              </select>
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Facultate:</label>
                              <input
                                type="text"
                                name="faculty"
                                value={newProgram.faculty}
                                onChange={handleProgramInputChange}
                                placeholder="Introduceți numele facultății"
                                className="form-input"
                              />
                            </div>

                            <div className="form-group">
                              <label>Credite:</label>
                              <input
                                type="number"
                                name="credits"
                                value={newProgram.credits}
                                onChange={handleProgramInputChange}
                                placeholder="Introduceți numărul de credite"
                                className="form-input"
                              />
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Durată (ani):</label>
                              <input
                                type="number"
                                name="duration"
                                min="1"
                                max="6"
                                value={newProgram.duration}
                                onChange={handleProgramInputChange}
                                placeholder="Număr de ani"
                                required
                                className="form-input"
                              />
                            </div>

                            <div className="form-group">
                              <label>Limbă de Predare:</label>
                              <select
                                name="language"
                                value={newProgram.language}
                                onChange={handleProgramInputChange}
                                required
                                className="form-select"
                              >
                                <option value="">Selectează limba</option>
                                <option value="Romanian">Română</option>
                                <option value="English">Engleză</option>
                                <option value="Russian">Rusă</option>
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
                              <label>Taxă de Școlarizare:</label>
                              <input
                                type="text"
                                name="tuition_fees"
                                maxLength="50"
                                value={newProgram.tuition_fees}
                                onChange={handleProgramInputChange}
                                placeholder="ex: 3000-4000 EUR/an"
                                required
                                className="form-input"
                              />
                            </div>

                            <div className="form-group">
                              <label>Universitate:</label>
                              <select
                                name="university_id"
                                value={newProgram.university_id}
                                onChange={handleProgramInputChange}
                                required
                                className="form-select"
                              >
                                <option value="">Selectează universitatea</option>
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
                              Adaugă Program
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {showEditProgramForm && editingProgram && (
                    <div className="modal-overlay">
                      <div className="modal-content program-modal">
                        <h2>Editează Programul</h2>
                        <form onSubmit={handleUpdateProgram} className="program-form">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Nume Program:</label>
                              <input
                                type="text"
                                name="name"
                                value={editingProgram.name}
                                onChange={(e) => setEditingProgram({
                                  ...editingProgram,
                                  name: e.target.value
                                })}
                                placeholder="Introduceți numele programului"
                                required
                                className="form-input"
                              />
                            </div>

                            <div className="form-group">
                              <label>Grad:</label>
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
                                <option value="">Selectează gradul</option>
                                <option value="Bachelor">Licență</option>
                                <option value="Master">Master</option>
                                <option value="PhD">Doctorat</option>
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
                                placeholder="Introduceți numele facultății"
                                className="form-input"
                              />
                            </div>

                            <div className="form-group">
                              <label>Credite:</label>
                              <input
                                type="number"
                                name="credits"
                                value={editingProgram.credits || ''}
                                onChange={(e) => setEditingProgram({
                                  ...editingProgram,
                                  credits: e.target.value
                                })}
                                placeholder="Introduceți numărul de credite"
                                className="form-input"
                              />
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Durată (ani):</label>
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
                                placeholder="Număr de ani"
                                required
                                className="form-input"
                              />
                            </div>

                            <div className="form-group">
                              <label>Limbă de Predare:</label>
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
                                <option value="">Selectează limba</option>
                                <option value="Romanian">Română</option>
                                <option value="English">Engleză</option>
                                <option value="Russian">Rusă</option>
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
                              placeholder="Descrieți programul de studiu"
                              className="form-textarea"
                              rows="4"
                            />
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Taxă de Școlarizare:</label>
                              <input
                                type="text"
                                name="tuition_fees"
                                maxLength="50"
                                value={editingProgram.tuition_fees}
                                onChange={(e) => setEditingProgram({
                                  ...editingProgram,
                                  tuition_fees: e.target.value
                                })}
                                placeholder="ex: 3000-4000 EUR/an"
                                required
                                className="form-input"
                              />
                            </div>

                            <div className="form-group">
                              <label>Universitate:</label>
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
                                <option value="">Selectează universitatea</option>
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
                              Salvează Modificările
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
                </div>
              ) : activeTab === 'documents' ? (
                <div className="documents-table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Utilizator</th>
                        <th>Tip Document</th>
                        <th>Data Încărcare</th>
                        <th>Status</th>
                        <th>Acțiuni</th>
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
                                {documentStatus === 'pending' ? 'În așteptare' :
                                 documentStatus === 'approved' ? 'Aprobat' :
                                 documentStatus === 'rejected' ? 'Respins' :
                                 documentStatus === 'missing' ? 'Lipsește' :
                                 documentStatus.charAt(0).toUpperCase() + documentStatus.slice(1)}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="action-button download-button"
                                  onClick={() => handleDownloadDocument(doc.document_type, doc.user_id)}
                                  title="Descarcă documentul"
                                >
                                  <i className="fas fa-download"></i>
                                  <span>Descarcă</span>
                                </button>
                                <button 
                                  className="action-button delete-button"
                                  onClick={() => handleDeleteDocument(doc.document_type, doc.user_id)}
                                  title="Șterge documentul"
                                >
                                  <i className="fas fa-trash"></i>
                                  <span>Șterge</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : activeTab === 'applications' ? (
                <div className="applications-table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Utilizator</th>
                        <th>Program</th>
                        <th>Universitate</th>
                        <th>Data Aplicației</th>
                        <th>Status</th>
                        <th>Acțiuni</th>
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
                                {app.status === 'pending' ? 'În Așteptare' :
                                 app.status === 'approved' ? 'Aprobată' :
                                 app.status === 'rejected' ? 'Respinsă' :
                                 app.status === 'under_review' ? 'În Revizuire' :
                                 app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="action-button view-button"
                                  onClick={() => handleViewApplication(app)}
                                >
                                  <i className="fas fa-eye"></i> Vezi
                                </button>
                                <button 
                                  className="action-button edit-button"
                                  onClick={() => handleEditApplication(app)}
                                >
                                  <i className="fas fa-edit"></i> Editează
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

              {showUserDetails && selectedUser && (
                <div className="modal-overlay">
                  <div className="modal-content user-details-modal">
                    <div className="modal-header">
                      <h2>Detalii Utilizator</h2>
                      <button className="close-button" onClick={closeModals}>
                        <span className="close-x">×</span>
                      </button>
                    </div>
                    <div className="user-details-content">
                      <div className="user-details-section">
                        <h3>Informații de Bază</h3>
                        <div className="detail-row">
                          <span className="detail-label">ID:</span>
                          <span className="detail-value">{selectedUser.id}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Nume:</span>
                          <span className="detail-value">{selectedUser.name}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Email:</span>
                          <span className="detail-value">{selectedUser.email}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Rol:</span>
                          <span className="detail-value">{selectedUser.role === 'admin' ? 'Administrator' : 'Utilizator'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Data Înregistrării:</span>
                          <span className="detail-value">{new Date(selectedUser.created_at).toLocaleDateString('ro-RO')}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Ultima Actualizare:</span>
                          <span className="detail-value">{new Date(selectedUser.updated_at).toLocaleDateString('ro-RO')}</span>
                        </div>
                      </div>

                      <div className="user-details-section">
                        <h3>Informații Personale</h3>
                        <div className="detail-row">
                          <span className="detail-label">Data Nașterii:</span>
                          <span className="detail-value">{selectedUser.date_of_birth ? new Date(selectedUser.date_of_birth).toLocaleDateString('ro-RO') : 'Nespecificată'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Țara de Origine:</span>
                          <span className="detail-value">{selectedUser.country_of_origin || 'Nespecificată'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Naționalitate:</span>
                          <span className="detail-value">{selectedUser.nationality || 'Nespecificată'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Număr de Telefon:</span>
                          <span className="detail-value">{selectedUser.phone || 'Nespecificat'}</span>
                        </div>
                      </div>

                      <div className="user-details-section">
                        <h3>Statut Documente</h3>
                        <div className="document-status-grid">
                          <div className="document-status-item">
                            <span className="status-label">Diplomă:</span>
                            <span className={`status-value ${docStatus.diploma.status}`}>
                              {docStatus.diploma.exists ? 'Încărcat' : 'Lipsește'}
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
                        <h3>Activități Recente</h3>
                        <div className="detail-row">
                          <span className="detail-label">Ultima Autentificare:</span>
                          <span className="detail-value">{selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString('ro-RO') : 'Nespecificată'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Status Cont:</span>
                          <span className="detail-value">{selectedUser.is_active ? 'Activ' : 'Inactiv'}</span>
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
                      <h2>Documente Utilizator</h2>
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
                      <h2>Detalii Aplicație</h2>
                      <button className="close-button" onClick={() => {
                        setShowApplicationDetails(false);
                        setSelectedApplication(null);
                      }}>
                        <span className="close-x">×</span>
                      </button>
                    </div>
                    <div className="application-details">
                      <div className="detail-row">
                        <span className="detail-label">ID Aplicație:</span>
                        <span className="detail-value">{selectedApplication.id}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Utilizator:</span>
                        <span className="detail-value">
                          {users.find(u => u.id === selectedApplication.user_id)?.name || 'N/A'}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Program:</span>
                        <span className="detail-value">{selectedApplication.program?.name || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Universitate:</span>
                        <span className="detail-value">{selectedApplication.university?.name || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Data Aplicației:</span>
                        <span className="detail-value">{formatDate(selectedApplication.created_at)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Status:</span>
                        <span className={`status-badge status-${selectedApplication.status}`}>
                          {selectedApplication.status === 'pending' ? 'În Așteptare' :
                           selectedApplication.status === 'approved' ? 'Aprobată' :
                           selectedApplication.status === 'rejected' ? 'Respinsă' :
                           selectedApplication.status === 'under_review' ? 'În Revizuire' :
                           selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                        </span>
                      </div>
                      {selectedApplication.notes && (
                        <div className="detail-row">
                          <span className="detail-label">Note:</span>
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
                      <h2>Editare Aplicație</h2>
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
                          <option value="pending">În Așteptare</option>
                          <option value="approved">Aprobată</option>
                          <option value="rejected">Respinsă</option>
                          <option value="under_review">În Revizuire</option>
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
                          Anulează
                        </button>
                        <button
                          className="confirm-button"
                          onClick={() => handleUpdateApplicationStatus(selectedApplication.id, selectedApplication.status)}
                        >
                          Salvează
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