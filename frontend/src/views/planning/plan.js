// import React, { useState, useEffect } from 'react';
// import { Helmet } from 'react-helmet-async';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import Navbar from '../../components/navbar';
// import Footer from '../../components/footer';
// import axios from 'axios';
// import { API_BASE_URL, getAuthHeaders } from '../../config/api.config';
// import './plan.css';

// const PlanYourStudies = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [selectedStep, setSelectedStep] = useState(1);
//   const [selectedField, setSelectedField] = useState('');
//   const [selectedDegree, setSelectedDegree] = useState('');
//   const [selectedLanguage, setSelectedLanguage] = useState('');
//   const [profileProgress, setProfileProgress] = useState(0);
//   const [documentsCount, setDocumentsCount] = useState(0);
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [budget, setBudget] = useState('');
//   const [academicYear, setAcademicYear] = useState('');
//   const [accommodation, setAccommodation] = useState('');
//   const [showSummary, setShowSummary] = useState(false);

//   const studyFields = [
//     { id: 'medicine', name: 'Medicine and Health', icon: '🏥', description: 'Study programs in medical and health fields' },
//     { id: 'engineering', name: 'Engineering and Technology', icon: '⚙️', description: 'Study programs in engineering and technology' },
//     { id: 'business', name: 'Business and Management', icon: '💼', description: 'Study programs in business and management' },
//     { id: 'arts', name: 'Arts and Humanities', icon: '🎨', description: 'Study programs in arts and humanities' },
//     { id: 'science', name: 'Science and Research', icon: '🔬', description: 'Study programs in science and research' },
//     { id: 'law', name: 'Law and International Relations', icon: '⚖️', description: 'Study programs in law and international relations' }
//   ];

//   const degrees = [
//     { id: 'bachelor', name: 'Bachelor', duration: '3-4 years', description: 'First level of university studies' },
//     { id: 'master', name: 'Master', duration: '1-2 years', description: 'Postgraduate specialization studies' },
//     { id: 'phd', name: 'PhD', duration: '3-4 years', description: 'Advanced research studies' }
//   ];

//   const languages = [
//     { id: 'english', name: 'English', level: 'B2/C1', description: 'Study programs in English' },
//     { id: 'romanian', name: 'Romanian', level: 'B2/C1', description: 'Study programs in Romanian' },
//     { id: 'russian', name: 'Russian', level: 'B2/C1', description: 'Study programs in Russian' }
//   ];

//   const accommodationOptions = [
//     { id: 'dormitory', name: 'Student Dormitory', description: 'Accommodation in student dormitory' },
//     { id: 'apartment', name: 'Private Apartment', description: 'Accommodation in private apartment' },
//     { id: 'hostel', name: 'Hostel', description: 'Accommodation in hostel' }
//   ];

//   useEffect(() => {
//     const fetchUserData = async () => {
//       if (!user) return;
      
//       try {
//         setLoading(true);
//         const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
//           headers: getAuthHeaders()
//         });
        
//         if (response.data.success) {
//           setUserData(response.data.user);
          
//           // Calculate profile progress
//           const requiredFields = ['name', 'email', 'phone', 'date_of_birth', 'country_of_origin', 'nationality'];
//           const filledFields = requiredFields.filter(field => response.data.user[field]);
//           const progress = (filledFields.length / requiredFields.length) * 100;
//           setProfileProgress(Math.round(progress));
          
//           // Set existing values
//           if (response.data.user.desired_study_level) {
//             setSelectedDegree(response.data.user.desired_study_level);
//           }
//           if (response.data.user.preferred_study_field) {
//             setSelectedField(response.data.user.preferred_study_field);
//           }
//           if (response.data.user.preferred_study_language) {
//             setSelectedLanguage(response.data.user.preferred_study_language);
//           }
//           if (response.data.user.estimated_budget) {
//             setBudget(response.data.user.estimated_budget);
//           }
//           if (response.data.user.desired_academic_year) {
//             setAcademicYear(response.data.user.desired_academic_year);
//           }
//           if (response.data.user.accommodation_preferences) {
//             setAccommodation(response.data.user.accommodation_preferences);
//           }
          
//           // Fetch user documents
//           try {
//             const documentsResponse = await axios.get(`${API_BASE_URL}/documents/user-documents`, {
//               headers: getAuthHeaders()
//             });
            
//             if (Array.isArray(documentsResponse.data)) {
//               const uploadedDocs = documentsResponse.data.filter(doc => doc.status === 'approved' || doc.status === 'pending');
//               setDocumentsCount(uploadedDocs.length);
//             }
//           } catch (docError) {
//             console.error('Error fetching documents:', docError);
//           }
//         }
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//         setError('Could not load user data');
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchUserData();
//   }, [user]);

//   const handleSavePlan = async () => {
//     if (!user) return;
    
//     try {
//       const planData = {
//         desired_study_level: selectedDegree,
//         preferred_study_field: selectedField,
//         desired_academic_year: academicYear,
//         preferred_study_language: selectedLanguage,
//         estimated_budget: budget,
//         accommodation_preferences: accommodation
//       };
      
