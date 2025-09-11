'use client';

import { useState, useEffect, useCallback } from 'react';
import { Harvest, HarvestFormData } from '@/lib/types';
import { apiClient, getErrorMessage } from '@/lib/api';

interface UseHarvestsOptions {
  autoload?: boolean;
  plantingId?: string;
  quality?: string;
}

export function useHarvests(options: UseHarvestsOptions = {}) {
  const { autoload = true, plantingId, quality } = options;
  
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // Función para obtener cosechas desde API
  const fetchHarvests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (plantingId) {
        // Obtener cosechas de una siembra específica
        response = await apiClient.getHarvestsByPlanting(plantingId);
        setHarvests(response);
      } else {
        // Obtener cosechas paginadas con filtros
        const paginatedResponse = await apiClient.getHarvests(1, 100, undefined, quality);
        setHarvests(paginatedResponse.data);
      }
      
      setIsConnected(true);
    } catch (err) {
      console.error('API error fetching harvests:', err);
      setIsConnected(false);
      setError(getErrorMessage(err));
      
      // Fallback a array vacío
      setHarvests([]);
    } finally {
      setIsLoading(false);
    }
  }, [plantingId, quality]);

  // Cargar harvests automáticamente
  useEffect(() => {
    if (autoload) {
      fetchHarvests();
    }
  }, [autoload, fetchHarvests]);

  // Crear nueva cosecha
  const createHarvest = useCallback(async (data: HarvestFormData): Promise<Harvest> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newHarvest = await apiClient.createHarvest(data);
      setHarvests(prev => [newHarvest, ...prev]);
      return newHarvest;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Actualizar cosecha
  const updateHarvest = useCallback(async (id: string, data: Partial<HarvestFormData>): Promise<Harvest> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedHarvest = await apiClient.updateHarvest(id, data);
      setHarvests(prev => 
        prev.map(h => h.id === id ? updatedHarvest : h)
      );
      return updatedHarvest;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Eliminar cosecha
  const deleteHarvest = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apiClient.deleteHarvest(id);
      setHarvests(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener cosecha por ID
  const getHarvestById = useCallback((id: string): Harvest | undefined => {
    return harvests.find(h => h.id === id);
  }, [harvests]);

  // Obtener cosechas por planting
  const getHarvestsByPlanting = useCallback((plantingId: string): Harvest[] => {
    return harvests.filter(h => h.plantingId === plantingId);
  }, [harvests]);

  // Obtener cosechas por calidad
  const getHarvestsByQuality = useCallback((targetQuality: string) => {
    return harvests.filter(h => h.quality === targetQuality);
  }, [harvests]);

  // Obtener cosechas recientes
  const getRecentHarvests = useCallback((limit: number = 5) => {
    return harvests
      .sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime())
      .slice(0, limit);
  }, [harvests]);

  // Obtener estadísticas
  const getStats = useCallback(() => {
    const total = harvests.length;
    const totalWeight = harvests.reduce((sum, h) => sum + h.weight, 0);
    const totalValue = harvests.reduce((sum, h) => sum + (h.totalValue || 0), 0);
    
    // Estadísticas por calidad
    const byQuality = harvests.reduce((acc, h) => {
      acc[h.quality] = (acc[h.quality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Estadísticas por período
    const now = new Date();
    const thisMonth = harvests.filter(h => {
      const harvestDate = new Date(h.harvestDate);
      return harvestDate.getMonth() === now.getMonth() && 
             harvestDate.getFullYear() === now.getFullYear();
    });
    
    const thisWeek = harvests.filter(h => {
      const harvestDate = new Date(h.harvestDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return harvestDate >= weekAgo;
    });

    return {
      total,
      totalWeight: Math.round(totalWeight * 10) / 10,
      totalValue: Math.round(totalValue * 100) / 100,
      averageWeight: total > 0 ? Math.round((totalWeight / total) * 10) / 10 : 0,
      averageValue: total > 0 ? Math.round((totalValue / total) * 100) / 100 : 0,
      
      // Por período
      thisMonth: {
        count: thisMonth.length,
        weight: Math.round(thisMonth.reduce((sum, h) => sum + h.weight, 0) * 10) / 10,
        value: Math.round(thisMonth.reduce((sum, h) => sum + (h.totalValue || 0), 0) * 100) / 100,
      },
      
      thisWeek: {
        count: thisWeek.length,
        weight: Math.round(thisWeek.reduce((sum, h) => sum + h.weight, 0) * 10) / 10,
      },
      
      // Por calidad
      byQuality,
      
      // Calidad promedio (convertir enum a número)
      averageQuality: total > 0 ? (() => {
        const qualityScores = { 'EXCELLENT': 5, 'GOOD': 4, 'FAIR': 3, 'POOR': 2 };
        const totalScore = harvests.reduce((sum, h) => sum + (qualityScores[h.quality] || 1), 0);
        return Math.round((totalScore / total) * 10) / 10;
      })() : 0,
    };
  }, [harvests]);

  // Obtener estadísticas por plantings
  const getStatsByPlanting = useCallback(() => {
    const plantingStats: Record<string, {
      plantingId: string;
      totalHarvests: number;
      totalWeight: number;
      averageWeight: number;
      averageQuality: number;
      lastHarvest: string;
    }> = {};

    harvests.forEach(harvest => {
      if (!plantingStats[harvest.plantingId]) {
        plantingStats[harvest.plantingId] = {
          plantingId: harvest.plantingId,
          totalHarvests: 0,
          totalWeight: 0,
          averageWeight: 0,
          averageQuality: 0,
          lastHarvest: harvest.harvestDate,
        };
      }

      const stats = plantingStats[harvest.plantingId];
      stats.totalHarvests++;
      stats.totalWeight += harvest.weight;
      
      // Actualizar última cosecha si es más reciente
      if (new Date(harvest.harvestDate) > new Date(stats.lastHarvest)) {
        stats.lastHarvest = harvest.harvestDate;
      }
    });

    // Calcular promedios
    Object.values(plantingStats).forEach(stats => {
      stats.averageWeight = Math.round((stats.totalWeight / stats.totalHarvests) * 10) / 10;
      
      const plantingHarvests = harvests.filter(h => h.plantingId === stats.plantingId);
      const qualityScores = { 'EXCELLENT': 5, 'GOOD': 4, 'FAIR': 3, 'POOR': 2 };
      const totalQuality = plantingHarvests.reduce((sum, h) => sum + (qualityScores[h.quality] || 1), 0);
      stats.averageQuality = Math.round((totalQuality / plantingHarvests.length) * 10) / 10;
    });

    return Object.values(plantingStats).sort((a, b) => b.totalWeight - a.totalWeight);
  }, [harvests]);

  return {
    // Estado
    harvests,
    isLoading,
    error,
    isConnected,
    
    // Acciones CRUD
    fetchHarvests,
    createHarvest,
    updateHarvest,
    deleteHarvest,
    
    // Utilidades
    getHarvestById,
    getHarvestsByPlanting,
    getHarvestsByQuality,
    getRecentHarvests,
    
    // Estadísticas
    getStats,
    getStatsByPlanting,
    
    // Control de estado
    setError,
    clearError: () => setError(null),
  };
}

// Hook específico para obtener una cosecha individual
export function useHarvest(id: string) {
  const [harvest, setHarvest] = useState<Harvest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHarvest = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.getHarvest(id);
        setHarvest(response);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        console.error('Error fetching harvest:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHarvest();
  }, [id]);

  return {
    harvest,
    isLoading,
    error,
    setHarvest,
    setError,
  };
}

// Hook para obtener cosechas de una siembra específica
export function useHarvestsByPlanting(plantingId: string) {
  const { harvests, isLoading, error, fetchHarvests } = useHarvests({
    autoload: true,
    plantingId,
  });

  return {
    harvests,
    isLoading,
    error,
    refetch: fetchHarvests,
  };
}