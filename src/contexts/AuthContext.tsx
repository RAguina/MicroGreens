'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, authAPI } from '@/lib/auth';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    console.log('AuthProvider mounted - checking current user');
    authAPI.getCurrentUser()
      .then((userData) => {
        console.log('Current user result:', userData);
        setUser(userData);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (credentials: LoginCredentials) => {
    console.log('AuthContext: logging in user');
    const userData = await authAPI.login(credentials);
    console.log('AuthContext: login successful, setting user:', userData);
    setUser(userData);
    console.log('AuthContext: user state updated');
    
    // Verificar inmediatamente después del login
    setTimeout(async () => {
      console.log('AuthContext: Checking user persistence after login...');
      const currentUser = await authAPI.getCurrentUser();
      console.log('AuthContext: getCurrentUser after login returned:', currentUser);
    }, 1000);
  };

  const logout = async () => {
    console.log('AuthContext: logging out user');
    await authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};