//       const response = await axios.put(`${API_BASE_URL}/api/auth/update-profile`, planData, {
//         headers: getAuthHeaders()
//       });
      
//       if (response.data.success) {
//         alert('Study plan saved successfully!');
//         setShowSummary(false);
//       } else {
//         alert(response.data.message || 'Error saving study plan');
//       }
//     } catch (error) {
//       console.error('Error saving study plan:', error);
//       alert('Error saving study plan');
//     }
//   };

//   const renderProfileProgress = () => {
//     if (!user) return null;

//     return (
//       <div className="profile-progress-container">
//         <div className="profile-progress-header">
//           <h3>Your Profile Progress</h3>
//           <span className="progress-percentage">{profileProgress}%</span>
//         </div>
//         <div className="profile-progress-bar">
//           <div 
//             className="profile-progress-fill"
//             style={{ width: `${profileProgress}%` }}
//           ></div>
//         </div>
//         <div className="profile-stats">
//           <div className="stat-item">
//             <span className="stat-icon">📄</span>
//             <span className="stat-label">Uploaded Documents:</span>
//             <span className="stat-value">{documentsCount}/3</span>
//           </div>
//           <div className="stat-item">
//             <span className="stat-icon">✅</span>
//             <span className="stat-label">Profile Completion:</span>
//             <span className="stat-value">{profileProgress}%</span>
//           </div>
//         </div>
//         {profileProgress < 100 && (
//           <div className="profile-actions">
//             <Link to="/profile" className="complete-profile-button">
//               Complete Profile
//             </Link>
//             <Link to="/documents" className="upload-documents-button">
//               Upload Documents
//             </Link>
//           </div>
//         )}
//       </div>
//     );
//   };

//   const renderStep = () => {
//     switch (selectedStep) {
//       case 1:
//         return (
//           <div className="plan-step">
//             <h2>Choose Study Field</h2>
//             <p>Select the field that interests you</p>
//             <div className="plan-grid">
//               {studyFields.map(field => (
//                 <div 
//                   key={field.id}
//                   className={`plan-card ${selectedField === field.id ? 'selected' : ''}`}
//                   onClick={() => {
//                     setSelectedField(field.id);
//                     setSelectedStep(2);
//                   }}
//                 >
//                   <span className="plan-icon">{field.icon}</span>
//                   <h3>{field.name}</h3>
//                   <p className="card-description">{field.description}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         );
//       case 2:
//         return (
//           <div className="plan-step">
//             <h2>Select Study Level</h2>
//             <p>Choose the type of degree you want to obtain</p>
//             <div className="plan-grid">
//               {degrees.map(degree => (
//                 <div 
//                   key={degree.id}
//                   className={`plan-card ${selectedDegree === degree.id ? 'selected' : ''}`}
//                   onClick={() => {
//                     setSelectedDegree(degree.id);
//                     setSelectedStep(3);
//                   }}
//                 >
//                   <h3>{degree.name}</h3>
//                   <p>Duration: {degree.duration}</p>
//                   <p className="card-description">{degree.description}</p>
//                 </div>
//               ))}
//             </div>
//             <button className="plan-back-button" onClick={() => setSelectedStep(1)}>
//               Back
//             </button>
//           </div>
//         );
//       case 3:
//         return (
//           <div className="plan-step">
//             <h2>Choose Study Language</h2>
//             <p>Select the language you want to study in</p>
//             <div className="plan-grid">
//               {languages.map(lang => (
//                 <div 
//                   key={lang.id}
//                   className={`plan-card ${selectedLanguage === lang.id ? 'selected' : ''}`}
//                   onClick={() => {
//                     setSelectedLanguage(lang.id);
//                     setSelectedStep(4);
//                   }}
//                 >
//                   <h3>{lang.name}</h3>
//                   <p>Required Level: {lang.level}</p>
//                   <p className="card-description">{lang.description}</p>
//                 </div>
//               ))}
//             </div>
//             <button className="plan-back-button" onClick={() => setSelectedStep(2)}>
//               Back
//             </button>
//           </div>
//         );
//       case 4:
//         return (
//           <div className="plan-step">
//             <h2>Additional Details</h2>
//             <p>Complete additional information about your study plan</p>
//             <div className="form-group">
//               <label>Desired Academic Year:</label>
//               <input 
//                 type="text" 
//                 value={academicYear} 
//                 onChange={(e) => setAcademicYear(e.target.value)}
//                 placeholder="ex: 2024-2025"
//               />
//             </div>
//             <div className="form-group">
//               <label>Estimated Budget (EUR):</label>
//               <input 
//                 type="number" 
//                 value={budget} 
//                 onChange={(e) => setBudget(e.target.value)}
//                 placeholder="ex: 5000"
//               />
//             </div>
//             <div className="form-group">
//               <label>Accommodation Preferences:</label>
//               <div className="accommodation-options">
//                 {accommodationOptions.map(option => (
//                   <div 
//                     key={option.id}
//                     className={`accommodation-option ${accommodation === option.id ? 'selected' : ''}`}
//                     onClick={() => setAccommodation(option.id)}
//                   >
//                     <h4>{option.name}</h4>
//                     <p>{option.description}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <div className="plan-actions">
//               <button className="plan-back-button" onClick={() => setSelectedStep(3)}>
//                 Back
//               </button>
//               <button className="plan-next-button" onClick={() => setSelectedStep(5)}>
//                 Continue
//               </button>
//             </div>
//           </div>
//         );
//       case 5:
//         return (
//           <div className="plan-step">
//             <h2>Study Plan Summary</h2>
//             <div className="plan-summary">
//               <div className="summary-item">
//                 <h3>Study Field</h3>
//                 <p>{studyFields.find(f => f.id === selectedField)?.name || 'Not specified'}</p>
//               </div>
//               <div className="summary-item">
//                 <h3>Study Level</h3>
//                 <p>{degrees.find(d => d.id === selectedDegree)?.name || 'Not specified'}</p>
//               </div>
//               <div className="summary-item">
//                 <h3>Study Language</h3>
//                 <p>{languages.find(l => l.id === selectedLanguage)?.name || 'Not specified'}</p>
//               </div>
//               <div className="summary-item">
//                 <h3>Academic Year</h3>
//                 <p>{academicYear || 'Not specified'}</p>
//               </div>
//               <div className="summary-item">
//                 <h3>Estimated Budget</h3>
//                 <p>{budget ? `${budget} EUR` : 'Not specified'}</p>
//               </div>
//               <div className="summary-item">
//                 <h3>Accommodation Preferences</h3>
//                 <p>{accommodationOptions.find(a => a.id === accommodation)?.name || 'Not specified'}</p>
//               </div>
//             </div>
//             <div className="plan-actions">
//               <button className="plan-back-button" onClick={() => setSelectedStep(4)}>
//                 Back
//               </button>
//               <button className="plan-save-button" onClick={handleSavePlan}>
//                 Save Plan
//               </button>
//               <Link to="/programs" className="plan-next-button">
//                 Find Matching Programs
//               </Link>
//             </div>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   const renderUnauthenticatedContent = () => {
//     return (
//       <div className="unauthenticated-content">
//         <div className="unauthenticated-header">
//           <h2>Start Your Journey Today</h2>
//           <p>Create an account or sign in to start planning your studies in Moldova</p>
//         </div>
//         <div className="unauthenticated-actions">
//           <Link to="/sign-up" className="sign-up-button">
//             Create Account
//           </Link>
//           <Link to="/sign-in" className="sign-in-button">
//             Sign In
//           </Link>
//         </div>
//       </div>
//     );
//   };

