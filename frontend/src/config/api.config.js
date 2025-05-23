// Configurare API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

console.log('=== Configurare API ===');
console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);

// Funcție pentru obținerea header-urilor de autentificare
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('=== Verificare Token ===');
  console.log('Token prezent:', !!token);
  
  if (token) {
    try {
      // Verificăm dacă token-ul este valid
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Token invalid: format incorect');
        console.error('Token parts:', tokenParts.length);
        localStorage.removeItem('token');
        window.location.href = '/sign-in';
        return {};
      }

      // Verificăm expirarea token-ului
      const payload = JSON.parse(atob(tokenParts[1]));
      const expiration = payload.exp * 1000; // Convertim în milisecunde
      const now = Date.now();
      
      console.log('Token payload:', payload);
      console.log('Expirare:', new Date(expiration).toLocaleString());
      console.log('Acum:', new Date(now).toLocaleString());
      console.log('Timp rămas:', Math.round((expiration - now) / 1000), 'secunde');
      
      if (now >= expiration) {
        console.error('Token expirat');
        localStorage.removeItem('token');
        window.location.href = '/sign-in';
        return {};
      }

      console.log('Token valid, expiră la:', new Date(expiration).toLocaleString());
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
    } catch (error) {
      console.error('Eroare la verificarea token-ului:', error);
      console.error('Token invalid:', token);
      localStorage.removeItem('token');
      window.location.href = '/sign-in';
      return {};
    }
  }
  return {};
};

// Funcție pentru gestionarea erorilor API
export const handleApiError = (error) => {
  console.error('=== Eroare API ===');
  console.error('Tip eroare:', error.name);
  console.error('Mesaj eroare:', error.message);
  console.error('Status:', error.response?.status);
  console.error('Status Text:', error.response?.statusText);
  console.error('Data răspuns:', error.response?.data);
  console.error('Config:', {
    url: error.config?.url,
    method: error.config?.method,
    headers: error.config?.headers,
    data: error.config?.data
  });

  if (error.response?.status === 401) {
    console.error('Token invalid sau expirat');
    localStorage.removeItem('token');
    window.location.href = '/sign-in';
    return { message: 'Sesiunea a expirat. Vă rugăm să vă autentificați din nou.' };
  }

  if (error.response?.status === 404) {
    return { message: 'Resursa solicitată nu a fost găsită.' };
  }

  if (error.response?.status === 500) {
    return { message: 'Eroare internă a serverului. Vă rugăm să încercați din nou mai târziu.' };
  }

  if (error.response?.data?.message) {
    return { message: error.response.data.message };
  }

  return { message: 'A apărut o eroare. Vă rugăm să încercați din nou.' };
};

export { API_BASE_URL }; 