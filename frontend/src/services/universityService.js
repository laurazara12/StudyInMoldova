import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../config/api.config';

// Axios Configuration
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const headers = getAuthHeaders();
    console.log('=== Request Interceptor ===');
    console.log('Generated headers:', headers);
    
    config.headers = {
      ...config.headers,
      ...headers
    };
    
    console.log('=== Starting Request ===');
    console.log('Full URL:', `${config.baseURL}${config.url}`);
    console.log('Method:', config.method?.toUpperCase());
    console.log('Headers:', JSON.stringify(config.headers, null, 2));
    if (config.data) {
      console.log('Data:', JSON.stringify(config.data, null, 2));
    }

    // Check if URL is valid
    if (!config.url) {
      console.error('Invalid URL:', config.url);
      return Promise.reject(new Error('Invalid URL'));
    }

    // Check if baseURL is set
    if (!config.baseURL) {
      console.error('Missing baseURL');
      return Promise.reject(new Error('Missing baseURL'));
    }

    return config;
  },
  (error) => {
    console.error('=== Request Error ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('Config:', error.config);
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('=== Response Received ===');
    console.log('URL:', `${response.config.baseURL}${response.config.url}`);
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', JSON.stringify(response.headers, null, 2));
    console.log('Data:', JSON.stringify(response.data, null, 2));

    // Check if response is valid
    if (!response.data) {
      console.error('Response without data');
      return Promise.reject(new Error('Invalid response: missing data'));
    }

    return response;
  },
  (error) => {
    console.error('=== Response Error ===');
    console.error('URL:', error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown');
    console.error('Method:', error.config?.method?.toUpperCase() || 'Unknown');
    console.error('Config:', error.config);
    
    if (error.response) {
      // Server responded with an error status
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
      
      if (error.response.status === 401) {
        // Invalid or expired token
        console.error('Invalid or expired token. Redirecting to login page...');
        localStorage.removeItem('token');
        window.location.href = '/sign-in';
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
      
      return Promise.reject(new Error(error.response.data.message || 'An error occurred while communicating with the server.'));
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response from server');
      console.error('Request configuration:', JSON.stringify(error.config, null, 2));
      console.error('Request:', error.request);
      return Promise.reject(new Error('Could not communicate with server. Please check your internet connection.'));
    } else {
      // Error occurred while setting up the request
      console.error('Error setting up request:', error.message);
      console.error('Stack trace:', error.stack);
      return Promise.reject(new Error('An error occurred while processing the request.'));
    }
  }
);

// Function to load a university by slug
export const getUniversityBySlug = async (slug) => {
  try {
    if (!slug) {
      throw new Error('University slug is required');
    }
    console.log('Loading university by slug:', slug);
    const response = await axiosInstance.get(`/api/universities/${slug}`);
    
    if (!response.data) {
      throw new Error('University not found');
    }

    // Dacă răspunsul are .success și .data, folosește-le, altfel folosește direct response.data
    if (typeof response.data === 'object' && ('success' in response.data) && ('data' in response.data)) {
      if (!response.data.success) {
        throw new Error(response.data?.message || 'University not found');
      }
      return response.data.data;
    } else {
      return response.data;
    }
  } catch (error) {
    console.error('Error loading university:', error);
    throw new Error(error.response?.data?.message || 'University not found');
  }
};

// Function to load study programs for a university
export const getUniversityPrograms = async (universityId) => {
  try {
    const response = await axiosInstance.get(`/api/universities/${universityId}/programs`);
    
    if (!response.data || !response.data.success) {
      console.error('Invalid response:', response);
      return [];
    }
    
    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    console.error('Error loading study programs:', error);
    throw new Error(error.response?.data?.message || 'Could not load study programs');
  }
};

// Function to load program details
export const getProgramDetails = async (programId) => {
  try {
    const response = await axiosInstance.get(`/api/programs/${programId}`);
    
    if (!response.data || !response.data.success) {
      console.error('Invalid response:', response);
      return {};
    }
    
    const programData = response.data.data;
    return {
      ...programData,
      tuition_fees: programData.tuition_fees || null,
      specializations: [] // Initialize with empty array, will be populated separately
    };
  } catch (error) {
    console.error('Error loading program details:', error);
    throw new Error(error.response?.data?.message || 'Could not load program details');
  }
};

// Function to load program specializations
export const getProgramSpecializations = async (programId) => {
  try {
    const response = await axiosInstance.get(`/api/programs/${programId}/specializations`);
    // Check if response is HTML and return empty array in this case
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      console.warn('HTML response received for specializations, returning empty array');
      return [];
    }
    return Array.isArray(response.data) ? response.data : 
           response.data.data ? response.data.data : [];
  } catch (error) {
    console.error('Error loading specializations:', error);
    return []; // Return empty array in case of error
  }
};

// Function to load tuition fees for a program
export const getProgramTuitionFees = async (programId) => {
  try {
    const response = await axiosInstance.get(`/api/programs/${programId}/tuition-fees`);
    // Check if response is HTML and return empty object in this case
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      console.warn('HTML response received for fees, returning empty object');
      return { amount: null, currency: 'MDL' };
    }
    return response.data.data || response.data || { amount: null, currency: 'MDL' };
  } catch (error) {
    console.error('Error loading tuition fees:', error);
    return { amount: null, currency: 'MDL' }; // Return empty object in case of error
  }
};

