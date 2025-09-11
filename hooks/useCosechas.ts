'use client';

import { useState, useEffect, useCallback } from 'react';
import { Cosecha, CosechaFormData, Siembra } from '@/lib/types';
import { apiClient, getErrorMessage } from '@/lib/api';
import { convertPlantingsToCosechas } from '@/lib/adapters/plantingAdapter';

// Mock data - En una aplicación real esto vendría de una API
const MOCK_COSECHAS: Cosecha[] = [
  {
    id: '1',
    siembra_id: '4',
    fecha_cosecha: '2025-01-04',
    peso_cosechado: 85.5,
    calidad: 4,
    notas: 'Excelente cosecha, muy buena textura',
    created_at: '2025-01-04T16:45:00Z',
  },
  {
    id: '2',
    siembra_id: '1',
    fecha_cosecha: '2025-01-03',
    peso_cosechado: 92.3,
    calidad: 5,
    notas: 'Cosecha perfecta, color intenso y sabor excelente',
    created_at: '2025-01-03T14:20:00Z',
  },
  {
    id: '3',
    siembra_id: '2',
    fecha_cosecha: '2024-12-30',
    peso_cosechado: 78.0,
    calidad: 3,
    notas: 'Cosecha regular, algunas hojas amarillentas',
    created_at: '2024-12-30T11:30:00Z',
  },
  {
    id: '4',
    siembra_id: '3',
    fecha_cosecha: '2024-12-28',
    peso_cosechado: 105.2,
    calidad: 4,
    notas: 'Muy buen rendimiento, sabor suave',
    created_at: '2024-12-28T09:15:00Z',
  },
  {
    id: '5',
    siembra_id: '5',
    fecha_cosecha: '2024-12-25',
    peso_cosechado: 67.8,
    calidad: 3,
    created_at: '2024-12-25T10:30:00Z',
  },
];

interface UseCosechasOptions {
  autoload?: boolean;
  useMockData?: boolean; // Nueva opción para forzar mock data
  filters?: {
    siembra_id?: string;
    tipo?: string;
    calidad_min?: number;
  };
}

