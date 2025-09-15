'use client';

import { useState } from 'react';
import { Planting, PlantingFormData, plantingsAPI } from '@/lib/plantings';

interface EditPlantingFormProps {
  planting: Planting;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditPlantingForm({ planting, onSuccess, onCancel }: EditPlantingFormProps) {
  const [formData, setFormData] = useState<PlantingFormData>({
    plantName: planting.plantName || '',
    datePlanted: planting.datePlanted.split('T')[0], // Convert to date string
    expectedHarvest: planting.expectedHarvest ? planting.expectedHarvest.split('T')[0] : '',
    domeDate: planting.domeDate ? planting.domeDate.split('T')[0] : '',
    lightDate: planting.lightDate ? planting.lightDate.split('T')[0] : '',
    quantity: planting.quantity || undefined,
    status: planting.status,
    trayNumber: planting.trayNumber || '',
    notes: planting.notes || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clean up form data - remove empty strings
      const cleanData: Partial<PlantingFormData> = {
        ...formData,
        expectedHarvest: formData.expectedHarvest || undefined,
        domeDate: formData.domeDate || undefined,
        lightDate: formData.lightDate || undefined,
        quantity: formData.quantity || undefined,
        trayNumber: formData.trayNumber || undefined,
        notes: formData.notes || undefined,
      };

      console.log('Updating planting with data:', cleanData);
      await plantingsAPI.updatePlanting(planting.id, cleanData);
      console.log('Planting updated successfully');
      onSuccess();
    } catch (err) {
      console.error('Error updating planting:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar la siembra');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof PlantingFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Editar Siembra</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Plant Name - Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Planta *
            </label>
            <input
              type="text"
              value={formData.plantName}
              onChange={(e) => handleChange('plantName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="ej. Rúcula, Brócoli, Radichio"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Planted - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Siembra *
              </label>
              <input
                type="date"
                value={formData.datePlanted}
                onChange={(e) => handleChange('datePlanted', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Expected Harvest */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cosecha Esperada
              </label>
              <input
                type="date"
                value={formData.expectedHarvest}
                onChange={(e) => handleChange('expectedHarvest', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dome Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Cúpula
              </label>
              <input
                type="date"
                value={formData.domeDate}
                onChange={(e) => handleChange('domeDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Light Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Luz
              </label>
              <input
                type="date"
                value={formData.lightDate}
                onChange={(e) => handleChange('lightDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad (gramos/semillas)
              </label>
              <input
                type="number"
                value={formData.quantity || ''}
                onChange={(e) => handleChange('quantity', e.target.value ? parseInt(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
                min="0"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="PLANTED">Plantado</option>
                <option value="GROWING">Creciendo</option>
                <option value="HARVESTED">Cosechado</option>
                <option value="COMPOSTED">Compostado</option>
              </select>
            </div>

            {/* Tray Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Bandeja
              </label>
              <input
                type="text"
                value={formData.trayNumber}
                onChange={(e) => handleChange('trayNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="ej. A1, B2, C3"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Observaciones, condiciones especiales, etc."
            />
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}