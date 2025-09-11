'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlantingFormData } from '@/lib/types';
import PlantingForm from '@/components/plantings/PlantingForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { usePlantings } from '@/hooks/usePlantings';
import { usePlantTypes } from '@/hooks/usePlantTypes';

export default function NuevaPlantingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { createPlanting } = usePlantings();
  const { plantTypes, isLoading: isLoadingPlantTypes } = usePlantTypes();

  const handleSubmit = async (data: PlantingFormData) => {
    setIsLoading(true);
    
    try {
      // Crear planting usando hook v2.0
      const newPlanting = await createPlanting(data);
      
      // Mostrar mensaje de éxito
      alert('Siembra registrada exitosamente');
      
      // Redirigir a la lista de siembras
      router.push('/siembras');
    } catch (error) {
      console.error('Error al crear planting:', error);
      throw new Error('Error al registrar la siembra. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      {/* Header con navegación */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver</span>
        </Button>
        <div className="h-6 w-px bg-gray-300" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Siembra</h1>
          <p className="text-gray-600">Registra una nueva siembra de microgreens</p>
        </div>
      </div>

      {/* Mostrar loading si están cargando los plant types */}
      {isLoadingPlantTypes ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      ) : (
        /* Formulario */
        <PlantingForm
          plantTypes={plantTypes}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          title="Registrar Nueva Siembra"
          description="Completa los datos para registrar tu nueva siembra"
        />
      )}
    </div>
  );
}