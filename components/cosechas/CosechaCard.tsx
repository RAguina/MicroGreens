'use client';

import { Cosecha, Siembra } from '@/lib/types';
import { MICROGREEN_LABELS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CalendarDays, 
  MapPin, 
  Scale,
  Star,
  Eye,
  Edit,
  MoreHorizontal,
  Scissors,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PESO_ESPERADO } from '@/lib/constants';

interface CosechaCardProps {
  cosecha: Cosecha;
  siembra?: Siembra; // Información opcional de la siembra relacionada
  onEdit?: (cosecha: Cosecha) => void;
  onView?: (cosecha: Cosecha) => void;
  onDelete?: (cosecha: Cosecha) => void;
}

export default function CosechaCard({ 
  cosecha, 
  siembra,
  onEdit, 
  onView, 
  onDelete 
}: CosechaCardProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
  };

  const getQualityColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
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

  const getRendimiento = () => {
    if (!siembra) return null;
    
    const esperado = PESO_ESPERADO[siembra.tipo_microgreen];
    if (!esperado) return null;
    
    const pesoReal = cosecha.peso_cosechado;
    const promedioEsperado = (esperado.min + esperado.max) / 2;
    const porcentaje = (pesoReal / promedioEsperado) * 100;
    
    return {
      porcentaje: Math.round(porcentaje),
      esBueno: porcentaje >= 90,
      esperadoMin: esperado.min,
      esperadoMax: esperado.max
    };
  };

  const rendimiento = getRendimiento();

  return (
    <Card className="hover:shadow-md transition-shadow animate-slide-up">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {siembra ? MICROGREEN_LABELS[siembra.tipo_microgreen] : 'Microgreen'}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 ${getQualityColor(cosecha.calidad)}`}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < cosecha.calidad 
                      ? 'fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg" align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(cosecha)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalle
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(cosecha)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(cosecha)}
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
            <span>Cosechado: {formatDate(cosecha.fecha_cosecha)}</span>
          </div>
          {siembra && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>Bandeja: {siembra.ubicacion_bandeja}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Scale className="h-4 w-4" />
            <span className="font-medium text-gray-900">{cosecha.peso_cosechado}g cosechados</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Star className="h-4 w-4" />
            <span>Calidad: {getQualityLabel(cosecha.calidad)}</span>
          </div>
        </div>

        {/* Rendimiento */}
        {rendimiento && (
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rendimiento</span>
              <div className="flex items-center space-x-1">
                {rendimiento.esBueno ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  rendimiento.esBueno ? 'text-green-600' : 'text-red-600'
                }`}>
                  {rendimiento.porcentaje}%
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Esperado: {rendimiento.esperadoMin}-{rendimiento.esperadoMax}g
            </div>
          </div>
        )}

        {/* Notas */}
        {cosecha.notas && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">{cosecha.notas}</p>
          </div>
        )}

        {/* Información de la siembra original */}
        {siembra && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Siembra original:</span>
              <span className="text-gray-900">
                {formatDate(siembra.fecha_siembra)} ({siembra.cantidad_sembrada}g)
              </span>
            </div>
            {siembra.fecha_esperada_cosecha && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Esperada para:</span>
                <span className="text-gray-900">
                  {formatDate(siembra.fecha_esperada_cosecha)}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}