'use client';

import { useRouter } from 'next/navigation';
import { Planting } from '@/lib/types';
import PlantingsList from '@/components/plantings/PlantingsList';
import { Button } from '@/components/ui/button';
import { Plus, Wifi, WifiOff } from 'lucide-react';
import { usePlantings } from '@/hooks/usePlantings';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PlantingsPage() {
  const router = useRouter();
  const { 
    plantings, 
    isLoading, 
    error,
    deletePlanting 
  } = usePlantings();

  const handleCreateNew = () => {
    router.push('/siembras/nueva');
  };

  const handleEdit = (planting: Planting) => {
    router.push(`/siembras/${planting.id}?edit=true`);
  };

  const handleView = (planting: Planting) => {
    router.push(`/siembras/${planting.id}`);
  };

  const handleHarvest = (planting: Planting) => {
    // Navegar a página de cosecha con la planting pre-seleccionada
    router.push(`/cosechas/nueva?planting=${planting.id}`);
  };

  const handleDelete = async (planting: Planting) => {
    const plantName = planting.plantType?.name || planting.plantName || 'cultivo';
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la siembra de ${plantName} en bandeja ${planting.trayNumber}?`
    );
    
    if (confirmed) {
      try {
        await deletePlanting(planting.id);
      } catch (error) {
        console.error('Error eliminando planting:', error);
        alert('Error al eliminar la siembra. Intenta nuevamente.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Mostrar error si existe */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <PlantingsList
        plantings={plantings}
        isLoading={isLoading}
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onView={handleView}
        onHarvest={handleHarvest}
        onDelete={handleDelete}
      />
    </div>
  );
}