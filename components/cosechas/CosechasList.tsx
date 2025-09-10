'use client';

import { useState, useMemo } from 'react';
import { Cosecha, Siembra } from '@/lib/types';
import { MICROGREEN_LABELS, PAGINATION } from '@/lib/constants';
import CosechaCard from './CosechaCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Plus, 
  Scissors,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Scale,
  Star,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CosechasListProps {
  cosechas: Cosecha[];
  siembras: Siembra[]; // Para obtener información de las siembras
  isLoading?: boolean;
  onEdit?: (cosecha: Cosecha) => void;
  onView?: (cosecha: Cosecha) => void;
  onDelete?: (cosecha: Cosecha) => void;
  onCreateNew?: () => void;
}

type SortField = 'fecha_cosecha' | 'peso_cosechado' | 'calidad' | 'tipo_microgreen';
type SortOrder = 'asc' | 'desc';

export default function CosechasList({
  cosechas,
  siembras,
  isLoading = false,
  onEdit,
  onView,
  onDelete,
  onCreateNew
}: CosechasListProps) {
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [filterCalidad, setFilterCalidad] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('fecha_cosecha');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION.DEFAULT_PAGE_SIZE);

  // Crear un mapa de siembras para acceso rápido
  const siembrasMap = useMemo(() => {
    return siembras.reduce((acc, siembra) => {
      acc[siembra.id] = siembra;
      return acc;
    }, {} as Record<string, Siembra>);
  }, [siembras]);

  // Aplicar filtros y búsqueda
  const filteredCosechas = useMemo(() => {
    let filtered = cosechas.filter(cosecha => {
      const siembra = siembrasMap[cosecha.siembra_id];
      
      // Búsqueda por texto
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        (siembra && MICROGREEN_LABELS[siembra.tipo_microgreen].toLowerCase().includes(searchLower)) ||
        (siembra && siembra.ubicacion_bandeja.toLowerCase().includes(searchLower)) ||
        (cosecha.notas && cosecha.notas.toLowerCase().includes(searchLower));

      // Filtro por tipo
      const matchesTipo = filterTipo === 'all' || 
        (siembra && siembra.tipo_microgreen === filterTipo);

      // Filtro por calidad
      const matchesCalidad = filterCalidad === 'all' || 
        cosecha.calidad.toString() === filterCalidad;

      return matchesSearch && matchesTipo && matchesCalidad;
    });

    // Ordenamiento
    filtered.sort((a, b) => {
      const siembraA = siembrasMap[a.siembra_id];
      const siembraB = siembrasMap[b.siembra_id];
      
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'fecha_cosecha':
          aValue = new Date(a.fecha_cosecha).getTime();
          bValue = new Date(b.fecha_cosecha).getTime();
          break;
        case 'peso_cosechado':
          aValue = a.peso_cosechado;
          bValue = b.peso_cosechado;
          break;
        case 'calidad':
          aValue = a.calidad;
          bValue = b.calidad;
          break;
        case 'tipo_microgreen':
          aValue = siembraA ? MICROGREEN_LABELS[siembraA.tipo_microgreen] : '';
          bValue = siembraB ? MICROGREEN_LABELS[siembraB.tipo_microgreen] : '';
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [cosechas, siembrasMap, searchTerm, filterTipo, filterCalidad, sortField, sortOrder]);

  // Paginación
  const totalItems = filteredCosechas.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCosechas = filteredCosechas.slice(startIndex, startIndex + pageSize);

  // Estadísticas generales
  const stats = useMemo(() => {
    const total = cosechas.length;
    const pesoTotal = cosechas.reduce((sum, c) => sum + c.peso_cosechado, 0);
    const calidadPromedio = total > 0 
      ? cosechas.reduce((sum, c) => sum + c.calidad, 0) / total 
      : 0;
    
    // Cosechas del mes actual
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const cosechasEsteMes = cosechas.filter(c => {
      const fechaCosecha = new Date(c.fecha_cosecha);
      return fechaCosecha.getMonth() === currentMonth && 
             fechaCosecha.getFullYear() === currentYear;
    });

    return { 
      total, 
      pesoTotal: Math.round(pesoTotal * 10) / 10,
      calidadPromedio: Math.round(calidadPromedio * 10) / 10,
      cosechasEsteMes: cosechasEsteMes.length
    };
  }, [cosechas]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterTipo('all');
    setFilterCalidad('all');
    setSortField('fecha_cosecha');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // Tipos únicos para el filtro
  const tiposDisponibles = useMemo(() => {
    const tipos = Array.from(new Set(
      cosechas.map(c => siembrasMap[c.siembra_id]?.tipo_microgreen).filter(Boolean)
    ));
    return tipos.sort();
  }, [cosechas, siembrasMap]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg mb-4" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Cosechas</CardTitle>
              <CardDescription>
                Historial de todas tus cosechas de microgreens
              </CardDescription>
            </div>
            {onCreateNew && (
              <Button onClick={onCreateNew} className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Cosecha
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total cosechas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.pesoTotal}g</div>
              <div className="text-sm text-gray-600">Peso total</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <span className="text-2xl font-bold text-yellow-600">{stats.calidadPromedio}</span>
                <Star className="h-5 w-5 text-yellow-600 fill-current" />
              </div>
              <div className="text-sm text-gray-600">Calidad promedio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.cosechasEsteMes}</div>
              <div className="text-sm text-gray-600">Este mes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por tipo, ubicación o notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por tipo */}
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {tiposDisponibles.map(tipo => (
                  <SelectItem key={tipo} value={tipo}>
                    {MICROGREEN_LABELS[tipo]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por calidad */}
            <Select value={filterCalidad} onValueChange={setFilterCalidad}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por calidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las calidades</SelectItem>
                <SelectItem value="5">⭐⭐⭐⭐⭐ Excelente</SelectItem>
                <SelectItem value="4">⭐⭐⭐⭐ Buena</SelectItem>
                <SelectItem value="3">⭐⭐⭐ Regular</SelectItem>
                <SelectItem value="2">⭐⭐ Baja</SelectItem>
                <SelectItem value="1">⭐ Muy baja</SelectItem>
              </SelectContent>
            </Select>

            {/* Ordenamiento */}
            <div className="flex space-x-2">
              <Select 
                value={`${sortField}-${sortOrder}`} 
                onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortField(field as SortField);
                  setSortOrder(order as SortOrder);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fecha_cosecha-desc">Más recientes</SelectItem>
                  <SelectItem value="fecha_cosecha-asc">Más antiguas</SelectItem>
                  <SelectItem value="peso_cosechado-desc">Mayor peso</SelectItem>
                  <SelectItem value="peso_cosechado-asc">Menor peso</SelectItem>
                  <SelectItem value="calidad-desc">Mejor calidad</SelectItem>
                  <SelectItem value="tipo_microgreen-asc">Por tipo (A-Z)</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Resultados */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {paginatedCosechas.length} de {totalItems} cosechas
            </p>
            {filteredCosechas.length !== cosechas.length && (
              <Badge variant="secondary">
                <Filter className="mr-1 h-3 w-3" />
                Filtros aplicados
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de cosechas */}
      {paginatedCosechas.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterTipo !== 'all' || filterCalidad !== 'all'
                  ? 'No se encontraron cosechas'
                  : 'No hay cosechas registradas'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterTipo !== 'all' || filterCalidad !== 'all'
                  ? 'Prueba ajustando los filtros de búsqueda'
                  : 'Comienza registrando tu primera cosecha'
                }
              </p>
              {onCreateNew && (
                <Button onClick={onCreateNew} className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Cosecha
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCosechas.map((cosecha) => (
            <CosechaCard
              key={cosecha.id}
              cosecha={cosecha}
              siembra={siembrasMap[cosecha.siembra_id]}
              onEdit={onEdit}
              onView={onView}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Mostrar:</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGINATION.PAGE_SIZE_OPTIONS.map(size => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}