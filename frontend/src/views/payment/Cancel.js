import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Payment.css';

const Cancel = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-status cancel">
      <i className="fas fa-times-circle"></i>
      <h2>Plata a fost anulată</h2>
      <p>Plata a fost anulată. Puteți încerca din nou când doriți.</p>
      <div className="button-group">
        <button onClick={() => navigate('/profile')} className="btn-secondary">
          Înapoi la profil
        </button>
        <button onClick={() => navigate('/application')} className="btn-primary">
          Încercați din nou
        </button>
      </div>
    </div>
  );
};

export default Cancel; 