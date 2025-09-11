'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CosechaFormData } from '@/lib/types';
import CosechaForm from '@/components/cosechas/CosechaForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSiembrasV2 } from '@/hooks/useSiembrasV2';
import { useCosechasV2 } from '@/hooks/useCosechasV2';

export default function NuevaCosechaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  
  // Usar hooks reales para obtener datos de la API
  const { siembras, isLoading: isLoadingSiembras } = useSiembrasV2();
  const { createCosecha } = useCosechasV2();

  // Obtener siembra preseleccionada desde URL
  const preSelectedSiembraId = searchParams.get('siembra');

  const handleSubmit = async (data: CosechaFormData) => {
    setIsLoading(true);
    
    try {
      console.log('🌾 [NuevaCosecha] Enviando datos:', data);
      
      // Usar hook real para crear cosecha
      const newCosecha = await createCosecha(data);
      
      console.log('✅ [NuevaCosecha] Cosecha creada:', newCosecha);
      
      // Mostrar mensaje de éxito
      alert('Cosecha registrada exitosamente');
      
      // Redirigir a la lista de cosechas
      router.push('/cosechas');
    } catch (error) {
      console.error('❌ [NuevaCosecha] Error al crear cosecha:', error);
      throw new Error('Error al registrar la cosecha. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoadingSiembras) {
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
      <CosechaForm
        siembras={siembras}
        preSelectedSiembra={preSelectedSiembraId || undefined}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        title="Registrar Nueva Cosecha"
        description="Completa los datos de tu cosecha de microgreens"
      />
    </div>
  );
}