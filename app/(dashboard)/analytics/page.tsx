'use client';

import { useState, useEffect } from 'react';
import { analyticsAPI, AnalyticsMetrics } from '@/lib/analytics';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsAPI.getMetrics();
      console.log('Analytics: Metrics loaded:', data);
      setMetrics(data);
    } catch (err) {
      console.error('Analytics: Error loading metrics:', err);
      setError(err instanceof Error ? err.message : 'Error cargando métricas');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'planted': return '🌱';
      case 'harvested': return '🌾';
      case 'composted': return '♻️';
      default: return '📝';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'planted': return 'Plantado';
      case 'harvested': return 'Cosechado';
      case 'composted': return 'Compostado';
      default: return 'Actualizado';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg text-gray-600">Cargando analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Error:</div>
        <div className="text-red-600">{error}</div>
        <button
          onClick={loadMetrics}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Analytics</h1>
          <p className="text-gray-600">Reportes y estadísticas de tus cultivos</p>
        </div>
        <button
          onClick={loadMetrics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm">🌱</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Siembras</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.totalPlantings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">📈</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">En Crecimiento</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.plantingsByStatus.GROWING + metrics.plantingsByStatus.PLANTED}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-sm">⏱️</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Días Promedio</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.averageDaysToHarvest || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-sm">🎯</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Eficiencia</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.harvestEfficiency.efficiency}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Estado</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{metrics.plantingsByStatus.PLANTED}</div>
            <div className="text-sm text-gray-600">Plantados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.plantingsByStatus.GROWING}</div>
            <div className="text-sm text-gray-600">Creciendo</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.plantingsByStatus.HARVESTED}</div>
            <div className="text-sm text-gray-600">Cosechados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{metrics.plantingsByStatus.COMPOSTED}</div>
            <div className="text-sm text-gray-600">Compostados</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencias Mensuales</h3>
          {metrics.monthlyTrends.length > 0 ? (
            <div className="space-y-3">
              {metrics.monthlyTrends.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900">{month.month}</div>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-green-600">🌱 {month.plantings}</span>
                    <span className="text-blue-600">🌾 {month.harvests}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay datos suficientes para mostrar tendencias
            </div>
          )}
        </div>

        {/* Most Popular Plants */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plantas Más Populares</h3>
          {metrics.mostPopularPlants.length > 0 ? (
            <div className="space-y-3">
              {metrics.mostPopularPlants.map((plant, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{plant.plantName}</div>
                    <div className="text-sm text-gray-600">{plant.count} siembras</div>
                  </div>
                  <div className="text-lg font-bold text-green-600">{plant.percentage}%</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay datos de plantas disponibles
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
        {metrics.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {metrics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">{getActionIcon(activity.action)}</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{activity.plantName}</div>
                  <div className="text-sm text-gray-600">
                    {getActionText(activity.action)} - {formatDate(activity.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay actividad reciente
          </div>
        )}
      </div>

      {/* Action Cards */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => alert('Funcionalidad próximamente disponible')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="text-lg font-medium text-gray-900 mb-1">📅 Reporte Mensual</div>
            <p className="text-sm text-gray-600">Resumen completo del mes</p>
          </button>

          <button
            onClick={() => alert('Funcionalidad próximamente disponible')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="text-lg font-medium text-gray-900 mb-1">📊 Exportar Datos</div>
            <p className="text-sm text-gray-600">Descargar datos en CSV</p>
          </button>

          <button
            onClick={loadMetrics}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="text-lg font-medium text-gray-900 mb-1">🔄 Actualizar</div>
            <p className="text-sm text-gray-600">Recargar métricas</p>
          </button>
        </div>
      </div>
    </div>
  );
}