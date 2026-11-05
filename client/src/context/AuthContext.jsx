import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('nexora_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          localStorage.removeItem('nexora_token');
          setUser(null);
        }
      } catch {
        localStorage.removeItem('nexora_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.success && res.user) {
      if (res.token) localStorage.setItem('nexora_token', res.token);
      setUser(res.user);
    }
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    if (res.success && res.user) {
      if (res.token) localStorage.setItem('nexora_token', res.token);
      setUser(res.user);
    }
  };

  const demoLogin = async () => {
    const res = await authApi.demoLogin();
    if (res.success && res.user) {
      if (res.token) localStorage.setItem('nexora_token', res.token);
      setUser(res.user);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('nexora_token');
      setUser(null);
    }
  };

  const updateUser = async (updates) => {
    const res = await authApi.updateProfile(updates);
    if (res.success && res.user) {
      setUser(res.user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, demoLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

