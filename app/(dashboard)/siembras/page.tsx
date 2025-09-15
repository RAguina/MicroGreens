'use client';

import { useState, useEffect } from 'react';
import { plantingsAPI, Planting, PlantingStatus } from '@/lib/plantings';
import CreatePlantingForm from '@/components/siembras/CreatePlantingForm';
import EditPlantingForm from '@/components/siembras/EditPlantingForm';
import DeletePlantingConfirm from '@/components/siembras/DeletePlantingConfirm';

type ViewMode = 'cards' | 'table';

export default function SiembrasPage() {
  // Future: import { useAuth } from '@/contexts/AuthContext'; for user filtering
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlanting, setEditingPlanting] = useState<Planting | null>(null);
  const [deletingPlanting, setDeletingPlanting] = useState<Planting | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  useEffect(() => {
    loadPlantings();
    // Load view preference from localStorage
    const savedViewMode = localStorage.getItem('plantings-view-mode') as ViewMode;
    if (savedViewMode && (savedViewMode === 'cards' || savedViewMode === 'table')) {
      setViewMode(savedViewMode);
    }
  }, []);

  const loadPlantings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await plantingsAPI.getPlantings();
      setPlantings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando siembras');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: PlantingStatus) => {
    switch (status) {
      case 'PLANTED': return 'bg-yellow-100 text-yellow-800';
      case 'GROWING': return 'bg-blue-100 text-blue-800';
      case 'HARVESTED': return 'bg-green-100 text-green-800';
      case 'COMPOSTED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: PlantingStatus) => {
    switch (status) {
      case 'PLANTED': return 'Plantado';
      case 'GROWING': return 'Creciendo';
      case 'HARVESTED': return 'Cosechado';
      case 'COMPOSTED': return 'Compostado';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getDaysFromPlanting = (datePlanted: string) => {
    const planted = new Date(datePlanted);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - planted.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleViewModeChange = (newViewMode: ViewMode) => {
    setViewMode(newViewMode);
    localStorage.setItem('plantings-view-mode', newViewMode);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg text-gray-600">Cargando siembras...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🌱 Siembras</h1>
          <p className="text-gray-600">Gestiona tus cultivos de microverdes</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('cards')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Cards
            </button>
            <button
              onClick={() => handleViewModeChange('table')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Tabla
            </button>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            + Nueva Siembra
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 font-medium">Error:</div>
          <div className="text-red-600">{error}</div>
          <button
            onClick={loadPlantings}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Siembras Activas ({plantings.length})
              </h2>
            </div>
            <div className="p-6">
              {plantings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🌱</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay siembras registradas</h3>
                  <p className="text-gray-600 mb-4">Comienza registrando tu primera siembra</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    + Nueva Siembra
                  </button>
                </div>
              ) : viewMode === 'cards' ? (
                <div className="space-y-4">
                  {plantings.map((planting) => (
                    <div key={planting.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-gray-900">
                              {planting.plantName || 'Sin nombre'}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(planting.status)}`}>
                              {getStatusText(planting.status)}
                            </span>
                          </div>
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Fecha siembra:</span>
                              <br />
                              {formatDate(planting.datePlanted)}
                            </div>
                            <div>
                              <span className="font-medium">Días transcurridos:</span>
                              <br />
                              {getDaysFromPlanting(planting.datePlanted)} días
                            </div>
                            <div>
                              <span className="font-medium">Bandeja:</span>
                              <br />
                              {planting.trayNumber || 'No asignada'}
                            </div>
                            <div>
                              <span className="font-medium">Cantidad:</span>
                              <br />
                              {planting.quantity || 'No especificada'}
                            </div>
                          </div>
                          {planting.notes && (
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">Notas:</span> {planting.notes}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingPlanting(planting)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setDeletingPlanting(planting)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Planta
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha Siembra
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Días
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bandeja
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {plantings.map((planting) => (
                        <tr key={planting.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {planting.plantName || 'Sin nombre'}
                            </div>
                            {planting.notes && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {planting.notes}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(planting.status)}`}>
                              {getStatusText(planting.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(planting.datePlanted)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getDaysFromPlanting(planting.datePlanted)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {planting.trayNumber || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {planting.quantity || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingPlanting(planting)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => setDeletingPlanting(planting)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total siembras:</span>
                <span className="font-medium">{plantings.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cosechadas:</span>
                <span className="font-medium text-green-600">
                  {plantings.filter(p => p.status === 'HARVESTED').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">En crecimiento:</span>
                <span className="font-medium text-blue-600">
                  {plantings.filter(p => p.status === 'GROWING').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plantadas:</span>
                <span className="font-medium text-yellow-600">
                  {plantings.filter(p => p.status === 'PLANTED').length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-2">
              <button
                onClick={() => window.location.href = '/calendario'}
                className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm"
              >
                📊 Ver calendario de siembras
              </button>
              <button
                onClick={() => alert('Funcionalidad próximamente disponible')}
                className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm"
              >
                🌱 Registrar nueva variedad
              </button>
              <button
                onClick={() => alert('Funcionalidad próximamente disponible')}
                className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm"
              >
                📋 Exportar reporte
              </button>
              <button
                onClick={loadPlantings}
                className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm"
              >
                🔄 Recargar datos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Planting Form Modal */}
      {showCreateForm && (
        <CreatePlantingForm
          onSuccess={() => {
            setShowCreateForm(false);
            loadPlantings(); // Reload the list
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Edit Planting Form Modal */}
      {editingPlanting && (
        <EditPlantingForm
          planting={editingPlanting}
          onSuccess={() => {
            setEditingPlanting(null);
            loadPlantings(); // Reload the list
          }}
          onCancel={() => setEditingPlanting(null)}
        />
      )}

      {/* Delete Planting Confirmation Modal */}
      {deletingPlanting && (
        <DeletePlantingConfirm
          planting={deletingPlanting}
          onSuccess={() => {
            setDeletingPlanting(null);
            loadPlantings(); // Reload the list
          }}
          onCancel={() => setDeletingPlanting(null)}
        />
      )}
    </div>
  );
}