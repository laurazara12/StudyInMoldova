export const API_BASE_URL = 'http://localhost:4000';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

export const handleApiError = (error) => {
  if (error.response) {
    return {
      status: error.response.status,
      message: error.response.data?.message || 'Eroare la comunicarea cu serverul'
    };
  } else if (error.request) {
    return {
      status: 0,
      message: 'Nu s-a putut conecta la server. Verificați conexiunea la internet.'
    };
  } else {
    return {
      status: -1,
      message: 'A apărut o eroare neașteptată. Vă rugăm să încercați din nou.'
    };
  }
}; 