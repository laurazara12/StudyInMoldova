export const API_BASE_URL = 'http://localhost:4000';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

export const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    return {
      message: error.response.data.message || 'A apărut o eroare',
      status: error.response.status
    };
  }
  return {
    message: 'Eroare de rețea',
    status: 500
  };
}; 