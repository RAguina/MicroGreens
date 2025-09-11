'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HarvestFormData, Harvest, Planting, HarvestQuality, getScoreFromQuality } from '@/lib/types';
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
  TrendingUp
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

// Schema de validación
const harvestSchema = z.object({
  plantingId: z.string().optional(), // Optional for independent harvests
  harvestDate: z.string().min(1, 'La fecha es requerida'),
  weight: z.number()
    .min(0.1, 'El peso debe ser mayor a 0.1g')
    .max(1000, 'El peso máximo es 1000g'),
  quality: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR']),
  notes: z.string().optional(),
  pricePerGram: z.number().optional(),
  appearance: z.number().min(1).max(10).optional(),
  taste: z.number().min(1).max(10).optional(),
  freshness: z.number().min(1).max(10).optional(),
});

type HarvestFormValues = z.infer<typeof harvestSchema>;

interface HarvestFormProps {
  harvest?: Harvest;
  plantings: Planting[];
  preSelectedPlanting?: string;
  onSubmit: (data: HarvestFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

const QUALITY_OPTIONS: { value: HarvestQuality; label: string; color: string }[] = [
  { value: 'EXCELLENT', label: 'Excelente', color: 'text-green-600' },
  { value: 'GOOD', label: 'Buena', color: 'text-blue-600' },
  { value: 'FAIR', label: 'Regular', color: 'text-yellow-600' },
  { value: 'POOR', label: 'Mala', color: 'text-red-600' },
];

export default function HarvestForm({ 
  harvest, 
  plantings,
  preSelectedPlanting,
  onSubmit, 
  onCancel, 
  isLoading = false,
  title = 'Nueva Cosecha',
  description = 'Registra una nueva cosecha de tu cultivo'
}: HarvestFormProps) {
  const [error, setError] = useState('');
  const [selectedPlanting, setSelectedPlanting] = useState<Planting | null>(null);
  const [isIndependent, setIsIndependent] = useState(false);
  
  const isEditing = !!harvest;
  
  // Filter plantings that can be harvested (not already harvested)
  const availablePlantings = plantings.filter(p => 
    p.status !== 'HARVESTED' && p.status !== 'FAILED'
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<HarvestFormValues>({
    resolver: zodResolver(harvestSchema),
    defaultValues: harvest ? {
      plantingId: harvest.plantingId,
      harvestDate: harvest.harvestDate.split('T')[0],
      weight: harvest.weight,
      quality: harvest.quality,
      notes: harvest.notes || '',
      pricePerGram: harvest.pricePerGram,
      appearance: harvest.appearance,
      taste: harvest.taste,
      freshness: harvest.freshness,
    } : {
      plantingId: preSelectedPlanting || '',
      harvestDate: format(new Date(), 'yyyy-MM-dd'),
      quality: 'GOOD' as HarvestQuality,
      appearance: 8,
      taste: 8,
      freshness: 8,
    }
  });

  const watchedPlantingId = watch('plantingId');
  const watchedWeight = watch('weight');
  const watchedQuality = watch('quality');

  // Find selected planting
  useEffect(() => {
    if (watchedPlantingId) {
      const planting = plantings.find(p => p.id === watchedPlantingId);
      setSelectedPlanting(planting || null);
    } else {
      setSelectedPlanting(null);
    }
  }, [watchedPlantingId, plantings]);

  // Clear planting when switching to independent mode
  useEffect(() => {
    if (isIndependent) {
      setValue('plantingId', '');
      setSelectedPlanting(null);
    }
  }, [isIndependent, setValue]);

  // Calculate planting stats
  const getPlantingStats = () => {
    if (!selectedPlanting) return null;
    
    const daysGrowing = differenceInDays(
      new Date(), 
      new Date(selectedPlanting.datePlanted)
    );
    
    const expectedDays = selectedPlanting.expectedHarvest 
      ? differenceInDays(
          new Date(selectedPlanting.expectedHarvest),
          new Date(selectedPlanting.datePlanted)
        )
      : selectedPlanting.plantType?.daysToHarvest || 7;
    
    const isLate = daysGrowing > expectedDays;
    const expectedYield = selectedPlanting.plantType?.averageYield;
    
    return {
      daysGrowing,
      expectedDays,
      isLate,
      expectedYield
    };
  };

  const plantingStats = getPlantingStats();

  // Evaluate yield performance
  const getYieldEvaluation = () => {
    if (!selectedPlanting || !watchedWeight || !plantingStats?.expectedYield) return null;
    
    const percentage = (watchedWeight / plantingStats.expectedYield) * 100;
    
    return {
      percentage: Math.round(percentage),
      category: percentage >= 100 ? 'excellent' : percentage >= 80 ? 'good' : 'low',
      expected: plantingStats.expectedYield
    };
  };

  const yieldEvaluation = getYieldEvaluation();

  const onSubmitForm = async (data: HarvestFormValues) => {
    setError('');
    
    try {
      // Convert form data to API format
      const harvestData: HarvestFormData = {
        plantingId: data.plantingId || '', // Empty string for independent harvests
        harvestDate: data.harvestDate,
        weight: data.weight,
        quality: data.quality,
        notes: data.notes,
        pricePerGram: data.pricePerGram,
        appearance: data.appearance,
        taste: data.taste,
        freshness: data.freshness,
      };

      await onSubmit(harvestData);
      
      if (!isEditing) {
        reset();
        setSelectedPlanting(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar la cosecha');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PLANTED': { label: 'Plantado', color: 'bg-gray-100 text-gray-800' },
      'GERMINATING': { label: 'Germinando', color: 'bg-yellow-100 text-yellow-800' },
      'GROWING': { label: 'Creciendo', color: 'bg-blue-100 text-blue-800' },
      'READY_TO_HARVEST': { label: 'Listo', color: 'bg-green-100 text-green-800' },
      'HARVESTED': { label: 'Cosechado', color: 'bg-gray-100 text-gray-600' },
      'FAILED': { label: 'Fallido', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return config || { label: status, color: 'bg-gray-100 text-gray-800' };
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
          {/* Harvest Type Toggle */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant={!isIndependent ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsIndependent(false)}
                disabled={isLoading || isEditing}
              >
                Cosechar Siembra Existente
              </Button>
              <Button
                type="button"
                variant={isIndependent ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsIndependent(true)}
                disabled={isLoading || isEditing}
              >
                Cosecha Independiente
              </Button>
            </div>
            
            {isIndependent && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Cosecha independiente: registra una cosecha sin vincular a una siembra específica.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Planting Selection */}
          {!isIndependent && (
            <div className="space-y-2">
              <Label htmlFor="plantingId">Siembra a cosechar *</Label>
              <Select
                value={watch('plantingId') || ''}
                onValueChange={(value) => setValue('plantingId', value)}
                disabled={isLoading || isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la siembra a cosechar" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlantings.map((planting) => {
                    const statusBadge = getStatusBadge(planting.status);
                    return (
                      <SelectItem key={planting.id} value={planting.id}>
                        <div className="flex items-center space-x-2">
                          <span>{planting.plantType?.name || planting.plantName}</span>
                          <span className="text-gray-500">- {planting.trayNumber || 'Sin ubicación'}</span>
                          <Badge variant="outline" className={statusBadge.color}>
                            {statusBadge.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.plantingId && (
                <p className="text-sm text-red-600">{errors.plantingId.message}</p>
              )}
              
              {availablePlantings.length === 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No hay siembras disponibles para cosechar.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Independent Harvest Info */}
          {isIndependent && (
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="font-medium text-orange-900">
                      Cosecha Independiente
                    </div>
                    <div className="text-sm text-orange-700">
                      Esta cosecha se registrará sin asociar a una siembra específica.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected Planting Info */}
          {selectedPlanting && plantingStats && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Tipo:</span>
                    <span className="ml-2 font-medium">
                      {selectedPlanting.plantType?.name || selectedPlanting.plantName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ubicación:</span>
                    <span className="ml-2 font-medium">{selectedPlanting.trayNumber || 'Sin ubicación'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Plantado:</span>
                    <span className="ml-2 font-medium">
                      {format(new Date(selectedPlanting.datePlanted), 'dd/MM/yyyy', { locale: es })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Días creciendo:</span>
                    <span className={`ml-2 font-medium ${
                      plantingStats.isLate ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {plantingStats.daysGrowing} días
                      {plantingStats.isLate && ' (tardía)'}
                    </span>
                  </div>
                  {plantingStats.expectedYield && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Rendimiento esperado:</span>
                      <span className="ml-2 font-medium">
                        ~{plantingStats.expectedYield}g
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Date and Weight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="harvestDate">Fecha de Cosecha *</Label>
              <Input
                id="harvestDate"
                type="date"
                {...register('harvestDate')}
                disabled={isLoading}
                className="w-full"
              />
              {errors.harvestDate && (
                <p className="text-sm text-red-600">{errors.harvestDate.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">Peso Cosechado (g) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0.1"
                max="1000"
                placeholder="Ej: 85.5"
                {...register('weight', { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.weight && (
                <p className="text-sm text-red-600">{errors.weight.message}</p>
              )}
            </div>
          </div>

          {/* Yield Evaluation */}
          {yieldEvaluation && (
            <Card className={`${
              yieldEvaluation.category === 'excellent' ? 'bg-green-50 border-green-200' :
              yieldEvaluation.category === 'good' ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            }`}>
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className={`h-5 w-5 ${
                    yieldEvaluation.category === 'excellent' ? 'text-green-600' :
                    yieldEvaluation.category === 'good' ? 'text-yellow-600' :
                    'text-red-600'
                  }`} />
                  <div>
                    <div className="font-medium">
                      Rendimiento: {yieldEvaluation.percentage}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Respecto al promedio esperado (~{yieldEvaluation.expected}g)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quality */}
          <div className="space-y-2">
            <Label htmlFor="quality">Calidad de la Cosecha *</Label>
            <Select
              value={watch('quality') || ''}
              onValueChange={(value) => setValue('quality', value as HarvestQuality)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la calidad" />
              </SelectTrigger>
              <SelectContent>
                {QUALITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4" />
                      <span className={option.color}>{option.label}</span>
                      <span className="text-xs text-gray-500">
                        ({getScoreFromQuality(option.value)}/10)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.quality && (
              <p className="text-sm text-red-600">{errors.quality.message}</p>
            )}
          </div>

          {/* Price (optional) */}
          <div className="space-y-2">
            <Label htmlFor="pricePerGram">Precio por gramo (opcional)</Label>
            <Input
              id="pricePerGram"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ej: 0.50"
              {...register('pricePerGram', { valueAsNumber: true })}
              disabled={isLoading}
            />
            <p className="text-sm text-gray-600">
              Precio de venta por gramo para calcular el valor total
            </p>
          </div>

          {/* Quality Metrics (optional) */}
          <div className="space-y-4">
            <Label>Métricas de Calidad (opcional)</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appearance" className="text-sm">Apariencia (1-10)</Label>
                <Input
                  id="appearance"
                  type="number"
                  min="1"
                  max="10"
                  {...register('appearance', { valueAsNumber: true })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taste" className="text-sm">Sabor (1-10)</Label>
                <Input
                  id="taste"
                  type="number"
                  min="1"
                  max="10"
                  {...register('taste', { valueAsNumber: true })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="freshness" className="text-sm">Frescura (1-10)</Label>
                <Input
                  id="freshness"
                  type="number"
                  min="1"
                  max="10"
                  {...register('freshness', { valueAsNumber: true })}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Observaciones sobre la cosecha, condiciones, etc."
              {...register('notes')}
              disabled={isLoading}
              maxLength={500}
            />
            {errors.notes && (
              <p className="text-sm text-red-600">{errors.notes.message}</p>
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
              disabled={isLoading || (!isIndependent && availablePlantings.length === 0)}
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