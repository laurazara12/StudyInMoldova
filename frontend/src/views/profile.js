// import React, { useState, useEffect, useRef } from 'react';
// import { Helmet } from 'react-helmet-async';
// import { useNavigate } from 'react-router-dom';
// import Navbar from '../components/navbar';
// import Footer from '../components/footer';
// import { API_BASE_URL, getAuthHeaders, handleApiError } from '../config/api.config';
// import { useAuth } from '../context/AuthContext';
// import axios from 'axios';
// import './profile.css';
// import PlanYourStudies from '../components/plan-your-studies';
// import DocumentCounter from '../components/document-counter';
// import Notifications from '../components/notifications';

// const initialDocuments = {
//   diploma: { uploading: false, progress: 0, uploaded: false, file: null },
//   transcript: { uploading: false, progress: 0, uploaded: false, file: null },
//   passport: { uploading: false, progress: 0, uploaded: false, file: null },
//   photo: { uploading: false, progress: 0, uploaded: false, file: null },
//   medical: { uploading: false, progress: 0, uploaded: false, file: null },
//   insurance: { uploading: false, progress: 0, uploaded: false, file: null },
//   other: { uploading: false, progress: 0, uploaded: false, file: null },
//   cv: { uploading: false, progress: 0, uploaded: false, file: null }
// };

// const documentTypes = [
//   { id: 'diploma', name: 'Diploma', description: 'High school diploma or equivalent' },
//   { id: 'transcript', name: 'Transcript', description: 'High school transcript with grades' },
//   { id: 'passport', name: 'Passport', description: 'Valid passport' },
//   { id: 'photo', name: 'Photo', description: 'Recent 3x4 photo' },
//   { id: 'medical', name: 'Medical Certificate', description: 'Medical certificate' },
//   { id: 'insurance', name: 'Health Insurance', description: 'Health insurance' },
//   { id: 'other', name: 'Other Documents', description: 'Other documents' },
//   { id: 'cv', name: 'CV', description: 'Curriculum Vitae' }
// ];

