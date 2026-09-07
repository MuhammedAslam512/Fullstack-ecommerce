// ─────────────────────────────────────────────────────────────
// GLOBAL AUTHENTICATION CONTEXT
// ─────────────────────────────────────────────────────────────
import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Load user on startup if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
          }
        } catch (error) {
          console.error('Failed to load user session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // ── REGISTER USER ───────────────────────────────────────────
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      return res.data;
    }
  };

  // ── LOGIN USER ──────────────────────────────────────────────
  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.success) {
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      return res.data;
    }
  };

  // ── LOGOUT USER ─────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role?.toLowerCase() === 'admin',
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

