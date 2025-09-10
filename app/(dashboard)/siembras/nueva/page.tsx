'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiembraFormData } from '@/lib/types';
import SiembraForm from '@/components/siembras/SiembraForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NuevaSiembraPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: SiembraFormData) => {
    setIsLoading(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En una aplicación real, esto sería una llamada a la API
      const newSiembra = {
        id: Date.now().toString(),
        ...data,
        fecha_esperada_cosecha: calculateExpectedHarvestDate(data.fecha_siembra, data.tipo_microgreen),
        estado: 'sembrado' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      console.log('Nueva siembra creada:', newSiembra);
      
      // Mostrar mensaje de éxito (en una app real usaríamos toast/notification)
      alert('Siembra registrada exitosamente');
      
      // Redirigir a la lista de siembras
      router.push('/siembras');
    } catch (error) {
      console.error('Error al crear siembra:', error);
      throw new Error('Error al registrar la siembra. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Función auxiliar para calcular fecha esperada de cosecha
  const calculateExpectedHarvestDate = (fechaSiembra: string, tipoMicrogreen: string) => {
    const tiemposCrecimiento: Record<string, number> = {
      brócoli: 7,
      rábano: 5,
      girasol: 8,
      guisante: 6,
      rúcula: 7,
      amaranto: 9,
    };
    
    const dias = tiemposCrecimiento[tipoMicrogreen] || 7;
    const fecha = new Date(fechaSiembra);
    fecha.setDate(fecha.getDate() + dias);
    
    return fecha.toISOString().split('T')[0];
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