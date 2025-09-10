'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Siembra } from '@/lib/types';
import SiembrasList from '@/components/siembras/SiembrasList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Mock data - En el futuro esto vendrá de una API
const mockSiembras: Siembra[] = [
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
    estado: 'sembrado',
    notas: 'Semillas de alta calidad',
    created_at: '2025-01-08T09:15:00Z',
    updated_at: '2025-01-08T09:15:00Z',
  },
  {
    id: '4',
    tipo_microgreen: 'rúcula',
    fecha_siembra: '2024-12-28',
    cantidad_sembrada: 45,
    ubicacion_bandeja: 'A3',
    fecha_esperada_cosecha: '2025-01-04',
    fecha_real_cosecha: '2025-01-04',
    estado: 'cosechado',
    created_at: '2024-12-28T11:20:00Z',
    updated_at: '2025-01-04T16:45:00Z',
  },
];

export default function SiembrasPage() {
  const router = useRouter();
  const [siembras, setSiembras] = useState<Siembra[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simular carga de datos
  useEffect(() => {
    const loadSiembras = async () => {
      setIsLoading(true);
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800));
      setSiembras(mockSiembras);
      setIsLoading(false);
    };

    loadSiembras();
  }, []);

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
    // En una aplicación real, esto haría una llamada a la API
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la siembra de ${siembra.tipo_microgreen} en bandeja ${siembra.ubicacion_bandeja}?`
    );
    
    if (confirmed) {
      setSiembras(prev => prev.filter(s => s.id !== siembra.id));
      // Aquí iría la llamada a la API para eliminar
      console.log('Eliminando siembra:', siembra.id);
    }
  };

  return (
    <div className="space-y-6">
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