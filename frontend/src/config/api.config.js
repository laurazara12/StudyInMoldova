// Configurare API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

console.log('=== Configurare API ===');
console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

// Funcție pentru obținerea header-urilor de autentificare
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

const verifyToken = () => {
  console.log('=== Verificare Token ===');
  const token = localStorage.getItem('token');
  console.log('Token prezent:', !!token);

  if (!token) {
    console.log('Token lipsă');
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);

    const expirationDate = new Date(payload.exp * 1000);
    const now = new Date();
    const timeLeft = Math.floor((expirationDate - now) / 1000);

    console.log('Expirare:', expirationDate.toLocaleString('ro-RO'));
    console.log('Acum:', now.toLocaleString('ro-RO'));
    console.log('Timp rămas:', timeLeft, 'secunde');

    if (timeLeft <= 0) {
      console.log('Token expirat');
      localStorage.removeItem('token');
      return false;
    }

    console.log('Token valid, expiră la:', expirationDate.toLocaleString('ro-RO'));
    return true;
  } catch (error) {
    console.error('Eroare la verificarea token-ului:', error);
    localStorage.removeItem('token');
    return false;
  }
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/sign-in';
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

export { API_BASE_URL, getAuthHeaders, verifyToken }; 