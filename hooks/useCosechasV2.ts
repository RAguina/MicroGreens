'use client';

import { useState, useEffect, useCallback } from 'react';
import { Cosecha, CosechaFormData, Harvest, Siembra } from '@/lib/types';
import { apiClient, getErrorMessage } from '@/lib/api';
import { 
  harvestsToCosechas,
  cosechaFormDataToHarvestFormData,
  harvestToCosecha 
} from '@/lib/adapters/hybridAdapter';
import { useHarvests } from './useHarvests';

// Mock data como fallback (mantenido para compatibilidad)
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
];

interface UseCosechasOptions {
  autoload?: boolean;
  useMockData?: boolean;
  filters?: {
    siembra_id?: string;
    tipo?: string;
    calidad_min?: number;
    quality?: string; // Nuevo filtro para quality de Harvest
  };
}

export function useCosechasV2(options: UseCosechasOptions = {}) {
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

  // Función para usar API real del Modelo Híbrido v2.0
  const fetchCosechasFromAPI = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    console.log('🔄 [useCosechasV2] Intentando conectar a API...');
    console.log('🌐 [useCosechasV2] API URL:', process.env.NEXT_PUBLIC_API_URL);
    
    try {
      let harvests: Harvest[];
      
      if (filters?.siembra_id) {
        console.log('📡 [useCosechasV2] Obteniendo cosechas para siembra:', filters.siembra_id);
        // Obtener cosechas de una siembra específica
        harvests = await apiClient.getHarvestsByPlanting(filters.siembra_id);
      } else {
        console.log('📡 [useCosechasV2] Obteniendo todas las cosechas...');
        // Obtener todas las cosechas con filtros
        const response = await apiClient.getHarvests(1, 100, undefined, filters?.quality);
        harvests = response.data;
      }
      
      console.log('✅ [useCosechasV2] Respuesta de API recibida:', harvests);
      console.log('📊 [useCosechasV2] Harvests encontrados:', harvests.length);
      
      // Convertir harvests del backend a cosechas del frontend usando adaptador híbrido
      let cosechasFromAPI = harvestsToCosechas(harvests);
      
      console.log('🔄 [useCosechasV2] Conversión a cosechas:', cosechasFromAPI.length);
      
      // Aplicar filtros frontend adicionales (para compatibilidad)
      if (filters) {
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
      console.log('🎉 [useCosechasV2] API conectada exitosamente, datos establecidos');
    } catch (err) {
      console.error('❌ [useCosechasV2] API error, falling back to mock cosechas:', err);
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

  // Crear nueva cosecha usando Modelo Híbrido v2.0
  const createCosecha = useCallback(async (data: CosechaFormData): Promise<Cosecha> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (useMockData || !isConnected) {
        // Modo mock/offline
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newCosecha: Cosecha = {
          id: Date.now().toString(),
          ...data,
          created_at: new Date().toISOString(),
        };
        
        setCosechas(prev => [newCosecha, ...prev]);
        return newCosecha;
      } else {
        // Modo API real v2.0
        
        // Convertir datos de cosecha legacy a formato Harvest v2.0
        const harvestData = cosechaFormDataToHarvestFormData(data);
        
        // Crear harvest en backend
        const response = await apiClient.createHarvest(harvestData);
        
        // Convertir respuesta de vuelta a formato Cosecha
        const newCosecha = harvestToCosecha(response);
        
        setCosechas(prev => [newCosecha, ...prev]);
        return newCosecha;
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [useMockData, isConnected]);

  // Actualizar cosecha existente
  const updateCosecha = useCallback(async (id: string, data: Partial<CosechaFormData>): Promise<Cosecha> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (useMockData || !isConnected) {
        // Modo mock/offline
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const existingCosecha = cosechas.find(c => c.id === id);
        if (!existingCosecha) {
          throw new Error('Cosecha no encontrada');
        }
        
        const updatedCosecha: Cosecha = {
          ...existingCosecha,
          ...data,
        };
        
        setCosechas(prev => 
          prev.map(c => c.id === id ? updatedCosecha : c)
        );
        
        return updatedCosecha;
      } else {
        // Modo API real v2.0
        
        // Convertir actualizaciones a formato Harvest
        const harvestData = cosechaFormDataToHarvestFormData(data as CosechaFormData);
        
        // Actualizar en backend
        const response = await apiClient.updateHarvest(id, harvestData);
        
        // Convertir respuesta de vuelta a formato Cosecha
        const updatedCosecha = harvestToCosecha(response);
        
        setCosechas(prev => 
          prev.map(c => c.id === id ? updatedCosecha : c)
        );
        
        return updatedCosecha;
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [useMockData, isConnected, cosechas]);

  // Eliminar cosecha
  const deleteCosecha = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (useMockData || !isConnected) {
        // Modo mock/offline
        await new Promise(resolve => setTimeout(resolve, 500));
        setCosechas(prev => prev.filter(c => c.id !== id));
      } else {
        // Modo API real v2.0
        await apiClient.deleteHarvest(id);
        setCosechas(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [useMockData, isConnected]);

  // Obtener una cosecha por ID
  const getCosechaById = useCallback((id: string): Cosecha | undefined => {
    return cosechas.find(c => c.id === id);
  }, [cosechas]);

  // Obtener cosechas por siembra
  const getCosechasBySiembra = useCallback((siembraId: string): Cosecha[] => {
    return cosechas.filter(c => c.siembra_id === siembraId);
  }, [cosechas]);

  // Obtener estadísticas generales (mejoradas para v2.0)
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

    // Estadísticas por calidad
    const porCalidad = cosechas.reduce((acc, c) => {
      acc[c.calidad] = (acc[c.calidad] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      total,
      pesoTotal: Math.round(pesoTotal * 10) / 10,
      calidadPromedio: Math.round(calidadPromedio * 10) / 10,
      cosechasEsteMes: cosechasEsteMes.length,
      pesoEsteMes: Math.round(cosechasEsteMes.reduce((sum, c) => sum + c.peso_cosechado, 0) * 10) / 10,
      cosechasSemanaAnterior: cosechasSemanaAnterior.length,
      porCalidad,
      
      // Nuevas métricas v2.0
      pesoPromedio: total > 0 ? Math.round((pesoTotal / total) * 10) / 10 : 0,
      mejoresCosechas: cosechas.filter(c => c.calidad >= 4).length,
      rendimientoExcelente: total > 0 ? Math.round((cosechas.filter(c => c.calidad === 5).length / total) * 100) : 0,
    };
  }, [cosechas]);

  // Obtener estadísticas por tipo de microgreen (requiere datos de siembras)
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

// Hook específico para obtener una cosecha individual (v2.0)
export function useCosechaV2(id: string, useMockData = false) {
  const [cosecha, setCosecha] = useState<Cosecha | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCosecha = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        if (useMockData) {
          // Modo mock
          await new Promise(resolve => setTimeout(resolve, 500));
          const foundCosecha = MOCK_COSECHAS.find(c => c.id === id);
          
          if (!foundCosecha) {
            setError('Cosecha no encontrada');
            return;
          }
          
          setCosecha(foundCosecha);
        } else {
          // Modo API real v2.0
          const response = await apiClient.getHarvest(id);
          const cosechaFromAPI = harvestToCosecha(response);
          setCosecha(cosechaFromAPI);
        }
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        console.error('Error fetching cosecha:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCosecha();
  }, [id, useMockData]);

  return {
    cosecha,
    isLoading,
    error,
    setCosecha,
    setError,
  };
}

// Hook para obtener cosechas de una siembra específica (v2.0)
export function useCosechasBySiembraV2(siembraId: string) {
  const { cosechas, isLoading, error, fetchCosechas } = useCosechasV2({
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