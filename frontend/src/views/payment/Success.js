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
      setError('Nu s-au găsit parametrii necesari pentru verificarea plății');
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
          throw new Error(response.data.message || 'Eroare la verificarea statusului plății');
        }
      } catch (error) {
        console.error('Eroare la verificarea statusului plății:', error);
        setError(error.response?.data?.message || 'A apărut o eroare la verificarea statusului plății');
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
        <p>Se verifică statusul plății...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="payment-status error">
        <i className="fas fa-exclamation-circle"></i>
        <h2>Eroare</h2>
        <p>{error || 'A apărut o eroare la procesarea plății'}</p>
        <button onClick={handleContinue} className="btn-primary">
          Înapoi la profil
        </button>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="payment-status pending">
        <i className="fas fa-clock"></i>
        <h2>Plata în procesare</h2>
        <p>Plata dvs. este în curs de procesare. Vă rugăm să așteptați...</p>
        <button onClick={handleContinue} className="btn-primary">
          Înapoi la profil
        </button>
      </div>
    );
  }

  return (
    <div className="payment-status success">
      <i className="fas fa-check-circle"></i>
      <h2>Plată reușită!</h2>
      <p>Plata a fost procesată cu succes. Veți fi redirecționat către pagina de profil...</p>
    </div>
  );
};

export default Success; 