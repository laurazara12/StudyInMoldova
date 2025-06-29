import React, { Fragment, useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import './navbar.css'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL, getAuthHeaders } from '../config/api.config'
import { useTranslation } from 'react-i18next'

const Navbar = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { i18n } = useTranslation();

  const languages = [
    { code: 'ro', name: 'Română' },
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ru', name: 'Русский' },
    { code: 'fr', name: 'Français' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
    setShowLanguageDropdown(false);
  };

  const toggleLanguageDropdown = () => {
    setShowLanguageDropdown(!showLanguageDropdown);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/sign-in');
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <div className={`navbar-container1 ${props.rootClassName} `}>
      <header data-thq="thq-navbar" className="navbar-navbar-interactive">
        <div className="navbar-container2">
          <Link to="/" className="navbar-text10">
            <img src="/LogoStudyInMoldova.png" alt="Study In Moldova Logo" className="navbar-logo" />
            <span className="navbar-text25">Study In Moldova</span>
          </Link>
        </div>
        <div data-thq="thq-navbar-nav" className="navbar-desktop-menu">
          <nav className="navbar-links1">
            <Link to="/universities" className={`navbar-text13 ${location.pathname === '/universities' ? 'active' : ''}`}>
              <span className="navbar-text32">Universities</span>
            </Link>
            <Link to="/programs" className={`navbar-text14 ${location.pathname === '/programs' ? 'active' : ''}`}>
              <span className="navbar-text29">Programmes</span>
            </Link>
            <Link to="/living-in-moldova" className={`navbar-text11 ${location.pathname === '/living-in-moldova' ? 'active' : ''}`}>
              <span className="navbar-text35">Living In Moldova</span>
            </Link>
            <Link to="/blog" className={`navbar-text12 ${location.pathname === '/blog' ? 'active' : ''}`}>
              <span className="navbar-text23">Blog</span>
            </Link>
            <Link to="/about" className={`navbar-text15 ${location.pathname === '/about' ? 'active' : ''}`}>
              <span className="navbar-text30">About Us</span>
            </Link>
            <Link to="/help-you-choose-AI" className={`navbar-text15 ${location.pathname === '/help-you-choose-AI' ? 'active' : ''}`}>
              <span className="navbar-text30">Help You AI</span>
            </Link>
          </nav>
          <div className="navbar-buttons1">
            {isAuthenticated && user && (
              <>
                {isAdmin && (
                  <>
                    <button className="navbar-login1 button">
                      <Link to="/dashboard" className={`navbar-navlink1 ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                        Dashboard
                      </Link>
                    </button>
                  </>
                )}
                {!isAdmin && (
                  <Link to="/profile" className={`navbar-navlink1 ${location.pathname === '/profile' ? 'active' : ''}`}>
                    <button className="navbar-login1 button">
                      <span className="navbar-text37">Profile</span>
                    </button>
                  </Link>
                )}
                <button className="navbar-login1 button" onClick={handleLogout}>
                  <span className="navbar-text33">Logout</span>
                </button>
              </>
            )}
            {(!isAuthenticated || !user) && (
              <>
                <button className="navbar-login1 button">
                  <Link to="/sign-in" className={`navbar-navlink1 ${location.pathname === '/sign-in' ? 'active' : ''}`}>
                    <span className="navbar-text33">Login</span>
                  </Link>
                </button>
                <button className="navbar-register1 button">
                  <Link to="/sign-up" className={`navbar-navlink2 ${location.pathname === '/sign-up' ? 'active' : ''}`}>
                    <span className="navbar-text34">Register</span>
                  </Link>
                </button>
              </>
            )}
                        <div className="language-selector">
              <div 
                className={`language-dropdown ${showLanguageDropdown ? 'active' : ''}`}
                onClick={toggleLanguageDropdown}
              >
                {currentLanguage.code.toUpperCase()}
                
              </div>
              {showLanguageDropdown && (
                <div className="language-options">
                  {languages.map((lang) => (
                    <div
                      key={lang.code}
                      className={`lang-option ${i18n.language === lang.code ? 'active' : ''}`}
                      onClick={() => handleLanguageChange(lang.code)}
                    >
                      {lang.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="navbar-burger-menu">
          <button className="navbar-button button" onClick={toggleMenu}>
            <svg viewBox="0 0 1024 1024" className="navbar-icon">
              <path d="M128 256h768v86h-768v-86zM128 554v-84h768v84h-768zM128 768v-86h768v86h-768z"></path>
            </svg>
          </button>
        </div>
      </header>
      {isOpen && (
        <div className="navbar-mobile-menu">
          <nav className="navbar-links2">
            <Link to="/universities" className="navbar-text18" onClick={toggleMenu}>
              <span className="navbar-text31">Universities</span>
            </Link>
            <Link to="/programs" className="navbar-text19" onClick={toggleMenu}>
              <span className="navbar-text28">Programmes</span>
            </Link>
            <Link to="/living-in-moldova" className="navbar-text16" onClick={toggleMenu}>
              <span className="navbar-text36">Living In Moldova</span>
            </Link>
            <Link to="/blog" className="navbar-text17" onClick={toggleMenu}>
              <span className="navbar-text24">Blog</span>
            </Link>
            <Link to="/about" className="navbar-text20" onClick={toggleMenu}>
              <span className="navbar-text27">About Us</span>
            </Link>
            <Link to="/help-you-choose-AI" className="navbar-text20" onClick={toggleMenu}>
              <span className="navbar-text27">Help You Choose AI</span>
            </Link>
            {isAuthenticated && isAdmin && (
              <>
                <Link to="/admin/users" className="navbar-text21" onClick={toggleMenu}>Users</Link>
                <Link to="/admin/documents" className="navbar-text22" onClick={toggleMenu}>Documents</Link>
                <Link to="/admin/applications" className="navbar-text23" onClick={toggleMenu}>Applications</Link>
              </>
            )}
          </nav>
          <div className="navbar-buttons2">
            <div className="language-selector-mobile">
              <div 
                className={`language-dropdown ${showLanguageDropdown ? 'active' : ''}`}
                onClick={toggleLanguageDropdown}
              >
                {currentLanguage.name}
                <span>▼</span>
              </div>
              {showLanguageDropdown && (
                <div className="language-options">
                  {languages.map((lang) => (
                    <div
                      key={lang.code}
                      className={`lang-option ${i18n.language === lang.code ? 'active' : ''}`}
                      onClick={() => {
                        handleLanguageChange(lang.code);
                        toggleMenu();
                      }}
                    >
                      {lang.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {isAuthenticated && user && (
              <>
                {isAdmin && (
                  <>
                    <button className="navbar-login2 button">
                      <Link to="/dashboard" className="navbar-navlink3" onClick={toggleMenu}>
                        Dashboard
                      </Link>
                    </button>
                  </>
                )}
                {!isAdmin && (
                  <Link to="/profile" className={`navbar-navlink3 ${location.pathname === '/profile' ? 'active' : ''}`}>
                    <button className="navbar-login2 button">
                      <span className="navbar-text38">Profile</span>
                    </button>
                  </Link>
                )}
                <button className="button" onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}>
                  <span className="navbar-text33">Logout</span>
                </button>
              </>
            )}
            {(!isAuthenticated || !user) && (
              <>
                <button className="navbar-login2 button">
                  <Link to="/sign-in" className="navbar-navlink3" onClick={toggleMenu}>
                    <span className="navbar-text33">Login</span>
                  </Link>
                </button>
                <button className="navbar-register2 button">
                  <Link to="/sign-up" className="navbar-navlink4" onClick={toggleMenu}>
                    <span className="navbar-text34">Register</span>
                  </Link>
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Confirm Logout</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to logout?</p>
            </div>
            <div className="modal-buttons">
              <button className="cancel-button" onClick={cancelLogout}>
                Cancel
              </button>
              <button className="confirm-button" onClick={confirmLogout}>
                Yes, logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Navbar.defaultProps = {
  rootClassName: '',
}

Navbar.propTypes = {
  rootClassName: PropTypes.string,
}

export default Navbar
