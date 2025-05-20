import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../config/api.config';

// Configurare Axios
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // timeout de 10 secunde
});

// Interceptor pentru cereri
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('=== Începem cererea ===');
    console.log('URL complet:', `${config.baseURL}${config.url}`);
    console.log('Metodă:', config.method?.toUpperCase());
    console.log('Headers:', JSON.stringify(config.headers, null, 2));
    if (config.data) {
      console.log('Data:', JSON.stringify(config.data, null, 2));
    }

    // Verificăm dacă URL-ul este valid
    if (!config.url) {
      console.error('URL invalid:', config.url);
      return Promise.reject(new Error('URL invalid'));
    }

    // Verificăm dacă baseURL este setat
    if (!config.baseURL) {
      console.error('baseURL lipsă');
      return Promise.reject(new Error('baseURL lipsă'));
    }

    return config;
  },
  (error) => {
    console.error('=== Eroare la cerere ===');
    console.error('Nume eroare:', error.name);
    console.error('Mesaj eroare:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('Config:', error.config);
    return Promise.reject(error);
  }
);

// Interceptor pentru răspunsuri
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('=== Răspuns primit ===');
    console.log('URL:', `${response.config.baseURL}${response.config.url}`);
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', JSON.stringify(response.headers, null, 2));
    console.log('Data:', JSON.stringify(response.data, null, 2));

    // Verificăm dacă răspunsul este valid
    if (!response.data) {
      console.error('Răspuns fără date');
      return Promise.reject(new Error('Răspuns invalid: lipsesc datele'));
    }

    return response;
  },
  (error) => {
    console.error('=== Eroare la răspuns ===');
    console.error('URL:', error.config ? `${error.config.baseURL}${error.config.url}` : 'Necunoscut');
    console.error('Metodă:', error.config?.method?.toUpperCase() || 'Necunoscută');
    console.error('Config:', error.config);
    
    if (error.response) {
      // Serverul a răspuns cu un status de eroare
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Data răspuns:', JSON.stringify(error.response.data, null, 2));
      console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
      
      if (error.response.status === 401) {
        // Token invalid sau expirat
        console.error('Token invalid sau expirat. Redirecționare către pagina de autentificare...');
        localStorage.removeItem('token');
        window.location.href = '/sign-in';
        return Promise.reject(new Error('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.'));
      }
      
      return Promise.reject(new Error(error.response.data.message || 'A apărut o eroare la comunicarea cu serverul.'));
    } else if (error.request) {
      // Cererea a fost făcută dar nu s-a primit răspuns
      console.error('Nu s-a primit răspuns de la server');
      console.error('Configurare cerere:', JSON.stringify(error.config, null, 2));
      console.error('Request:', error.request);
      return Promise.reject(new Error('Nu s-a putut comunica cu serverul. Vă rugăm să verificați conexiunea la internet.'));
    } else {
      // Eroare la configurarea cererii
      console.error('Eroare la configurarea cererii:', error.message);
      console.error('Stack trace:', error.stack);
      return Promise.reject(new Error('A apărut o eroare la procesarea cererii.'));
    }
  }
);

// Funcție pentru încărcarea unei universități după slug
export const getUniversityBySlug = async (slug) => {
  try {
    if (!slug) {
      throw new Error('Slug-ul universității este obligatoriu');
    }
    console.log('Încărcare universitate după slug:', slug);
    const response = await axiosInstance.get(`/api/universities/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Eroare la încărcarea universității:', error);
    throw new Error('Universitatea nu a fost găsită');
  }
};

// Funcție pentru încărcarea programelor de studiu pentru o universitate
export const getUniversityPrograms = async (universityId) => {
  try {
    const response = await axiosInstance.get(`/api/universities/${universityId}/programs`);
    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    console.error('Eroare la încărcarea programelor de studiu:', error);
    throw new Error('Nu s-au putut încărca programele de studiu');
  }
};

// Funcție pentru încărcarea detaliilor unui program de studiu
export const getProgramDetails = async (programId) => {
  try {
    const response = await axiosInstance.get(`/api/programs/${programId}`);
    return response.data.data;
  } catch (error) {
    console.error('Eroare la încărcarea detaliilor programului:', error);
    throw new Error(error.response?.data?.message || 'Nu s-au putut încărca detaliile programului');
  }
};

// Funcție pentru încărcarea specializărilor unui program
export const getProgramSpecializations = async (programId) => {
  try {
    const response = await axiosInstance.get(`/api/programs/${programId}/specializations`);
    return response.data;
  } catch (error) {
    console.error('Eroare la încărcarea specializărilor:', error);
    throw new Error('Nu s-au putut încărca specializările');
  }
};

// Funcție pentru încărcarea taxelor de școlarizare pentru un program
export const getProgramTuitionFees = async (programId) => {
  try {
    const response = await axiosInstance.get(`/api/programs/${programId}/tuition-fees`);
    return response.data;
  } catch (error) {
    console.error('Eroare la încărcarea taxelor de școlarizare:', error);
    throw new Error('Nu s-au putut încărca taxele de școlarizare');
  }
};

// Funcție pentru încărcarea tuturor universităților
export const getAllUniversities = async () => {
  try {
    const response = await axiosInstance.get('/api/universities');
    return response.data;
  } catch (error) {
    console.error('Eroare la obținerea listei de universități:', error);
    throw new Error('Nu am putut încărca lista de universități');
  }
};

const universityService = {
  getUniversityById: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/universities/${id}`);
      return response.data;
    } catch (error) {
      console.error('Eroare la obținerea universității:', error);
      throw new Error('Nu am putut încărca datele universității');
    }
  },

  createUniversity: async (universityData) => {
    try {
      const response = await axiosInstance.post('/api/universities', universityData);
      return response.data;
    } catch (error) {
      console.error('Eroare la crearea universității:', error);
      throw new Error('Nu am putut crea universitatea');
    }
  },

  updateUniversity: async (id, universityData) => {
    try {
      const response = await axiosInstance.put(`/api/universities/${id}`, universityData);
      return response.data;
    } catch (error) {
      console.error('Eroare la actualizarea universității:', error);
      throw new Error('Nu am putut actualiza universitatea');
    }
  },

  deleteUniversity: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/universities/${id}`);
      return response.data;
    } catch (error) {
      console.error('Eroare la ștergerea universității:', error);
      throw new Error('Nu am putut șterge universitatea');
    }
  }
};

export default universityService; 