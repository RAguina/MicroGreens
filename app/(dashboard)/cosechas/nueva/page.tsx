'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CosechaFormData, Siembra } from '@/lib/types';
import CosechaForm from '@/components/cosechas/CosechaForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Mock data de siembras disponibles para cosechar
const mockSiembrasDisponibles: Siembra[] = [
  {
    id: '1',
    tipo_microgreen: 'brócoli',
    fecha_siembra: '2025-01-05',
    cantidad_sembrada: 50,
    ubicacion_bandeja: 'A1',
    fecha_esperada_cosecha: '2025-01-12',
    estado: 'listo',
    notas: 'Primera siembra de prueba',
    created_at: '2025-01-05T10:00:00Z',
    updated_at: '2025-01-05T10:00:00Z',
  },
  {
    id: '2',
    tipo_microgreen: 'rábano',
    fecha_siembra: '2025-01-07',
    cantidad_sembrada: 40,
    ubicacion_bandeja: 'A2',
    fecha_esperada_cosecha: '2025-01-12',
    estado: 'creciendo',
    created_at: '2025-01-07T14:30:00Z',
    updated_at: '2025-01-07T14:30:00Z',
  },
  {
    id: '3',
    tipo_microgreen: 'girasol',
    fecha_siembra: '2025-01-08',
    cantidad_sembrada: 60,
    ubicacion_bandeja: 'B1',
    fecha_esperada_cosecha: '2025-01-16',
    estado: 'creciendo',
    notas: 'Semillas de alta calidad',
    created_at: '2025-01-08T09:15:00Z',
    updated_at: '2025-01-08T09:15:00Z',
  },
  {
    id: '5',
    tipo_microgreen: 'guisante',
    fecha_siembra: '2025-01-06',
    cantidad_sembrada: 35,
    ubicacion_bandeja: 'B2',
    fecha_esperada_cosecha: '2025-01-12',
    estado: 'listo',
    created_at: '2025-01-06T16:20:00Z',
    updated_at: '2025-01-06T16:20:00Z',
  },
  {
    id: '6',
    tipo_microgreen: 'rúcula',
    fecha_siembra: '2025-01-09',
    cantidad_sembrada: 45,
    ubicacion_bandeja: 'C1',
    fecha_esperada_cosecha: '2025-01-16',
    estado: 'creciendo',
    created_at: '2025-01-09T11:20:00Z',
    updated_at: '2025-01-09T11:20:00Z',
  },
];

export default function NuevaCosechaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [siembras, setSiembras] = useState<Siembra[]>([]);
  const [isLoadingSiembras, setIsLoadingSiembras] = useState(true);

  // Obtener siembra preseleccionada desde URL
  const preSelectedSiembraId = searchParams.get('siembra');

  // Cargar siembras disponibles
  useEffect(() => {
    const loadSiembras = async () => {
      setIsLoadingSiembras(true);
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));
      setSiembras(mockSiembrasDisponibles);
      setIsLoadingSiembras(false);
    };

    loadSiembras();
  }, []);

  const handleSubmit = async (data: CosechaFormData) => {
    setIsLoading(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En una aplicación real, esto sería una llamada a la API
      const newCosecha = {
        id: Date.now().toString(),
        ...data,
        created_at: new Date().toISOString(),
      };
      
      console.log('Nueva cosecha creada:', newCosecha);
      
      // También necesitamos marcar la siembra como cosechada
      const siembraACosechar = siembras.find(s => s.id === data.siembra_id);
      if (siembraACosechar) {
        console.log('Marcando siembra como cosechada:', siembraACosechar.id);
        // En una aplicación real, actualizaríamos el estado de la siembra
      }
      
      // Mostrar mensaje de éxito (en una app real usaríamos toast/notification)
      alert('Cosecha registrada exitosamente');
      
      // Redirigir a la lista de cosechas
      router.push('/cosechas');
    } catch (error) {
      console.error('Error al crear cosecha:', error);
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