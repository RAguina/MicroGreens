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
    let mounted = true;
    
    const initAuth = async () => {
      try {
        console.log('🔍 [AuthProvider] Checking authentication status...');
        
        // Intentar obtener usuario actual del backend (verifica cookie JWT)
        const currentUser = await realAuth.getCurrentUser();
        
        if (!mounted) return; // Prevent state update if component unmounted
        
        if (currentUser) {
          console.log('✅ [AuthProvider] User authenticated:', currentUser.email);
          setUser(currentUser);
          authStorage.setUser(currentUser); // Guardar en localStorage para UX
        } else {
          console.log('❌ [AuthProvider] No authenticated user found');
          // No hay sesión activa, limpiar localStorage
          authStorage.removeUser();
          setUser(null);
        }
      } catch (error) {
        console.error('❌ [AuthProvider] Error initializing auth:', error);
        if (mounted) {
          authStorage.removeUser();
          setUser(null);
        }
      } finally {
        if (mounted) {
          console.log('✅ [AuthProvider] Auth initialization complete');
          setIsLoading(false);
        }
      }
    };

    initAuth();
    
    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('🔐 [AuthProvider] Attempting login for:', credentials.email);
      setIsLoading(true);
      
      const { user: loggedInUser } = await realAuth.login(credentials);
      
      console.log('✅ [AuthProvider] Login successful for:', loggedInUser.email);
      
      // Actualizar estado local
      setUser(loggedInUser);
      authStorage.setUser(loggedInUser);
      
    } catch (error) {
      console.error('❌ [AuthProvider] Login failed:', error);
      
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