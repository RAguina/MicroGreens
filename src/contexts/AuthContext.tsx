'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, authAPI } from '@/lib/auth';
import { csrfAPI } from '@/lib/csrf';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  accessToken: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize CSRF token and try silent refresh on mount
  useEffect(() => {
    console.log('AuthProvider mounted - initializing CSRF and attempting silent refresh');

    const initializeApp = async () => {
      try {
        // First, get CSRF token for future requests
        console.log('AuthProvider: Getting CSRF token...');
        await csrfAPI.getCSRFToken();
        console.log('AuthProvider: CSRF token obtained');

        // Then try silent refresh to restore session
        console.log('AuthProvider: Attempting silent refresh...');
        const result = await authAPI.refreshToken();

        if (result) {
          console.log('AuthProvider: Silent refresh successful:', result.user);
          setUser(result.user);
          setAccessToken(result.accessToken);
        } else {
          console.log('AuthProvider: No valid session found');
        }
      } catch (error) {
        console.error('AuthProvider: Error during initialization:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    console.log('AuthContext: logging in user');
    const result = await authAPI.login(credentials);
    console.log('AuthContext: login successful, setting user and token:', result);
    setUser(result.user);
    setAccessToken(result.accessToken);
    console.log('AuthContext: user state updated');
  };

  const logout = async () => {
    console.log('AuthContext: logging out user');
    await authAPI.logout();
    setUser(null);
    setAccessToken(null);
  };

  const updateUser = async (userData: User) => {
    console.log('AuthContext: updating user data');
    // In a real app, this would call an API to update the user
    // For now, we'll just update the local state
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};