//   if (!user) {
//     return (
//       <div className="plan-your-studies-container">
//         <Helmet>
//           <title>Plan Your Studies - Study In Moldova</title>
//           <meta property="og:title" content="Plan Your Studies - Study In Moldova" />
//         </Helmet>
//         <Navbar rootClassName="navbar-root-class-name" />
//         <div className="plan-your-studies-content">
//           {renderUnauthenticatedContent()}
//         </div>
//         <Footer rootClassName="footer-root-class-name" />
//       </div>
//     );
//   }

//   return (
//     <div className="plan-your-studies-container">
//       <Helmet>
//         <title>Plan Your Studies - Study In Moldova</title>
//         <meta property="og:title" content="Plan Your Studies - Study In Moldova" />
//       </Helmet>
//       <Navbar rootClassName="navbar-root-class-name" />
//       <div className="plan-your-studies-content">
//         {renderProfileProgress()}
//         <div className="plan-header">
//           <h1>Plan Your Studies</h1>
//           <p>Follow these steps to find the perfect study program for you</p>
//         </div>

//         <div className="plan-progress">
//           <div className={`progress-step ${selectedStep >= 1 ? 'active' : ''}`}>
//             <span className="step-number">1</span>
//             <span className="step-label">Field</span>
//           </div>
//           <div className={`progress-step ${selectedStep >= 2 ? 'active' : ''}`}>
//             <span className="step-number">2</span>
//             <span className="step-label">Level</span>
//           </div>
//           <div className={`progress-step ${selectedStep >= 3 ? 'active' : ''}`}>
//             <span className="step-number">3</span>
//             <span className="step-label">Language</span>
//           </div>
//           <div className={`progress-step ${selectedStep >= 4 ? 'active' : ''}`}>
//             <span className="step-number">4</span>
//             <span className="step-label">Details</span>
//           </div>
//           <div className={`progress-step ${selectedStep >= 5 ? 'active' : ''}`}>
//             <span className="step-number">5</span>
//             <span className="step-label">Summary</span>
//           </div>
//         </div>

//         <div className="plan-main">
//           {loading ? (
//             <div className="loading">Loading...</div>
//           ) : error ? (
//             <div className="error">{error}</div>
//           ) : (
//             renderStep()
//           )}
//         </div>

//         <div className="plan-info">
//           <h2>Need Help?</h2>
//           <p>Our team is here to help you choose the right program. Contact us for personalized guidance.</p>
//           <Link to="/contact" className="plan-contact-button">
//             Contact Us
//           </Link>
//         </div>
//       </div>
//       <Footer rootClassName="footer-root-class-name" />
//     </div>
//   );
// };

// export default PlanYourStudies; 