'use client';

import { Planting } from '@/lib/types';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sprout, 
  Plus, 
  Edit, 
  Eye, 
  Trash2,
  Scissors,
  Calendar,
  MapPin,
  Loader2
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface PlantingsListProps {
  plantings: Planting[];
  isLoading?: boolean;
  onCreateNew: () => void;
  onEdit: (planting: Planting) => void;
  onView: (planting: Planting) => void;
  onHarvest: (planting: Planting) => void;
  onDelete: (planting: Planting) => void;
}

export default function PlantingsList({
  plantings,
  isLoading = false,
  onCreateNew,
  onEdit,
  onView,
  onHarvest,
  onDelete
}: PlantingsListProps) {
  
  // Get planting display name
  const getPlantingName = (planting: Planting) => {
    return planting.plantType?.name || planting.plantName || 'Sin nombre';
  };

  // Calculate days since planted
  const getDaysPlanted = (planting: Planting) => {
    return differenceInDays(new Date(), new Date(planting.datePlanted));
  };

  // Calculate days until expected harvest
  const getDaysUntilHarvest = (planting: Planting) => {
    if (!planting.expectedHarvest) return null;
    return differenceInDays(new Date(planting.expectedHarvest), new Date());
  };

  // Get status badge configuration
  const getStatusBadge = (status: string) => {
    return {
      label: STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status,
      className: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'
    };
  };

  // Check if ready to harvest
  const canHarvest = (planting: Planting) => {
    return ['GROWING', 'READY_TO_HARVEST'].includes(planting.status);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Siembras</h1>
            <p className="text-gray-600 mt-1">Gestiona tus siembras y cultivos</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Siembras</h1>
          <p className="text-gray-600 mt-1">
            {plantings.length === 0 ? 
              'No hay siembras registradas' : 
              `${plantings.length} siembra${plantings.length !== 1 ? 's' : ''} registrada${plantings.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        
        <Button 
          onClick={onCreateNew}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Siembra
        </Button>
      </div>

      {/* Empty state */}
      {plantings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-green-50 rounded-full mb-4">
              <Sprout className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay siembras registradas
            </h3>
            <p className="text-gray-500 text-center mb-6 max-w-md">
              Comienza registrando tu primera siembra. Podrás hacer seguimiento del crecimiento y rendimiento de tus cultivos.
            </p>
            <Button 
              onClick={onCreateNew}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Registrar Primera Siembra
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Plantings grid */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plantings.map((planting) => {
            const plantingName = getPlantingName(planting);
            const daysPlanted = getDaysPlanted(planting);
            const daysUntilHarvest = getDaysUntilHarvest(planting);
            const statusBadge = getStatusBadge(planting.status);
            const isReadyToHarvest = canHarvest(planting);

            return (
              <Card key={planting.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {plantingName}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {format(new Date(planting.datePlanted), 'dd MMM yyyy', { locale: es })}
                        </span>
                      </div>
                    </div>
                    
                    <Badge className={statusBadge.className}>
                      {statusBadge.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Growth info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Días plantado:</span>
                        <div className="font-medium">{daysPlanted} días</div>
                      </div>
                      {daysUntilHarvest !== null && (
                        <div>
                          <span className="text-gray-600">Para cosecha:</span>
                          <div className={`font-medium ${daysUntilHarvest <= 0 ? 'text-green-600' : ''}`}>
                            {daysUntilHarvest <= 0 ? 'Listo!' : `${daysUntilHarvest} días`}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Location and quantity */}
                    <div className="flex items-center justify-between text-sm">
                      {planting.trayNumber && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{planting.trayNumber}</span>
                        </div>
                      )}
                      {planting.quantity && (
                        <div className="text-gray-600">
                          {planting.quantity}g sembrado
                        </div>
                      )}
                    </div>

                    {/* Plant type info */}
                    {planting.plantType && (
                      <div className="text-xs space-y-1">
                        {planting.plantType.category && (
                          <div className="text-gray-500">
                            Categoría: {planting.plantType.category}
                          </div>
                        )}
                        {planting.plantType.daysToHarvest && (
                          <div className="text-gray-500">
                            Ciclo: ~{planting.plantType.daysToHarvest} días
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes preview */}
                    {planting.notes && (
                      <div className="text-xs text-gray-600 line-clamp-2">
                        {planting.notes}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      {/* Harvest button (if ready) */}
                      {isReadyToHarvest && (
                        <Button
                          size="sm"
                          onClick={() => onHarvest(planting)}
                          className="bg-green-600 hover:bg-green-700 text-xs"
                        >
                          <Scissors className="h-3 w-3 mr-1" />
                          Cosechar
                        </Button>
                      )}
                      
                      {/* Action icons */}
                      <div className="flex items-center space-x-1 ml-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(planting)}
                          className="text-gray-600 hover:text-gray-900 h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(planting)}
                          className="text-blue-600 hover:text-blue-900 h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(planting)}
                          className="text-red-600 hover:text-red-900 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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