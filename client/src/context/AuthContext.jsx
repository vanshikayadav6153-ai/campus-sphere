import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('campus_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Calls /api/auth/me on load and checks URL for OAuth callback tokens
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);

      // Check if OAuth callback passed ?token=... in the URL
      const searchParams = new URLSearchParams(window.location.search);
      const urlToken = searchParams.get('token');
      if (urlToken) {
        localStorage.setItem('campus_token', urlToken);
        // Clean token from browser history without refreshing
        const cleanPath = window.location.pathname.replace(/\/+/g, '/');
        window.history.replaceState({}, document.title, cleanPath);
      }

      const res = await api.get('/api/auth/me');
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('campus_user', JSON.stringify(res.data.user));
      } else {
        // If server says unauthorized, clear invalid session
        localStorage.removeItem('campus_user');
        localStorage.removeItem('campus_token');
        setUser(null);
      }
    } catch (err) {
      // If server is temporarily unreachable, maintain cached session if present
      const cached = localStorage.getItem('campus_user');
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Logout clears server cookie and local user state
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.warn('Logout request warning:', err);
    } finally {
      localStorage.removeItem('campus_token');
      localStorage.removeItem('campus_user');
      setUser(null);
      window.location.href = '/login';
    }
  };

  // Helper for direct domain verification and dev testing
  const devLogin = async (email, name) => {
    const allowedDomain = 'gmail.com';
    const normalizedEmail = (email || '').toLowerCase().trim();

    // Client-side domain gating check
    if (!normalizedEmail.endsWith(`@${allowedDomain}`) && !normalizedEmail.endsWith('@college.ac.in')) {
      throw new Error(`Access Restricted: Only emails ending with @${allowedDomain} or @college.ac.in are authorized.`);
    }

    try {
      const res = await api.post('/api/auth/dev-login', { email: normalizedEmail, name });
      if (res.data?.success && res.data?.user) {
        if (res.data.token) {
          localStorage.setItem('campus_token', res.data.token);
        }
        localStorage.setItem('campus_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data.user;
      }
    } catch (err) {
      // Fallback for standalone demo / offline preview
      const fallbackUser = {
        _id: `demo_${Date.now()}`,
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(normalizedEmail)}`,
        credits: 10,
        heldCredits: 0,
      };
      localStorage.setItem('campus_user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      return fallbackUser;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, checkAuth, devLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
