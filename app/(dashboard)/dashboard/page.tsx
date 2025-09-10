'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sprout, 
  Scissors, 
  TrendingUp, 
  Calendar,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  // Datos mock para el dashboard
  const stats = [
    {
      title: 'Siembras Activas',
      value: '24',
      description: 'Creciendo actualmente',
      icon: Sprout,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Cosechas del Mes',
      value: '18',
      description: 'Total este mes',
      icon: Scissors,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Rendimiento Promedio',
      value: '85g',
      description: 'Por bandeja',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Próximas Cosechas',
      value: '6',
      description: 'En los próximos 3 días',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'siembra',
      description: 'Nueva siembra de brócoli en bandeja A1',
      time: 'Hace 2 horas',
      status: 'sembrado'
    },
    {
      id: 2,
      type: 'cosecha',
      description: 'Cosecha de rábano - 95g obtenidos',
      time: 'Hace 4 horas',
      status: 'cosechado'
    },
    {
      id: 3,
      type: 'siembra',
      description: 'Siembra de girasol lista para cosechar',
      time: 'Hace 6 horas',
      status: 'listo'
    },
  ];

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
          <Button asChild>
            <Link href="/siembras">
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
                <Calendar className="mr-3 h-4 w-4" />
                Ver Siembras Activas
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/estadisticas">
                <TrendingUp className="mr-3 h-4 w-4" />
                Ver Estadísticas
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}