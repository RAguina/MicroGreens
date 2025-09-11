'use client';

import { useState, useEffect, useCallback } from 'react';
import { Siembra, SiembraFormData } from '@/lib/types';
import { apiClient, isApiError, getErrorMessage } from '@/lib/api';
import { 
  backendToFrontendSiembra, 
  frontendToBackendPlanting, 
  updateBackendPlanting,
  convertPlantingsToSiembras 
} from '@/lib/adapters/plantingAdapter';

// Mock data como fallback
const MOCK_SIEMBRAS: Siembra[] = [
  {
    id: '1',
    tipo_microgreen: 'brócoli',
    fecha_siembra: '2025-01-05',
    cantidad_sembrada: 50,
    ubicacion_bandeja: 'A1',
    fecha_esperada_cosecha: '2025-01-12',
    estado: 'listo',
    notas: 'Primera siembra de prueba',
    created_at: '2025-01-05T10:00:00Z',
    updated_at: '2025-01-05T10:00:00Z',
  },
  {
    id: '2',
    tipo_microgreen: 'rábano',
    fecha_siembra: '2025-01-07',
    cantidad_sembrada: 40,
    ubicacion_bandeja: 'A2',
    fecha_esperada_cosecha: '2025-01-12',
    estado: 'creciendo',
    created_at: '2025-01-07T14:30:00Z',
    updated_at: '2025-01-07T14:30:00Z',
  },
];

interface UseSiembrasOptions {
  autoload?: boolean;
  useMockData?: boolean; // Nueva opción para forzar mock data
  filters?: {
    estado?: string;
    tipo?: string;
  };
}

