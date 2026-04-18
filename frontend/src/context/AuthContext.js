import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { formatApiError } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch {
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
    return data;
  };

  const register = async (email, password, name) => {
    const { data } = await api.post('/auth/register', { email, password, name });
    setUser(data);
    return data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(false);
  };

  const quickSwitch = async (role) => {
    try {
      if (role === 'admin') {
        const { data } = await api.post('/auth/login', { email: 'admin@ocean2joy.com', password: 'admin123' });
        setUser(data);
      } else {
        const { data } = await api.post('/auth/login', { email: 'client@test.com', password: 'client123' });
        setUser(data);
      }
    } catch (e) {
      console.error('Quick switch failed:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, quickSwitch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

export { formatApiError };
