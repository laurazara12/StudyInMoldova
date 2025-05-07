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
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [filterUserDateRange, setFilterUserDateRange] = useState({ start: '', end: '' });
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
      setLoading(prev => ({ ...prev, users: true, documents: true, universities: true }));

      // Încărcăm toate datele în paralel
      const [usersResponse, documentsResponse, universitiesResponse, programsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/auth/users`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/api/documents`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/api/universities`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/api/programs`, { headers: getAuthHeaders() })
      ]);

      console.log('Răspuns API documente:', documentsResponse.data);
      console.log('Răspuns API utilizatori:', usersResponse.data);

      // Procesăm utilizatorii
      if (Array.isArray(usersResponse.data)) {
        setUsers(usersResponse.data);
      }

      // Procesăm documentele
      if (documentsResponse.data) {
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

        console.log('Status inițial pentru utilizatori:', statusByUser);

        // Procesăm documentele pentru a evita duplicarea
        const processedDocuments = documentsResponse.data.reduce((acc, doc) => {
          // Verificăm structura documentului
          console.log('Document primit:', doc);
          
          // Extragem userId și documentType din document
          const userId = doc.user_id || doc.userId || doc.user?.id;
          const documentType = (doc.document_type || doc.type || doc.documentType)?.toLowerCase();
          
          console.log('Procesare document:', {
            userId,
            documentType,
            originalDoc: doc
          });

          if (!userId || !documentType) {
            console.warn('Document invalid:', {
              document: doc,
              userId,
              documentType,
              reason: !userId ? 'userId lipsă' : 'documentType lipsă'
            });
            return acc;
          }

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
            if (statusByUser[userId]) {
              if (!statusByUser[userId][documentType]) {
                console.warn(`Tip de document necunoscut pentru utilizatorul ${userId}: ${documentType}`);
                statusByUser[userId][documentType] = {
                  exists: true,
                  status: processedDoc.status,
                  id: processedDoc.id,
                  uploadDate: processedDoc.uploadDate
                };
              } else {
                statusByUser[userId][documentType] = {
                  exists: true,
                  status: processedDoc.status,
                  id: processedDoc.id,
                  uploadDate: processedDoc.uploadDate
                };
              }
              console.log(`Status actualizat pentru utilizatorul ${userId}, documentul ${documentType}:`, statusByUser[userId][documentType]);
            } else {
              console.warn(`Nu s-a putut actualiza statusul pentru utilizatorul ${userId}, documentul ${documentType} - utilizatorul nu există`);
            }
          }
          return acc;
        }, []);

        console.log('Documente procesate:', processedDocuments);
        console.log('Status final pentru utilizatori:', statusByUser);

        // Verificăm dacă toți utilizatorii au statusul corect
        Object.entries(statusByUser).forEach(([userId, status]) => {
          console.log(`Verificare finală pentru utilizatorul ${userId}:`, status);
        });

        // Actualizăm state-ul
        setDocuments(processedDocuments);
        setDocStatus(statusByUser);

        // Verificăm dacă state-ul a fost actualizat
        setTimeout(() => {
          console.log('Verificare state după actualizare:', {
            documents: processedDocuments,
            docStatus: statusByUser
          });
        }, 0);
      }

      // Procesăm universitățile și programele
      if (Array.isArray(universitiesResponse.data)) {
        setUniversities(universitiesResponse.data);
      }
      if (Array.isArray(programsResponse.data)) {
        setPrograms(programsResponse.data);
      }

    } catch (err) {
      console.error('Error initializing dashboard:', err);
      setError('A apărut o eroare la încărcarea datelor. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(prev => ({ ...prev, users: false, documents: false, universities: false }));
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
      program.faculty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDegree = filterDegree === 'all' || program.degree === filterDegree;
    const matchesFaculty = filterFaculty === '' || program.faculty === filterFaculty;
    const matchesLanguage = filterLanguage === '' || 
      (Array.isArray(program.languages) && program.languages.includes(filterLanguage));
    
    const matchesCredits = (!filterCredits.min || program.credits >= parseInt(filterCredits.min)) &&
                         (!filterCredits.max || program.credits <= parseInt(filterCredits.max));
    
    const matchesTuitionFee = (!filterTuitionFee.min || program.tuitionFee >= parseInt(filterTuitionFee.min)) &&
                            (!filterTuitionFee.max || program.tuitionFee <= parseInt(filterTuitionFee.max));
    
    return matchesSearch && matchesDegree && matchesFaculty && matchesLanguage && 
           matchesCredits && matchesTuitionFee;
  }) : [];

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

  const handleUpdateUniversity = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:4000/api/universities/${editingUniversity.id}`, editingUniversity);
      setShowEditUniversityForm(false);
      setEditingUniversity(null);
      // Reload the list of universities
      const response = await axios.get('http://localhost:4000/api/universities');
      setUniversities(response.data);
      setSuccessMessage('Universitatea a fost modificată cu succes!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      console.error('Error updating university:', error);
      setError('Error updating university');
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
      // Load the list of universities if we're not in the universities tab
      if (activeTab !== 'universities') {
        const response = await axios.get(`${API_BASE_URL}/universities`, {
          headers: getAuthHeaders()
        });
        setUniversities(response.data);
      }
      setEditingProgram(program);
      setShowEditProgramForm(true);
    } catch (error) {
      console.error('Error loading universities:', error);
      setError('Error loading university list');
    }
  };

  const handleAddProgram = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/programs`, newProgram, {
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
      // Reload the list of programs
      const response = await axios.get(`${API_BASE_URL}/api/programs`, {
        headers: getAuthHeaders()
      });
      setPrograms(response.data);
      setSuccessMessage('Programul a fost adăugat cu succes!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      console.error('Error adding program:', error);
      setError('Error adding program');
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
      console.error('Error updating program:', error);
      setError('Error updating program');
    }
  };

  const handleDeleteProgram = async (programId) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
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
        console.error('Error deleting program:', error);
        setError('Error deleting program');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Eroare la formatarea datei:', error);
      return 'N/A';
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
                  <label>Degree:</label>
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
                  <label>Faculty:</label>
                  <select
                    value={filterFaculty}
                    onChange={(e) => setFilterFaculty(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Faculties</option>
                    {[...new Set(Array.isArray(programs) ? programs.map(p => p.faculty) : [])].map(faculty => (
                      <option key={faculty} value={faculty}>{faculty}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Language:</label>
                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Languages</option>
                    {[...new Set(Array.isArray(programs) ? programs.flatMap(p => Array.isArray(p.languages) ? p.languages : []) : [])].map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Credits Range:</label>
                  <div className="range-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filterCredits.min}
                      onChange={(e) => setFilterCredits({...filterCredits, min: e.target.value})}
                      className="range-input"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filterCredits.max}
                      onChange={(e) => setFilterCredits({...filterCredits, max: e.target.value})}
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
                <button 
                  className="clear-filters-button"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterDegree('all');
                    setFilterFaculty('');
                    setFilterLanguage('');
                    setFilterCredits({ min: '', max: '' });
                    setFilterTuitionFee({ min: '', max: '' });
                  }}
                >
                  Clear Filters
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
                            <h3>Tuition Fees</h3>
                            <div className="form-group">
                              <label>Bachelor:</label>
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
                              <label>PhD:</label>
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
                            <h3>Contact Information</h3>
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
                              <label>Phone:</label>
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
                              <label>Address:</label>
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
                          <th>Name</th>
                          <th>Faculty</th>
                          <th>Degree</th>
                          <th>Credits</th>
                          <th>Language</th>
                          <th>Duration</th>
                          <th>Fee</th>
                          <th>University</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPrograms.map(program => (
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
                                  Edit
                                </button>
                                <button 
                                  className="delete-button"
                                  onClick={() => handleDeleteProgram(program.id)}
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
                              <label>Facultate:</label>
                              <input
                                type="text"
                                name="faculty"
                                value={newProgram.faculty}
                                onChange={handleProgramInputChange}
                                placeholder="Introduceți numele facultății"
                                required
                                className="form-input"
                              />
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Grad:</label>
                              <select
                                name="degree"
                                value={newProgram.degree}
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

                            <div className="form-group">
                              <label>Credite:</label>
                              <input
                                type="number"
                                name="credits"
                                min="0"
                                max="300"
                                value={newProgram.credits}
                                onChange={handleProgramInputChange}
                                placeholder="Număr de credite"
                                required
                                className="form-input"
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Limbi de Predare:</label>
                            <div className="language-checkboxes">
                              {['Romanian', 'English', 'Russian'].map(lang => (
                                <label key={lang} className="checkbox-label">
                                  <input
                                    type="checkbox"
                                    checked={newProgram.languages.includes(lang)}
                                    onChange={(e) => {
                                      const updatedLanguages = e.target.checked
                                        ? [...newProgram.languages, lang]
                                        : newProgram.languages.filter(l => l !== lang);
                                      setNewProgram(prev => ({
                                        ...prev,
                                        languages: updatedLanguages
                                      }));
                                    }}
                                  />
                                  {lang}
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Descriere:</label>
                            <textarea
                              name="description"
                              value={newProgram.description}
                              onChange={handleProgramInputChange}
                              placeholder="Descrieți programul de studiu"
                              required
                              className="form-textarea"
                              rows="4"
                            />
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Durată:</label>
                              <input
                                type="text"
                                name="duration"
                                value={newProgram.duration}
                                onChange={handleProgramInputChange}
                                placeholder="Ex: 3 ani / 6 semestre"
                                required
                                className="form-input"
                              />
                            </div>

                            <div className="form-group">
                              <label>Taxă de Școlarizare (EUR):</label>
                              <input
                                type="number"
                                name="tuitionFee"
                                min="0"
                                value={newProgram.tuitionFee}
                                onChange={handleProgramInputChange}
                                placeholder="Introduceți taxa"
                                required
                                className="form-input"
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Universitate:</label>
                            <select
                              name="universityId"
                              value={newProgram.universityId}
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

                          <div className="modal-buttons">
                            <button 
                              type="button" 
                              className="cancel-button"
                              onClick={() => {
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
                              {Array.isArray(universities) ? universities.map(university => (
                                <option key={university.id} value={university.id}>
                                  {university.name}
                                </option>
                              )) : []}
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
                            <td>{user.name}</td>
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
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard; 