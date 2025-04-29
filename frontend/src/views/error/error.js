import React from 'react';
import { Link } from 'react-router-dom';
import './error.css';

const ErrorPage = () => {
  return (
    <div className="error-container">
      <div className="error-content">
        <h1 className="error-title">Oops!</h1>
        <div className="error-code">404</div>
        <p className="error-message">
          We can't seem to find the page you are looking for.
        </p>
        <Link to="/" className="back-button">
          Back to homepage
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage; 