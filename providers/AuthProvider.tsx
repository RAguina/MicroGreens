'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginCredentials } from '@/lib/types';
import { realAuth, authStorage, AuthError } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verificar autenticación al cargar - usar backend real
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Intentar obtener usuario actual del backend (verifica cookie JWT)
        const currentUser = await realAuth.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          authStorage.setUser(currentUser); // Guardar en localStorage para UX
        } else {
          // No hay sesión activa, limpiar localStorage
          authStorage.removeUser();
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authStorage.removeUser();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      
      const { user: loggedInUser } = await realAuth.login(credentials);
      
      // Actualizar estado local
      setUser(loggedInUser);
      authStorage.setUser(loggedInUser);
      
    } catch (error) {
      // Re-lanzar error para que el componente pueda manejarlo
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Error inesperado durante el login');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Logout en el backend (borra cookie JWT)
      await realAuth.logout();
      
      // Limpiar estado local
      setUser(null);
      authStorage.removeUser();
      
      // Redirigir a login
      router.push('/login');
      
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Aunque el logout falle en el backend, limpiar estado local
      setUser(null);
      authStorage.removeUser();
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}