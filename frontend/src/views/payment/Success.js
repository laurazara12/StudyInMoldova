import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../../config/api.config';
import './Payment.css';

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const paymentIntent = searchParams.get('payment_intent');
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');

    if (!sessionId && !paymentIntent) {
      setError('Required payment verification parameters not found');
      setStatus('error');
      return;
    }

    const checkStatus = async () => {
      try {
        let response;
        
        if (sessionId) {
          // Verificare folosind session_id
          response = await axios.get(
            `${API_BASE_URL}/api/payments/check-payment-status/${sessionId}`,
            { headers: getAuthHeaders() }
          );
        } else {
          // Verificare folosind payment_intent
          response = await axios.post(
            `${API_BASE_URL}/api/payments/confirm`,
            {
              paymentMethodId: paymentIntent,
              applicationId: localStorage.getItem('currentApplicationId')
            },
            { headers: getAuthHeaders() }
          );
        }

        if (response.data.success) {
          if (response.data.status === 'paid' || response.data.status === 'success') {
            setStatus('success');
            // Curățăm localStorage
            localStorage.removeItem('currentApplicationId');
            localStorage.removeItem('pendingApplication');
            localStorage.removeItem('currentPaymentSession');
            
            // Redirecționăm către pagina de profil după 3 secunde
            setTimeout(() => {
              navigate('/profile');
            }, 3000);
          } else {
            setStatus('pending');
          }
        } else {
          throw new Error(response.data.message || 'Error checking payment status');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setError(error.response?.data?.message || 'An error occurred while checking payment status');
        setStatus('error');
      }
    };

    checkStatus();
  }, [searchParams, navigate]);

  const handleContinue = () => {
    navigate('/profile');
  };

  if (status === 'loading') {
    return (
      <div className="payment-status">
        <div className="loading-spinner"></div>
        <p>Checking payment status...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="payment-status error">
        <i className="fas fa-exclamation-circle"></i>
        <h2>Error</h2>
        <p>{error || 'An error occurred while processing the payment'}</p>
        <button onClick={handleContinue} className="btn-primary">
          Back to Profile
        </button>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="payment-status pending">
        <i className="fas fa-clock"></i>
        <h2>Payment Processing</h2>
        <p>Your payment is being processed. Please wait...</p>
        <button onClick={handleContinue} className="btn-primary">
          Back to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="payment-status success">
      <i className="fas fa-check-circle"></i>
      <h2>Payment Successful!</h2>
      <p>Payment has been processed successfully. You will be redirected to your profile page...</p>
    </div>
  );
};

export default Success; 