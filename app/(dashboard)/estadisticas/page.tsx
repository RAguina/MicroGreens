'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Sprout, Scissors, Scale } from 'lucide-react';
import { usePlantings } from '@/hooks/usePlantings';
import { useHarvests } from '@/hooks/useHarvests';

export default function EstadisticasPage() {
  const { plantings, getStats: getPlantingsStats, isLoading: plantingsLoading } = usePlantings();
  const { harvests, getStats: getHarvestsStats, isLoading: harvestsLoading } = useHarvests();

  const plantingsStats = getPlantingsStats();
  const harvestsStats = getHarvestsStats();

  const isLoading = plantingsLoading || harvestsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Estadísticas</h1>
        <p className="text-gray-600">Análisis y métricas de tus cultivos</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siembras</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plantingsStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {plantingsStats.growing} creciendo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cosechas</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{harvestsStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {harvestsStats.thisMonth.count} este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso Total</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{harvestsStats.totalWeight}g</div>
            <p className="text-xs text-muted-foreground">
              {harvestsStats.thisMonth.weight}g este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{harvestsStats.averageWeight}g</div>
            <p className="text-xs text-muted-foreground">
              por cosecha
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Siembras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Plantado</span>
                <span className="font-medium">{plantingsStats.planted}</span>
              </div>
              <div className="flex justify-between">
                <span>Germinando</span>
                <span className="font-medium">{plantingsStats.germinating}</span>
              </div>
              <div className="flex justify-between">
                <span>Creciendo</span>
                <span className="font-medium">{plantingsStats.growing}</span>
              </div>
              <div className="flex justify-between">
                <span>Listo</span>
                <span className="font-medium">{plantingsStats.readyToHarvest}</span>
              </div>
              <div className="flex justify-between">
                <span>Cosechado</span>
                <span className="font-medium">{plantingsStats.harvested}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen de Calidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Excelente</span>
                <span className="font-medium">{harvestsStats.qualityDistribution.excellent}</span>
              </div>
              <div className="flex justify-between">
                <span>Buena</span>
                <span className="font-medium">{harvestsStats.qualityDistribution.good}</span>
              </div>
              <div className="flex justify-between">
                <span>Regular</span>
                <span className="font-medium">{harvestsStats.qualityDistribution.fair}</span>
              </div>
              <div className="flex justify-between">
                <span>Mala</span>
                <span className="font-medium">{harvestsStats.qualityDistribution.poor}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}