import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

export const useAuth = () => {
  const [state, setState] = useState({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false
  });

  const setAuthState = useCallback((newState) => {
    setState(prevState => ({ ...prevState, ...newState }));
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      setAuthState({ loading: true, error: null });
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
      
      if (!response.data?.token) {
        throw new Error('Token lipsă din răspuns');
      }

      localStorage.setItem('token', response.data.token);
      await fetchUserData();
      return true;
    } catch (err) {
      setAuthState({ 
        error: err.response?.data?.message || 'Eroare la autentificare',
        loading: false 
      });
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    });
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null
        });
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.data?.success) {
        throw new Error('Date utilizator invalide');
      }

      const userData = response.data.data;
      
      if (!userData?.id || !userData?.role) {
        throw new Error('Date utilizator incomplete');
      }

      const completeUserData = {
        ...userData,
        name: userData.name || 'Utilizator',
        email: userData.email || '',
        avatar: userData.avatar || null
      };

      setAuthState({
        user: completeUserData,
        isAuthenticated: true,
        loading: false,
        error: null
      });
    } catch (err) {
      console.error('Eroare la obținerea datelor utilizator:', err);
      localStorage.removeItem('token');
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: err.message
      });
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    ...state,
    login,
    logout,
    refreshUser: fetchUserData
  };
};