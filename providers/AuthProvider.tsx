'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginCredentials } from '@/lib/types';
import { mockAuth, authStorage } from '@/lib/auth';

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

  // Verificar autenticación al cargar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authStorage.getToken();
        const savedUser = authStorage.getUser();
        
        if (token && savedUser) {
          // Verificar que el token siga siendo válido
          const verifiedUser = await mockAuth.verifyToken(token);
          if (verifiedUser) {
            setUser(verifiedUser);
          } else {
            // Token inválido, limpiar storage
            authStorage.removeToken();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authStorage.removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const { user: authenticatedUser, token } = await mockAuth.login(credentials);
      
      // Guardar en storage
      authStorage.setToken(token);
      authStorage.setUser(authenticatedUser);
      
      // Actualizar estado
      setUser(authenticatedUser);
      
      // Pequeña pausa para asegurar que las cookies se guarden
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirigir al dashboard
      router.push('/dashboard');
    } catch (error) {
      throw error; // Re-lanzar para que el componente de login pueda manejarlo
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await mockAuth.logout();
      
      // Limpiar storage y estado
      authStorage.removeToken();
      setUser(null);
      
      // Redirigir al login
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}