'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Cosecha, Siembra } from '@/lib/types';
import CosechasList from '@/components/cosechas/CosechasList';

// Mock data para cosechas
const mockCosechas: Cosecha[] = [
  {
    id: '1',
    siembra_id: '4', // Rúcula cosechada
    fecha_cosecha: '2025-01-04',
    peso_cosechado: 85.5,
    calidad: 4,
    notas: 'Excelente cosecha, muy buena textura',
    created_at: '2025-01-04T16:45:00Z',
  },
  {
    id: '2',
    siembra_id: '1', // Brócoli (simulamos que ya fue cosechado)
    fecha_cosecha: '2025-01-03',
    peso_cosechado: 92.3,
    calidad: 5,
    notas: 'Cosecha perfecta, color intenso y sabor excelente',
    created_at: '2025-01-03T14:20:00Z',
  },
  {
    id: '3',
    siembra_id: '2', // Rábano (simulamos cosecha anterior)
    fecha_cosecha: '2024-12-30',
    peso_cosechado: 78.0,
    calidad: 3,
    notas: 'Cosecha regular, algunas hojas amarillentas',
    created_at: '2024-12-30T11:30:00Z',
  },
  {
    id: '4',
    siembra_id: '3', // Girasol
    fecha_cosecha: '2024-12-28',
    peso_cosechado: 105.2,
    calidad: 4,
    notas: 'Muy buen rendimiento, sabor suave',
    created_at: '2024-12-28T09:15:00Z',
  },
];

// Mock data para siembras (necesario para mostrar información relacionada)
const mockSiembras: Siembra[] = [
  {
    id: '1',
    tipo_microgreen: 'brócoli',
    fecha_siembra: '2025-01-05',
    cantidad_sembrada: 50,
    ubicacion_bandeja: 'A1',
    fecha_esperada_cosecha: '2025-01-12',
    fecha_real_cosecha: '2025-01-03',
    estado: 'cosechado',
    notas: 'Primera siembra de prueba',
    created_at: '2025-01-05T10:00:00Z',
    updated_at: '2025-01-03T14:20:00Z',
  },
  {
    id: '2',
    tipo_microgreen: 'rábano',
    fecha_siembra: '2024-12-25',
    cantidad_sembrada: 40,
    ubicacion_bandeja: 'A2',
    fecha_esperada_cosecha: '2024-12-30',
    fecha_real_cosecha: '2024-12-30',
    estado: 'cosechado',
    created_at: '2024-12-25T14:30:00Z',
    updated_at: '2024-12-30T11:30:00Z',
  },
  {
    id: '3',
    tipo_microgreen: 'girasol',
    fecha_siembra: '2024-12-20',
    cantidad_sembrada: 60,
    ubicacion_bandeja: 'B1',
    fecha_esperada_cosecha: '2024-12-28',
    fecha_real_cosecha: '2024-12-28',
    estado: 'cosechado',
    notas: 'Semillas de alta calidad',
    created_at: '2024-12-20T09:15:00Z',
    updated_at: '2024-12-28T09:15:00Z',
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
  // Siembras actuales disponibles para cosechar
  {
    id: '5',
    tipo_microgreen: 'brócoli',
    fecha_siembra: '2025-01-05',
    cantidad_sembrada: 50,
    ubicacion_bandeja: 'B2',
    fecha_esperada_cosecha: '2025-01-12',
    estado: 'listo',
    created_at: '2025-01-05T10:00:00Z',
    updated_at: '2025-01-05T10:00:00Z',
  },
  {
    id: '6',
    tipo_microgreen: 'guisante',
    fecha_siembra: '2025-01-06',
    cantidad_sembrada: 35,
    ubicacion_bandeja: 'C1',
    fecha_esperada_cosecha: '2025-01-12',
    estado: 'creciendo',
    created_at: '2025-01-06T16:20:00Z',
    updated_at: '2025-01-06T16:20:00Z',
  },
];

export default function CosechasPage() {
  const router = useRouter();
  const [cosechas, setCosechas] = useState<Cosecha[]>([]);
  const [siembras, setSiembras] = useState<Siembra[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simular carga de datos
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800));
      setCosechas(mockCosechas);
      setSiembras(mockSiembras);
      setIsLoading(false);
    };

    loadData();
  }, []);

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
      setCosechas(prev => prev.filter(c => c.id !== cosecha.id));
      // Aquí iría la llamada a la API para eliminar
      console.log('Eliminando cosecha:', cosecha.id);
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