// const Profile = () => {
//   const navigate = useNavigate();
//   const { isAuthenticated, user: authUser, checkAuth } = useAuth();
//   const [savedPrograms, setSavedPrograms] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [user, setUser] = useState(null);
//   const [documents, setDocuments] = useState([]);
//   const [uploadStatus, setUploadStatus] = useState(() => {
//     const savedDocuments = localStorage.getItem('uploadedDocuments');
//     return savedDocuments ? { ...initialDocuments, ...JSON.parse(savedDocuments) } : initialDocuments;
//   });
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState({
//     full_name: '',
//     email: '',
//     phone: '',
//     date_of_birth: '',
//     country_of_origin: '',
//     nationality: '',
//     desired_study_level: '',
//     preferred_study_field: '',
//     desired_academic_year: '',
//     preferred_study_language: '',
//     estimated_budget: '',
//     accommodation_preferences: ''
//   });
//   const [userData, setUserData] = useState(null);
//   const fileInputRef = useRef(null);
//   const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeProfileTab') || 'profile');

//   useEffect(() => {
//     if (!isAuthenticated || !authUser) {
//       navigate('/sign-in');
//       return;
//     }

//     if (!isInitialized) {
//       fetchSavedPrograms();
//       setIsInitialized(true);
//     }
//   }, [isAuthenticated, authUser, navigate, isInitialized]);

//   useEffect(() => {
//     localStorage.setItem('activeProfileTab', activeTab);
//   }, [activeTab]);

//   useEffect(() => {
//     localStorage.setItem('uploadedDocuments', JSON.stringify(uploadStatus));
//   }, [uploadStatus]);

//   useEffect(() => {
//     let isMounted = true;
//     const token = localStorage.getItem('token');

//     if (!token) {
//       navigate('/sign-in');
//       return;
//     }

//     const fetchUserData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
//           headers: getAuthHeaders()
//         });

//         if (!response.data?.success || !response.data?.user) {
//           throw new Error('User data is missing or invalid');
//         }

//         const userData = response.data.user;
        
//         if (isMounted) {
//           setUser(userData);
//           setUserData(userData);
//           setFormData({
//             full_name: userData.full_name || '',
//             email: userData.email || '',
//             phone: userData.phone || '',
//             date_of_birth: userData.date_of_birth || '',
//             country_of_origin: userData.country_of_origin || '',
//             nationality: userData.nationality || '',
//             desired_study_level: userData.desired_study_level || '',
//             preferred_study_field: userData.preferred_study_field || '',
//             desired_academic_year: userData.desired_academic_year || '',
//             preferred_study_language: userData.preferred_study_language || '',
//             estimated_budget: userData.estimated_budget || '',
//             accommodation_preferences: userData.accommodation_preferences || ''
//           });

//           if (userData.role !== 'admin') {
//             await fetchDocuments();
//           }
//         }
//       } catch (error) {
//         if (isMounted) {
//           const apiError = handleApiError(error);
//           console.error('Error fetching user data:', apiError);
          
//           if (apiError.status === 401) {
//             localStorage.removeItem('token');
//             localStorage.removeItem('user');
//             navigate('/sign-in');
//           } else {
//             setError(apiError.message || 'An error occurred while loading data');
//           }
//         }
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchUserData();

//     return () => {
//       isMounted = false;
//     };
//   }, [navigate]);

//   const fetchSavedPrograms = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await axios.get(`${API_BASE_URL}/api/saved-programs`, {
//         headers: getAuthHeaders()
//       });
      
//       if (response.data) {
//         setSavedPrograms(response.data);
//       }
//     } catch (error) {
//       console.error('Error fetching saved programs:', error);
      
//       if (error.response?.status === 401) {
//         navigate('/sign-in');
//         return;
//       }
//       setError(handleApiError(error).message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchDocuments = async () => {
//     try {
//       setError(null);
//       const response = await axios.get(`${API_BASE_URL}/api/documents/user-documents`, {
//         headers: getAuthHeaders()
//       });

//       if (!response.data || !Array.isArray(response.data)) {
//         throw new Error('Invalid document format');
//       }

//       const validDocuments = response.data.filter(doc => {
//         if (!doc.id || !doc.document_type || !doc.file_path) {
//           console.warn('Invalid document - missing required fields:', doc);
//           return false;
//         }

//         if (doc.status === 'deleted') {
//           console.warn('Deleted document:', doc);
//           return false;
//         }

//         if (!doc.uploaded) {
//           console.warn('Document not uploaded:', doc);
//           return false;
//         }

//         return true;
//       });

//       setDocuments(validDocuments);
      
//       const newUploadStatus = { ...uploadStatus };
//       validDocuments.forEach(doc => {
//         if (newUploadStatus[doc.document_type]) {
//           newUploadStatus[doc.document_type] = {
//             ...newUploadStatus[doc.document_type],
//             uploaded: true
//           };
//         }
//       });
//       setUploadStatus(newUploadStatus);
//     } catch (error) {
//       const apiError = handleApiError(error);
//       console.error('Error fetching documents:', apiError);
//       setError(apiError.message || 'An error occurred while loading documents');
//       setDocuments([]);
//     }
//   };

//   const calculateProfileProgress = (userData) => {
//     if (!userData) return 0;
    
//     const requiredFields = [
//       'phone',
//       'date_of_birth',
//       'country_of_origin',
//       'nationality',
//       'desired_study_level',
//       'preferred_study_field',
//       'desired_academic_year',
//       'preferred_study_language',
//       'estimated_budget',
//       'accommodation_preferences'
//     ];
    
//     const completedFields = requiredFields.filter(field => 
//       userData[field] && userData[field].toString().trim() !== ''
//     );
    
//     const progress = Math.round((completedFields.length / requiredFields.length) * 100);
//     return progress;
//   };

//   if (loading) {
//     return (
//       <div className="profile-container">
//         <Navbar />
//         <div className="profile-content">
//           <div className="loading">Loading...</div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   if (!user) {
//     return null;
//   }

//   return (
//     <div className="profile-page">
//       <Helmet>
//         <title>Profile - Study In Moldova</title>
//         <meta property="og:title" content="Profile - Study In Moldova" />
//       </Helmet>
//       <Navbar />
      
//       <div className="profile-container">
//         <div className="profile-content">
//           <div className="profile-header">
//             <h1>My Profile</h1>
//             <div className="profile-progress">
//               <div className="progress-bar">
//                 <div 
//                   className="progress-fill" 
//                   style={{ width: `${calculateProfileProgress(userData)}%` }}
//                 ></div>
//               </div>
//               <span>{calculateProfileProgress(userData)}% Complete</span>
//             </div>
//           </div>

//           <div className="profile-tabs">
//             <button 
//               className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
//               onClick={() => setActiveTab('profile')}
//             >
//               Profile
//             </button>
//             <button 
//               className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
//               onClick={() => setActiveTab('documents')}
//             >
//               Documents
//             </button>
//             <button 
//               className={`tab-button ${activeTab === 'study-plan' ? 'active' : ''}`}
//               onClick={() => setActiveTab('study-plan')}
//             >
//               Study Plan
//             </button>
//             <button 
//               className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
//               onClick={() => setActiveTab('notifications')}
//             >
//               Notifications
//             </button>
//           </div>

//           <div className="profile-main">
//             {activeTab === 'profile' && (
//               <div className="profile-section">
//                 {!isEditing ? (
//                   <div className="profile-info">
//                     <div className="info-group">
//                       <label>Full Name:</label>
//                       <span>{userData?.full_name || 'Not specified'}</span>
//                     </div>
//                     <div className="info-group">
//                       <label>Email:</label>
//                       <span>{userData?.email || 'Not specified'}</span>
//                     </div>
//                     <div className="info-group">
//                       <label>Phone:</label>
//                       <span>{userData?.phone || 'Not specified'}</span>
//                     </div>
//                     <div className="info-group">
//                       <label>Date of Birth:</label>
//                       <span>{userData?.date_of_birth || 'Not specified'}</span>
//                     </div>
//                     <div className="info-group">
//                       <label>Country of Origin:</label>
//                       <span>{userData?.country_of_origin || 'Not specified'}</span>
//                     </div>
//                     <div className="info-group">
//                       <label>Nationality:</label>
//                       <span>{userData?.nationality || 'Not specified'}</span>
//                     </div>
//                     <button 
//                       className="edit-profile-button"
//                       onClick={() => setIsEditing(true)}
//                     >
//                       Edit Profile
//                     </button>
//                   </div>
//                 ) : (
//                   <form onSubmit={handleSubmit} className="edit-profile-form">
//                     <div className="form-group">
//                       <label>Full Name:</label>
//                       <input
//                         type="text"
//                         name="full_name"
//                         value={formData.full_name}
//                         onChange={handleChange}
//                       />
//                     </div>
//                     <div className="form-group">
//                       <label>Email:</label>
//                       <input
//                         type="email"
//                         name="email"
//                         value={formData.email}
//                         onChange={handleChange}
//                       />
//                     </div>
//                     <div className="form-group">
//                       <label>Phone:</label>
//                       <input
//                         type="tel"
//                         name="phone"
//                         value={formData.phone}
//                         onChange={handleChange}
//                       />
//                     </div>
//                     <div className="form-group">
//                       <label>Date of Birth:</label>
//                       <input
//                         type="date"
//                         name="date_of_birth"
//                         value={formData.date_of_birth}
//                         onChange={handleChange}
//                       />
//                     </div>
//                     <div className="form-group">
//                       <label>Country of Origin:</label>
//                       <input
//                         type="text"
//                         name="country_of_origin"
//                         value={formData.country_of_origin}
//                         onChange={handleChange}
//                       />
//                     </div>
//                     <div className="form-group">
//                       <label>Nationality:</label>
//                       <input
//                         type="text"
//                         name="nationality"
//                         value={formData.nationality}
//                         onChange={handleChange}
//                       />
//                     </div>
//                     <div className="form-buttons">
//                       <button type="submit" className="save-button">Save Changes</button>
//                       <button 
//                         type="button" 
//                         className="cancel-button"
//                         onClick={() => setIsEditing(false)}
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </form>
//                 )}
//               </div>
//             )}

//             {activeTab === 'documents' && (
//               <div className="documents-section">
//                 <DocumentCounter documents={documents} />
//                 <div className="documents-grid">
//                   {documentTypes.map((docType) => (
//                     <div key={docType.id} className="document-card">
//                       <h3>{docType.name}</h3>
//                       <p>{docType.description}</p>
//                       <div className="document-actions">
//                         {uploadStatus[docType.id]?.uploaded ? (
//                           <>
//                             <button 
//                               className="download-button"
//                               onClick={() => handleDownload(docType.id)}
//                             >
//                               Download
//                             </button>
//                             <button 
//                               className="delete-button"
//                               onClick={() => handleDelete(docType.id)}
//                             >
//                               Delete
//                             </button>
//                           </>
//                         ) : (
//                           <>
//                             <input
//                               type="file"
//                               ref={fileInputRef}
//                               onChange={(e) => handleFileChange(docType.id, e)}
//                               style={{ display: 'none' }}
//                             />
//                             <button 
//                               className="upload-button"
//                               onClick={() => fileInputRef.current?.click()}
//                             >
//                               Upload
//                             </button>
//                           </>
//                         )}
//                       </div>
//                       {uploadStatus[docType.id]?.uploading && (
//                         <div className="upload-progress">
//                           <div 
//                             className="progress-bar"
//                             style={{ width: `${uploadStatus[docType.id].progress}%` }}
//                           ></div>
//                           <span>{uploadStatus[docType.id].progress}%</span>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {activeTab === 'study-plan' && (
//               <PlanYourStudies 
//                 userData={userData}
//                 calculateProfileProgress={calculateProfileProgress}
//               />
//             )}

//             {activeTab === 'notifications' && (
//               <Notifications />
//             )}
//           </div>
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default Profile;