'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SiembraFormData, Siembra, PlantType } from '@/lib/types';
import { 
  TIPOS_MICROGREENS, 
  MICROGREEN_LABELS, 
  TIEMPOS_CRECIMIENTO,
  VALIDATION,
  ERROR_MESSAGES 
} from '@/lib/constants';
import { usePlantTypes } from '@/hooks/usePlantTypes';
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
import { Loader2, Sprout, CalendarDays } from 'lucide-react';
import { addDays, format } from 'date-fns';

// Schema de validación más flexible
const siembraSchema = z.object({
  tipo_microgreen: z.string().min(1, ERROR_MESSAGES.REQUIRED_FIELD),
  fecha_siembra: z.string().min(1, ERROR_MESSAGES.REQUIRED_FIELD),
  cantidad_sembrada: z.number()
    .min(VALIDATION.MIN_CANTIDAD_SEMBRADA, ERROR_MESSAGES.MIN_CANTIDAD)
    .max(VALIDATION.MAX_CANTIDAD_SEMBRADA, ERROR_MESSAGES.MAX_CANTIDAD),
  ubicacion_bandeja: z.string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .regex(VALIDATION.UBICACION_PATTERN, ERROR_MESSAGES.INVALID_UBICACION),
  notas: z.string()
    .max(VALIDATION.MAX_NOTAS_LENGTH, ERROR_MESSAGES.MAX_NOTAS)
    .optional(),
});

type SiembraFormValues = z.infer<typeof siembraSchema>;

interface SiembraFormProps {
  siembra?: Siembra;
  onSubmit: (data: SiembraFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export default function SiembraForm({ 
  siembra, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  title = 'Nueva Siembra',
  description = 'Registra una nueva siembra de microgreens'
}: SiembraFormProps) {
  const [error, setError] = useState('');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  
  // Intentar cargar PlantTypes con manejo de errores
  const { plantTypes, isLoading: plantTypesLoading, error: plantTypesError } = usePlantTypes({ autoload: true });
  
  const isEditing = !!siembra;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<SiembraFormValues>({
    resolver: zodResolver(siembraSchema),
    defaultValues: siembra ? {
      tipo_microgreen: siembra.tipo_microgreen,
      fecha_siembra: siembra.fecha_siembra,
      cantidad_sembrada: siembra.cantidad_sembrada,
      ubicacion_bandeja: siembra.ubicacion_bandeja,
      notas: siembra.notas || '',
    } : {
      fecha_siembra: format(new Date(), 'yyyy-MM-dd'),
      cantidad_sembrada: 50, // Valor por defecto
    }
  });

  const watchedValues = watch(['tipo_microgreen', 'fecha_siembra']);

  // Calcular fecha esperada de cosecha
  React.useEffect(() => {
    const [tipoMicrogreen, fechaSiembra] = watchedValues;
    
    if (tipoMicrogreen && fechaSiembra) {
      // Buscar PlantType correspondiente
      const plantType = plantTypes.find(pt => 
        pt.name.toLowerCase() === tipoMicrogreen.toLowerCase()
      );
      
      // Usar daysToHarvest del PlantType o fallback a constantes
      const diasCrecimiento = plantType?.daysToHarvest || TIEMPOS_CRECIMIENTO[tipoMicrogreen] || 7;
      const fechaEsperada = addDays(new Date(fechaSiembra), diasCrecimiento);
      setExpectedHarvestDate(format(fechaEsperada, 'yyyy-MM-dd'));
    }
  }, [watchedValues, plantTypes]);

  const onSubmitForm = async (data: SiembraFormValues) => {
    setError('');
    
    try {
      await onSubmit(data);
      if (!isEditing) {
        reset();
        setExpectedHarvestDate('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.GENERIC_ERROR);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <Sprout className="h-5 w-5 text-green-600" />
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
          {/* Tipo de microgreen */}
          <div className="space-y-2">
            <Label htmlFor="tipo_microgreen">Tipo de Microgreen *</Label>
            <Select
              value={watch('tipo_microgreen') || ''}
              onValueChange={(value) => setValue('tipo_microgreen', value as any)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de microgreen" />
              </SelectTrigger>
              <SelectContent>
                {plantTypesLoading ? (
                  <SelectItem value="loading" disabled>Cargando tipos de plantas...</SelectItem>
                ) : plantTypes.length > 0 ? (
                  plantTypes.map((plantType) => (
                    <SelectItem key={plantType.id} value={plantType.name.toLowerCase()}>
                      {plantType.name}
                    </SelectItem>
                  ))
                ) : (
                  // Fallback a tipos hardcodeados si no hay PlantTypes
                  TIPOS_MICROGREENS.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {MICROGREEN_LABELS[tipo]}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.tipo_microgreen && (
              <p className="text-sm text-red-600">{errors.tipo_microgreen.message}</p>
            )}
          </div>

          {/* Fecha y cantidad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fecha_siembra">Fecha de Siembra *</Label>
              <Input
                id="fecha_siembra"
                type="date"
                {...register('fecha_siembra')}
                disabled={isLoading}
                className="w-full"
              />
              {errors.fecha_siembra && (
                <p className="text-sm text-red-600">{errors.fecha_siembra.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cantidad_sembrada">Cantidad Sembrada (g) *</Label>
              <Input
                id="cantidad_sembrada"
                type="number"
                step="0.1"
                min={VALIDATION.MIN_CANTIDAD_SEMBRADA}
                max={VALIDATION.MAX_CANTIDAD_SEMBRADA}
                {...register('cantidad_sembrada', { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.cantidad_sembrada && (
                <p className="text-sm text-red-600">{errors.cantidad_sembrada.message}</p>
              )}
            </div>
          </div>

          {/* Ubicación y fecha esperada */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ubicacion_bandeja">Ubicación (Bandeja) *</Label>
              <Input
                id="ubicacion_bandeja"
                placeholder="Ej: A1, B2, C3"
                {...register('ubicacion_bandeja')}
                disabled={isLoading}
              />
              {errors.ubicacion_bandeja && (
                <p className="text-sm text-red-600">{errors.ubicacion_bandeja.message}</p>
              )}
            </div>
            
            {/* Fecha esperada de cosecha (solo informativa) */}
            {expectedHarvestDate && (
              <div className="space-y-2">
                <Label>Cosecha Esperada</Label>
                <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-md">
                  <CalendarDays className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">
                    {format(new Date(expectedHarvestDate), 'dd/MM/yyyy')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              placeholder="Observaciones, condiciones especiales, etc."
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
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Actualizando...' : 'Registrando...'}
                </>
              ) : (
                <>
                  <Sprout className="mr-2 h-4 w-4" />
                  {isEditing ? 'Actualizar Siembra' : 'Registrar Siembra'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}