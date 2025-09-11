'use client';

import { useRouter } from 'next/navigation';
import { Harvest } from '@/lib/types';
import HarvestsList from '@/components/harvests/HarvestsList';
import { useHarvests } from '@/hooks/useHarvests';
import { usePlantings } from '@/hooks/usePlantings';

export default function HarvestsPage() {
  const router = useRouter();
  const { harvests, isLoading: harvestsLoading, deleteHarvest } = useHarvests({ autoload: true });
  const { plantings, isLoading: plantingsLoading } = usePlantings();

  const isLoading = harvestsLoading || plantingsLoading;

  const handleCreateNew = () => {
    router.push('/cosechas/nueva');
  };

  const handleEdit = (harvest: Harvest) => {
    // En el futuro implementaremos edición de cosechas
    console.log('Editar harvest:', harvest.id);
    // router.push(`/cosechas/${harvest.id}?edit=true`);
  };

  const handleView = (harvest: Harvest) => {
    // En el futuro implementaremos vista detallada
    console.log('Ver detalle harvest:', harvest.id);
    // router.push(`/cosechas/${harvest.id}`);
  };

  const handleDelete = async (harvest: Harvest) => {
    // Encontrar la planting relacionada para mostrar información más clara
    const relatedPlanting = plantings.find(p => p.id === harvest.plantingId);
    const plantName = relatedPlanting ? 
      (relatedPlanting.plantType?.name || relatedPlanting.plantName) : 
      'cultivo';
    
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la cosecha de ${plantName} del ${new Date(harvest.harvestDate).toLocaleDateString('es-ES')}?`
    );
    
    if (confirmed) {
      try {
        await deleteHarvest(harvest.id);
      } catch (error) {
        console.error('Error eliminando harvest:', error);
        alert('Error al eliminar la cosecha. Intenta nuevamente.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <HarvestsList
        harvests={harvests}
        plantings={plantings}
        isLoading={isLoading}
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />
    </div>
  );
}