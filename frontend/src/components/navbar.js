import React, { Fragment, useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import './navbar.css'
import axios from 'axios'
import { API_BASE_URL } from '../config/api.config'

const Navbar = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token && user) {
      setIsAuthenticated(true);
      setUserRole(user.role);
      setUser(user);
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
      setUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null);
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
            <Link to="/programms" className={`navbar-text14 ${location.pathname === '/programms' ? 'active' : ''}`}>
              <span className="navbar-text29">Programmes</span>
            </Link>
            <span className="navbar-text15">
              <span className="navbar-text30">Help You Choose</span>
            </span>
          </nav>
          <div className="navbar-buttons1">
            {isAuthenticated && user ? (
              <>
                {userRole === 'admin' && (
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
                {userRole !== 'admin' && (
                  <button className="navbar-login1 button">
                    <Link to="/profile" className={`navbar-navlink1 ${location.pathname === '/profile' ? 'active' : ''}`}>
                      <span className="navbar-text37">Profile</span>
                    </Link>
                  </button>
                )}
                <button className="button" onClick={handleLogout}>
                  <span className="navbar-text33">Logout</span>
                </button>
              </>
            ) : (
              <>
                <button className="navbar-login1 button">
                  <Link to="/sign-in" className={`navbar-navlink1 ${location.pathname === '/sign-in' ? 'active' : ''}`}>
                    <span className="navbar-text37">Login</span>
                  </Link>
                </button>
                <button className="button">
                  <Link to="/sign-up" className="navbar-navlink2">
                    <span className="navbar-text33">Register</span>
                  </Link>
                </button>
              </>
            )}
          </div>
        </div>

        <div data-thq="thq-burger-menu" className="navbar-burger-menu" onClick={toggleMenu}>
          <img alt="menu" src="/playground_assets/menu.svg" className="navbar-icon10" />
        </div>
        <div data-thq="thq-mobile-menu" className={`navbar-mobile-menu ${isOpen ? 'active' : ''}`}>
          <div className="navbar-nav">
            <div className="navbar-top">
              <Link to="/" className="navbar-text10">
                <span className="navbar-text25">Study In Moldova</span>
              </Link>
              <div data-thq="thq-close-menu" className="navbar-close-menu" onClick={toggleMenu}>
                <svg viewBox="0 0 1024 1024" className="navbar-icon12">
                  <path d="M810 274l-238 238 238 238-60 60-238-238-238 238-60-60 238-238-238-238 60-60 238 238 238-238z"></path>
                </svg>
              </div>
            </div>
            <nav className="navbar-links2">
              <Link to="/living-in-moldova" className={`navbar-text16 ${location.pathname === '/living-in-moldova' ? 'active' : ''}`}>
                <span className="navbar-text35">Living In Moldova</span>
              </Link>
              <Link to="/plan-your-studies" className={`navbar-text17 ${location.pathname === '/plan-your-studies' ? 'active' : ''}`}>
                <span className="navbar-text23">Plan Your Studies</span>
              </Link>
              <Link to="/universities" className={`navbar-text18 ${location.pathname === '/universities' ? 'active' : ''}`}>
                <span className="navbar-text32">Universities</span>
              </Link>
              <Link to="/programms" className={`navbar-text19 ${location.pathname === '/programms' ? 'active' : ''}`}>
                <span className="navbar-text29">Programmes</span>
              </Link>
            </nav>
            <div className="navbar-buttons2">
              {isAuthenticated && user ? (
                <>
                  {userRole === 'admin' && (
                    <>
                      <button className="navbar-login2 button">
                        <Link to="/dashboard" className={`navbar-navlink2 ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                          Dashboard
                        </Link>
                      </button>
                      <button className="navbar-login2 button">
                        <Link to="/admin-profile" className={`navbar-navlink2 ${location.pathname === '/admin-profile' ? 'active' : ''}`}>
                          Admin Profile
                        </Link>
                      </button>
                    </>
                  )}
                  {userRole !== 'admin' && (
                    <button className="navbar-login2 button">
                      <Link to="/profile" className={`navbar-navlink2 ${location.pathname === '/profile' ? 'active' : ''}`}>
                        <span className="navbar-text34">Profile</span>
                      </Link>
                    </button>
                  )}
                  <button className="button" onClick={handleLogout}>
                    <span className="navbar-text31">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button className="navbar-login2 button">
                    <Link to="/sign-in" className={`navbar-navlink2 ${location.pathname === '/sign-in' ? 'active' : ''}`}>
                      <span className="navbar-text34">Login</span>
                    </Link>
                  </button>
                  <button className="button">
                    <Link to="/sign-up" className="navbar-navlink2">
                      <span className="navbar-text31">Register</span>
                    </Link>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}

Navbar.defaultProps = {
  rootClassName: '',
}

Navbar.propTypes = {
  rootClassName: PropTypes.string,
}

export default Navbar
