import { User, LoginCredentials } from './types';

// Credenciales mockeadas
export const MOCK_CREDENTIALS = {
  email: 'admin@microgreens.com',
  password: 'admin123'
} as const;

export const MOCK_USER: User = {
  id: '1',
  email: 'admin@microgreens.com',
  name: 'Administrador',
  role: 'admin',
  avatar: '/placeholder-user.jpg'
};

// Token mock
const MOCK_TOKEN = 'mock-jwt-token-microgreens-2025';

// Storage keys
const TOKEN_KEY = 'microgreens-auth-token';
const USER_KEY = 'microgreens-user';

// Funciones de autenticación mock
export const mockAuth = {
  // Login simulado
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Validar credenciales
    if (
      credentials.email === MOCK_CREDENTIALS.email &&
      credentials.password === MOCK_CREDENTIALS.password
    ) {
      return {
        user: MOCK_USER,
        token: MOCK_TOKEN
      };
    } else {
      throw new Error('Credenciales inválidas');
    }
  },

  // Logout
  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // En un escenario real, invalidaríamos el token en el servidor
  },

  // Verificar token
  async verifyToken(token: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (token === MOCK_TOKEN) {
      return MOCK_USER;
    }
    return null;
  }
};

// Utilidades de storage
export const authStorage = {
  // Guardar token (localStorage + cookie)
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      // También guardar en cookie para que el middleware pueda leerlo
      document.cookie = `microgreens-auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 días
    }
  },

  // Obtener token
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  // Remover token (localStorage + cookie)
  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      // También remover cookie
      document.cookie = 'microgreens-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
  },

  // Guardar usuario
  setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  // Obtener usuario
  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }
};

// Utilidad para verificar si está autenticado
export const isAuthenticated = (): boolean => {
  return !!authStorage.getToken();
};