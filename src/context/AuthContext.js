import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyToken, getProfile } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      verifyToken(token)
        .then(() => getProfile())
        .then((res) => {
          const u = res.data?.data ?? res.data;
          setUser(u);
        })
        .catch(() => {
          localStorage.removeItem('access_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = (token, userData) => {
    localStorage.setItem('access_token', token);
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const refreshUser = () =>
    getProfile().then((res) => {
      const u = res.data?.data ?? res.data;
      setUser(u);
      return u;
    });

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
