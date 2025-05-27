import React, { Fragment, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import PropTypes from 'prop-types'

import './sign-up.css'
import { getCloudinaryImageUrl } from '../../../config/cloudinary'

const SignUp = (props) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();
    
    if (!termsAccepted) {
      setErrorMessage('Trebuie să acceptați termenii și condițiile pentru a continua.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Parolele nu se potrivesc.');
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
          termsAccepted
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
      setErrorMessage('Eroare de rețea. Vă rugăm să verificați conexiunea și să încercați din nou.');
      setSuccessMessage('');
    }
  };

  return (
    <div className="sign-up-container1">
      <div className="sign-up-max-width">
        <div className="sign-up-sign-up-image thq-img-ratio-16-9" style={{
          backgroundImage: `url(${getCloudinaryImageUrl('pexels-radubradu-395822838-15252123_ckp83y', { 
            width: 1200, 
            height: 675, 
            crop: 'fill',
            quality: 'auto'
          })})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}></div>
        <div className="sign-up-form thq-section-padding">
          <div className="sign-up-title-root">
            <h2 className="sign-up-text10 thq-heading-2">
              {props.heading1 ?? (
                <Fragment>
                  <span className="sign-up-text20">Creează un cont</span>
                </Fragment>
              )}
            </h2>
            <span className="thq-body-small">
              {props.content1 ?? (
                <Fragment>
                  <span className="sign-up-text23">Înregistrează-te pentru a vedea detaliile</span>
                </Fragment>
              )}
            </span>
          </div>
          <form onSubmit={handleSignUp}>
            <input
              type="text"
              placeholder="Nume"
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
              placeholder="Parolă"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirmă parola"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <div className="terms-checkbox">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
              />
              <label htmlFor="terms">
                Accept{' '}
                <Link to="/terms" className="sign-up-navlink">Termenii de utilizare</Link>
                {' '}și{' '}
                <Link to="/privacy" className="sign-up-navlink">Politica de confidențialitate</Link>
              </label>
            </div>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <button type="submit" className="sign-up-button1 thq-button-filled">
              {props.action1 ?? (
                <Fragment>
                  <span className="sign-up-text22">Continuă cu email</span>
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
                    <span className="sign-up-text21">Continuă cu Google</span>
                  </Fragment>
                )}
              </span>
            </button>
          </form>
          <span className="sign-up-text18 thq-body-small">
            <span>
              Ai deja un cont?
              <span
                dangerouslySetInnerHTML={{
                  __html: ' ',
                }}
              />
            </span>
            <Link to="/sign-in" className="sign-up-navlink">
              Autentificare
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
