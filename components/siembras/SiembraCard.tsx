'use client';

import { Siembra } from '@/lib/types';
import { ESTADO_LABELS, ESTADO_COLORS, MICROGREEN_LABELS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CalendarDays, 
  MapPin, 
  Sprout, 
  Scissors,
  Eye,
  Edit,
  MoreHorizontal 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SiembraCardProps {
  siembra: Siembra;
  onEdit?: (siembra: Siembra) => void;
  onView?: (siembra: Siembra) => void;
  onHarvest?: (siembra: Siembra) => void;
  onDelete?: (siembra: Siembra) => void;
}

export default function SiembraCard({ 
  siembra, 
  onEdit, 
  onView, 
  onHarvest, 
  onDelete 
}: SiembraCardProps) {
  const canHarvest = siembra.estado === 'listo';
  const isHarvested = siembra.estado === 'cosechado';

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
  };

  const getDaysUntilHarvest = () => {
    const today = new Date();
    const expectedDate = new Date(siembra.fecha_esperada_cosecha);
    const diffTime = expectedDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} días tarde`;
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    return `En ${diffDays} días`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow animate-slide-up">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {MICROGREEN_LABELS[siembra.tipo_microgreen]}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={ESTADO_COLORS[siembra.estado]}>
              {ESTADO_LABELS[siembra.estado]}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="!bg-white border border-gray-200 shadow-lg" align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(siembra)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalle
                  </DropdownMenuItem>
                )}
                {onEdit && !isHarvested && (
                  <DropdownMenuItem onClick={() => onEdit(siembra)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onHarvest && canHarvest && (
                  <DropdownMenuItem onClick={() => onHarvest(siembra)}>
                    <Scissors className="mr-2 h-4 w-4" />
                    Cosechar
                  </DropdownMenuItem>
                )}
                {onDelete && !isHarvested && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(siembra)}
                    className="text-red-600"
                  >
                    <Scissors className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Información básica */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CalendarDays className="h-4 w-4" />
            <span>Sembrado: {formatDate(siembra.fecha_siembra)}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>Bandeja: {siembra.ubicacion_bandeja}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Sprout className="h-4 w-4" />
            <span>{siembra.cantidad_sembrada}g sembrados</span>
          </div>
          {!isHarvested && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CalendarDays className="h-4 w-4" />
              <span className={canHarvest ? 'text-green-600 font-medium' : ''}>
                {getDaysUntilHarvest()}
              </span>
            </div>
          )}
        </div>

        {/* Fecha real de cosecha si ya fue cosechado */}
        {isHarvested && siembra.fecha_real_cosecha && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Scissors className="h-4 w-4" />
            <span>Cosechado: {formatDate(siembra.fecha_real_cosecha)}</span>
          </div>
        )}

        {/* Notas */}
        {siembra.notas && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">{siembra.notas}</p>
          </div>
        )}

        {/* Acciones rápidas */}
        {canHarvest && onHarvest && (
          <div className="pt-2 border-t">
            <Button 
              onClick={() => onHarvest(siembra)}
              className="w-full bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Scissors className="mr-2 h-4 w-4" />
              Registrar Cosecha
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}