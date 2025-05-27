import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyToken } from '../../config/api.config';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await verifyToken();
        if (!isValid) {
          navigate('/sign-in');
        }
      } catch (error) {
        console.error('Eroare la verificarea autentificării:', error);
        navigate('/sign-in');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isChecking) {
    return <div>Se verifică autentificarea...</div>;
  }

  return children;
};

export default ProtectedRoute; 