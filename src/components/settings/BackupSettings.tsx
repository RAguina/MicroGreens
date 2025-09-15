'use client';

import { useState, useRef } from 'react';
import { BackupService, BackupStats } from '@/lib/backup';
import { useNotify } from '@/contexts/NotificationContext';

export default function BackupSettings() {
  const notify = useNotify();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<BackupStats | null>(null);

  // Load stats on component mount
  useState(() => {
    loadStats();
  });

  const loadStats = async () => {
    try {
      const currentStats = await BackupService.getBackupStats();
      setStats(currentStats);
    } catch (error) {
      console.error('Error loading backup stats:', error);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      const backupStats = await BackupService.downloadBackup();

      notify.success(
        '📦 Respaldo Creado',
        `Respaldo descargado exitosamente (${backupStats.dataSize}) con ${backupStats.totalPlantings} siembras y ${backupStats.totalReports} reportes.`,
        {
          duration: 8000,
          action: {
            label: 'Ver Archivos',
            onClick: () => {
              // Open downloads folder (this will vary by browser)
              window.open('file:///downloads', '_blank');
            }
          }
        }
      );

      // Update stats
      await loadStats();
    } catch (error) {
      notify.error(
        'Error en Respaldo',
        error instanceof Error ? error.message : 'Error al crear el respaldo'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);

      // Validate file type
      if (!file.name.endsWith('.json')) {
        throw new Error('Solo se permiten archivos JSON');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('El archivo es demasiado grande (máximo 10MB)');
      }

      await BackupService.restoreBackup(file);

      notify.success(
        '✅ Respaldo Restaurado',
        'Tus datos han sido restaurados exitosamente. La página se recargará para aplicar los cambios.',
        {
          duration: 5000
        }
      );

      // Reload page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      notify.error(
        'Error en Restauración',
        error instanceof Error ? error.message : 'Error al restaurar el respaldo'
      );
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearData = () => {
    BackupService.clearAllData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Respaldo de Información
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Crea respaldos de seguridad de todos tus datos y configuraciones.
        </p>
      </div>

      {/* Current Data Stats */}
      {stats && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            📊 Datos Actuales
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 dark:text-blue-300">Siembras:</span>
              <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">
                {stats.totalPlantings}
              </span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Reportes:</span>
              <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">
                {stats.totalReports}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-blue-700 dark:text-blue-300">Tamaño estimado:</span>
              <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">
                {stats.dataSize}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Backup Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Create Backup */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">💾</div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Crear Respaldo
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Descarga un archivo con todos tus datos
              </p>
              <button
                onClick={handleCreateBackup}
                disabled={loading}
                className="
                  w-full px-4 py-2 text-sm bg-green-600 text-white rounded-lg
                  hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                {loading ? 'Creando...' : 'Descargar Respaldo'}
              </button>
            </div>
          </div>
        </div>

        {/* Restore Backup */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">📤</div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Restaurar Respaldo
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Cargar datos desde un archivo de respaldo
              </p>
              <button
                onClick={handleRestoreBackup}
                disabled={loading}
                className="
                  w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-lg
                  hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                {loading ? 'Procesando...' : 'Seleccionar Archivo'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="border-t pt-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
          Opciones Avanzadas
        </h4>
        <div className="space-y-3">
          <button
            onClick={handleClearData}
            className="
              w-full text-left p-3 border border-red-200 dark:border-red-800
              text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20
              transition-colors text-sm
            "
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">🗑️</span>
              <div>
                <div className="font-medium">Limpiar Todos los Datos</div>
                <div className="text-xs opacity-75">
                  Elimina todas las configuraciones locales (irreversible)
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          💡 Recomendaciones
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Crea respaldos regulares, especialmente antes de cambios importantes</li>
          <li>• Guarda los archivos de respaldo en un lugar seguro</li>
          <li>• Los respaldos incluyen: siembras, reportes, configuraciones y preferencias</li>
          <li>• La restauración sobrescribirá tus datos actuales</li>
        </ul>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}