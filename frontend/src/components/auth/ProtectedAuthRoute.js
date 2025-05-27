import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyToken } from '../../config/api.config';

const ProtectedAuthRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await verifyToken();
        if (isAuthenticated) {
          console.log('Utilizator deja autentificat - redirecționare către profil');
          navigate('/profile');
        }
      } catch (error) {
        console.error('Eroare la verificarea autentificării:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isChecking) {
    return null; // sau un spinner de loading
  }

  return children;
};

export default ProtectedAuthRoute; 