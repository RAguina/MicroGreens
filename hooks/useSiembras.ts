'use client';

import { useState, useEffect, useCallback } from 'react';
import { Siembra, SiembraFormData } from '@/lib/types';
import { TIEMPOS_CRECIMIENTO } from '@/lib/constants';

// Mock data - En una aplicación real esto vendría de una API
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
  {
    id: '3',
    tipo_microgreen: 'girasol',
    fecha_siembra: '2025-01-08',
    cantidad_sembrada: 60,
    ubicacion_bandeja: 'B1',
    fecha_esperada_cosecha: '2025-01-16',
    estado: 'sembrado',
    notas: 'Semillas de alta calidad',
    created_at: '2025-01-08T09:15:00Z',
    updated_at: '2025-01-08T09:15:00Z',
  },
  {
    id: '4',
    tipo_microgreen: 'rúcula',
    fecha_siembra: '2024-12-28',
    cantidad_sembrada: 45,
    ubicacion_bandeja: 'A3',
    fecha_esperada_cosecha: '2025-01-04',
    fecha_real_cosecha: '2025-01-04',
    estado: 'cosechado',
    created_at: '2024-12-28T11:20:00Z',
    updated_at: '2025-01-04T16:45:00Z',
  },
  {
    id: '5',
    tipo_microgreen: 'guisante',
    fecha_siembra: '2025-01-06',
    cantidad_sembrada: 35,
    ubicacion_bandeja: 'B2',
    fecha_esperada_cosecha: '2025-01-12',
    estado: 'creciendo',
    created_at: '2025-01-06T16:20:00Z',
    updated_at: '2025-01-06T16:20:00Z',
  },
];

interface UseSiembrasOptions {
  autoload?: boolean;
  filters?: {
    estado?: string;
    tipo?: string;
  };
}

export function useSiembras(options: UseSiembrasOptions = {}) {
  const { autoload = true, filters } = options;
  
  const [siembras, setSiembras] = useState<Siembra[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simular llamada a API para obtener siembras
  const fetchSiembras = useCallback(async () => {
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
    } catch (err) {
      setError('Error al cargar las siembras');
      console.error('Error fetching siembras:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

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
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calcular fecha esperada de cosecha
      const fechaEsperada = new Date(data.fecha_siembra);
      const diasCrecimiento = TIEMPOS_CRECIMIENTO[data.tipo_microgreen] || 7;
      fechaEsperada.setDate(fechaEsperada.getDate() + diasCrecimiento);
      
      const newSiembra: Siembra = {
        id: Date.now().toString(),
        ...data,
        fecha_esperada_cosecha: fechaEsperada.toISOString().split('T')[0],
        estado: 'sembrado',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Actualizar estado local
      setSiembras(prev => [newSiembra, ...prev]);
      
      return newSiembra;
    } catch (err) {
      const errorMessage = 'Error al crear la siembra';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Actualizar siembra existente
  const updateSiembra = useCallback(async (id: string, data: Partial<SiembraFormData>): Promise<Siembra> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedSiembra: Siembra = {
        ...siembras.find(s => s.id === id)!,
        ...data,
        updated_at: new Date().toISOString(),
      };
      
      // Actualizar estado local
      setSiembras(prev => 
        prev.map(s => s.id === id ? updatedSiembra : s)
      );
      
      return updatedSiembra;
    } catch (err) {
      const errorMessage = 'Error al actualizar la siembra';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [siembras]);

  // Eliminar siembra
  const deleteSiembra = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Actualizar estado local
      setSiembras(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      const errorMessage = 'Error al eliminar la siembra';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener una siembra por ID
  const getSiembraById = useCallback((id: string): Siembra | undefined => {
    return siembras.find(s => s.id === id);
  }, [siembras]);

  // Marcar siembra como cosechada
  const markAsHarvested = useCallback(async (id: string, fechaCosecha?: string): Promise<Siembra> => {
    const fechaReal = fechaCosecha || new Date().toISOString().split('T')[0];
    
    return updateSiembra(id, {
      estado: 'cosechado',
      fecha_real_cosecha: fechaReal,
    } as any);
  }, [updateSiembra]);

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

  return {
    // Estado
    siembras,
    isLoading,
    error,
    
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
  };
}

// Hook específico para obtener una siembra individual
export function useSiembra(id: string) {
  const [siembra, setSiembra] = useState<Siembra | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiembra = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const foundSiembra = MOCK_SIEMBRAS.find(s => s.id === id);
        
        if (!foundSiembra) {
          setError('Siembra no encontrada');
          return;
        }
        
        setSiembra(foundSiembra);
      } catch (err) {
        setError('Error al cargar la siembra');
        console.error('Error fetching siembra:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchSiembra();
    }
  }, [id]);

  return {
    siembra,
    isLoading,
    error,
    setSiembra,
    setError,
  };
}