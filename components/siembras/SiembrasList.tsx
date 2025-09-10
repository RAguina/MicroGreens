'use client';

import { useState, useMemo } from 'react';
import { Siembra } from '@/lib/types';
import { ESTADO_LABELS, MICROGREEN_LABELS, PAGINATION } from '@/lib/constants';
import SiembraCard from './SiembraCard';
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
  Sprout,
  ChevronLeft,
  ChevronRight,
  RotateCcw 
} from 'lucide-react';

interface SiembrasListProps {
  siembras: Siembra[];
  isLoading?: boolean;
  onEdit?: (siembra: Siembra) => void;
  onView?: (siembra: Siembra) => void;
  onHarvest?: (siembra: Siembra) => void;
  onDelete?: (siembra: Siembra) => void;
  onCreateNew?: () => void;
}

type SortField = 'fecha_siembra' | 'fecha_esperada_cosecha' | 'tipo_microgreen' | 'estado';
type SortOrder = 'asc' | 'desc';

export default function SiembrasList({
  siembras,
  isLoading = false,
  onEdit,
  onView,
  onHarvest,
  onDelete,
  onCreateNew
}: SiembrasListProps) {
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('fecha_siembra');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION.DEFAULT_PAGE_SIZE);

  // Aplicar filtros y búsqueda
  const filteredSiembras = useMemo(() => {
    let filtered = siembras.filter(siembra => {
      // Búsqueda por texto
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        MICROGREEN_LABELS[siembra.tipo_microgreen].toLowerCase().includes(searchLower) ||
        siembra.ubicacion_bandeja.toLowerCase().includes(searchLower) ||
        (siembra.notas && siembra.notas.toLowerCase().includes(searchLower));

      // Filtro por estado
      const matchesEstado = filterEstado === 'all' || siembra.estado === filterEstado;

      // Filtro por tipo
      const matchesTipo = filterTipo === 'all' || siembra.tipo_microgreen === filterTipo;

      return matchesSearch && matchesEstado && matchesTipo;
    });

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'fecha_siembra':
          aValue = new Date(a.fecha_siembra).getTime();
          bValue = new Date(b.fecha_siembra).getTime();
          break;
        case 'fecha_esperada_cosecha':
          aValue = new Date(a.fecha_esperada_cosecha).getTime();
          bValue = new Date(b.fecha_esperada_cosecha).getTime();
          break;
        case 'tipo_microgreen':
          aValue = MICROGREEN_LABELS[a.tipo_microgreen];
          bValue = MICROGREEN_LABELS[b.tipo_microgreen];
          break;
        case 'estado':
          aValue = a.estado;
          bValue = b.estado;
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
  }, [siembras, searchTerm, filterEstado, filterTipo, sortField, sortOrder]);

  // Paginación
  const totalItems = filteredSiembras.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSiembras = filteredSiembras.slice(startIndex, startIndex + pageSize);

  // Estadísticas rápidas
  const stats = useMemo(() => {
    const sembradas = siembras.filter(s => s.estado === 'sembrado').length;
    const creciendo = siembras.filter(s => s.estado === 'creciendo').length;
    const listas = siembras.filter(s => s.estado === 'listo').length;
    const cosechadas = siembras.filter(s => s.estado === 'cosechado').length;

    return { sembradas, creciendo, listas, cosechadas };
  }, [siembras]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterEstado('all');
    setFilterTipo('all');
    setSortField('fecha_siembra');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // Tipos únicos para el filtro
  const tiposDisponibles = useMemo(() => {
    const tipos = Array.from(new Set(siembras.map(s => s.tipo_microgreen)));
    return tipos.sort();
  }, [siembras]);

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
              <CardTitle className="text-2xl font-bold">Siembras</CardTitle>
              <CardDescription>
                Gestiona tus siembras de microgreens
              </CardDescription>
            </div>
            {onCreateNew && (
              <Button onClick={onCreateNew} className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Siembra
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.sembradas}</div>
              <div className="text-sm text-gray-600">Sembradas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.creciendo}</div>
              <div className="text-sm text-gray-600">Creciendo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.listas}</div>
              <div className="text-sm text-gray-600">Listas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.cosechadas}</div>
              <div className="text-sm text-gray-600">Cosechadas</div>
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

            {/* Filtro por estado */}
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="sembrado">Sembradas</SelectItem>
                <SelectItem value="creciendo">Creciendo</SelectItem>
                <SelectItem value="listo">Listas</SelectItem>
                <SelectItem value="cosechado">Cosechadas</SelectItem>
              </SelectContent>
            </Select>

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
                  <SelectItem value="fecha_siembra-desc">Más recientes</SelectItem>
                  <SelectItem value="fecha_siembra-asc">Más antiguas</SelectItem>
                  <SelectItem value="fecha_esperada_cosecha-asc">Próximas a cosechar</SelectItem>
                  <SelectItem value="tipo_microgreen-asc">Por tipo (A-Z)</SelectItem>
                  <SelectItem value="estado-asc">Por estado</SelectItem>
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
              Mostrando {paginatedSiembras.length} de {totalItems} siembras
            </p>
            {filteredSiembras.length !== siembras.length && (
              <Badge variant="secondary">
                <Filter className="mr-1 h-3 w-3" />
                Filtros aplicados
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de siembras */}
      {paginatedSiembras.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Sprout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterEstado !== 'all' || filterTipo !== 'all'
                  ? 'No se encontraron siembras'
                  : 'No hay siembras registradas'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterEstado !== 'all' || filterTipo !== 'all'
                  ? 'Prueba ajustando los filtros de búsqueda'
                  : 'Comienza registrando tu primera siembra'
                }
              </p>
              {onCreateNew && (
                <Button onClick={onCreateNew} className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Siembra
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedSiembras.map((siembra) => (
            <SiembraCard
              key={siembra.id}
              siembra={siembra}
              onEdit={onEdit}
              onView={onView}
              onHarvest={onHarvest}
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