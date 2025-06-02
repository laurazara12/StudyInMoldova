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
      // Ensure email is a string
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

      console.log('Server response:', response.data);

      // Check response structure
      if (!response.data) {
        throw new Error('Empty server response');
      }

      // Check if response has correct structure
      if (!response.data.success || !response.data.data) {
        throw new Error('Invalid response format');
      }

      // Extract data from response
      const { token, user: userData } = response.data.data;

      if (!token) {
        console.error('Server response:', response.data);
        throw new Error('Missing token in server response');
      }

      if (!userData || !userData.id || !userData.email || !userData.role) {
        console.error('Incomplete user data:', userData);
        throw new Error('Incomplete user data');
      }

      console.log('Data received from server:', { userData, token });

      // Save email in localStorage for future logins
      localStorage.setItem('lastEmail', emailString.trim());

      // Save token and user data in localStorage
      console.log('Attempting to save token in localStorage...');
      localStorage.setItem('token', token);
      console.log('Token saved in localStorage:', localStorage.getItem('token'));
      
      console.log('Attempting to save user data in localStorage...');
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('User data saved in localStorage:', localStorage.getItem('user'));

      // Authenticate user through context
      await login(userData, token);
      
      // Redirect user based on role
      if (userData.role === 'admin') {
        console.log('Redirecting to dashboard for admin');
        navigate('/dashboard');
      } else {
        console.log('Redirecting to profile for user');
        navigate('/profile');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      
      if (error.response) {
        console.error('Error details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        if (error.response.status === 401) {
          setError('Incorrect email or password.');
        } else {
          setError(error.response.data?.message || 'An error occurred during authentication.');
        }
      } else if (error.request) {
        console.error('No response from server:', error.request);
        setError('Could not connect to server. Please check your internet connection.');
      } else {
        console.error('Error configuring request:', error.message);
        setError('An error occurred while communicating with the server.');
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
                    Sign in to Study in Moldova
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
                  <span>Email</span>
                </label>

                <input
                  type="email"
                  id="thq-sign-in-6-email"
                  required={true}
                  placeholder="Email address"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="sign-in-password">
                <label
                  htmlFor="thq-sign-in-6-password"
                  className="thq-body-large sign-in-text13"
                >
                  <span>Password</span>
                </label>
                <div className="sign-in-textfield">
                  <div className="sign-in-container4">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="thq-sign-in-6-password"
                      required={true}
                      placeholder="Password"
                      className="input-field"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="sign-in-button3"
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="currentColor"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 7C14.76 7 17 9.24 17 12C17 12.65 16.87 13.26 16.64 13.83L19.56 16.75C21.07 15.49 22.26 13.86 22.99 12C21.26 7.61 16.99 4.5 11.99 4.5C10.59 4.5 9.25 4.75 8.01 5.2L10.17 7.36C10.74 7.13 11.35 7 12 7ZM2 4.27L3.28 5.55L3.74 6.01C2.08 7.3 0.78 9 0 11C1.73 15.39 6 18.5 11 18.5C12.55 18.5 14.03 18.2 15.38 17.66L15.8 18.08L19.73 22L21 20.73L3.27 3L2 4.27ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.78 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8ZM11.84 9.02L14.99 12.17L15.01 12.01C15.01 10.35 13.67 9.01 12.01 9.01L11.84 9.02Z" fill="currentColor"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <Link
                  to="/forgot-password"
                  className="sign-in-link thq-body-small"
                >
                  Forgot password?
                </Link>
              </div>
              <button 
                type="submit" 
                className="thq-button-filled"
                disabled={loading}
              >
                <span className="sign-in-text15 thq-body-small">
                  {loading ? "Loading..." : (props.action1 ?? (
                    <Fragment>
                      <span className="sign-in-text19">Sign In</span>
                    </Fragment>
                  ))}
                </span>
              </button>
            </form>
            <div className="sign-in-divider1">
              <div className="sign-in-divider2"></div>
              <p className="thq-body-large sign-in-text16">OR</p>
              <div className="sign-in-divider3"></div>
            </div>
            <div className="sign-in-container4">
              <Link to="/sign-up" className="sign-in-navlink1">
                <button className="thq-button-outline">
                  <span className="sign-in-text17 thq-body-small">
                    {props.action2 ?? (
                      <Fragment>
                        <span className="sign-in-text19">Create Account</span>
                      </Fragment>
                    )}
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
  image1Alt: 'Sign In Image',
  heading11: undefined,
  action1: undefined,
  action2: undefined,
}

SignIn.propTypes = {
  rootClassName: PropTypes.string,
  image1Alt: PropTypes.string,
  heading11: PropTypes.element,
  action1: PropTypes.element,
  action2: PropTypes.element,
}

export default SignIn
