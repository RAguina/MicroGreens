'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Sprout, 
  Scissors, 
  Scale,
  Target,
  Calendar,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useSiembras } from '@/hooks/useSiembras';
import { useCosechas } from '@/hooks/useCosechas';
import { MICROGREEN_LABELS } from '@/lib/constants';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function EstadisticasPage() {
  const { 
    siembras, 
    getStats: getSiembrasStats, 
    isLoading: siembrasLoading,
    isConnected: siembrasConnected,
    error: siembrasError
  } = useSiembras();
  
  const { 
    cosechas, 
    getStats: getCosechasStats, 
    getStatsByType,
    getRecentCosechas,
    isLoading: cosechasLoading,
    isConnected: cosechasConnected,
    error: cosechasError
  } = useCosechas();

  const [selectedPeriod, setSelectedPeriod] = useState('mes'); // 'semana', 'mes', 'trimestre'

  const siembrasStats = getSiembrasStats();
  const cosechasStats = getCosechasStats();
  const statsByType = getStatsByType(siembras);
  const recentCosechas = getRecentCosechas(5);

  const isConnected = siembrasConnected && cosechasConnected;
  const isLoading = siembrasLoading || cosechasLoading;
  const hasError = siembrasError || cosechasError;

  // Calcular métricas de rendimiento
  const calcularRendimiento = () => {
    const totalSiembras = siembrasStats.total;
    const totalCosechas = cosechasStats.total;
    const tasaExito = totalSiembras > 0 ? Math.round((totalCosechas / totalSiembras) * 100) : 0;
    
    return {
      tasaExito,
      totalSiembras,
      totalCosechas,
      pesoPromedioPorCosecha: totalCosechas > 0 ? Math.round((cosechasStats.pesoTotal / totalCosechas) * 10) / 10 : 0,
    };
  };

  const rendimiento = calcularRendimiento();

  // Calcular tendencias (simulado)
  const calcularTendencias = () => {
    const cosechasRecientes = recentCosechas.slice(0, 3);
    const cosechasAnteriores = recentCosechas.slice(3, 6);
    
    const pesoReciente = cosechasRecientes.reduce((sum, c) => sum + c.peso_cosechado, 0);
    const pesoAnterior = cosechasAnteriores.reduce((sum, c) => sum + c.peso_cosechado, 0);
    
    const cambio = pesoAnterior > 0 ? ((pesoReciente - pesoAnterior) / pesoAnterior) * 100 : 0;
    
    return {
      cambio: Math.round(cambio * 10) / 10,
      esMejor: cambio > 0,
    };
  };

  const tendencias = calcularTendencias();

  const statsCards = [
    {
      title: 'Tasa de Éxito',
      value: `${rendimiento.tasaExito}%`,
      description: 'Siembras completadas exitosamente',
      icon: Target,
      color: rendimiento.tasaExito >= 80 ? 'text-green-600' : rendimiento.tasaExito >= 60 ? 'text-yellow-600' : 'text-red-600',
      bgColor: rendimiento.tasaExito >= 80 ? 'bg-green-100' : rendimiento.tasaExito >= 60 ? 'bg-yellow-100' : 'bg-red-100',
    },
    {
      title: 'Rendimiento Promedio',
      value: `${rendimiento.pesoPromedioPorCosecha}g`,
      description: 'Por cosecha',
      icon: Scale,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Calidad Promedio',
      value: `${cosechasStats.calidadPromedio}/5`,
      description: 'Estrellas promedio',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Tendencia',
      value: `${tendencias.cambio >= 0 ? '+' : ''}${tendencias.cambio}%`,
      description: 'Últimas cosechas vs anteriores',
      icon: tendencias.esMejor ? TrendingUp : TrendingDown,
      color: tendencias.esMejor ? 'text-green-600' : 'text-red-600',
      bgColor: tendencias.esMejor ? 'bg-green-100' : 'bg-red-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estadísticas</h1>
          <p className="text-gray-600 mt-2">
            Análisis detallado de tu producción de microgreens
          </p>
        </div>
        <div className="flex space-x-2">
          {['semana', 'mes', 'trimestre'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="capitalize"
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Indicador de conexión */}
      {isConnected !== null && (
        <Alert className={isConnected ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-orange-600" />
            )}
            <AlertDescription className={isConnected ? 'text-green-700' : 'text-orange-700'}>
              {isConnected 
                ? 'Estadísticas en tiempo real desde la API' 
                : 'Modo offline - Estadísticas desde datos locales'
              }
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Mostrar error si existe */}
      {hasError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            {siembrasError || cosechasError}
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rendimiento por Tipo */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Rendimiento por Tipo</CardTitle>
            <CardDescription>
              Comparación de diferentes microgreens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statsByType.length > 0 ? (
                statsByType.map((stat) => (
                  <div key={stat.tipo} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {MICROGREEN_LABELS[stat.tipo] || stat.tipo}
                        </span>
                        <Badge variant="secondary">
                          {stat.totalCosechas} cosechas
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>Promedio: {stat.pesoPromedio}g</span>
                        <span>Calidad: {stat.calidadPromedio}/5</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No hay datos de cosechas disponibles
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resumen de Actividad */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Resumen de Actividad</CardTitle>
            <CardDescription>
              Estado actual de la producción
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-blue-50">
                  <Sprout className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {siembrasStats.sembradas + siembrasStats.creciendo}
                  </div>
                  <div className="text-sm text-blue-700">Siembras Activas</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50">
                  <Scissors className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {siembrasStats.listas}
                  </div>
                  <div className="text-sm text-green-700">Listas para Cosechar</div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-3">Últimas Cosechas</h4>
                <div className="space-y-2">
                  {recentCosechas.slice(0, 3).map((cosecha) => {
                    const siembraRelacionada = siembras.find(s => s.id === cosecha.siembra_id);
                    return (
                      <div key={cosecha.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {siembraRelacionada ? MICROGREEN_LABELS[siembraRelacionada.tipo_microgreen] : 'Microgreen'}
                        </span>
                        <span className="font-medium">{cosecha.peso_cosechado}g</span>
                      </div>
                    );
                  })}
                  {recentCosechas.length === 0 && (
                    <p className="text-gray-500 text-center py-2">
                      No hay cosechas recientes
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información Adicional */}
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Información del Período</CardTitle>
          <CardDescription>
            Datos del {selectedPeriod} actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {cosechasStats.cosechasEsteMes}
              </div>
              <div className="text-sm text-gray-600">Cosechas este mes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {cosechasStats.pesoEsteMes}g
              </div>
              <div className="text-sm text-gray-600">Peso cosechado este mes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {siembrasStats.total}
              </div>
              <div className="text-sm text-gray-600">Total de siembras</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}