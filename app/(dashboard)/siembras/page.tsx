'use client';

import { useRouter } from 'next/navigation';
import { Siembra } from '@/lib/types';
import SiembrasList from '@/components/siembras/SiembrasList';
import { Button } from '@/components/ui/button';
import { Plus, Wifi, WifiOff } from 'lucide-react';
import { useSiembrasV2 } from '@/hooks/useSiembrasV2';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SiembrasPage() {
  const router = useRouter();
  const { 
    siembras, 
    isLoading, 
    error, 
    isConnected,
    deleteSiembra 
  } = useSiembrasV2();

  const handleCreateNew = () => {
    router.push('/siembras/nueva');
  };

  const handleEdit = (siembra: Siembra) => {
    router.push(`/siembras/${siembra.id}?edit=true`);
  };

  const handleView = (siembra: Siembra) => {
    router.push(`/siembras/${siembra.id}`);
  };

  const handleHarvest = (siembra: Siembra) => {
    // Navegar a página de cosecha con la siembra pre-seleccionada
    router.push(`/cosechas/nueva?siembra=${siembra.id}`);
  };

  const handleDelete = async (siembra: Siembra) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la siembra de ${siembra.tipo_microgreen} en bandeja ${siembra.ubicacion_bandeja}?`
    );
    
    if (confirmed) {
      try {
        await deleteSiembra(siembra.id);
      } catch (error) {
        console.error('Error eliminando siembra:', error);
        alert('Error al eliminar la siembra. Intenta nuevamente.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Indicador de conexión */}
      {isConnected !== null && (
        <Alert className={isConnected ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-orange-600" />
            )}
            <AlertDescription className={isConnected ? 'text-green-700' : 'text-orange-700'}>
              {isConnected 
                ? 'Conectado a la API - Datos en tiempo real' 
                : 'Modo offline - Usando datos locales'
              }
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Mostrar error si existe */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <SiembrasList
        siembras={siembras}
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