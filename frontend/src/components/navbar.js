import React, { Fragment, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import './navbar.css'

const Navbar = (props) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      navigate('/');
    }
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
            <Link to="/living-in-moldova" className="navbar-text11">
              <span className="navbar-text35">Living In Moldova</span>
            </Link>
            <span className="navbar-text12">
              <span className="navbar-text23">Plan Your Studies</span>
            </span>
            <Link to="/universities" className="navbar-text13">
              <span className="navbar-text32">Universities</span>
            </Link>
            <Link to="/programms" className="navbar-text14">
              <span className="navbar-text29">Programmes</span>
            </Link>
            <span className="navbar-text15">
              <span className="navbar-text30">Help You Choose</span>
            </span>
          </nav>
          <div className="navbar-buttons1">
            {user ? (
              <>
                <button className="navbar-login1 button">
                  <Link to="/profile" className="navbar-navlink1">
                    <span className="navbar-text37">Profile</span>
                  </Link>
                </button>
                {user.role === 'admin' && (
                  <button className="navbar-login1 button">
                    <Link to="/admin" className="navbar-navlink1">
                      <span className="navbar-text37">Admin</span>
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
                  <Link to="/sign-in" className="navbar-navlink1">
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

        {/* Meniul mobil trebuie actualizat similar */}
        <div data-thq="thq-burger-menu" className="navbar-burger-menu">
          <svg viewBox="0 0 1024 1024" className="navbar-icon10">
            <path d="M128 554.667h768c23.552 0 42.667-19.115 42.667-42.667s-19.115-42.667-42.667-42.667h-768c-23.552 0-42.667 19.115-42.667 42.667s19.115 42.667 42.667 42.667zM128 298.667h768c23.552 0 42.667-19.115 42.667-42.667s-19.115-42.667-42.667-42.667h-768c-23.552 0-42.667 19.115-42.667 42.667s19.115 42.667 42.667 42.667zM128 810.667h768c23.552 0 42.667-19.115 42.667-42.667s-19.115-42.667-42.667-42.667h-768c-23.552 0-42.667 19.115-42.667 42.667s19.115 42.667 42.667 42.667z"></path>
          </svg>
        </div>
        <div data-thq="thq-mobile-menu" className="navbar-mobile-menu">
          <div className="navbar-nav">
            <div className="navbar-top">
              <img
                alt={props.logoAlt}
                src={props.logoSrc}
                className="navbar-logo"
              />
              <div data-thq="thq-close-menu" className="navbar-close-menu">
                <svg viewBox="0 0 1024 1024" className="navbar-icon12">
                  <path d="M810 274l-238 238 238 238-60 60-238-238-238 238-60-60 238-238-238-238 60-60 238 238 238-238z"></path>
                </svg>
              </div>
            </div>
            <nav className="navbar-links2">
              {/* ... restul linkurilor mobile ... */}
            </nav>
            <div className="navbar-buttons2">
              {user ? (
                <>
                  <button className="navbar-login2 button">
                    <Link to="/profile">
                      <span className="navbar-text34">{user.name}</span>
                    </Link>
                  </button>
                  <button className="button" onClick={handleLogout}>
                    <span className="navbar-text31">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button className="navbar-login2 button">
                    <Link to="/sign-in">
                      <span className="navbar-text34">Login</span>
                    </Link>
                  </button>
                  <button className="button">
                    <Link to="/sign-up">
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
  text6: undefined,
  text16: undefined,
  logoSrc: 'https://presentation-website-assets.teleporthq.io/logos/logo.png',
  rootClassName: '',
  text: undefined,
  text13: undefined,
  text15: undefined,
  text14: undefined,
  text3: undefined,
  text4: undefined,
  register1: undefined,
  text5: undefined,
  register: undefined,
  logoAlt: 'image',
  login1: undefined,
  text2: undefined,
  text12: undefined,
  login: undefined,
}

Navbar.propTypes = {
  text6: PropTypes.element,
  text16: PropTypes.element,
  logoSrc: PropTypes.string,
  rootClassName: PropTypes.string,
  text: PropTypes.element,
  text13: PropTypes.element,
  text15: PropTypes.element,
  text14: PropTypes.element,
  text3: PropTypes.element,
  text4: PropTypes.element,
  register1: PropTypes.element,
  text5: PropTypes.element,
  register: PropTypes.element,
  logoAlt: PropTypes.string,
  login1: PropTypes.element,
  text2: PropTypes.element,
  text12: PropTypes.element,
  login: PropTypes.element,
}

export default Navbar
