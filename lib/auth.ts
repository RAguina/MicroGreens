import { User, LoginCredentials } from './types';

/**
 * 🔑 Autenticación Real con Backend JWT
 * Integración completa con micro-greens-backend.vercel.app
 */

const API_BASE = 'https://micro-greens-backend.vercel.app';

// Usuario demo para testing (del backend real)
export const DEMO_CREDENTIALS = {
  email: 'demo@microgreens.com',
  password: 'demo123'
} as const;

// Clase de error personalizada
export class AuthError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Cliente HTTP con soporte para cookies JWT HttpOnly
 */
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const fullUrl = `${API_BASE}${endpoint}`;
  console.log(`🌐 [Auth API] ${options.method || 'GET'} ${fullUrl}`);
  console.log(`📤 [Auth API] Request body:`, options.body);
  console.log(`📤 [Auth API] Request headers:`, options.headers);
  
  try {
    const requestConfig = {
      ...options,
      credentials: 'include' as RequestCredentials, // CRÍTICO para JWT cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    console.log(`📤 [Auth API] Full request config:`, requestConfig);
    
    const response = await fetch(fullUrl, requestConfig);

    console.log(`📡 [Auth API] Response: ${response.status} ${response.statusText}`);
    console.log(`📡 [Auth API] Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      const error = new AuthError(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
      console.error('❌ [Auth API] Error response:', errorData);
      throw error;
    }

    const data = await response.json();
    console.log('✅ [Auth API] Success response:', data);
    return data;
  } catch (error) {
    if (error instanceof AuthError) {
      console.error('❌ [Auth API] Auth Error:', error.message, error.statusCode);
      throw error;
    }
    console.error('❌ [Auth API] Network/Parse error:', error);
    throw new AuthError('Error de conexión con el servidor');
  }
};

/**
 * 🔐 Funciones de autenticación real con backend
 */
export const realAuth = {
  /**
   * Login con backend real - setea cookie JWT automáticamente
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; token?: string }> {
    try {
      const response = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      });

      // El backend debería devolver { user: User, success: boolean }
      if (!response.user) {
        throw new AuthError('Respuesta de login inválida del servidor');
      }

      return {
        user: response.user,
        token: 'jwt-cookie' // Token está en cookie HttpOnly
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Error al conectar con el servidor de autenticación');
    }
  },

  /**
   * Verificar estado de autenticación actual
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiCall('/api/auth/me');
      return response.user || null;
    } catch (error) {
      // Si falla = no está autenticado
      return null;
    }
  },

  /**
   * Logout - borra cookie JWT automáticamente
   */
  async logout(): Promise<void> {
    try {
      await apiCall('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      // Ignorar errores de logout, limpiar estado local de todos modos
      console.warn('Error during logout:', error);
    }
  },

  /**
   * Verificar si token es válido (usando endpoint /me)
   */
  async verifyToken(token?: string): Promise<User | null> {
    // Con JWT cookies, no necesitamos verificar token manualmente
    // Solo verificamos con el endpoint /me
    return this.getCurrentUser();
  }
};

/**
 * 💾 Storage helper para datos de usuario (sin token)
 */
export const authStorage = {
  // Clave para datos de usuario en localStorage
  USER_KEY: 'microgreens-user',

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  },

  setUser(user: User): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  },

  removeUser(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Error removing user from localStorage:', error);
    }
  },

  // Métodos legacy para compatibilidad (pero no usamos tokens locales)
  getToken(): string | null {
    return 'jwt-cookie'; // Token está en cookie HttpOnly
  },

  removeToken(): void {
    this.removeUser(); // Solo limpiamos datos de usuario
  }
};

/**
 * 🚀 Helper para requests autenticadas
 */
export const makeAuthenticatedRequest = async (
  endpoint: string, 
  options: RequestInit = {},
  onAuthError?: () => void
) => {
  try {
    return await apiCall(endpoint, options);
  } catch (error) {
    if (error instanceof AuthError && (error.statusCode === 401 || error.statusCode === 403)) {
      // Token expirado o inválido
      authStorage.removeUser();
      if (onAuthError) {
        onAuthError();
      }
    }
    throw error;
  }
};

// Exportar como default para compatibilidad
export const mockAuth = realAuth;
export default realAuth;