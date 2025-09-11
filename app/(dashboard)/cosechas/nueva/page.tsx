'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HarvestFormData } from '@/lib/types';
import HarvestForm from '@/components/harvests/HarvestForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { usePlantings } from '@/hooks/usePlantings';
import { useHarvests } from '@/hooks/useHarvests';

export default function NuevaHarvestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  
  // Usar hooks v2.0 para obtener datos de la API
  const { plantings, isLoading: isLoadingPlantings } = usePlantings();
  const { createHarvest } = useHarvests();

  // Obtener planting preseleccionado desde URL
  const preSelectedPlantingId = searchParams.get('planting');

  const handleSubmit = async (data: HarvestFormData) => {
    setIsLoading(true);
    
    try {
      console.log('🌾 [NewHarvest] Enviando datos:', data);
      
      // Crear harvest usando hook v2.0
      const newHarvest = await createHarvest(data);
      
      console.log('✅ [NewHarvest] Harvest creado:', newHarvest);
      
      // Mostrar mensaje de éxito
      alert('Cosecha registrada exitosamente');
      
      // Redirigir a la lista de cosechas
      router.push('/cosechas');
    } catch (error) {
      console.error('❌ [NewHarvest] Error al crear harvest:', error);
      throw new Error('Error al registrar la cosecha. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoadingPlantings) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Nueva Cosecha</h1>
          <p className="text-gray-600">Registra una nueva cosecha de microgreens</p>
        </div>
      </div>

      {/* Formulario */}
      <HarvestForm
        plantings={plantings}
        preSelectedPlanting={preSelectedPlantingId || undefined}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        title="Registrar Nueva Cosecha"
        description="Completa los datos de tu cosecha"
      />
    </div>
  );
}