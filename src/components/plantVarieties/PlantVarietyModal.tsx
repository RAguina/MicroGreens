'use client';

import { useState } from 'react';
import { PlantVarietyFormData, PlantCategory, DifficultyLevel } from '@/types/plantVarieties';
import { PlantVarietiesService } from '@/lib/plantVarieties';
import { useNotify } from '@/contexts/NotificationContext';

interface PlantVarietyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PlantVarietyModal({ isOpen, onClose, onSuccess }: PlantVarietyModalProps) {
  const notify = useNotify();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<PlantVarietyFormData>({
    name: '',
    category: 'brassicas',
    description: '',
    growthDays: 7,
    domeDays: 3,
    lightDays: 4,
    difficulty: 'easy',
    color: '',
    height: '',
    texture: '',
    flavor: '',
    appearance: '',
    vitamins: '',
    minerals: '',
    benefits: '',
    soakingTime: 0,
    density: '',
    germination: '',
    seedStorage: '',
    harvestIndicators: '',
    harvestMethod: '',
    harvestStorage: '',
    shelfLife: '',
    growingTips: '',
    tags: ''
  });

  const handleChange = (field: keyof PlantVarietyFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Validations
      if (!formData.name.trim()) {
        notify.error('Campo Requerido', 'El nombre de la variedad es obligatorio');
        return;
      }

      if (!formData.description.trim()) {
        notify.error('Campo Requerido', 'La descripción es obligatoria');
        return;
      }

      if (formData.growthDays < 1 || formData.growthDays > 30) {
        notify.error('Valor Inválido', 'Los días de crecimiento deben estar entre 1 y 30');
        return;
      }

      // Check if variety name already exists
      const existingVarieties = PlantVarietiesService.getAllVarieties();
      const nameExists = existingVarieties.some(variety =>
        variety.name.toLowerCase() === formData.name.toLowerCase()
      );

      if (nameExists) {
        notify.error('Nombre Duplicado', 'Ya existe una variedad con este nombre');
        return;
      }

      // Create variety
      const newVariety = PlantVarietiesService.createCustomVariety(formData);

      notify.success(
        '🌱 Variedad Creada',
        `${newVariety.name} ha sido registrada exitosamente`,
        {
          action: {
            label: 'Ver Variedades',
            onClick: () => {
              window.location.href = '/siembras?view=varieties';
            }
          }
        }
      );

      // Reset form
      resetForm();
      onSuccess?.();
      onClose();

    } catch (error) {
      notify.error(
        'Error al Crear Variedad',
        error instanceof Error ? error.message : 'Error desconocido'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'brassicas',
      description: '',
      growthDays: 7,
      domeDays: 3,
      lightDays: 4,
      difficulty: 'easy',
      color: '',
      height: '',
      texture: '',
      flavor: '',
      appearance: '',
      vitamins: '',
      minerals: '',
      benefits: '',
      soakingTime: 0,
      density: '',
      germination: '',
      seedStorage: '',
      harvestIndicators: '',
      harvestMethod: '',
      harvestStorage: '',
      shelfLife: '',
      growingTips: '',
      tags: ''
    });
    setCurrentStep(1);
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
              🌱 Registrar Nueva Variedad
            </h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl disabled:opacity-50"
            >
              ×
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step <= currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }
                `}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`
                    w-16 h-1 mx-2
                    ${step < currentStep ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'}
                  `} />
                )}
              </div>
            ))}
          </div>

          {/* Step Labels */}
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-4">
            <span>Información Básica</span>
            <span>Características</span>
            <span>Cultivo</span>
            <span>Cosecha</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Información Básica
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre de la Variedad *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="ej: Rúcula Silvestre"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoría *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value as PlantCategory)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                >
                  {PlantVarietiesService.getCategoryOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe las características principales, sabor, usos..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dificultad de Cultivo
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleChange('difficulty', e.target.value as DifficultyLevel)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                >
                  {PlantVarietiesService.getDifficultyOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Characteristics */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Características Físicas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    placeholder="ej: Verde oscuro"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Altura
                  </label>
                  <input
                    type="text"
                    value={formData.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                    placeholder="ej: 2-4 cm"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Textura
                  </label>
                  <input
                    type="text"
                    value={formData.texture}
                    onChange={(e) => handleChange('texture', e.target.value)}
                    placeholder="ej: Crujiente, tierna"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sabor
                  </label>
                  <input
                    type="text"
                    value={formData.flavor}
                    onChange={(e) => handleChange('flavor', e.target.value)}
                    placeholder="ej: Picante, dulce"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Apariencia
                </label>
                <input
                  type="text"
                  value={formData.appearance}
                  onChange={(e) => handleChange('appearance', e.target.value)}
                  placeholder="ej: Hojas pequeñas redondeadas"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Información Nutricional
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={formData.vitamins}
                    onChange={(e) => handleChange('vitamins', e.target.value)}
                    placeholder="Vitaminas (separadas por coma)"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    value={formData.minerals}
                    onChange={(e) => handleChange('minerals', e.target.value)}
                    placeholder="Minerales (separados por coma)"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    value={formData.benefits}
                    onChange={(e) => handleChange('benefits', e.target.value)}
                    placeholder="Beneficios (separados por coma)"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Growing Information */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Información de Cultivo
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Días hasta cosecha *
                  </label>
                  <input
                    type="number"
                    value={formData.growthDays}
                    onChange={(e) => handleChange('growthDays', parseInt(e.target.value) || 0)}
                    min={1}
                    max={30}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Días bajo cúpula
                  </label>
                  <input
                    type="number"
                    value={formData.domeDays || ''}
                    onChange={(e) => handleChange('domeDays', e.target.value ? parseInt(e.target.value) : 0)}
                    min={0}
                    max={10}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Días bajo luz
                  </label>
                  <input
                    type="number"
                    value={formData.lightDays || ''}
                    onChange={(e) => handleChange('lightDays', e.target.value ? parseInt(e.target.value) : 0)}
                    min={0}
                    max={20}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tiempo de remojo (horas)
                  </label>
                  <input
                    type="number"
                    value={formData.soakingTime || ''}
                    onChange={(e) => handleChange('soakingTime', e.target.value ? parseInt(e.target.value) : 0)}
                    min={0}
                    max={48}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tiempo de germinación
                  </label>
                  <input
                    type="text"
                    value={formData.germination}
                    onChange={(e) => handleChange('germination', e.target.value)}
                    placeholder="ej: 1-2 días"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Densidad de siembra
                </label>
                <input
                  type="text"
                  value={formData.density}
                  onChange={(e) => handleChange('density', e.target.value)}
                  placeholder="ej: 2 cucharadas por bandeja 10x20"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Consejos de cultivo
                </label>
                <textarea
                  value={formData.growingTips}
                  onChange={(e) => handleChange('growingTips', e.target.value)}
                  placeholder="Cada línea será un consejo separado..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          )}

          {/* Step 4: Harvest Information */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Información de Cosecha
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Indicadores de cosecha
                </label>
                <textarea
                  value={formData.harvestIndicators}
                  onChange={(e) => handleChange('harvestIndicators', e.target.value)}
                  placeholder="Cada línea será un indicador separado..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Método de cosecha
                  </label>
                  <input
                    type="text"
                    value={formData.harvestMethod}
                    onChange={(e) => handleChange('harvestMethod', e.target.value)}
                    placeholder="ej: Cortar con tijeras limpias"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Vida útil
                  </label>
                  <input
                    type="text"
                    value={formData.shelfLife}
                    onChange={(e) => handleChange('shelfLife', e.target.value)}
                    placeholder="ej: 5-7 días"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Almacenamiento post-cosecha
                </label>
                <input
                  type="text"
                  value={formData.harvestStorage}
                  onChange={(e) => handleChange('harvestStorage', e.target.value)}
                  placeholder="ej: Refrigerador en contenedor hermético"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Almacenamiento de semillas
                </label>
                <input
                  type="text"
                  value={formData.seedStorage}
                  onChange={(e) => handleChange('seedStorage', e.target.value)}
                  placeholder="ej: Lugar fresco y seco, hasta 3 años"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Etiquetas
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  placeholder="ej: fácil, nutritivo, popular (separadas por coma)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between pt-6 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1 || loading}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>

            <div className="space-x-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Guardando...' : 'Crear Variedad'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}