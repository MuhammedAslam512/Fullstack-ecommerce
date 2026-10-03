// ─────────────────────────────────────────────────────────────
// GLOBAL AUTHENTICATION CONTEXT (Supports Access Tokens)
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
      const savedToken = localStorage.getItem('token');
      if (savedToken && savedToken !== 'undefined') {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data || res.data.user);
          }
        } catch (error) {
          console.error('Failed to load user session:', error);
          logout();
        }
      } else {
        logout();
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // ── REGISTER USER ───────────────────────────────────────────
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      // ⚡ Handle BOTH accessToken (Dual-Token) or token (Single Token):
      const authToken = res.data.accessToken || res.data.token;
      const authUser = res.data.user;

      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(authUser);
      return res.data;
    }
  };

  // ── LOGIN USER ──────────────────────────────────────────────
  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.success) {
      // ⚡ Handle BOTH accessToken (Dual-Token) or token (Single Token):
      const authToken = res.data.accessToken || res.data.token;
      const authUser = res.data.user;

      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(authUser);
      return res.data;
    }
  };

  // ── LOGOUT USER ─────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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