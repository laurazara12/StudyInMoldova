// API Configuration
if (!process.env.REACT_APP_API_URL) {
  throw new Error('REACT_APP_API_URL nu este setat! Toate request-urile către backend trebuie să folosească domeniul corect.');
}
const API_BASE_URL = process.env.REACT_APP_API_URL;

console.log('=== API Configuration ===');
console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

// Function for token verification
export const verifyToken = async () => {
  console.log('=== Token Verification ===');
  const token = localStorage.getItem('token');
  console.log('Token present:', !!token);

  if (!token) {
    console.log('Token missing');
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
      console.log('Invalid or expired token');
      await clearUserData();
      return false;
    }

    const data = await response.json();
    if (!data.success || !data.user) {
      console.log('Invalid user data');
      await clearUserData();
      return false;
    }

    // Update user data in localStorage
    localStorage.setItem('user', JSON.stringify(data.user));
    console.log('Valid token, user authenticated');
    return true;
  } catch (error) {
    console.error('Error verifying token:', error);
    await clearUserData();
    return false;
  }
};

// Function for getting authentication headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('=== Getting Headers ===');
  console.log('Token present:', !!token);
  
  if (!token) {
    console.log('Token missing for headers');
    return {
      'Content-Type': 'application/json'
    };
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  console.log('Generated headers:', headers);
  return headers;
};

// Function for handling API errors
export const handleApiError = (error) => {
  console.error('API Error:', error);

  if (error.response) {
    // Server responded with an error status
    console.error('Error details:', {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data
    });

    switch (error.response.status) {
      case 401:
        // Invalid or expired token
        clearUserData();
        return 'Session expired. Please log in again.';
      
      case 403:
        return 'You do not have permission to access this resource.';
      
      case 404:
        return 'The requested resource was not found.';
      
      case 500:
        return 'A server error occurred. Please try again later.';
      
      default:
        return error.response.data?.message || 'An error occurred while processing the request.';
    }
  } else if (error.request) {
    // Request was made but no response received
    console.error('No response from server:', error.request);
    return 'Could not connect to server. Please check your internet connection.';
  } else {
    // Error occurred while setting up the request
    console.error('Error setting up request:', error.message);
    return 'An error occurred while communicating with the server.';
  }
};

import { useNavigation } from '../contexts/NavigationContext';

let navigationCallback = null;

export const setNavigationCallback = (callback) => {
  navigationCallback = callback;
};

export const clearUserData = async () => {
  console.log('Clearing user data');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // No longer automatically redirecting here
  return true;
};

export { API_BASE_URL }; 