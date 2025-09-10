'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CosechaFormData, Cosecha, Siembra } from '@/lib/types';
import { 
  MICROGREEN_LABELS,
  VALIDATION,
  ERROR_MESSAGES,
  CALIDAD_OPTIONS,
  PESO_ESPERADO
} from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Scissors, 
  Scale,
  Star,
  Info,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

// Schema de validación
const cosechaSchema = z.object({
  siembra_id: z.string().min(1, ERROR_MESSAGES.REQUIRED_FIELD),
  fecha_cosecha: z.string().min(1, ERROR_MESSAGES.REQUIRED_FIELD),
  peso_cosechado: z.number()
    .min(VALIDATION.MIN_PESO_COSECHADO, ERROR_MESSAGES.MIN_PESO)
    .max(VALIDATION.MAX_PESO_COSECHADO, ERROR_MESSAGES.MAX_PESO),
  calidad: z.number()
    .min(1, 'La calidad debe ser al menos 1 estrella')
    .max(5, 'La calidad máxima es 5 estrellas'),
  notas: z.string()
    .max(VALIDATION.MAX_NOTAS_LENGTH, ERROR_MESSAGES.MAX_NOTAS)
    .optional(),
});

type CosechaFormValues = z.infer<typeof cosechaSchema>;

interface CosechaFormProps {
  cosecha?: Cosecha;
  siembras: Siembra[]; // Lista de siembras disponibles para cosechar
  preSelectedSiembra?: string; // ID de siembra preseleccionada
  onSubmit: (data: CosechaFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export default function CosechaForm({ 
  cosecha, 
  siembras,
  preSelectedSiembra,
  onSubmit, 
  onCancel, 
  isLoading = false,
  title = 'Nueva Cosecha',
  description = 'Registra una nueva cosecha de microgreens'
}: CosechaFormProps) {
  const [error, setError] = useState('');
  const [selectedSiembra, setSelectedSiembra] = useState<Siembra | null>(null);
  
  const isEditing = !!cosecha;
  
  // Filtrar siembras que se pueden cosechar (listas o creciendo)
  const siembrasDisponibles = siembras.filter(s => 
    ['listo', 'creciendo'].includes(s.estado)
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<CosechaFormValues>({
    resolver: zodResolver(cosechaSchema),
    defaultValues: cosecha ? {
      siembra_id: cosecha.siembra_id,
      fecha_cosecha: cosecha.fecha_cosecha,
      peso_cosechado: cosecha.peso_cosechado,
      calidad: cosecha.calidad,
      notas: cosecha.notas || '',
    } : {
      siembra_id: preSelectedSiembra || '',
      fecha_cosecha: format(new Date(), 'yyyy-MM-dd'),
      calidad: 4, // Valor por defecto: buena calidad
    }
  });

  const watchedSiembraId = watch('siembra_id');
  const watchedPeso = watch('peso_cosechado');

  // Encontrar la siembra seleccionada
  useEffect(() => {
    if (watchedSiembraId) {
      const siembra = siembras.find(s => s.id === watchedSiembraId);
      setSelectedSiembra(siembra || null);
    } else {
      setSelectedSiembra(null);
    }
  }, [watchedSiembraId, siembras]);

  // Calcular estadísticas de la siembra seleccionada
  const getSiembraStats = () => {
    if (!selectedSiembra) return null;
    
    const diasCrecimiento = differenceInDays(
      new Date(), 
      new Date(selectedSiembra.fecha_siembra)
    );
    
    const diasEsperados = differenceInDays(
      new Date(selectedSiembra.fecha_esperada_cosecha),
      new Date(selectedSiembra.fecha_siembra)
    );
    
    const pesoEsperado = PESO_ESPERADO[selectedSiembra.tipo_microgreen];
    
    return {
      diasCrecimiento,
      diasEsperados,
      esTarde: diasCrecimiento > diasEsperados,
      pesoEsperado
    };
  };

  const siembraStats = getSiembraStats();

  // Evaluar el rendimiento basado en el peso ingresado
  const getRendimientoEvaluacion = () => {
    if (!selectedSiembra || !watchedPeso || !siembraStats?.pesoEsperado) return null;
    
    const { min, max } = siembraStats.pesoEsperado;
    const promedio = (min + max) / 2;
    const porcentaje = (watchedPeso / promedio) * 100;
    
    return {
      porcentaje: Math.round(porcentaje),
      categoria: porcentaje >= 100 ? 'excelente' : porcentaje >= 80 ? 'bueno' : 'bajo',
      esperadoMin: min,
      esperadoMax: max
    };
  };

  const rendimiento = getRendimientoEvaluacion();

  const onSubmitForm = async (data: CosechaFormValues) => {
    setError('');
    
    try {
      await onSubmit(data);
      if (!isEditing) {
        reset();
        setSelectedSiembra(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.GENERIC_ERROR);
    }
  };

  const getQualityLabel = (rating: number) => {
    const labels = {
      1: 'Muy baja',
      2: 'Baja', 
      3: 'Regular',
      4: 'Buena',
      5: 'Excelente'
    };
    return labels[rating as keyof typeof labels];
  };

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <Scissors className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">
              {title}
            </CardTitle>
            <CardDescription>
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Selección de siembra */}
          <div className="space-y-2">
            <Label htmlFor="siembra_id">Siembra a cosechar *</Label>
            <Select
              value={watch('siembra_id') || ''}
              onValueChange={(value) => setValue('siembra_id', value)}
              disabled={isLoading || isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la siembra a cosechar" />
              </SelectTrigger>
              <SelectContent>
                {siembrasDisponibles.map((siembra) => (
                  <SelectItem key={siembra.id} value={siembra.id}>
                    <div className="flex items-center space-x-2">
                      <span>{MICROGREEN_LABELS[siembra.tipo_microgreen]}</span>
                      <span className="text-gray-500">- {siembra.ubicacion_bandeja}</span>
                      <Badge 
                        variant="outline" 
                        className={siembra.estado === 'listo' ? 'text-green-600' : 'text-blue-600'}
                      >
                        {siembra.estado === 'listo' ? 'Listo' : 'Creciendo'}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.siembra_id && (
              <p className="text-sm text-red-600">{errors.siembra_id.message}</p>
            )}
            
            {siembrasDisponibles.length === 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No hay siembras disponibles para cosechar. 
                  Las siembras deben estar en estado "Creciendo" o "Listo".
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Información de la siembra seleccionada */}
          {selectedSiembra && siembraStats && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Tipo:</span>
                    <span className="ml-2 font-medium">
                      {MICROGREEN_LABELS[selectedSiembra.tipo_microgreen]}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ubicación:</span>
                    <span className="ml-2 font-medium">{selectedSiembra.ubicacion_bandeja}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Sembrado:</span>
                    <span className="ml-2 font-medium">
                      {format(new Date(selectedSiembra.fecha_siembra), 'dd/MM/yyyy', { locale: es })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Días creciendo:</span>
                    <span className={`ml-2 font-medium ${
                      siembraStats.esTarde ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {siembraStats.diasCrecimiento} días
                      {siembraStats.esTarde && ' (tardía)'}
                    </span>
                  </div>
                  {siembraStats.pesoEsperado && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Peso esperado:</span>
                      <span className="ml-2 font-medium">
                        {siembraStats.pesoEsperado.min}-{siembraStats.pesoEsperado.max}g
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fecha y peso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fecha_cosecha">Fecha de Cosecha *</Label>
              <Input
                id="fecha_cosecha"
                type="date"
                {...register('fecha_cosecha')}
                disabled={isLoading}
                className="w-full"
              />
              {errors.fecha_cosecha && (
                <p className="text-sm text-red-600">{errors.fecha_cosecha.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="peso_cosechado">Peso Cosechado (g) *</Label>
              <Input
                id="peso_cosechado"
                type="number"
                step="0.1"
                min={VALIDATION.MIN_PESO_COSECHADO}
                max={VALIDATION.MAX_PESO_COSECHADO}
                placeholder="Ej: 85.5"
                {...register('peso_cosechado', { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.peso_cosechado && (
                <p className="text-sm text-red-600">{errors.peso_cosechado.message}</p>
              )}
            </div>
          </div>

          {/* Evaluación de rendimiento */}
          {rendimiento && (
            <Card className={`${
              rendimiento.categoria === 'excelente' ? 'bg-green-50 border-green-200' :
              rendimiento.categoria === 'bueno' ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            }`}>
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className={`h-5 w-5 ${
                    rendimiento.categoria === 'excelente' ? 'text-green-600' :
                    rendimiento.categoria === 'bueno' ? 'text-yellow-600' :
                    'text-red-600'
                  }`} />
                  <div>
                    <div className="font-medium">
                      Rendimiento: {rendimiento.porcentaje}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Respecto al promedio esperado ({rendimiento.esperadoMin}-{rendimiento.esperadoMax}g)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Calidad */}
          <div className="space-y-2">
            <Label htmlFor="calidad">Calidad de la Cosecha *</Label>
            <div className="grid grid-cols-5 gap-2">
              {CALIDAD_OPTIONS.map((rating) => (
                <Button
                  key={rating}
                  type="button"
                  variant={watch('calidad') === rating ? 'default' : 'outline'}
                  className="h-12 flex flex-col items-center justify-center"
                  onClick={() => setValue('calidad', rating)}
                  disabled={isLoading}
                >
                  <Star className={`h-4 w-4 ${
                    watch('calidad') === rating ? 'fill-current' : ''
                  }`} />
                  <span className="text-xs mt-1">{rating}</span>
                </Button>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Calidad seleccionada: {watch('calidad') ? getQualityLabel(watch('calidad')) : 'Ninguna'}
            </p>
            {errors.calidad && (
              <p className="text-sm text-red-600">{errors.calidad.message}</p>
            )}
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              placeholder="Observaciones sobre la cosecha, condiciones, etc."
              {...register('notas')}
              disabled={isLoading}
              maxLength={VALIDATION.MAX_NOTAS_LENGTH}
            />
            {errors.notas && (
              <p className="text-sm text-red-600">{errors.notas.message}</p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading || siembrasDisponibles.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Actualizando...' : 'Registrando...'}
                </>
              ) : (
                <>
                  <Scale className="mr-2 h-4 w-4" />
                  {isEditing ? 'Actualizar Cosecha' : 'Registrar Cosecha'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}