export function useSiembras(options: UseSiembrasOptions = {}) {
  const { autoload = true, useMockData = false, filters } = options;
  
  const [siembras, setSiembras] = useState<Siembra[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // Función para usar mock data
  const useMockFallback = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let result = MOCK_SIEMBRAS;
      
      // Aplicar filtros si existen
      if (filters) {
        if (filters.estado && filters.estado !== 'all') {
          result = result.filter(s => s.estado === filters.estado);
        }
        if (filters.tipo && filters.tipo !== 'all') {
          result = result.filter(s => s.tipo_microgreen === filters.tipo);
        }
      }
      
      setSiembras(result);
      setIsConnected(false);
    } catch (err) {
      setError('Error al cargar las siembras (modo offline)');
      console.error('Error with mock data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Función para usar API real
  const fetchSiembrasFromAPI = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Intentar obtener todas las siembras (paginación simple por ahora)
      const response = await apiClient.getPlantings(1, 100, '');
      
      // Convertir plantings del backend a siembras del frontend
      let siembrasFromAPI = convertPlantingsToSiembras(response.data);
      
      // Aplicar filtros si existen
      if (filters) {
        if (filters.estado && filters.estado !== 'all') {
          siembrasFromAPI = siembrasFromAPI.filter(s => s.estado === filters.estado);
        }
        if (filters.tipo && filters.tipo !== 'all') {
          siembrasFromAPI = siembrasFromAPI.filter(s => s.tipo_microgreen === filters.tipo);
        }
      }
      
      setSiembras(siembrasFromAPI);
      setIsConnected(true);
    } catch (err) {
      console.error('API error, falling back to mock data:', err);
      setIsConnected(false);
      
      // Fallback a mock data si la API falla
      await useMockFallback();
    } finally {
      setIsLoading(false);
    }
  }, [filters, useMockFallback]);

  // Función principal de fetch que decide qué usar
  const fetchSiembras = useCallback(async () => {
    if (useMockData) {
      await useMockFallback();
    } else {
      await fetchSiembrasFromAPI();
    }
  }, [useMockData, useMockFallback, fetchSiembrasFromAPI]);

  // Cargar siembras automáticamente al montar el componente
  useEffect(() => {
    if (autoload) {
      fetchSiembras();
    }
  }, [autoload, fetchSiembras]);

  // Crear nueva siembra
  const createSiembra = useCallback(async (data: SiembraFormData): Promise<Siembra> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (useMockData || !isConnected) {
        // Modo mock/offline
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newSiembra: Siembra = {
          id: Date.now().toString(),
          ...data,
          fecha_esperada_cosecha: data.fecha_esperada_cosecha || 
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          estado: 'sembrado',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        setSiembras(prev => [newSiembra, ...prev]);
        return newSiembra;
      } else {
        // Modo API real
        // TODO: Obtener userId real cuando se implemente autenticación
        const tempUserId = 'temp-user-id'; // Temporal hasta implementar auth
        const backendData = frontendToBackendPlanting(data, tempUserId);
        const response = await apiClient.createPlanting(backendData);
        const newSiembra = backendToFrontendSiembra(response);
        
        setSiembras(prev => [newSiembra, ...prev]);
        return newSiembra;
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [useMockData, isConnected]);

  // Actualizar siembra existente
  const updateSiembra = useCallback(async (id: string, data: Partial<SiembraFormData>): Promise<Siembra> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (useMockData || !isConnected) {
        // Modo mock/offline
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const updatedSiembra: Siembra = {
          ...siembras.find(s => s.id === id)!,
          ...data,
          updated_at: new Date().toISOString(),
        };
        
        setSiembras(prev => 
          prev.map(s => s.id === id ? updatedSiembra : s)
        );
        
        return updatedSiembra;
      } else {
        // Modo API real
        const existingSiembra = siembras.find(s => s.id === id);
        if (!existingSiembra) {
          throw new Error('Siembra no encontrada');
        }
        
        // Obtener el planting original del backend
        const originalPlanting = await apiClient.getPlanting(id);
        const backendUpdates = updateBackendPlanting(originalPlanting, data);
        
        const response = await apiClient.updatePlanting(id, backendUpdates);
        const updatedSiembra = backendToFrontendSiembra(response);
        
        setSiembras(prev => 
          prev.map(s => s.id === id ? updatedSiembra : s)
        );
        
        return updatedSiembra;
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [useMockData, isConnected, siembras]);

  // Eliminar siembra
  const deleteSiembra = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (useMockData || !isConnected) {
        // Modo mock/offline
        await new Promise(resolve => setTimeout(resolve, 500));
        setSiembras(prev => prev.filter(s => s.id !== id));
      } else {
        // Modo API real
        await apiClient.deletePlanting(id);
        setSiembras(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [useMockData, isConnected]);

  // Obtener una siembra por ID
  const getSiembraById = useCallback((id: string): Siembra | undefined => {
    return siembras.find(s => s.id === id);
  }, [siembras]);

  // Marcar siembra como cosechada
  const markAsHarvested = useCallback(async (id: string, peso: number, fechaCosecha?: string): Promise<Siembra> => {
    const fecha = fechaCosecha || new Date().toISOString().split('T')[0];
    
    if (useMockData || !isConnected) {
      // Modo mock
      return updateSiembra(id, {
        estado: 'cosechado',
        fecha_real_cosecha: fecha,
        notas: `Cosechado: ${peso}g el ${fecha}`,
      } as any);
    } else {
      // Modo API real - actualizar el yield en el backend
      const backendUpdates = {
        yield: peso,
        notes: `Cosechado: ${peso}g el ${fecha}`,
      };
      
      const response = await apiClient.updatePlanting(id, backendUpdates);
      const updatedSiembra = backendToFrontendSiembra(response);
      
      setSiembras(prev => 
        prev.map(s => s.id === id ? updatedSiembra : s)
      );
      
      return updatedSiembra;
    }
  }, [useMockData, isConnected, updateSiembra]);

  // Obtener estadísticas básicas
  const getStats = useCallback(() => {
    const stats = {
      total: siembras.length,
      sembradas: siembras.filter(s => s.estado === 'sembrado').length,
      creciendo: siembras.filter(s => s.estado === 'creciendo').length,
      listas: siembras.filter(s => s.estado === 'listo').length,
      cosechadas: siembras.filter(s => s.estado === 'cosechado').length,
    };
    
    return stats;
  }, [siembras]);

  // Obtener siembras próximas a cosechar
  const getUpcomingHarvests = useCallback((days: number = 3) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return siembras.filter(s => {
      if (s.estado === 'cosechado') return false;
      
      const expectedDate = new Date(s.fecha_esperada_cosecha);
      return expectedDate >= today && expectedDate <= futureDate;
    }).sort((a, b) => 
      new Date(a.fecha_esperada_cosecha).getTime() - new Date(b.fecha_esperada_cosecha).getTime()
    );
  }, [siembras]);

  // Obtener siembras por tipo
  const getSiembrasByType = useCallback((tipo: string) => {
    return siembras.filter(s => s.tipo_microgreen === tipo);
  }, [siembras]);

  // Obtener siembras por estado
  const getSiembrasByEstado = useCallback((estado: string) => {
    return siembras.filter(s => s.estado === estado);
  }, [siembras]);

  // Verificar conexión con backend
  const checkConnection = useCallback(async () => {
    try {
      await apiClient.healthCheck();
      setIsConnected(true);
      return true;
    } catch (error) {
      setIsConnected(false);
      return false;
    }
  }, []);

  return {
    // Estado
    siembras,
    isLoading,
    error,
    isConnected,
    
    // Acciones CRUD
    fetchSiembras,
    createSiembra,
    updateSiembra,
    deleteSiembra,
    
    // Utilidades
    getSiembraById,
    markAsHarvested,
    
    // Estadísticas y filtros
    getStats,
    getUpcomingHarvests,
    getSiembrasByType,
    getSiembrasByEstado,
    
    // Control de estado
    setError,
    clearError: () => setError(null),
    
    // Control de conexión
    checkConnection,
  };
}

// Hook específico para obtener una siembra individual
export function useSiembra(id: string, useMockData = false) {
  const [siembra, setSiembra] = useState<Siembra | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiembra = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (useMockData) {
          // Modo mock
          await new Promise(resolve => setTimeout(resolve, 500));
          const foundSiembra = MOCK_SIEMBRAS.find(s => s.id === id);
          
          if (!foundSiembra) {
            setError('Siembra no encontrada');
            return;
          }
          
          setSiembra(foundSiembra);
        } else {
          // Modo API real
          const response = await apiClient.getPlanting(id);
          const siembraFromAPI = backendToFrontendSiembra(response);
          setSiembra(siembraFromAPI);
        }
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        console.error('Error fetching siembra:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchSiembra();
    }
  }, [id, useMockData]);

  return {
    siembra,
    isLoading,
    error,
    setSiembra,
    setError,
  };
}