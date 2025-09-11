'use client';

import { useRouter } from 'next/navigation';
import { Cosecha } from '@/lib/types';
import CosechasList from '@/components/cosechas/CosechasList';
import { useCosechasV2 } from '@/hooks/useCosechasV2';
import { useSiembrasV2 } from '@/hooks/useSiembrasV2';

export default function CosechasPage() {
  const router = useRouter();
  const { cosechas, isLoading: cosechasLoading, deleteCosecha } = useCosechasV2();
  const { siembras, isLoading: siembrasLoading } = useSiembrasV2();

  const isLoading = cosechasLoading || siembrasLoading;

  const handleCreateNew = () => {
    router.push('/cosechas/nueva');
  };

  const handleEdit = (cosecha: Cosecha) => {
    // En el futuro implementaremos edición de cosechas
    console.log('Editar cosecha:', cosecha.id);
    // router.push(`/cosechas/${cosecha.id}?edit=true`);
  };

  const handleView = (cosecha: Cosecha) => {
    // En el futuro implementaremos vista detallada
    console.log('Ver detalle cosecha:', cosecha.id);
    // router.push(`/cosechas/${cosecha.id}`);
  };

  const handleDelete = async (cosecha: Cosecha) => {
    // Encontrar la siembra relacionada para mostrar información más clara
    const siembraRelacionada = siembras.find(s => s.id === cosecha.siembra_id);
    const tipoMicrogreen = siembraRelacionada ? siembraRelacionada.tipo_microgreen : 'microgreen';
    
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la cosecha de ${tipoMicrogreen} del ${new Date(cosecha.fecha_cosecha).toLocaleDateString('es-ES')}?`
    );
    
    if (confirmed) {
      try {
        await deleteCosecha(cosecha.id);
      } catch (error) {
        console.error('Error eliminando cosecha:', error);
        alert('Error al eliminar la cosecha. Intenta nuevamente.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <CosechasList
        cosechas={cosechas}
        siembras={siembras}
        isLoading={isLoading}
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />
    </div>
  );
}