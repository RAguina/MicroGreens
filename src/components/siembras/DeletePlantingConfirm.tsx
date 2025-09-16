'use client';

import { useState } from 'react';
import { Planting, plantingsAPI } from '@/lib/plantings';

interface DeletePlantingConfirmProps {
  planting: Planting;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DeletePlantingConfirm({ planting, onSuccess, onCancel }: DeletePlantingConfirmProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await plantingsAPI.deletePlanting(planting.id);
      onSuccess();
    } catch (err) {
      console.error('Error deleting planting:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la siembra';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Confirmar Eliminación</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-xl"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            ¿Estás seguro de que quieres eliminar esta siembra?
          </p>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              {planting.plantName || 'Sin nombre'}
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Fecha de siembra:</strong> {formatDate(planting.datePlanted)}</p>
              <p><strong>Estado:</strong> {planting.status}</p>
              {planting.trayNumber && (
                <p><strong>Bandeja:</strong> {planting.trayNumber}</p>
              )}
            </div>
          </div>

          <p className="text-red-600 text-sm mt-4">
            ⚠️ Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}