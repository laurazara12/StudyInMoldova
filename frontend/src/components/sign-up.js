import React, { Fragment, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import PropTypes from 'prop-types'

import './sign-up.css'

const SignUp = (props) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();
    console.log('Datele trimise:', {
      email,
      password,
      confirmPassword,
      name,
    });
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    try {
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage('Înregistrare reușită!');
        setErrorMessage('');
        navigate('/sign-in');
      } else {
        setErrorMessage(data.message || 'A apărut o eroare în timpul înregistrării.');
        setSuccessMessage('');
      }
    } catch (error) {
      setErrorMessage('Network error. Please check your connection and try again.');
      setSuccessMessage('');
    }
  };

  return (
    <div className="sign-up-container1">
      <div className="sign-up-max-width">
        <div className="sign-up-sign-up-image thq-img-ratio-16-9"></div>
        <div className="sign-up-form thq-section-padding">
          <div className="sign-up-title-root">
            <h2 className="sign-up-text10 thq-heading-2">
              {props.heading1 ?? (
                <Fragment>
                  <span className="sign-up-text20">Create an account</span>
                </Fragment>
              )}
            </h2>
            <span className="thq-body-small">
              {props.content1 ?? (
                <Fragment>
                  <span className="sign-up-text23">Sign up to see details</span>
                </Fragment>
              )}
            </span>
          </div>
          <form onSubmit={handleSignUp}>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <button type="submit" className="sign-up-button1 thq-button-filled">
              {props.action1 ?? (
                <Fragment>
                  <span className="sign-up-text22">Continue with email</span>
                </Fragment>
              )}
            </button>
            <button className="sign-up-button2 thq-button-outline">
              <svg
                viewBox="0 0 860.0137142857142 1024"
                className="sign-up-icon1"
              >
                <path d="M438.857 449.143h414.286c4 22.286 6.857 44 6.857 73.143 0 250.286-168 428.571-421.143 428.571-242.857 0-438.857-196-438.857-438.857s196-438.857 438.857-438.857c118.286 0 217.714 43.429 294.286 114.857l-119.429 114.857c-32.571-31.429-89.714-68-174.857-68-149.714 0-272 124-272 277.143s122.286 277.143 272 277.143c173.714 0 238.857-124.571 249.143-189.143h-249.143v-150.857z"></path>
              </svg>
              <span className="sign-up-text13 thq-body-small">
                {props.action3 ?? (
                  <Fragment>
                    <span className="sign-up-text21">Continue with Google</span>
                  </Fragment>
                )}
              </span>
            </button>
          </form>
          <p className="sign-up-text14 thq-body-large">
            <span className="sign-up-text15">
              By creating an account, you agree to the Terms of use and Privacy
              Policy.
            </span>
            <span>
              <span
                dangerouslySetInnerHTML={{
                  __html: ' ',
                }}
              />
            </span>
            <span>
              <span
                dangerouslySetInnerHTML={{
                  __html: ' ',
                }}
              />
            </span>
          </p>
          <span className="sign-up-text18 thq-body-small">
            <span>
              Already have an account?
              <span
                dangerouslySetInnerHTML={{
                  __html: ' ',
                }}
              />
            </span>
            <Link to="/sign-in" className="sign-up-navlink">
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}

SignUp.defaultProps = {
  heading1: undefined,
  action3: undefined,
  action1: undefined,
  content1: undefined,
}

SignUp.propTypes = {
  heading1: PropTypes.element,
  action3: PropTypes.element,
  action1: PropTypes.element,
  content1: PropTypes.element,
}

export default SignUp
