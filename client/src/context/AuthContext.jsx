import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext(undefined);

// Instant 0ms session recovery from localStorage
const getCachedUser = () => {
  try {
    const raw = localStorage.getItem('nexora_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getCachedUser);
  // If we already have a cached user, we do not block initial render!
  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem('nexora_token');
    const cached = getCachedUser();
    return !!token && !cached;
  });

  const saveUserSession = (userData, token) => {
    if (token) localStorage.setItem('nexora_token', token);
    if (userData) localStorage.setItem('nexora_user', JSON.stringify(userData));
    setUser(userData);
  };

  const clearUserSession = () => {
    localStorage.removeItem('nexora_token');
    localStorage.removeItem('nexora_user');
    setUser(null);
  };

  useEffect(() => {
    async function verifySession() {
      const token = localStorage.getItem('nexora_token');
      if (!token) {
        clearUserSession();
        setLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        if (res.success && res.user) {
          saveUserSession(res.user);
        } else {
          clearUserSession();
        }
      } catch {
        // If offline/network fails, keep cached user so the app remains accessible
        if (!user) {
          clearUserSession();
        }
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.success && res.user) {
      saveUserSession(res.user, res.token);
    }
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    if (res.success && res.user) {
      saveUserSession(res.user, res.token);
    }
  };

  const demoLogin = async () => {
    const res = await authApi.demoLogin();
    if (res.success && res.user) {
      saveUserSession(res.user, res.token);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearUserSession();
    }
  };

  const updateUser = async (updates) => {
    const res = await authApi.updateProfile(updates);
    if (res.success && res.user) {
      saveUserSession(res.user);
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

