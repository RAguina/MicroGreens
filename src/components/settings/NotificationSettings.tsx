'use client';

import { useNotifications, useNotify } from '@/contexts/NotificationContext';

export default function NotificationSettings() {
  const { settings, updateSettings } = useNotifications();
  const notify = useNotify();

  const handleToggle = (key: keyof typeof settings, value: boolean) => {
    updateSettings({ [key]: value });

    if (key === 'enabled' && value) {
      notify.success(
        'Notificaciones Activadas',
        'Recibirás alertas sobre el estado de tus siembras'
      );
    }
  };

  const handleReminderDaysChange = (days: number) => {
    updateSettings({ reminderDays: days });
    notify.info(
      'Configuración Actualizada',
      `Recibirás recordatorios ${days} día(s) antes de la cosecha`
    );
  };

  const testNotification = () => {
    notify.warning(
      '🌱 Notificación de Prueba',
      'Esta es una notificación de ejemplo para verificar que todo funciona correctamente.',
      {
        action: {
          label: 'Ver Siembras',
          onClick: () => {
            window.location.href = '/siembras';
          }
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Main Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Notificaciones
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Recibir alertas sobre el estado de las siembras
          </p>
        </div>
        <button
          onClick={() => handleToggle('enabled', !settings.enabled)}
          className={`
            px-3 py-1 text-sm rounded transition-colors
            ${settings.enabled
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-400 text-white hover:bg-gray-500'
            }
          `}
        >
          {settings.enabled ? 'Activado' : 'Desactivado'}
        </button>
      </div>

      {/* Detailed Settings - Only show when enabled */}
      {settings.enabled && (
        <div className="space-y-4 pl-4 border-l-2 border-green-200 dark:border-green-700">
          {/* Harvest Reminders */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Recordatorios de Cosecha
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Alertas automáticas para fechas de cosecha próximas
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.harvestReminders}
                onChange={(e) => handleToggle('harvestReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="
                w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4
                peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer
                dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white
                after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white
                after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4
                after:transition-all dark:border-gray-600 peer-checked:bg-green-600
              "></div>
            </label>
          </div>

          {/* Reminder Days Setting */}
          {settings.harvestReminders && (
            <div className="ml-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Días de anticipación para recordatorios
              </label>
              <select
                value={settings.reminderDays}
                onChange={(e) => handleReminderDaysChange(Number(e.target.value))}
                className="
                  block w-full px-3 py-2 text-sm border border-gray-300 rounded-md
                  bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                "
              >
                <option value={1}>1 día antes</option>
                <option value={2}>2 días antes</option>
                <option value={3}>3 días antes</option>
                <option value={5}>5 días antes</option>
                <option value={7}>1 semana antes</option>
              </select>
            </div>
          )}

          {/* Status Updates */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Actualizaciones de Estado
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Notificaciones cuando cambias el estado de las plantas
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.statusUpdates}
                onChange={(e) => handleToggle('statusUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="
                w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4
                peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer
                dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white
                after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white
                after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4
                after:transition-all dark:border-gray-600 peer-checked:bg-green-600
              "></div>
            </label>
          </div>

          {/* System Alerts */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Alertas del Sistema
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Notificaciones importantes del sistema y errores
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.systemAlerts}
                onChange={(e) => handleToggle('systemAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="
                w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4
                peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer
                dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white
                after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white
                after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4
                after:transition-all dark:border-gray-600 peer-checked:bg-green-600
              "></div>
            </label>
          </div>

          {/* Test Notification Button */}
          <div className="pt-4">
            <button
              onClick={testNotification}
              className="
                px-4 py-2 text-sm bg-blue-600 text-white rounded-lg
                hover:bg-blue-700 transition-colors
              "
            >
              🧪 Probar Notificación
            </button>
          </div>
        </div>
      )}
    </div>
  );
}