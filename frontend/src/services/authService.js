import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

const API_URL = `${API_BASE_URL}/api`;

export const authService = {
  async getCurrentUser() {
    const response = await axios.get(`${API_URL}/users/me`);
    return response;
  },

  async updateProfile(profileData) {
    const response = await axios.put(`${API_URL}/users/profile`, profileData);
    return response;
  },

  async getProfileHistory() {
    const response = await axios.get(`${API_URL}/users/profile/history`);
    return response;
  },

  async login(credentials) {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    if (response.data?.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      if (response.data?.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
    }
    return response;
  },

  async register(userData) {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}; 