import React, { Fragment, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import PropTypes from 'prop-types'
import './sign-in.css'
import { API_BASE_URL, handleApiError } from '../../../config/api.config'
import { useAuth } from '../../../contexts/AuthContext'
import { getCloudinaryImageUrl } from '../../../config/cloudinary'

const SignIn = (props) => {
  const [email, setEmail] = useState(() => {
    // Încercăm să preluăm email-ul salvat din localStorage
    return localStorage.getItem('lastEmail') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {      
      // Ne asigurăm că email-ul este un string
      const emailString = typeof email === 'string' ? email : email.email;
      
      const requestData = {
        email: emailString.trim(),
        password: password.trim()
      };
      
      const loginUrl = `${API_BASE_URL}/api/auth/login`;
      
      const response = await axios.post(loginUrl, requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Răspuns de la server:', response.data);

      // Verificăm structura răspunsului
      if (!response.data) {
        throw new Error('Răspuns gol de la server');
      }

      // Verificăm dacă răspunsul are structura corectă
      if (!response.data.success || !response.data.data) {
        throw new Error('Format răspuns invalid');
      }

      // Extragem datele din răspuns
      const { token, user: userData } = response.data.data;

      if (!token) {
        console.error('Răspuns server:', response.data);
        throw new Error('Token lipsă din răspunsul serverului');
      }

      if (!userData || !userData.id || !userData.email || !userData.role) {
        console.error('Date utilizator incomplete:', userData);
        throw new Error('Date utilizator incomplete');
      }

      console.log('Date primite de la server:', { userData, token });

      // Salvăm email-ul în localStorage pentru autentificări viitoare
      localStorage.setItem('lastEmail', emailString.trim());

      // Salvăm token-ul și datele utilizatorului în localStorage
      console.log('Încercăm să salvăm token-ul în localStorage...');
      localStorage.setItem('token', token);
      console.log('Token salvat în localStorage:', localStorage.getItem('token'));
      
      console.log('Încercăm să salvăm datele utilizatorului în localStorage...');
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Date utilizator salvate în localStorage:', localStorage.getItem('user'));

      // Autentificăm utilizatorul prin context
      await login(userData, token);
      
      // Redirecționăm utilizatorul în funcție de rol
      if (userData.role === 'admin') {
        console.log('Redirecționare către dashboard pentru admin');
        navigate('/dashboard');
      } else {
        console.log('Redirecționare către profil pentru utilizator');
        navigate('/profile');
      }
    } catch (error) {
      console.error('Eroare la autentificare:', error);
      
      if (error.response) {
        console.error('Detalii eroare:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        if (error.response.status === 401) {
          setError('Email sau parolă incorectă.');
        } else {
          setError(error.response.data?.message || 'A apărut o eroare în timpul autentificării.');
        }
      } else if (error.request) {
        console.error('Nu s-a primit răspuns de la server:', error.request);
        setError('Nu s-a putut conecta la server. Verificați conexiunea la internet.');
      } else {
        console.error('Eroare la configurarea cererii:', error.message);
        setError('A apărut o eroare în timpul comunicării cu serverul.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      setError('');
      setLoading(false);
    };
  }, []);

  return (
    <div className={`sign-in-container1 ${props.rootClassName} `}>
      <div className="sign-in-max-width thq-section-max-width">
        <div className="sign-in-container2">
          <img
            alt={props.image1Alt}
            src={getCloudinaryImageUrl('pexels-vadim-burdujan-207144379-18877978_akmeg5', { 
              width: 800, 
              height: 600, 
              crop: 'fill', 
              quality: 'auto:good',
              lazy: false
            })}
            className="sign-in-sign-up-image thq-img-ratio-4-6"
          />
        </div>
        <div className="sign-in-form-root thq-section-padding">
          <Link to="/" className="sign-in-navlink">
            <span className="sign-in-text10">Study in Moldova</span>
          </Link>
          <div className="sign-in-form1">
            <h2 className="sign-in-text11 thq-heading-2">
              {props.heading11 ?? (
                <Fragment>
                  <span className="sign-in-text19">
                    Autentificare în Study in Moldova
                  </span>
                </Fragment>
              )}
            </h2>
            <form className="sign-in-form2" onSubmit={handleSubmit}>
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              <div className="sign-in-email">
                <label
                  htmlFor="thq-sign-in-6-email"
                  className="thq-body-large sign-in-text12"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="thq-sign-in-6-email"
                  required={true}
                  placeholder="Adresa de email"
                  className="sign-in-textinput1 thq-input thq-body-large"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="sign-in-password">
                <div className="sign-in-textfield">
                  <div className="sign-in-container3">
                    <label
                      htmlFor="thq-sign-in-6-password"
                      className="thq-body-large sign-in-text13"
                    >
                      Parolă
                    </label>
                    <div className="sign-in-container4">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="thq-sign-in-6-password"
                        required={true}
                        placeholder="Parolă"
                        className="sign-in-textinput2 thq-input thq-body-large"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="sign-in-button3"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? "Ascunde" : "Arată"}
                      </button>
                    </div>
                  </div>
                </div>
                <Link
                  to="/forgot-password"
                  className="sign-in-link thq-body-small"
                >
                  Ați uitat parola?
                </Link>
              </div>
              <button 
                type="submit" 
                className="sign-in-button1 thq-button-filled"
                disabled={loading}
              >
                <span className="sign-in-text15 thq-body-small">
                  {loading ? "Se încarcă..." : (props.action1 ?? (
                    <Fragment>
                      <span className="sign-in-text19">Autentificare</span>
                    </Fragment>
                  ))}
                </span>
              </button>
            </form>
            <div className="sign-in-divider1">
              <div className="sign-in-divider2"></div>
              <p className="thq-body-large sign-in-text16">SAU</p>
              <div className="sign-in-divider3"></div>
            </div>
            <div className="sign-in-container4">
              <Link to="/sign-up" className="sign-in-navlink1">
                <button className="sign-in-button2 thq-button-outline">
                  <span className="sign-in-text17 thq-body-small">
                    Creează cont nou
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

SignIn.defaultProps = {
  rootClassName: '',
  image1Alt: 'Imagine Autentificare',
  heading11: undefined,
  action1: undefined,
}

SignIn.propTypes = {
  rootClassName: PropTypes.string,
  image1Alt: PropTypes.string,
  heading11: PropTypes.element,
  action1: PropTypes.element,
}

export default SignIn
