import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Payment.css';

const Cancel = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-status cancel">
      <i className="fas fa-times-circle"></i>
      <h2>Payment Cancelled</h2>
      <p>The payment has been cancelled. You can try again whenever you want.</p>
      <div className="button-group">
        <button onClick={() => navigate('/profile')} className="btn2">
          Back to Profile
        </button>
        <button onClick={() => navigate('/application')} className="btn1">
          Try Again
        </button>
      </div>
    </div>
  );
};

export default Cancel; 