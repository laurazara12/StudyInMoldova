import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.success && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Eroare la verificarea token-ului:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
      return false;
    }
  };

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!storedToken || !storedUser) {
        setLoading(false);
        return false;
      }

      const isValid = await verifyToken(storedToken);
      
      if (!isValid) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
      return isValid;
    } catch (error) {
      console.error('Eroare la verificarea autentificării:', error);
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
    
    // Verificăm periodic validitatea token-ului
    const interval = setInterval(checkAuth, 300000); // Verificăm la fiecare 5 minute
    
    return () => clearInterval(interval);
  }, []);

  const login = async (userData, token) => {
    try {
      console.log('=== Începe procesul de autentificare ===');
      console.log('User Data:', userData);
      console.log('Token:', token ? 'Prezent' : 'Lipsă');

      if (!userData || !token) {
        console.error('Date de autentificare incomplete:', { userData, token });
        throw new Error('Date de autentificare incomplete');
      }

      // Salvăm token-ul și datele utilizatorului
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Verificăm token-ul
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Verificare token:', response.data);

      if (!response.data || !response.data.success) {
        console.error('Verificare token eșuată:', response.data);
        throw new Error('Verificare token eșuată');
      }

      setUser(userData);
      setIsAuthenticated(true);
      console.log('Autentificare reușită pentru:', userData.email);
      return true;
    } catch (error) {
      console.error('=== Eroare la autentificare ===');
      console.error('Tip eroare:', error.name);
      console.error('Mesaj eroare:', error.message);
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Data răspuns:', error.response?.data);

      // Curățăm datele de autentificare în caz de eroare
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading, checkAuth }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth trebuie folosit în interiorul unui AuthProvider');
  }
  return context;
}; 