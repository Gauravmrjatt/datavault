"use client";

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const apiBackend = process.env.NEXT_PUBLIC_API_BACKEND || 'http://localhost:5000';

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }
  return data;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [sessionUser, setSessionUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);
    fetchJson(`${apiBackend}/api/auth/me`, {
      headers: { Authorization: `Bearer ${storedToken}` }
    })
      .then((payload) => {
        setSessionUser(payload.user);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setToken(null);
        setSessionUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const payload = await fetchJson(`${apiBackend}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    localStorage.setItem('token', payload.token);
    setToken(payload.token);
    setSessionUser(payload.user);
    return payload;
  };

  const register = async (email, password, name) => {
    const payload = await fetchJson(`${apiBackend}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    localStorage.setItem('token', payload.token);
    setToken(payload.token);
    setSessionUser(payload.user);
    return payload;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setSessionUser(null);
  };

  const value = useMemo(
    () => ({ token, user: sessionUser, loading, login, register, logout }),
    [token, sessionUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