// Function to load all universities
export const getAllUniversities = async () => {
  try {
    console.log('=== Starting universities loading ===');
    const response = await axiosInstance.get('/api/universities');
    console.log('Raw server response:', response.data);
    
    if (!response.data) {
      console.error('Response without data');
      throw new Error('No data received from server');
    }

    // Check if response has correct format
    if (!response.data.success) {
      console.error('Unsuccessful response:', response.data);
      throw new Error(response.data.message || 'Error fetching universities');
    }

    // Extract data from response
    const universitiesData = response.data.data;

    // Check if data is an array
    if (!Array.isArray(universitiesData)) {
      console.error('Data is not an array:', universitiesData);
      throw new Error('Invalid data format received');
    }

    // Process data to ensure correct format
    const processedData = universitiesData.map(uni => {
      console.log('Processing university:', uni);
      
      // Keep fees as text
      const tuitionFees = uni.tuition_fees || {};
      const processedFees = {
        bachelor: tuitionFees.bachelor || '',
        master: tuitionFees.master || '',
        phd: tuitionFees.phd || ''
      };
      
      return {
        ...uni,
        type: uni.type || 'Public',
        location: uni.location || 'Chișinău',
        ranking: uni.ranking || '',
        tuition_fees: processedFees,
        contact_info: uni.contact_info || {
          email: null,
          phone: null,
          address: null
        }
      };
    });

    console.log('All universities processed:', processedData);
    return processedData;
  } catch (error) {
    console.error('Error loading universities:', error);
    throw new Error(error.response?.data?.message || 'Error loading universities');
  }
};

const universityService = {
  getUniversityById: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/universities/${id}`);
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Could not load university data');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error getting university:', error);
      throw new Error(error.response?.data?.message || 'Could not load university data');
    }
  },

  createUniversity: async (universityData) => {
    try {
      const response = await axiosInstance.post('/api/universities', universityData);
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Could not create university');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error creating university:', error);
      throw new Error(error.response?.data?.message || 'Could not create university');
    }
  },

  updateUniversity: async (id, universityData) => {
    try {
      const response = await axiosInstance.put(`/api/universities/${id}`, universityData);
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Could not update university');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error updating university:', error);
      throw new Error(error.response?.data?.message || 'Could not update university');
    }
  },

  deleteUniversity: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/universities/${id}`);
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Could not delete university');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error deleting university:', error);
      throw new Error(error.response?.data?.message || 'Could not delete university');
    }
  }
};

export default universityService; 