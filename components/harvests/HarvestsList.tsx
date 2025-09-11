'use client';

import { Harvest, Planting } from '@/lib/types';
import { QUALITY_LABELS, QUALITY_COLORS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Scissors, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Scale,
  Star,
  Calendar,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HarvestsListProps {
  harvests: Harvest[];
  plantings: Planting[];
  isLoading?: boolean;
  onCreateNew: () => void;
  onEdit: (harvest: Harvest) => void;
  onView: (harvest: Harvest) => void;
  onDelete: (harvest: Harvest) => void;
}

export default function HarvestsList({
  harvests,
  plantings,
  isLoading = false,
  onCreateNew,
  onEdit,
  onView,
  onDelete
}: HarvestsListProps) {
  
  // Find planting for a harvest
  const getPlantingInfo = (harvest: Harvest) => {
    if (!harvest.plantingId) return null;
    return plantings.find(p => p.id === harvest.plantingId);
  };

  // Get planting display name
  const getPlantingName = (harvest: Harvest) => {
    const planting = getPlantingInfo(harvest);
    if (!planting) return 'Cosecha independiente';
    return planting.plantType?.name || planting.plantName || 'Sin nombre';
  };

  // Calculate total value
  const getTotalValue = (harvest: Harvest) => {
    if (!harvest.pricePerGram) return null;
    return (harvest.weight * harvest.pricePerGram).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cosechas</h1>
            <p className="text-gray-600 mt-1">Gestiona las cosechas de tus cultivos</p>
          </div>
          <Button disabled className="bg-green-600">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cargando...
          </Button>
        </div>

        {/* Loading skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cosechas</h1>
          <p className="text-gray-600 mt-1">
            {harvests.length === 0 ? 
              'No hay cosechas registradas' : 
              `${harvests.length} cosecha${harvests.length !== 1 ? 's' : ''} registrada${harvests.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        
        <Button 
          onClick={onCreateNew}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cosecha
        </Button>
      </div>

      {/* Empty state */}
      {harvests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-green-50 rounded-full mb-4">
              <Scissors className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay cosechas registradas
            </h3>
            <p className="text-gray-500 text-center mb-6 max-w-md">
              Comienza registrando tu primera cosecha. Podrás ver el progreso y rendimiento de tus cultivos.
            </p>
            <Button 
              onClick={onCreateNew}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Registrar Primera Cosecha
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Harvests grid */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {harvests.map((harvest) => {
            const planting = getPlantingInfo(harvest);
            const plantingName = getPlantingName(harvest);
            const totalValue = getTotalValue(harvest);
            const isIndependent = !harvest.plantingId;

            return (
              <Card key={harvest.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {plantingName}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {format(new Date(harvest.harvestDate), 'dd MMM yyyy', { locale: es })}
                        </span>
                      </div>
                    </div>
                    
                    {isIndependent && (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        Independiente
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Weight and Quality */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Scale className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{harvest.weight}g</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className={`text-sm font-medium ${QUALITY_COLORS[harvest.quality]}`}>
                          {QUALITY_LABELS[harvest.quality]}
                        </span>
                      </div>
                    </div>

                    {/* Value */}
                    {totalValue && (
                      <div className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-md">
                        <span className="text-sm text-green-700">Valor total</span>
                        <span className="text-sm font-semibold text-green-800">
                          ${totalValue}
                        </span>
                      </div>
                    )}

                    {/* Location from planting */}
                    {planting?.trayNumber && (
                      <div className="text-xs text-gray-500">
                        Ubicación: {planting.trayNumber}
                      </div>
                    )}

                    {/* Notes preview */}
                    {harvest.notes && (
                      <div className="text-xs text-gray-600 line-clamp-2">
                        {harvest.notes}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(harvest)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(harvest)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(harvest)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}