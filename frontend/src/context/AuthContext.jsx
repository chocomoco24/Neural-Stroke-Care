import { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // The JWT lives in an httpOnly cookie (not readable by JS). We keep only the
  // non-sensitive user profile in localStorage for UI state across reloads.
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('nsc_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('nsc_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    authService.logout(); // clears the httpOnly cookie server-side
    setUser(null);
    localStorage.removeItem('nsc_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
