import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { checkPaymentStatus } from '../../services/paymentService';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../../config/api.config';
import './Payment.css';

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 3000;

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        
        console.log('Verificare status plată cu session_id:', sessionId);
        
        if (!sessionId) {
          console.error('Nu s-a găsit ID-ul sesiunii');
          setError('Nu s-au găsit informații despre plată');
          setStatus('error');
          return;
        }

        console.log('Se trimite cererea de verificare a plății...');
        const response = await checkPaymentStatus(sessionId);
        console.log('Răspuns status plată:', response);

        if (!response) {
          console.error('Nu s-a primit răspuns de la server');
          setError('Nu s-a putut verifica statusul plății');
          setStatus('error');
          return;
        }

        console.log('Status plătă primit:', {
          success: response.success,
          status: response.status,
          paymentDetails: response.paymentDetails
        });

        if (response.success && response.status === 'paid') {
          console.log('Plată confirmată cu succes');
          
          // Verificăm dacă aplicația este într-adevăr plătită
          if (response.application && response.application.payment_status === 'paid' && response.application.is_paid) {
            setStatus('success');
            setPaymentDetails({
              ...response.paymentDetails,
              application: response.application
            });
            
            // Curățăm localStorage
            console.log('Se curăță localStorage...');
            localStorage.removeItem('currentPaymentSession');
            localStorage.removeItem('paymentApplicationId');
            localStorage.removeItem('selectedProgram');
            localStorage.removeItem('motivationLetter');
            localStorage.removeItem('selectedDocuments');
            
            // Reîncărcăm aplicațiile pentru a actualiza statusul plății
            try {
              const applicationsResponse = await axios.get(`${API_BASE_URL}/api/applications/user`, {
                headers: getAuthHeaders()
              });
              
              if (applicationsResponse.data.success) {
                console.log('Aplicațiile au fost reîncărcate cu succes');
              }
            } catch (error) {
              console.error('Eroare la reîncărcarea aplicațiilor:', error);
            }
            
            console.log('Se va redirecționa către profil în 3 secunde...');
            // Redirecționăm după 3 secunde
            setTimeout(() => {
              navigate('/profile');
            }, 3000);
          } else {
            console.error('Inconsistență în statusul plății:', response.application);
            setError('A apărut o eroare la verificarea statusului plății. Vă rugăm să contactați suportul.');
            setStatus('error');
          }
        } else if (response.status === 'pending' || response.status === 'processing') {
          console.log('Plată în procesare, se reîncearcă...', {
            retryCount,
            maxRetries: MAX_RETRIES
          });
          if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1);
            setTimeout(checkStatus, RETRY_DELAY);
          } else {
            console.error('S-a atins numărul maxim de încercări');
            setError('Plata este încă în procesare. Vă rugăm să verificați profilul mai târziu.');
            setStatus('error');
          }
        } else {
          console.error('Status neașteptat:', response.status);
          setError(response.message || 'Nu s-a putut verifica statusul plății');
          setStatus('error');
        }
      } catch (error) {
        console.error('Eroare la verificarea statusului plății:', error);
        setError(error.message || 'A apărut o eroare la verificarea statusului plății');
        setStatus('error');
      }
    };

    checkStatus();
  }, [searchParams, navigate, retryCount]);

  const handleRetry = () => {
    setRetryCount(0);
    setStatus('loading');
    setError(null);
  };

  const handleBackToProfile = () => {
    navigate('/profile');
  };

  if (status === 'loading') {
    return (
      <div className="payment-status-container">
        <div className="payment-status loading">
          <div className="spinner"></div>
          <h2>Se verifică statusul plății...</h2>
          <p>Vă rugăm să așteptați în timp ce verificăm plata.</p>
          {retryCount > 0 && <p>Încercarea {retryCount} din {MAX_RETRIES}</p>}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="payment-status-container">
        <div className="payment-status error">
          <i className="fas fa-exclamation-circle"></i>
          <h2>Eroare la verificarea plății</h2>
          <p>{error}</p>
          <div className="payment-actions">
            <button onClick={handleRetry} className="retry-button">
              Încearcă din nou
            </button>
            <button onClick={handleBackToProfile} className="back-button">
              Înapoi la profil
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="payment-status-container">
        <div className="payment-status pending">
          <i className="fas fa-clock"></i>
          <h2>Plata este în procesare</h2>
          <p>Plata dvs. este în curs de procesare. Vă rugăm să verificați din nou în câteva minute.</p>
          {paymentDetails && (
            <div className="payment-details">
              <p>Status: {paymentDetails.status}</p>
              <p>Status Intent: {paymentDetails.payment_intent_status}</p>
              <p>Metodă de plată: {paymentDetails.payment_method}</p>
            </div>
          )}
          <div className="payment-actions">
            <button onClick={handleRetry} className="retry-button">
              Verifică din nou
            </button>
            <button onClick={handleBackToProfile} className="back-button">
              Înapoi la profil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-status-container">
      <div className="payment-status success">
        <i className="fas fa-check-circle"></i>
        <h2>Plata a fost procesată cu succes!</h2>
        <p>Plata dvs. a fost procesată cu succes. Veți fi redirecționat către profilul dvs. în câteva secunde.</p>
        {paymentDetails && (
          <div className="payment-details">
            <h3>Detalii plată:</h3>
            <p>Suma plătită: {paymentDetails.amount} {paymentDetails.currency}</p>
            <p>Data plății: {new Date(paymentDetails.payment_date).toLocaleString()}</p>
            <p>Metodă de plată: {paymentDetails.payment_method}</p>
            <p>Status: {paymentDetails.status}</p>
            <p>Status Intent: {paymentDetails.payment_intent_status}</p>
            
            {paymentDetails.application && (
              <>
                <h3>Detalii aplicație:</h3>
                <p>Status aplicație: {paymentDetails.application.status}</p>
                <p>Status plată: {paymentDetails.application.payment_status}</p>
                <p>Data aplicației: {new Date(paymentDetails.application.application_date).toLocaleString()}</p>
              </>
            )}
          </div>
        )}
        <div className="payment-actions">
          <button onClick={handleBackToProfile} className="back-button">
            Înapoi la profil
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success; 