import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import './plan-your-studies.css';

const PlanYourStudies = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedStep, setSelectedStep] = useState(1);
  const [selectedField, setSelectedField] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [profileProgress, setProfileProgress] = useState(0);
  const [documentsCount, setDocumentsCount] = useState(0);

  const studyFields = [
    { id: 'medicine', name: 'Medicine & Healthcare', icon: '🏥' },
    { id: 'engineering', name: 'Engineering & Technology', icon: '⚙️' },
    { id: 'business', name: 'Business & Management', icon: '💼' },
    { id: 'arts', name: 'Arts & Humanities', icon: '🎨' },
    { id: 'science', name: 'Science & Research', icon: '🔬' },
    { id: 'law', name: 'Law & International Relations', icon: '⚖️' }
  ];

  const degrees = [
    { id: 'bachelor', name: 'Bachelor\'s Degree', duration: '3-4 years' },
    { id: 'master', name: 'Master\'s Degree', duration: '1-2 years' },
    { id: 'phd', name: 'PhD', duration: '3-4 years' }
  ];

  const languages = [
    { id: 'english', name: 'English', level: 'B2/C1' },
    { id: 'romanian', name: 'Romanian', level: 'B2/C1' },
    { id: 'russian', name: 'Russian', level: 'B2/C1' }
  ];

  useEffect(() => {
    if (user) {
      // Calculăm progresul profilului
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'country'];
      const filledFields = requiredFields.filter(field => user[field]);
      const progress = (filledFields.length / requiredFields.length) * 100;
      setProfileProgress(Math.round(progress));

      // Obținem numărul de documente încărcate
      // Aici ar trebui să facem un apel la API pentru a obține numărul real
      setDocumentsCount(0); // Temporar setat la 0
    }
  }, [user]);

  const renderProfileProgress = () => {
    if (!user) return null;

    return (
      <div className="profile-progress-container">
        <div className="profile-progress-header">
          <h3>Your Profile Progress</h3>
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
            <span className="stat-label">Documents Uploaded:</span>
            <span className="stat-value">{documentsCount}/3</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">✅</span>
            <span className="stat-label">Profile Completion:</span>
            <span className="stat-value">{profileProgress}%</span>
          </div>
        </div>
        {profileProgress < 100 && (
          <div className="profile-actions">
            <Link to="/profile" className="complete-profile-button">
              Complete Your Profile
            </Link>
            <Link to="/documents" className="upload-documents-button">
              Upload Documents
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
            <h2>Choose Your Field of Study</h2>
            <p>Select the area you're interested in pursuing</p>
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
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="plan-step">
            <h2>Select Your Degree Level</h2>
            <p>Choose the type of degree you want to pursue</p>
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
                  <p>Duration: {degree.duration}</p>
                </div>
              ))}
            </div>
            <button className="plan-back-button" onClick={() => setSelectedStep(1)}>
              Back
            </button>
          </div>
        );
      case 3:
        return (
          <div className="plan-step">
            <h2>Choose Your Language</h2>
            <p>Select the language you want to study in</p>
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
                  <p>Required Level: {lang.level}</p>
                </div>
              ))}
            </div>
            <button className="plan-back-button" onClick={() => setSelectedStep(2)}>
              Back
            </button>
          </div>
        );
      case 4:
        return (
          <div className="plan-step">
            <h2>Your Study Plan Summary</h2>
            <div className="plan-summary">
              <div className="summary-item">
                <h3>Field of Study</h3>
                <p>{studyFields.find(f => f.id === selectedField)?.name}</p>
              </div>
              <div className="summary-item">
                <h3>Degree Level</h3>
                <p>{degrees.find(d => d.id === selectedDegree)?.name}</p>
              </div>
              <div className="summary-item">
                <h3>Language</h3>
                <p>{languages.find(l => l.id === selectedLanguage)?.name}</p>
              </div>
            </div>
            <div className="plan-actions">
              <button className="plan-back-button" onClick={() => setSelectedStep(3)}>
                Back
              </button>
              <Link to="/programms" className="plan-next-button">
                Find Matching Programs
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
          <h2>Begin Your Journey Today</h2>
          <p>Create an account or sign in to start planning your studies in Moldova</p>
        </div>
        <div className="unauthenticated-actions">
          <Link to="/sign-up" className="sign-up-button">
            Create Account
          </Link>
          <Link to="/sign-in" className="sign-in-button">
            Sign In
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
          <title>Plan Your Studies - Study In Moldova</title>
          <meta property="og:title" content="Plan Your Studies - Study In Moldova" />
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
        <title>Plan Your Studies - Study In Moldova</title>
        <meta property="og:title" content="Plan Your Studies - Study In Moldova" />
      </Helmet>
      <Navbar rootClassName="navbar-root-class-name" />
      <div className="plan-your-studies-content">
        {renderProfileProgress()}
        <div className="plan-header">
          <h1>Plan Your Studies</h1>
          <p>Follow these steps to find the perfect study program for you</p>
        </div>

        <div className="plan-progress">
          <div className={`progress-step ${selectedStep >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Field</span>
          </div>
          <div className={`progress-step ${selectedStep >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Degree</span>
          </div>
          <div className={`progress-step ${selectedStep >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Language</span>
          </div>
          <div className={`progress-step ${selectedStep >= 4 ? 'active' : ''}`}>
            <span className="step-number">4</span>
            <span className="step-label">Summary</span>
          </div>
        </div>

        <div className="plan-main">
          {renderStep()}
        </div>

        <div className="plan-info">
          <h2>Need Help?</h2>
          <p>Our team is here to assist you in choosing the right program. Contact us for personalized guidance.</p>
          <Link to="/contact" className="plan-contact-button">
            Get in Touch
          </Link>
        </div>
      </div>
      <Footer rootClassName="footer-root-class-name" />
    </div>
  );
};

export default PlanYourStudies; 