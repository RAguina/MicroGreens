'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlantType, PlantTypeFormData } from '@/lib/types';
import { apiClient, getErrorMessage } from '@/lib/api';

interface UsePlantTypesOptions {
  autoload?: boolean;
  category?: string;
  difficulty?: string;
}

export function usePlantTypes(options: UsePlantTypesOptions = {}) {
  const { autoload = true, category, difficulty } = options;
  
  const [plantTypes, setPlantTypes] = useState<PlantType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // Función para obtener tipos de plantas desde API
  const fetchPlantTypes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getPlantTypes(category, difficulty);
      setPlantTypes(response);
      setIsConnected(true);
    } catch (err) {
      console.error('API error fetching plant types:', err);
      setIsConnected(false);
      setError(getErrorMessage(err));
      
      // Fallback a array vacío - no hay datos mock para plant types
      setPlantTypes([]);
    } finally {
      setIsLoading(false);
    }
  }, [category, difficulty]);

  // Cargar plant types automáticamente
  useEffect(() => {
    if (autoload) {
      fetchPlantTypes();
    }
  }, [autoload, fetchPlantTypes]);

  // Crear nuevo tipo de planta
  const createPlantType = useCallback(async (data: PlantTypeFormData): Promise<PlantType> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newPlantType = await apiClient.createPlantType(data);
      setPlantTypes(prev => [newPlantType, ...prev]);
      return newPlantType;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Actualizar tipo de planta
  const updatePlantType = useCallback(async (id: string, data: Partial<PlantTypeFormData>): Promise<PlantType> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedPlantType = await apiClient.updatePlantType(id, data);
      setPlantTypes(prev => 
        prev.map(pt => pt.id === id ? updatedPlantType : pt)
      );
      return updatedPlantType;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Eliminar tipo de planta
  const deletePlantType = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apiClient.deletePlantType(id);
      setPlantTypes(prev => prev.filter(pt => pt.id !== id));
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener tipo de planta por ID
  const getPlantTypeById = useCallback((id: string): PlantType | undefined => {
    return plantTypes.find(pt => pt.id === id);
  }, [plantTypes]);

  // Obtener tipos por categoría
  const getPlantTypesByCategory = useCallback((cat: string) => {
    return plantTypes.filter(pt => pt.category === cat);
  }, [plantTypes]);

  // Obtener tipos por dificultad
  const getPlantTypesByDifficulty = useCallback((diff: string) => {
    return plantTypes.filter(pt => pt.difficulty === diff);
  }, [plantTypes]);

  // Buscar tipos por nombre
  const searchPlantTypes = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return plantTypes;
    
    const term = searchTerm.toLowerCase();
    return plantTypes.filter(pt => 
      pt.name.toLowerCase().includes(term) ||
      pt.scientificName?.toLowerCase().includes(term) ||
      pt.category?.toLowerCase().includes(term)
    );
  }, [plantTypes]);

  // Obtener estadísticas
  const getStats = useCallback(() => {
    const total = plantTypes.length;
    const byCategory = plantTypes.reduce((acc, pt) => {
      const cat = pt.category || 'Sin categoría';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byDifficulty = plantTypes.reduce((acc, pt) => {
      const diff = pt.difficulty || 'No especificado';
      acc[diff] = (acc[diff] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byCategory,
      byDifficulty,
      averageYield: total > 0 
        ? Math.round((plantTypes.reduce((sum, pt) => sum + (pt.averageYield || 0), 0) / total) * 10) / 10
        : 0,
    };
  }, [plantTypes]);

  return {
    // Estado
    plantTypes,
    isLoading,
    error,
    isConnected,
    
    // Acciones CRUD
    fetchPlantTypes,
    createPlantType,
    updatePlantType,
    deletePlantType,
    
    // Utilidades
    getPlantTypeById,
    getPlantTypesByCategory,
    getPlantTypesByDifficulty,
    searchPlantTypes,
    getStats,
    
    // Control de estado
    setError,
    clearError: () => setError(null),
  };
}

// Hook específico para obtener un tipo de planta individual
export function usePlantType(id: string) {
  const [plantType, setPlantType] = useState<PlantType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlantType = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.getPlantType(id);
        setPlantType(response);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        console.error('Error fetching plant type:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlantType();
  }, [id]);

  return {
    plantType,
    isLoading,
    error,
    setPlantType,
    setError,
  };
}