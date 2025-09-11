'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sprout, 
  Scissors, 
  TrendingUp, 
  Calendar,
  Plus,
  Scale,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlantings } from '@/hooks/usePlantings';
import { useHarvests } from '@/hooks/useHarvests';
import { STATUS_LABELS, STATUS_COLORS, QUALITY_LABELS } from '@/lib/constants';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardPage() {
  // Usar hooks v2.0 para datos reales de la API
  const { plantings, getStats: getPlantingsStats, getUpcomingHarvests } = usePlantings();
  const { harvests, getStats: getHarvestsStats } = useHarvests();
  
  const [dashboardData, setDashboardData] = useState({
    plantingsStats: { planted: 0, growing: 0, readyToHarvest: 0, harvested: 0 },
    harvestsStats: { total: 0, totalWeight: 0, thisMonth: { count: 0 }, averageQuality: 0 },
    proximasCosechas: []
  });

  // Actualizar datos del dashboard cuando cambien siembras o cosechas
  useEffect(() => {
    const siembrasStats = getSiembrasStats();
    const cosechasStats = getCosechasStats();
    const proximasCosechas = getUpcomingHarvests(3);

    setDashboardData({
      siembrasStats,
      cosechasStats,
      proximasCosechas
    });
  }, [siembras, cosechas, getSiembrasStats, getCosechasStats, getUpcomingHarvests]);

  const stats = [
    {
      title: 'Siembras Activas',
      value: (dashboardData.siembrasStats.sembradas + dashboardData.siembrasStats.creciendo).toString(),
      description: 'Sembradas + Creciendo',
      icon: Sprout,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Cosechas del Mes',
      value: dashboardData.cosechasStats.cosechasEsteMes.toString(),
      description: 'Total este mes',
      icon: Scissors,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Peso Total Cosechado',
      value: `${dashboardData.cosechasStats.pesoTotal}g`,
      description: 'Todas las cosechas',
      icon: Scale,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Próximas Cosechas',
      value: dashboardData.proximasCosechas.length.toString(),
      description: 'En los próximos 3 días',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  // Generar actividad reciente real basada en datos
  const getRecentActivity = () => {
    const activities = [];

    // Agregar siembras recientes (últimas 3)
    const siembrasRecientes = [...siembras]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2);

    siembrasRecientes.forEach((siembra, index) => {
      activities.push({
        id: `siembra-${siembra.id}`,
        type: 'siembra',
        description: `Nueva siembra de ${MICROGREEN_LABELS[siembra.tipo_microgreen]} en bandeja ${siembra.ubicacion_bandeja}`,
        time: format(new Date(siembra.created_at), "dd/MM/yyyy 'a las' HH:mm", { locale: es }),
        status: siembra.estado
      });
    });

    // Agregar cosechas recientes (últimas 2)
    const cosechasRecientes = [...cosechas]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2);

    cosechasRecientes.forEach(cosecha => {
      const siembraRelacionada = siembras.find(s => s.id === cosecha.siembra_id);
      const tipoMicrogreen = siembraRelacionada ? MICROGREEN_LABELS[siembraRelacionada.tipo_microgreen] : 'microgreen';
      
      activities.push({
        id: `cosecha-${cosecha.id}`,
        type: 'cosecha',
        description: `Cosecha de ${tipoMicrogreen} - ${cosecha.peso_cosechado}g obtenidos`,
        time: format(new Date(cosecha.created_at), "dd/MM/yyyy 'a las' HH:mm", { locale: es }),
        status: 'cosechado'
      });
    });

    // Ordenar por fecha más reciente y limitar a 4
    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 4);
  };

  const recentActivity = getRecentActivity();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sembrado': return 'bg-status-sembrado';
      case 'creciendo': return 'bg-status-creciendo';
      case 'listo': return 'bg-status-listo';
      case 'cosechado': return 'bg-status-cosechado';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sembrado': return 'Sembrado';
      case 'creciendo': return 'Creciendo';
      case 'listo': return 'Listo';
      case 'cosechado': return 'Cosechado';
      default: return status;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Resumen general de tu producción de microgreens
          </p>
        </div>
        <div className="flex space-x-3">
          <Button asChild variant="outline">
            <Link href="/cosechas/nueva">
              <Scissors className="mr-2 h-4 w-4" />
              Nueva Cosecha
            </Link>
          </Button>
          <Button asChild>
            <Link href="/siembras/nueva">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Siembra
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
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
        {/* Actividad Reciente */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
            <CardDescription>
              Últimos eventos en tu sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                  <Badge 
                    className={`${getStatusColor(activity.status)} text-white`}
                  >
                    {getStatusLabel(activity.status)}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                Ver todo el historial
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Acciones Rápidas */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
            <CardDescription>
              Operaciones más comunes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/siembras/nueva">
                <Sprout className="mr-3 h-4 w-4" />
                Registrar Nueva Siembra
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/cosechas/nueva">
                <Scissors className="mr-3 h-4 w-4" />
                Registrar Cosecha
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/siembras">
                <Sprout className="mr-3 h-4 w-4 text-blue-600" />
                Ver Siembras
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/cosechas">
                <Scale className="mr-3 h-4 w-4 text-green-600" />
                Ver Cosechas
              </Link>
            </Button>
            {dashboardData.proximasCosechas.length > 0 && (
              <Button asChild className="w-full justify-start bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100">
                <Link href="/siembras">
                  <Calendar className="mr-3 h-4 w-4" />
                  {dashboardData.proximasCosechas.length} Próximas Cosechas
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}