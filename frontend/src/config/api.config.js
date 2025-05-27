// Configurare API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

console.log('=== Configurare API ===');
console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

// Funcție pentru verificarea token-ului
export const verifyToken = async () => {
  console.log('=== Verificare Token ===');
  const token = localStorage.getItem('token');
  console.log('Token prezent:', !!token);

  if (!token) {
    console.log('Token lipsă');
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-token`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.log('Token invalid sau expirat');
      await clearUserData();
      return false;
    }

    const data = await response.json();
    if (!data.success || !data.user) {
      console.log('Date utilizator invalide');
      await clearUserData();
      return false;
    }

    // Actualizăm datele utilizatorului în localStorage
    localStorage.setItem('user', JSON.stringify(data.user));
    console.log('Token valid, utilizator autentificat');
    return true;
  } catch (error) {
    console.error('Eroare la verificarea token-ului:', error);
    await clearUserData();
    return false;
  }
};

// Funcție pentru obținerea header-urilor de autentificare
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('=== Obținere Headers ===');
  console.log('Token prezent:', !!token);
  
  if (!token) {
    console.log('Token lipsă pentru headers');
    return {
      'Content-Type': 'application/json'
    };
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  console.log('Headers generate:', headers);
  return headers;
};

// Funcție pentru gestionarea erorilor API
export const handleApiError = (error) => {
  console.error('Eroare API:', error);

  if (error.response) {
    // Serverul a răspuns cu un status de eroare
    console.error('Detalii eroare:', {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data
    });

    switch (error.response.status) {
      case 401:
        // Token invalid sau expirat
        clearUserData();
        return 'Sesiunea a expirat. Vă rugăm să vă autentificați din nou.';
      
      case 403:
        return 'Nu aveți permisiunea de a accesa această resursă.';
      
      case 404:
        return 'Resursa solicitată nu a fost găsită.';
      
      case 500:
        return 'A apărut o eroare pe server. Vă rugăm să încercați din nou mai târziu.';
      
      default:
        return error.response.data?.message || 'A apărut o eroare în timpul procesării cererii.';
    }
  } else if (error.request) {
    // Cererea a fost făcută dar nu s-a primit răspuns
    console.error('Nu s-a primit răspuns de la server:', error.request);
    return 'Nu s-a putut conecta la server. Verificați conexiunea la internet.';
  } else {
    // A apărut o eroare la configurarea cererii
    console.error('Eroare la configurarea cererii:', error.message);
    return 'A apărut o eroare în timpul comunicării cu serverul.';
  }
};

import { useNavigation } from '../contexts/NavigationContext';

let navigationCallback = null;

export const setNavigationCallback = (callback) => {
  navigationCallback = callback;
};

export const clearUserData = async () => {
  console.log('Ștergere date utilizator');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Nu mai redirecționăm automat aici
  return true;
};

export { API_BASE_URL }; 