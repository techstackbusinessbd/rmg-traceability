import { create } from 'zustand';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
  token: localStorage.getItem('auth_token') || null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const { user, token } = response.data.data;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      
      set({ user, token, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Invalid credentials.';
      set({ error: msg, loading: false });
      return { success: false, error: msg };
    }
  },

  logout: async () => {
    const { token } = get();
    try {
      if (token) {
        await axios.post(`${API_BASE}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  }
}));
