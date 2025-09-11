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
  
  // Emergency fallback - skip auth check if there are repeated failures
  const [skipAuthCheck] = useState(() => {
    if (typeof window !== 'undefined') {
      const failures = localStorage.getItem('auth-failures');
      return failures && parseInt(failures) > 3;
    }
    return false;
  });

  // Verificar autenticación al cargar - usar backend real
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const initAuth = async () => {
      try {
        console.log('🔍 [AuthProvider] Checking authentication status...');
        
        // Skip auth check if emergency fallback is active
        if (skipAuthCheck) {
          console.log('⚠️ [AuthProvider] Skipping auth check due to repeated failures');
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }
        
        // Timeout de 10 segundos para evitar cuelgue
        const authPromise = realAuth.getCurrentUser();
        const timeoutPromise = new Promise<null>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Auth timeout - taking too long to respond'));
          }, 10000);
        });
        
        // Race entre la auth y el timeout
        const currentUser = await Promise.race([authPromise, timeoutPromise]);
        
        // Limpiar timeout si llegamos aquí
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        if (!mounted) return; // Prevent state update if component unmounted
        
        if (currentUser) {
          console.log('✅ [AuthProvider] User authenticated:', currentUser.email);
          setUser(currentUser);
          authStorage.setUser(currentUser); // Guardar en localStorage para UX
          // Reset failure count on success
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-failures');
          }
        } else {
          console.log('❌ [AuthProvider] No authenticated user found');
          // No hay sesión activa, limpiar localStorage
          authStorage.removeUser();
          setUser(null);
        }
      } catch (error) {
        console.error('❌ [AuthProvider] Error initializing auth:', error);
        
        // Track failures
        if (typeof window !== 'undefined') {
          const currentFailures = parseInt(localStorage.getItem('auth-failures') || '0');
          localStorage.setItem('auth-failures', String(currentFailures + 1));
        }
        
        if (mounted) {
          authStorage.removeUser();
          setUser(null);
        }
      } finally {
        if (mounted) {
          console.log('✅ [AuthProvider] Auth initialization complete');
          setIsLoading(false);
        }
        // Limpiar timeout en caso de que aún esté activo
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };

    initAuth();
    
    // Cleanup function
    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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