export function useCosechas(options: UseCosechasOptions = {}) {
  const { autoload = true, useMockData = false, filters } = options;
  
  const [cosechas, setCosechas] = useState<Cosecha[]>([]);
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
      
      let result = MOCK_COSECHAS;
      
      // Aplicar filtros si existen
      if (filters) {
        if (filters.siembra_id) {
          result = result.filter(c => c.siembra_id === filters.siembra_id);
        }
        if (filters.calidad_min) {
          result = result.filter(c => c.calidad >= filters.calidad_min);
        }
      }
      
      // Ordenar por fecha más reciente
      result = result.sort((a, b) => 
        new Date(b.fecha_cosecha).getTime() - new Date(a.fecha_cosecha).getTime()
      );
      
      setCosechas(result);
      setIsConnected(false);
    } catch (err) {
      setError('Error al cargar las cosechas (modo offline)');
      console.error('Error with mock cosechas:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Función para usar API real
  const fetchCosechasFromAPI = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Obtener plantings cosechados (con yield > 0)
      const response = await apiClient.getPlantings(1, 100, '');
      
      // Convertir plantings cosechados a cosechas
      let cosechasFromAPI = convertPlantingsToCosechas(response.data);
      
      // Aplicar filtros si existen
      if (filters) {
        if (filters.siembra_id) {
          cosechasFromAPI = cosechasFromAPI.filter(c => c.siembra_id === filters.siembra_id);
        }
        if (filters.calidad_min) {
          cosechasFromAPI = cosechasFromAPI.filter(c => c.calidad >= filters.calidad_min);
        }
      }
      
      // Ordenar por fecha más reciente
      cosechasFromAPI = cosechasFromAPI.sort((a, b) => 
        new Date(b.fecha_cosecha).getTime() - new Date(a.fecha_cosecha).getTime()
      );
      
      setCosechas(cosechasFromAPI);
      setIsConnected(true);
    } catch (err) {
      console.error('API error, falling back to mock cosechas:', err);
      setIsConnected(false);
      
      // Fallback a mock data si la API falla
      await useMockFallback();
    } finally {
      setIsLoading(false);
    }
  }, [filters, useMockFallback]);

  // Función principal de fetch que decide qué usar
  const fetchCosechas = useCallback(async () => {
    if (useMockData) {
      await useMockFallback();
    } else {
      await fetchCosechasFromAPI();
    }
  }, [useMockData, useMockFallback, fetchCosechasFromAPI]);

  // Cargar cosechas automáticamente al montar el componente
  useEffect(() => {
    if (autoload) {
      fetchCosechas();
    }
  }, [autoload, fetchCosechas]);

  // Crear nueva cosecha
  const createCosecha = useCallback(async (data: CosechaFormData): Promise<Cosecha> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCosecha: Cosecha = {
        id: Date.now().toString(),
        ...data,
        created_at: new Date().toISOString(),
      };
      
      // Actualizar estado local
      setCosechas(prev => [newCosecha, ...prev]);
      
      return newCosecha;
    } catch (err) {
      const errorMessage = 'Error al crear la cosecha';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Actualizar cosecha existente
  const updateCosecha = useCallback(async (id: string, data: Partial<CosechaFormData>): Promise<Cosecha> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const existingCosecha = cosechas.find(c => c.id === id);
      if (!existingCosecha) {
        throw new Error('Cosecha no encontrada');
      }
      
      const updatedCosecha: Cosecha = {
        ...existingCosecha,
        ...data,
      };
      
      // Actualizar estado local
      setCosechas(prev => 
        prev.map(c => c.id === id ? updatedCosecha : c)
      );
      
      return updatedCosecha;
    } catch (err) {
      const errorMessage = 'Error al actualizar la cosecha';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [cosechas]);

  // Eliminar cosecha
  const deleteCosecha = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Actualizar estado local
      setCosechas(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      const errorMessage = 'Error al eliminar la cosecha';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener una cosecha por ID
  const getCosechaById = useCallback((id: string): Cosecha | undefined => {
    return cosechas.find(c => c.id === id);
  }, [cosechas]);

  // Obtener cosechas por siembra
  const getCosechasBySiembra = useCallback((siembraId: string): Cosecha[] => {
    return cosechas.filter(c => c.siembra_id === siembraId);
  }, [cosechas]);

  // Obtener estadísticas generales
  const getStats = useCallback(() => {
    const total = cosechas.length;
    const pesoTotal = cosechas.reduce((sum, c) => sum + c.peso_cosechado, 0);
    const calidadPromedio = total > 0 
      ? cosechas.reduce((sum, c) => sum + c.calidad, 0) / total 
      : 0;

    // Estadísticas por período
    const now = new Date();
    const mesActual = now.getMonth();
    const añoActual = now.getFullYear();
    
    const cosechasEsteMes = cosechas.filter(c => {
      const fecha = new Date(c.fecha_cosecha);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
    });
    
    const cosechasSemanaAnterior = cosechas.filter(c => {
      const fecha = new Date(c.fecha_cosecha);
      const hace7Dias = new Date();
      hace7Dias.setDate(hace7Dias.getDate() - 7);
      return fecha >= hace7Dias;
    });

    return {
      total,
      pesoTotal: Math.round(pesoTotal * 10) / 10,
      calidadPromedio: Math.round(calidadPromedio * 10) / 10,
      cosechasEsteMes: cosechasEsteMes.length,
      pesoEsteMes: Math.round(cosechasEsteMes.reduce((sum, c) => sum + c.peso_cosechado, 0) * 10) / 10,
      cosechasSemanaAnterior: cosechasSemanaAnterior.length,
    };
  }, [cosechas]);

  // Obtener estadísticas por tipo de microgreen
  const getStatsByType = useCallback((siembras: Siembra[]) => {
    const siembrasMap = siembras.reduce((acc, siembra) => {
      acc[siembra.id] = siembra;
      return acc;
    }, {} as Record<string, Siembra>);

    const statsByType: Record<string, {
      tipo: string;
      totalCosechas: number;
      pesoTotal: number;
      pesoPromedio: number;
      calidadPromedio: number;
    }> = {};

    cosechas.forEach(cosecha => {
      const siembra = siembrasMap[cosecha.siembra_id];
      if (!siembra) return;

      const tipo = siembra.tipo_microgreen;
      if (!statsByType[tipo]) {
        statsByType[tipo] = {
          tipo,
          totalCosechas: 0,
          pesoTotal: 0,
          pesoPromedio: 0,
          calidadPromedio: 0,
        };
      }

      statsByType[tipo].totalCosechas++;
      statsByType[tipo].pesoTotal += cosecha.peso_cosechado;
    });

    // Calcular promedios
    Object.values(statsByType).forEach(stat => {
      stat.pesoPromedio = Math.round((stat.pesoTotal / stat.totalCosechas) * 10) / 10;
      
      const cosechasTipo = cosechas.filter(c => {
        const siembra = siembrasMap[c.siembra_id];
        return siembra && siembra.tipo_microgreen === stat.tipo;
      });
      
      stat.calidadPromedio = Math.round(
        (cosechasTipo.reduce((sum, c) => sum + c.calidad, 0) / cosechasTipo.length) * 10
      ) / 10;
    });

    return Object.values(statsByType).sort((a, b) => b.pesoTotal - a.pesoTotal);
  }, [cosechas]);

  // Obtener cosechas recientes
  const getRecentCosechas = useCallback((limit: number = 5) => {
    return cosechas
      .sort((a, b) => new Date(b.fecha_cosecha).getTime() - new Date(a.fecha_cosecha).getTime())
      .slice(0, limit);
  }, [cosechas]);

  // Obtener cosechas por calidad
  const getCosechasByQuality = useCallback((calidad: number) => {
    return cosechas.filter(c => c.calidad === calidad);
  }, [cosechas]);

  // Obtener rendimiento promedio para un tipo de microgreen
  const getAverageYieldByType = useCallback((tipo: string, siembras: Siembra[]) => {
    const siembrasDelTipo = siembras.filter(s => s.tipo_microgreen === tipo);
    const cosechasDelTipo = cosechas.filter(c => 
      siembrasDelTipo.some(s => s.id === c.siembra_id)
    );

    if (cosechasDelTipo.length === 0) return 0;

    const pesoTotal = cosechasDelTipo.reduce((sum, c) => sum + c.peso_cosechado, 0);
    return Math.round((pesoTotal / cosechasDelTipo.length) * 10) / 10;
  }, [cosechas]);

  return {
    // Estado
    cosechas,
    isLoading,
    error,
    isConnected,
    
    // Acciones CRUD
    fetchCosechas,
    createCosecha,
    updateCosecha,
    deleteCosecha,
    
    // Utilidades
    getCosechaById,
    getCosechasBySiembra,
    
    // Estadísticas y análisis
    getStats,
    getStatsByType,
    getRecentCosechas,
    getCosechasByQuality,
    getAverageYieldByType,
    
    // Control de estado
    setError,
    clearError: () => setError(null),
  };
}

// Hook específico para obtener una cosecha individual
export function useCosecha(id: string) {
  const [cosecha, setCosecha] = useState<Cosecha | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCosecha = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const foundCosecha = MOCK_COSECHAS.find(c => c.id === id);
        
        if (!foundCosecha) {
          setError('Cosecha no encontrada');
          return;
        }
        
        setCosecha(foundCosecha);
      } catch (err) {
        setError('Error al cargar la cosecha');
        console.error('Error fetching cosecha:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCosecha();
    }
  }, [id]);

  return {
    cosecha,
    isLoading,
    error,
    setCosecha,
    setError,
  };
}

// Hook para obtener cosechas de una siembra específica
export function useCosechasBySiembra(siembraId: string) {
  const { cosechas, isLoading, error, fetchCosechas } = useCosechas({
    autoload: true,
    filters: { siembra_id: siembraId }
  });

  return {
    cosechas,
    isLoading,
    error,
    refetch: fetchCosechas,
  };
}