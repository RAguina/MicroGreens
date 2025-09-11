/**
 * 🌱 MicroGreens API Client
 * 
 * Cliente HTTP para conectar con el backend de MicroGreens.
 * Basado en API_REFERENCE.md para producción.
 */

// Tipos del backend (basados en schema de Prisma)
export interface BackendPlanting {
  id: string;
  plantName: string;
  datePlanted: string; // API devuelve como string ISO
  expectedHarvest?: string;
  domeDate?: string;
  lightDate?: string;
  quantity?: number; // Int? en Prisma, puede ser null
  yield?: number; // Float? en Prisma, puede ser null
  notes?: string;
  createdAt: string; // API devuelve como string ISO
  updatedAt: string; // API devuelve como string ISO
  deletedAt?: string;
  userId: string; // Campo requerido en Prisma
}

export interface BackendUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'GROWER' | 'VIEWER';
  createdAt: string;
  updatedAt: string;
  plantingsCount?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
    value: any;
  }>;
}

export class MicroGreensApiError extends Error {
  public statusCode: number;
  public details?: ApiError['details'];

  constructor(message: string, statusCode: number, details?: ApiError['details']) {
    super(message);
    this.name = 'MicroGreensApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Cliente API principal para MicroGreens
 */
export class MicroGreensAPI {
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  }

  /**
   * Método base para todas las requests HTTP
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      credentials: 'include', // Importante para cookies HttpOnly
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Parsear respuesta
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const apiError = data as ApiError;
        throw new MicroGreensApiError(
          apiError.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          apiError.details
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof MicroGreensApiError) {
        throw error;
      }
      
      // Error de red o parsing
      throw new MicroGreensApiError(
        'Error de conexión con el servidor',
        0
      );
    }
  }

  // ==============================================
  // 🔑 AUTHENTICATION METHODS
  // ==============================================

  /**
   * Registrar nuevo usuario
   */
  async register(email: string, password: string, name: string) {
    return this.request<{ message: string; user: BackendUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  /**
   * Iniciar sesión
   */
  async login(email: string, password: string) {
    return this.request<{ message: string; user: BackendUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    return this.request<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    });
  }

  /**
   * Obtener usuario actual (requiere autenticación)
   */
  async getMe() {
    return this.request<{ user: BackendUser }>('/api/auth/me');
  }

  /**
   * Actualizar perfil (requiere autenticación)
   */
  async updateProfile(updates: { name?: string; email?: string }) {
    return this.request<{ user: BackendUser }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Cambiar contraseña (requiere autenticación)
   */
  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    return this.request<{ message: string }>('/api/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
  }

  // ==============================================
  // 🌱 PLANTINGS CRUD METHODS
  // ==============================================

  /**
   * Obtener lista paginada de siembras
   */
  async getPlantings(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append('plantName', search);
    }

    return this.request<PaginatedResponse<BackendPlanting>>(`/api/plantings?${params}`);
  }

  /**
   * Obtener una siembra por ID
   */
  async getPlanting(id: string) {
    return this.request<BackendPlanting>(`/api/plantings/${id}`);
  }

  /**
   * Crear nueva siembra
   */
  async createPlanting(data: {
    plantName: string;
    datePlanted: string;
    expectedHarvest?: string;
    domeDate?: string;
    lightDate?: string;
    quantity?: number;
    yield?: number;
    notes?: string;
  }) {
    return this.request<BackendPlanting>('/api/plantings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Actualizar siembra existente
   */
  async updatePlanting(id: string, updates: Partial<{
    plantName: string;
    datePlanted: string;
    expectedHarvest: string;
    domeDate: string;
    lightDate: string;
    quantity: number;
    yield: number;
    notes: string;
  }>) {
    return this.request<BackendPlanting>(`/api/plantings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Eliminar siembra (soft delete)
   */
  async deletePlanting(id: string) {
    return this.request<{ message: string }>(`/api/plantings/${id}`, {
      method: 'DELETE',
    });
  }

  // ==============================================
  // 📊 HEALTH & UTILITY METHODS
  // ==============================================

  /**
   * Verificar estado del servidor
   */
  async healthCheck() {
    return this.request<{
      status: string;
      timestamp: string;
      environment: string;
    }>('/health');
  }

  /**
   * Obtener configuración del cliente (útil para debugging)
   */
  getConfig() {
    return {
      baseURL: this.baseURL,
      environment: process.env.NODE_ENV,
    };
  }
}

// ==============================================
// 📦 INSTANCIA GLOBAL DEL CLIENTE
// ==============================================

/**
 * Instancia global del cliente API
 * Usar en toda la aplicación para mantener configuración consistente
 */
export const apiClient = new MicroGreensAPI();

// ==============================================
// 🔧 HELPER FUNCTIONS
// ==============================================

/**
 * Verificar si un error es de tipo API
 */
export const isApiError = (error: unknown): error is MicroGreensApiError => {
  return error instanceof MicroGreensApiError;
};

/**
 * Obtener mensaje de error legible para el usuario
 */
export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    // Si hay detalles de validación, mostrar el primer error
    if (error.details && error.details.length > 0) {
      return error.details[0].message;
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Error inesperado';
};

/**
 * Verificar si hay conexión con el backend
 */
export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    await apiClient.healthCheck();
    return true;
  } catch (error) {
    console.error('Backend connection failed:', error);
    return false;
  }
};

// ==============================================
// 🧪 DEVELOPMENT HELPERS
// ==============================================

if (process.env.NODE_ENV === 'development') {
  // Exponer en window para debugging en desarrollo
  if (typeof window !== 'undefined') {
    (window as any).microGreensAPI = apiClient;
    (window as any).checkBackendConnection = checkBackendConnection;
  }
}