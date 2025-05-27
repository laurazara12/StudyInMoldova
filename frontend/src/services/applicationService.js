import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../config/api.config';

export const applicationService = {
  async getApplicationById(id) {
    const response = await axios.get(`${API_BASE_URL}/api/applications/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  async getUserApplications() {
    const response = await axios.get(`${API_BASE_URL}/api/applications/user`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  async createApplication(data) {
    const response = await axios.post(`${API_BASE_URL}/api/applications`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  async cancelApplication(id, data) {
    const response = await axios.post(`${API_BASE_URL}/api/applications/${id}/cancel`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  async updateApplication(id, data) {
    const response = await axios.put(`${API_BASE_URL}/api/applications/${id}`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  async submitApplication(id) {
    const response = await axios.post(`${API_BASE_URL}/api/applications/${id}/submit`, {}, {
      headers: getAuthHeaders()
    });
    return response.data;
  }
}; 