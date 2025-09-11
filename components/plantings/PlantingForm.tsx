'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlantingFormData, Planting, PlantType, PlantingStatus } from '@/lib/types';
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
  Sprout, 
  Calendar,
  MapPin,
  Info
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

// Schema de validación
const plantingSchema = z.object({
  plantTypeId: z.string().optional(),
  plantName: z.string().optional(), // Fallback when no plantType selected
  datePlanted: z.string().min(1, 'La fecha de siembra es requerida'),
  expectedHarvest: z.string().optional(),
  domeDate: z.string().optional(),
  lightDate: z.string().optional(),
  quantity: z.number()
    .min(1, 'La cantidad debe ser mayor a 0')
    .max(1000, 'La cantidad máxima es 1000')
    .optional(),
  trayNumber: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.plantTypeId || data.plantName, {
  message: "Debes seleccionar un tipo de planta o ingresar un nombre",
  path: ["plantTypeId"],
});

type PlantingFormValues = z.infer<typeof plantingSchema>;

interface PlantingFormProps {
  planting?: Planting;
  plantTypes: PlantType[];
  onSubmit: (data: PlantingFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

const STATUS_OPTIONS: { value: PlantingStatus; label: string; color: string }[] = [
  { value: 'PLANTED', label: 'Plantado', color: 'bg-gray-100 text-gray-800' },
  { value: 'GERMINATING', label: 'Germinando', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'GROWING', label: 'Creciendo', color: 'bg-blue-100 text-blue-800' },
  { value: 'READY_TO_HARVEST', label: 'Listo para cosechar', color: 'bg-green-100 text-green-800' },
];

export default function PlantingForm({ 
  planting, 
  plantTypes,
  onSubmit, 
  onCancel, 
  isLoading = false,
  title = 'Nueva Siembra',
  description = 'Registra una nueva siembra en tu cultivo'
}: PlantingFormProps) {
  const [error, setError] = useState('');
  const [selectedPlantType, setSelectedPlantType] = useState<PlantType | null>(null);
  const [useCustomName, setUseCustomName] = useState(false);
  
  const isEditing = !!planting;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<PlantingFormValues>({
    resolver: zodResolver(plantingSchema),
    defaultValues: planting ? {
      plantTypeId: planting.plantTypeId || '',
      plantName: planting.plantName || '',
      datePlanted: planting.datePlanted.split('T')[0],
      expectedHarvest: planting.expectedHarvest?.split('T')[0] || '',
      domeDate: planting.domeDate?.split('T')[0] || '',
      lightDate: planting.lightDate?.split('T')[0] || '',
      quantity: planting.quantity || 50,
      trayNumber: planting.trayNumber || '',
      notes: planting.notes || '',
    } : {
      plantTypeId: '',
      datePlanted: format(new Date(), 'yyyy-MM-dd'),
      quantity: 50,
    }
  });

  const watchedPlantTypeId = watch('plantTypeId');
  const watchedDatePlanted = watch('datePlanted');

  // Find selected plant type
  useEffect(() => {
    if (watchedPlantTypeId) {
      const plantType = plantTypes.find(pt => pt.id === watchedPlantTypeId);
      setSelectedPlantType(plantType || null);
      setUseCustomName(false);
    } else {
      setSelectedPlantType(null);
    }
  }, [watchedPlantTypeId, plantTypes]);

  // Auto-calculate expected harvest date when plant type or date changes
  useEffect(() => {
    if (selectedPlantType && watchedDatePlanted && selectedPlantType.daysToHarvest) {
      const expectedDate = addDays(new Date(watchedDatePlanted), selectedPlantType.daysToHarvest);
      setValue('expectedHarvest', format(expectedDate, 'yyyy-MM-dd'));
    }
  }, [selectedPlantType, watchedDatePlanted, setValue]);

  // Auto-calculate dome and light dates
  useEffect(() => {
    if (selectedPlantType && watchedDatePlanted) {
      // Dome date: usually 2-3 days after planting for microgreens
      const domeDate = addDays(new Date(watchedDatePlanted), selectedPlantType.daysToGerminate || 2);
      setValue('domeDate', format(domeDate, 'yyyy-MM-dd'));
      
      // Light date: usually 1-2 days after dome date
      const lightDate = addDays(domeDate, 2);
      setValue('lightDate', format(lightDate, 'yyyy-MM-dd'));
    }
  }, [selectedPlantType, watchedDatePlanted, setValue]);

  const onSubmitForm = async (data: PlantingFormValues) => {
    setError('');
    
    try {
      // Prepare form data
      const plantingData: PlantingFormData = {
        plantTypeId: useCustomName ? undefined : data.plantTypeId,
        plantName: useCustomName ? data.plantName : undefined,
        datePlanted: data.datePlanted,
        expectedHarvest: data.expectedHarvest,
        domeDate: data.domeDate,
        lightDate: data.lightDate,
        quantity: data.quantity,
        trayNumber: data.trayNumber,
        notes: data.notes,
        status: 'PLANTED', // Default status
      };

      await onSubmit(plantingData);
      
      if (!isEditing) {
        reset();
        setSelectedPlantType(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar la siembra');
    }
  };

  const getDifficultyBadge = (difficulty?: string) => {
    const difficultyConfig = {
      'Easy': { label: 'Fácil', color: 'bg-green-100 text-green-800' },
      'Medium': { label: 'Medio', color: 'bg-yellow-100 text-yellow-800' },
      'Hard': { label: 'Difícil', color: 'bg-red-100 text-red-800' },
    };

    if (!difficulty) return null;
    const config = difficultyConfig[difficulty as keyof typeof difficultyConfig];
    return config || { label: difficulty, color: 'bg-gray-100 text-gray-800' };
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
          {/* Plant Type Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant={!useCustomName ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUseCustomName(false)}
                disabled={isLoading}
              >
                Catálogo de Plantas
              </Button>
              <Button
                type="button"
                variant={useCustomName ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUseCustomName(true)}
                disabled={isLoading}
              >
                Nombre Personalizado
              </Button>
            </div>

            {!useCustomName ? (
              <div className="space-y-2">
                <Label htmlFor="plantTypeId">Tipo de Planta *</Label>
                <Select
                  value={watch('plantTypeId') || ''}
                  onValueChange={(value) => setValue('plantTypeId', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de planta" />
                  </SelectTrigger>
                  <SelectContent>
                    {plantTypes.map((plantType) => {
                      const difficultyBadge = getDifficultyBadge(plantType.difficulty);
                      return (
                        <SelectItem key={plantType.id} value={plantType.id}>
                          <div className="flex items-center space-x-2">
                            <span>{plantType.name}</span>
                            {plantType.category && (
                              <span className="text-gray-500 text-xs">({plantType.category})</span>
                            )}
                            {difficultyBadge && (
                              <Badge variant="outline" className={`text-xs ${difficultyBadge.color}`}>
                                {difficultyBadge.label}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors.plantTypeId && (
                  <p className="text-sm text-red-600">{errors.plantTypeId.message}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="plantName">Nombre de la Planta *</Label>
                <Input
                  id="plantName"
                  placeholder="Ej: Microgreen de rúcula"
                  {...register('plantName')}
                  disabled={isLoading}
                />
                {errors.plantName && (
                  <p className="text-sm text-red-600">{errors.plantName.message}</p>
                )}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Usar nombre personalizado cuando la planta no esté en el catálogo.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          {/* Selected Plant Type Info */}
          {selectedPlantType && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-blue-900">{selectedPlantType.name}</h4>
                    {selectedPlantType.difficulty && (
                      <Badge variant="outline" className={getDifficultyBadge(selectedPlantType.difficulty)?.color}>
                        {getDifficultyBadge(selectedPlantType.difficulty)?.label}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedPlantType.daysToGerminate && (
                      <div>
                        <span className="text-gray-600">Días para germinar:</span>
                        <span className="ml-2 font-medium">{selectedPlantType.daysToGerminate}</span>
                      </div>
                    )}
                    {selectedPlantType.daysToHarvest && (
                      <div>
                        <span className="text-gray-600">Días para cosechar:</span>
                        <span className="ml-2 font-medium">{selectedPlantType.daysToHarvest}</span>
                      </div>
                    )}
                    {selectedPlantType.averageYield && (
                      <div>
                        <span className="text-gray-600">Rendimiento promedio:</span>
                        <span className="ml-2 font-medium">{selectedPlantType.averageYield}g</span>
                      </div>
                    )}
                    {selectedPlantType.optimalTemp && (
                      <div>
                        <span className="text-gray-600">Temperatura óptima:</span>
                        <span className="ml-2 font-medium">{selectedPlantType.optimalTemp}°C</span>
                      </div>
                    )}
                  </div>

                  {selectedPlantType.description && (
                    <p className="text-sm text-blue-700 mt-2">
                      {selectedPlantType.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Planting Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="datePlanted">Fecha de Siembra *</Label>
              <Input
                id="datePlanted"
                type="date"
                {...register('datePlanted')}
                disabled={isLoading}
              />
              {errors.datePlanted && (
                <p className="text-sm text-red-600">{errors.datePlanted.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad (semillas/g)</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="1000"
                placeholder="50"
                {...register('quantity', { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.quantity && (
                <p className="text-sm text-red-600">{errors.quantity.message}</p>
              )}
            </div>
          </div>

          {/* Growth Timeline */}
          <div className="space-y-4">
            <Label>Cronograma de Crecimiento</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="domeDate" className="text-sm">Fecha de Domo</Label>
                <Input
                  id="domeDate"
                  type="date"
                  {...register('domeDate')}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-600">Cuándo cubrir con domo/tapa</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lightDate" className="text-sm">Fecha de Luz</Label>
                <Input
                  id="lightDate"
                  type="date"
                  {...register('lightDate')}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-600">Cuándo exponer a la luz</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedHarvest" className="text-sm">Cosecha Esperada</Label>
                <Input
                  id="expectedHarvest"
                  type="date"
                  {...register('expectedHarvest')}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-600">Fecha estimada de cosecha</p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="trayNumber">Ubicación/Bandeja</Label>
            <Input
              id="trayNumber"
              placeholder="Ej: A1, Estante-2-Nivel-3"
              {...register('trayNumber')}
              disabled={isLoading}
            />
            <p className="text-sm text-gray-600">
              Dónde está ubicada físicamente la siembra
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Observaciones, condiciones especiales, etc."
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