import React, { Fragment, useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import './navbar.css'
import { useAuth } from '../context/AuthContext'

const Navbar = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/sign-in');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`navbar-container1 ${props.rootClassName} `}>
      <header data-thq="thq-navbar" className="navbar-navbar-interactive">
        <div className="navbar-container2">
          <Link to="/" className="navbar-text10">
            <span className="navbar-text25">Study In Moldova</span>
          </Link>
        </div>
        <div data-thq="thq-navbar-nav" className="navbar-desktop-menu">
          <nav className="navbar-links1">
            <Link to="/living-in-moldova" className={`navbar-text11 ${location.pathname === '/living-in-moldova' ? 'active' : ''}`}>
              <span className="navbar-text35">Living In Moldova</span>
            </Link>
            <Link to="/plan-your-studies" className={`navbar-text12 ${location.pathname === '/plan-your-studies' ? 'active' : ''}`}>
              <span className="navbar-text23">Plan Your Studies</span>
            </Link>
            <Link to="/universities" className={`navbar-text13 ${location.pathname === '/universities' ? 'active' : ''}`}>
              <span className="navbar-text32">Universities</span>
            </Link>
            <Link to="/programs" className={`navbar-text14 ${location.pathname === '/programs' ? 'active' : ''}`}>
              <span className="navbar-text29">Programmes</span>
            </Link>
            <Link to="/help-you-choose-AI" className={`navbar-text15 ${location.pathname === '/help-you-choose-AI' ? 'active' : ''}`}>
              <span className="navbar-text30">Help You Choose AI</span>
            </Link>
          </nav>
          <div className="navbar-buttons1">
            {isAuthenticated && user ? (
              <>
                {user.role === 'admin' && (
                  <>
                    <button className="navbar-login1 button">
                      <Link to="/dashboard" className={`navbar-navlink1 ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                        Dashboard
                      </Link>
                    </button>
                    <button className="navbar-login1 button">
                      <Link to="/admin-profile" className={`navbar-navlink1 ${location.pathname === '/admin-profile' ? 'active' : ''}`}>
                        Admin Profile
                      </Link>
                    </button>
                  </>
                )}
                {user.role !== 'admin' && (
                  <Link to="/profile" className={`navbar-navlink1 ${location.pathname === '/profile' ? 'active' : ''}`}>
                    <button className="navbar-login1 button">
                      <span className="navbar-text37">Profile</span>
                    </button>
                  </Link>
                )}
                <button className="button" onClick={handleLogout}>
                  <span className="navbar-text33">Logout</span>
                </button>
              </>
            ) : (
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
            <Link to="/living-in-moldova" className="navbar-text16" onClick={toggleMenu}>
              <span className="navbar-text36">Living In Moldova</span>
            </Link>
            <Link to="/plan-your-studies" className="navbar-text17" onClick={toggleMenu}>
              <span className="navbar-text24">Plan Your Studies</span>
            </Link>
            <Link to="/universities" className="navbar-text18" onClick={toggleMenu}>
              <span className="navbar-text31">Universities</span>
            </Link>
            <Link to="/programs" className="navbar-text19" onClick={toggleMenu}>
              <span className="navbar-text28">Programmes</span>
            </Link>
            <Link to="/help-you-choose-AI" className="navbar-text20" onClick={toggleMenu}>
              <span className="navbar-text27">Help You Choose AI</span>
            </Link>
          </nav>
          <div className="navbar-buttons2">
            {isAuthenticated && user ? (
              <>
                {user.role === 'admin' && (
                  <>
                    <button className="navbar-login2 button">
                      <Link to="/dashboard" className="navbar-navlink3" onClick={toggleMenu}>
                        Dashboard
                      </Link>
                    </button>
                    <button className="navbar-login2 button">
                      <Link to="/admin-profile" className="navbar-navlink3" onClick={toggleMenu}>
                        Admin Profile
                      </Link>
                    </button>
                  </>
                )}
                {user.role !== 'admin' && (
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
            ) : (
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
