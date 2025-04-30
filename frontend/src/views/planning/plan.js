import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../../config/api.config';
import './plan.css';

const PlanYourStudies = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedStep, setSelectedStep] = useState(1);
  const [selectedField, setSelectedField] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [profileProgress, setProfileProgress] = useState(0);
  const [documentsCount, setDocumentsCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [budget, setBudget] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [accommodation, setAccommodation] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  const studyFields = [
    { id: 'medicine', name: 'Medicină și Sănătate', icon: '🏥', description: 'Programe de studiu în domeniul medical și al sănătății' },
    { id: 'engineering', name: 'Inginerie și Tehnologie', icon: '⚙️', description: 'Programe de studiu în domeniul ingineriei și tehnologiei' },
    { id: 'business', name: 'Business și Management', icon: '💼', description: 'Programe de studiu în domeniul business-ului și managementului' },
    { id: 'arts', name: 'Arte și Umanități', icon: '🎨', description: 'Programe de studiu în domeniul artelor și al umanităților' },
    { id: 'science', name: 'Știință și Cercetare', icon: '🔬', description: 'Programe de studiu în domeniul științelor și al cercetării' },
    { id: 'law', name: 'Drept și Relații Internaționale', icon: '⚖️', description: 'Programe de studiu în domeniul dreptului și al relațiilor internaționale' }
  ];

  const degrees = [
    { id: 'bachelor', name: 'Licență', duration: '3-4 ani', description: 'Primul nivel de studii universitare' },
    { id: 'master', name: 'Masterat', duration: '1-2 ani', description: 'Studii postuniversitare de specializare' },
    { id: 'phd', name: 'Doctorat', duration: '3-4 ani', description: 'Studii avansate de cercetare' }
  ];

  const languages = [
    { id: 'english', name: 'Engleză', level: 'B2/C1', description: 'Programe de studiu în limba engleză' },
    { id: 'romanian', name: 'Română', level: 'B2/C1', description: 'Programe de studiu în limba română' },
    { id: 'russian', name: 'Rusă', level: 'B2/C1', description: 'Programe de studiu în limba rusă' }
  ];

  const accommodationOptions = [
    { id: 'dormitory', name: 'Camin studențesc', description: 'Cazare în căminul studențesc' },
    { id: 'apartment', name: 'Apartament privat', description: 'Cazare în apartament privat' },
    { id: 'hostel', name: 'Hostel', description: 'Cazare în hostel' }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: getAuthHeaders()
        });
        
        if (response.data.success) {
          setUserData(response.data.user);
          
          // Calculăm progresul profilului
          const requiredFields = ['name', 'email', 'phone', 'date_of_birth', 'country_of_origin', 'nationality'];
          const filledFields = requiredFields.filter(field => response.data.user[field]);
          const progress = (filledFields.length / requiredFields.length) * 100;
          setProfileProgress(Math.round(progress));
          
          // Setăm valorile existente
          if (response.data.user.desired_study_level) {
            setSelectedDegree(response.data.user.desired_study_level);
          }
          if (response.data.user.preferred_study_field) {
            setSelectedField(response.data.user.preferred_study_field);
          }
          if (response.data.user.preferred_study_language) {
            setSelectedLanguage(response.data.user.preferred_study_language);
          }
          if (response.data.user.estimated_budget) {
            setBudget(response.data.user.estimated_budget);
          }
          if (response.data.user.desired_academic_year) {
            setAcademicYear(response.data.user.desired_academic_year);
          }
          if (response.data.user.accommodation_preferences) {
            setAccommodation(response.data.user.accommodation_preferences);
          }
          
          // Preluăm documentele utilizatorului
          try {
            const documentsResponse = await axios.get(`${API_BASE_URL}/documents/user-documents`, {
              headers: getAuthHeaders()
            });
            
            if (Array.isArray(documentsResponse.data)) {
              const uploadedDocs = documentsResponse.data.filter(doc => doc.status === 'approved' || doc.status === 'pending');
              setDocumentsCount(uploadedDocs.length);
            }
          } catch (docError) {
            console.error('Error fetching documents:', docError);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Nu s-au putut încărca datele utilizatorului');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  const handleSavePlan = async () => {
    if (!user) return;
    
    try {
      const planData = {
        desired_study_level: selectedDegree,
        preferred_study_field: selectedField,
        desired_academic_year: academicYear,
        preferred_study_language: selectedLanguage,
        estimated_budget: budget,
        accommodation_preferences: accommodation
      };
      
      const response = await axios.put(`${API_BASE_URL}/api/auth/update-profile`, planData, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        alert('Planul de studii a fost salvat cu succes!');
        setShowSummary(false);
      } else {
        alert(response.data.message || 'Eroare la salvarea planului de studii');
      }
    } catch (error) {
      console.error('Error saving study plan:', error);
      alert('Eroare la salvarea planului de studii');
    }
  };

  const renderProfileProgress = () => {
    if (!user) return null;

    return (
      <div className="profile-progress-container">
        <div className="profile-progress-header">
          <h3>Progresul Profilului Tău</h3>
          <span className="progress-percentage">{profileProgress}%</span>
        </div>
        <div className="profile-progress-bar">
          <div 
            className="profile-progress-fill"
            style={{ width: `${profileProgress}%` }}
          ></div>
        </div>
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-icon">📄</span>
            <span className="stat-label">Documente Încărcate:</span>
            <span className="stat-value">{documentsCount}/3</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">✅</span>
            <span className="stat-label">Completare Profil:</span>
            <span className="stat-value">{profileProgress}%</span>
          </div>
        </div>
        {profileProgress < 100 && (
          <div className="profile-actions">
            <Link to="/profile" className="complete-profile-button">
              Completează Profilul
            </Link>
            <Link to="/documents" className="upload-documents-button">
              Încarcă Documente
            </Link>
          </div>
        )}
      </div>
    );
  };

  const renderStep = () => {
    switch (selectedStep) {
      case 1:
        return (
          <div className="plan-step">
            <h2>Alege Domeniul de Studiu</h2>
            <p>Selectează domeniul care te interesează</p>
            <div className="plan-grid">
              {studyFields.map(field => (
                <div 
                  key={field.id}
                  className={`plan-card ${selectedField === field.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedField(field.id);
                    setSelectedStep(2);
                  }}
                >
                  <span className="plan-icon">{field.icon}</span>
                  <h3>{field.name}</h3>
                  <p className="card-description">{field.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="plan-step">
            <h2>Selectează Nivelul de Studii</h2>
            <p>Alege tipul de diplomă pe care dorești să o obții</p>
            <div className="plan-grid">
              {degrees.map(degree => (
                <div 
                  key={degree.id}
                  className={`plan-card ${selectedDegree === degree.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedDegree(degree.id);
                    setSelectedStep(3);
                  }}
                >
                  <h3>{degree.name}</h3>
                  <p>Durată: {degree.duration}</p>
                  <p className="card-description">{degree.description}</p>
                </div>
              ))}
            </div>
            <button className="plan-back-button" onClick={() => setSelectedStep(1)}>
              Înapoi
            </button>
          </div>
        );
      case 3:
        return (
          <div className="plan-step">
            <h2>Alege Limba de Studiu</h2>
            <p>Selectează limba în care dorești să studiezi</p>
            <div className="plan-grid">
              {languages.map(lang => (
                <div 
                  key={lang.id}
                  className={`plan-card ${selectedLanguage === lang.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedLanguage(lang.id);
                    setSelectedStep(4);
                  }}
                >
                  <h3>{lang.name}</h3>
                  <p>Nivel Cerut: {lang.level}</p>
                  <p className="card-description">{lang.description}</p>
                </div>
              ))}
            </div>
            <button className="plan-back-button" onClick={() => setSelectedStep(2)}>
              Înapoi
            </button>
          </div>
        );
      case 4:
        return (
          <div className="plan-step">
            <h2>Detalii Suplimentare</h2>
            <p>Completează informațiile suplimentare despre planul tău de studii</p>
            <div className="form-group">
              <label>Anul Academic Dorit:</label>
              <input 
                type="text" 
                value={academicYear} 
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="ex: 2024-2025"
              />
            </div>
            <div className="form-group">
              <label>Buget Estimativ (EUR):</label>
              <input 
                type="number" 
                value={budget} 
                onChange={(e) => setBudget(e.target.value)}
                placeholder="ex: 5000"
              />
            </div>
            <div className="form-group">
              <label>Preferințe de Cazare:</label>
              <div className="accommodation-options">
                {accommodationOptions.map(option => (
                  <div 
                    key={option.id}
                    className={`accommodation-option ${accommodation === option.id ? 'selected' : ''}`}
                    onClick={() => setAccommodation(option.id)}
                  >
                    <h4>{option.name}</h4>
                    <p>{option.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="plan-actions">
              <button className="plan-back-button" onClick={() => setSelectedStep(3)}>
                Înapoi
              </button>
              <button className="plan-next-button" onClick={() => setSelectedStep(5)}>
                Continuă
              </button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="plan-step">
            <h2>Rezumatul Planului de Studii</h2>
            <div className="plan-summary">
              <div className="summary-item">
                <h3>Domeniul de Studiu</h3>
                <p>{studyFields.find(f => f.id === selectedField)?.name || 'Nespecificat'}</p>
              </div>
              <div className="summary-item">
                <h3>Nivelul de Studii</h3>
                <p>{degrees.find(d => d.id === selectedDegree)?.name || 'Nespecificat'}</p>
              </div>
              <div className="summary-item">
                <h3>Limba de Studiu</h3>
                <p>{languages.find(l => l.id === selectedLanguage)?.name || 'Nespecificat'}</p>
              </div>
              <div className="summary-item">
                <h3>Anul Academic</h3>
                <p>{academicYear || 'Nespecificat'}</p>
              </div>
              <div className="summary-item">
                <h3>Buget Estimativ</h3>
                <p>{budget ? `${budget} EUR` : 'Nespecificat'}</p>
              </div>
              <div className="summary-item">
                <h3>Preferințe de Cazare</h3>
                <p>{accommodationOptions.find(a => a.id === accommodation)?.name || 'Nespecificat'}</p>
              </div>
            </div>
            <div className="plan-actions">
              <button className="plan-back-button" onClick={() => setSelectedStep(4)}>
                Înapoi
              </button>
              <button className="plan-save-button" onClick={handleSavePlan}>
                Salvează Planul
              </button>
              <Link to="/programs" className="plan-next-button">
                Găsește Programe Potrivite
              </Link>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderUnauthenticatedContent = () => {
    return (
      <div className="unauthenticated-content">
        <div className="unauthenticated-header">
          <h2>Începe Călătoria Ta Astăzi</h2>
          <p>Creează un cont sau autentifică-te pentru a începe planificarea studiilor tale în Moldova</p>
        </div>
        <div className="unauthenticated-actions">
          <Link to="/sign-up" className="sign-up-button">
            Creează Cont
          </Link>
          <Link to="/sign-in" className="sign-in-button">
            Autentifică-te
          </Link>
        </div>
      </div>
    );
  };

  // Dacă utilizatorul nu este autentificat, afișăm doar conținutul neautentificat
  if (!user) {
    return (
      <div className="plan-your-studies-container">
        <Helmet>
          <title>Planifică Studiile Tale - Study In Moldova</title>
          <meta property="og:title" content="Planifică Studiile Tale - Study In Moldova" />
        </Helmet>
        <Navbar rootClassName="navbar-root-class-name" />
        <div className="plan-your-studies-content">
          {renderUnauthenticatedContent()}
        </div>
        <Footer rootClassName="footer-root-class-name" />
      </div>
    );
  }

  // Dacă utilizatorul este autentificat, afișăm conținutul complet
  return (
    <div className="plan-your-studies-container">
      <Helmet>
        <title>Planifică Studiile Tale - Study In Moldova</title>
        <meta property="og:title" content="Planifică Studiile Tale - Study In Moldova" />
      </Helmet>
      <Navbar rootClassName="navbar-root-class-name" />
      <div className="plan-your-studies-content">
        {renderProfileProgress()}
        <div className="plan-header">
          <h1>Planifică Studiile Tale</h1>
          <p>Urmează acești pași pentru a găsi programul de studiu perfect pentru tine</p>
        </div>

        <div className="plan-progress">
          <div className={`progress-step ${selectedStep >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Domeniu</span>
          </div>
          <div className={`progress-step ${selectedStep >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Nivel</span>
          </div>
          <div className={`progress-step ${selectedStep >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Limbă</span>
          </div>
          <div className={`progress-step ${selectedStep >= 4 ? 'active' : ''}`}>
            <span className="step-number">4</span>
            <span className="step-label">Detalii</span>
          </div>
          <div className={`progress-step ${selectedStep >= 5 ? 'active' : ''}`}>
            <span className="step-number">5</span>
            <span className="step-label">Rezumat</span>
          </div>
        </div>

        <div className="plan-main">
          {loading ? (
            <div className="loading">Se încarcă...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            renderStep()
          )}
        </div>

        <div className="plan-info">
          <h2>Ai Nevoie de Ajutor?</h2>
          <p>Echipa noastră este aici pentru a te ajuta să alegi programul potrivit. Contactează-ne pentru ghidare personalizată.</p>
          <Link to="/contact" className="plan-contact-button">
            Contactează-ne
          </Link>
        </div>
      </div>
      <Footer rootClassName="footer-root-class-name" />
    </div>
  );
};

export default PlanYourStudies; 