'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiembraFormData } from '@/lib/types';
import SiembraForm from '@/components/siembras/SiembraForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSiembrasV2 } from '@/hooks/useSiembrasV2';

export default function NuevaSiembraPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { createSiembra } = useSiembrasV2();

  const handleSubmit = async (data: SiembraFormData) => {
    setIsLoading(true);
    
    try {
      console.log('🌱 [NuevaSiembra] Enviando datos:', data);
      
      // Usar hook real para crear siembra
      const newSiembra = await createSiembra(data);
      
      console.log('✅ [NuevaSiembra] Siembra creada:', newSiembra);
      
      // Mostrar mensaje de éxito (en una app real usaríamos toast/notification)
      alert('Siembra registrada exitosamente');
      
      // Redirigir a la lista de siembras
      router.push('/siembras');
    } catch (error) {
      console.error('❌ [NuevaSiembra] Error al crear siembra:', error);
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

      {/* Formulario */}
      <SiembraForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        title="Registrar Nueva Siembra"
        description="Completa los datos para registrar tu nueva siembra de microgreens"
      />
    </div>
  );
}