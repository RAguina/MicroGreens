'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlantingFormData, plantingsAPI } from '@/lib/plantings';
import { toLocalDateString, getTodayLocalString, normalizeDate } from '@/utils/dateUtils';
import { useNotify } from '@/contexts/NotificationContext';
import { getSubstrateHistory, getLastSubstrate, saveSubstrate } from '@/utils/substrateUtils';

interface CreatePlantingFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialDate?: Date | null;
}

export default function CreatePlantingForm({ onSuccess, onCancel, initialDate }: CreatePlantingFormProps) {
  const notify = useNotify();
  const router = useRouter();
  const [formData, setFormData] = useState<PlantingFormData>({
    plantName: '',
    datePlanted: initialDate ? toLocalDateString(initialDate) : getTodayLocalString(), // Today's date or selected date
    expectedHarvest: '',
    domeDate: '',
    lightDate: '',
    quantity: undefined,
    status: 'PLANTED',
    trayNumber: '',
    notes: '',
    substrate: '',
    irrigationMl: undefined,
    soakingHours: undefined
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [substrateHistory, setSubstrateHistory] = useState<string[]>([]);
  const [showSubstrateDropdown, setShowSubstrateDropdown] = useState(false);

  useEffect(() => {
    // Load substrate history and set default
    const history = getSubstrateHistory();
    const lastSubstrate = getLastSubstrate();

    setSubstrateHistory(history);
    if (lastSubstrate) {
      setFormData(prev => ({ ...prev, substrate: lastSubstrate }));
    }
  }, []);

  useEffect(() => {
    // Close substrate dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.substrate-dropdown')) {
        setShowSubstrateDropdown(false);
      }
    };

    if (showSubstrateDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSubstrateDropdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Save substrate to history if provided
      if (formData.substrate?.trim()) {
        saveSubstrate(formData.substrate.trim());
      }

      // Clean up form data - remove empty strings and normalize dates
      const cleanData: PlantingFormData = {
        ...formData,
        datePlanted: normalizeDate(formData.datePlanted),
        expectedHarvest: formData.expectedHarvest ? normalizeDate(formData.expectedHarvest) : undefined,
        domeDate: formData.domeDate ? normalizeDate(formData.domeDate) : undefined,
        lightDate: formData.lightDate ? normalizeDate(formData.lightDate) : undefined,
        quantity: formData.quantity || undefined,
        trayNumber: formData.trayNumber || undefined,
        notes: formData.notes || undefined,
        substrate: formData.substrate?.trim() || undefined,
        irrigationMl: formData.irrigationMl || undefined,
        soakingHours: formData.soakingHours || undefined,
      };

      await plantingsAPI.createPlanting(cleanData);

      notify.success(
        '🌱 Nueva Siembra Creada',
        `${formData.plantName || 'Nueva planta'} ha sido plantada exitosamente`,
        {
          action: {
            label: 'Ver Siembras',
            onClick: () => {
              router.push('/siembras');
            }
          }
        }
      );

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la siembra');
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

  const handleSubstrateChange = (value: string) => {
    setFormData(prev => ({ ...prev, substrate: value }));
    setShowSubstrateDropdown(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nueva Siembra</h2>
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
                Densidad (gramos)
              </label>
              <input
                type="number"
                value={formData.quantity || ''}
                onChange={(e) => handleChange('quantity', e.target.value ? parseInt(e.target.value) : undefined)}
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

          {/* New Fields Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Características Adicionales (Opcional)</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Substrate */}
              <div className="relative substrate-dropdown">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sustrato
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.substrate || ''}
                    onChange={(e) => handleChange('substrate', e.target.value)}
                    onFocus={() => setShowSubstrateDropdown(true)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="ej. Zeolita, Turba + Perlita, Compost"
                  />
                  {showSubstrateDropdown && substrateHistory.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {substrateHistory.map((substrate, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSubstrateChange(substrate)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                        >
                          {substrate}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Irrigation ML */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Riego (ML)
                </label>
                <input
                  type="number"
                  value={formData.irrigationMl || ''}
                  onChange={(e) => handleChange('irrigationMl', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Soaking Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remojo (horas)
                </label>
                <input
                  type="number"
                  value={formData.soakingHours || ''}
                  onChange={(e) => handleChange('soakingHours', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>
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
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Siembra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}