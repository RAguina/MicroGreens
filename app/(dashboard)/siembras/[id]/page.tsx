'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Siembra, SiembraFormData } from '@/lib/types';
import { MICROGREEN_LABELS, ESTADO_LABELS, ESTADO_COLORS } from '@/lib/constants';
import SiembraForm from '@/components/siembras/SiembraForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Scissors, 
  CalendarDays, 
  MapPin, 
  Sprout,
  Clock,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Mock data - simula la búsqueda por ID
const mockSiembras: Record<string, Siembra> = {
  '1': {
    id: '1',
    tipo_microgreen: 'brócoli',
    fecha_siembra: '2025-01-05',
    cantidad_sembrada: 50,
    ubicacion_bandeja: 'A1',
    fecha_esperada_cosecha: '2025-01-12',
    estado: 'listo',
    notas: 'Primera siembra de prueba. Condiciones ideales de temperatura.',
    created_at: '2025-01-05T10:00:00Z',
    updated_at: '2025-01-05T10:00:00Z',
  },
  '2': {
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
};

export default function SiembraDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const siembraId = params.id as string;
  const isEditing = searchParams.get('edit') === 'true';
  
  const [siembra, setSiembra] = useState<Siembra | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Cargar datos de la siembra
  useEffect(() => {
    const loadSiembra = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Simular llamada a API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const foundSiembra = mockSiembras[siembraId];
        if (!foundSiembra) {
          setError('Siembra no encontrada');
          return;
        }
        
        setSiembra(foundSiembra);
      } catch (err) {
        setError('Error al cargar la siembra');
        console.error('Error loading siembra:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (siembraId) {
      loadSiembra();
    }
  }, [siembraId]);

  const handleEdit = () => {
    router.push(`/siembras/${siembraId}?edit=true`);
  };

  const handleHarvest = () => {
    router.push(`/cosechas/nueva?siembra=${siembraId}`);
  };

  const handleSubmit = async (data: SiembraFormData) => {
    if (!siembra) return;
    
    setIsSaving(true);
    
    try {
      // Simular llamada a API para actualizar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedSiembra = {
        ...siembra,
        ...data,
        updated_at: new Date().toISOString(),
      };
      
      setSiembra(updatedSiembra);
      
      // Mostrar mensaje de éxito
      alert('Siembra actualizada exitosamente');
      
      // Salir del modo edición
      router.push(`/siembras/${siembraId}`);
    } catch (error) {
      console.error('Error updating siembra:', error);
      throw new Error('Error al actualizar la siembra');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      router.push(`/siembras/${siembraId}`);
    } else {
      router.back();
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
  };

  const getDaysUntilHarvest = () => {
    if (!siembra) return '';
    
    const today = new Date();
    const expectedDate = new Date(siembra.fecha_esperada_cosecha);
    const diffTime = expectedDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} días tarde`;
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    return `En ${diffDays} días`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-64 bg-gray-200 rounded mb-6" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !siembra) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="text-red-600 text-lg font-medium mb-2">
                {error || 'Siembra no encontrada'}
              </div>
              <Button onClick={() => router.push('/siembras')}>
                Ir a Siembras
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Edit mode
  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Siembra</h1>
            <p className="text-gray-600">
              {MICROGREEN_LABELS[siembra.tipo_microgreen]} - Bandeja {siembra.ubicacion_bandeja}
            </p>
          </div>
        </div>

        <SiembraForm
          siembra={siembra}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSaving}
          title="Editar Siembra"
          description="Modifica los datos de tu siembra"
        />
      </div>
    );
  }

  // View mode
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {MICROGREEN_LABELS[siembra.tipo_microgreen]}
            </h1>
            <p className="text-gray-600">Bandeja {siembra.ubicacion_bandeja}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Badge className={ESTADO_COLORS[siembra.estado]}>
            {ESTADO_LABELS[siembra.estado]}
          </Badge>
          {siembra.estado !== 'cosechado' && (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
          {siembra.estado === 'listo' && (
            <Button onClick={handleHarvest} className="bg-green-600 hover:bg-green-700">
              <Scissors className="h-4 w-4 mr-2" />
              Cosechar
            </Button>
          )}
        </div>
      </div>

      {/* Información principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detalles */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Siembra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <CalendarDays className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Fecha de siembra</p>
                    <p className="font-medium">{formatDate(siembra.fecha_siembra)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Ubicación</p>
                    <p className="font-medium">Bandeja {siembra.ubicacion_bandeja}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Sprout className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Cantidad sembrada</p>
                    <p className="font-medium">{siembra.cantidad_sembrada}g</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Cosecha esperada</p>
                    <p className="font-medium">
                      {formatDate(siembra.fecha_esperada_cosecha)}
                      {siembra.estado !== 'cosechado' && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({getDaysUntilHarvest()})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {siembra.fecha_real_cosecha && (
                <div className="flex items-center space-x-3">
                  <Scissors className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Fecha real de cosecha</p>
                    <p className="font-medium">{formatDate(siembra.fecha_real_cosecha)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notas */}
          {siembra.notas && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Notas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{siembra.notas}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Estado actual */}
          <Card>
            <CardHeader>
              <CardTitle>Estado Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Badge className={`${ESTADO_COLORS[siembra.estado]} text-lg px-4 py-2`}>
                  {ESTADO_LABELS[siembra.estado]}
                </Badge>
                {siembra.estado === 'listo' && (
                  <div className="mt-4">
                    <Button 
                      onClick={handleHarvest}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Scissors className="h-4 w-4 mr-2" />
                      Registrar Cosecha
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Metadatos */}
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Creado</p>
                <p className="text-sm">
                  {format(new Date(siembra.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Última actualización</p>
                <p className="text-sm">
                  {format(new Date(siembra.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}