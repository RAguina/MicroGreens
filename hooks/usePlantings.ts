'use client';

import { useState, useEffect, useCallback } from 'react';
import { Planting, PlantingFormData, PlantingStatus } from '@/lib/types';
import { apiClient, getErrorMessage } from '@/lib/api';
import { usePlantTypes } from './usePlantTypes';

interface UsePlantingsOptions {
  autoload?: boolean;
  filters?: {
    status?: PlantingStatus;
    plantTypeId?: string;
    trayNumber?: string;
  };
}

export function usePlantings(options: UsePlantingsOptions = {}) {
  const { autoload = true, filters } = options;
  
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener PlantTypes para relaciones
  const { plantTypes } = usePlantTypes({ autoload: true });

  // Fetch plantings from API
  const fetchPlantings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getPlantings(1, 100, '');
      
      // Aplicar filtros si existen
      let filteredPlantings = response.data;
      
      if (filters) {
        if (filters.status) {
          filteredPlantings = filteredPlantings.filter(p => p.status === filters.status);
        }
        if (filters.plantTypeId) {
          filteredPlantings = filteredPlantings.filter(p => p.plantTypeId === filters.plantTypeId);
        }
        if (filters.trayNumber) {
          filteredPlantings = filteredPlantings.filter(p => p.trayNumber === filters.trayNumber);
        }
      }
      
      setPlantings(filteredPlantings);
    } catch (err) {
      console.error('Error fetching plantings:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Auto-load plantings
  useEffect(() => {
    if (autoload) {
      fetchPlantings();
    }
  }, [autoload, fetchPlantings]);

  // Create new planting
  const createPlanting = useCallback(async (data: PlantingFormData): Promise<Planting> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.createPlanting(data);
      setPlantings(prev => [response, ...prev]);
      return response;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update planting
  const updatePlanting = useCallback(async (id: string, data: Partial<PlantingFormData>): Promise<Planting> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.updatePlanting(id, data);
      setPlantings(prev => 
        prev.map(p => p.id === id ? response : p)
      );
      return response;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete planting
  const deletePlanting = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apiClient.deletePlanting(id);
      setPlantings(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get planting by ID
  const getPlantingById = useCallback((id: string): Planting | undefined => {
    return plantings.find(p => p.id === id);
  }, [plantings]);

  // Get statistics
  const getStats = useCallback(() => {
    const stats = {
      total: plantings.length,
      planted: plantings.filter(p => p.status === 'PLANTED').length,
      germinating: plantings.filter(p => p.status === 'GERMINATING').length,
      growing: plantings.filter(p => p.status === 'GROWING').length,
      readyToHarvest: plantings.filter(p => p.status === 'READY_TO_HARVEST').length,
      harvested: plantings.filter(p => p.status === 'HARVESTED').length,
      failed: plantings.filter(p => p.status === 'FAILED').length,
    };
    
    return stats;
  }, [plantings]);

  // Get upcoming harvests
  const getUpcomingHarvests = useCallback((days: number = 3) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return plantings.filter(p => {
      if (p.status === 'HARVESTED') return false;
      if (!p.expectedHarvest) return false;
      
      const expectedDate = new Date(p.expectedHarvest);
      return expectedDate >= today && expectedDate <= futureDate;
    }).sort((a, b) => 
      new Date(a.expectedHarvest!).getTime() - new Date(b.expectedHarvest!).getTime()
    );
  }, [plantings]);

  // Get plantings by status
  const getPlantingsByStatus = useCallback((status: PlantingStatus) => {
    return plantings.filter(p => p.status === status);
  }, [plantings]);

  // Get plantings by plant type
  const getPlantingsByType = useCallback((plantTypeId: string) => {
    return plantings.filter(p => p.plantTypeId === plantTypeId);
  }, [plantings]);

  return {
    // State
    plantings,
    isLoading,
    error,
    
    // CRUD operations
    fetchPlantings,
    createPlanting,
    updatePlanting,
    deletePlanting,
    
    // Utilities
    getPlantingById,
    
    // Statistics and filters
    getStats,
    getUpcomingHarvests,
    getPlantingsByStatus,
    getPlantingsByType,
    
    // Error handling
    setError,
    clearError: () => setError(null),
    
    // Additional data
    plantTypes,
  };
}

// Hook for individual planting
export function usePlanting(id: string) {
  const [planting, setPlanting] = useState<Planting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPlanting = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.getPlanting(id);
        setPlanting(response);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        console.error('Error fetching planting:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPlanting();
    }
  }, [id]);

  return {
    planting,
    isLoading,
    error,
    setPlanting,
    setError,
  };
}