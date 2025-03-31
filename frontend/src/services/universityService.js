import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const universityService = {
  getAllUniversities: async () => {
    try {
      const response = await axios.get(`${API_URL}/universities`);
      return response.data;
    } catch (error) {
      console.error('Eroare la încărcarea universităților:', error);
      throw new Error('Eroare la încărcarea universităților');
    }
  },

  getUniversityById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/universities/${id}`);
      return response.data;
    } catch (error) {
      console.error('Eroare la încărcarea detaliilor universității:', error);
      throw new Error('Eroare la încărcarea detaliilor universității');
    }
  },

  createUniversity: async (universityData) => {
    try {
      const response = await axios.post(`${API_URL}/universities`, universityData);
      return response.data;
    } catch (error) {
      console.error('Eroare la crearea universității:', error);
      throw new Error('Eroare la crearea universității');
    }
  },

  updateUniversity: async (id, universityData) => {
    try {
      const response = await axios.put(`${API_URL}/universities/${id}`, universityData);
      return response.data;
    } catch (error) {
      console.error('Eroare la actualizarea universității:', error);
      throw new Error('Eroare la actualizarea universității');
    }
  },

  deleteUniversity: async (id) => {
    try {
      await axios.delete(`${API_URL}/universities/${id}`);
    } catch (error) {
      console.error('Eroare la ștergerea universității:', error);
      throw new Error('Eroare la ștergerea universității');
    }
  }
};

export default universityService; 