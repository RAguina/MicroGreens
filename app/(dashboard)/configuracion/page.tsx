'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ReportGeneratorModal from '@/components/reports/ReportGeneratorModal';
import { ReportConfig } from '@/types/reports';
import { ReportsService } from '@/lib/reports';
import { Planting } from '@/lib/plantings';
import ThemeToggle from '@/components/ui/ThemeToggle';
import NotificationSettings from '@/components/settings/NotificationSettings';
import EditProfileForm from '@/components/profile/EditProfileForm';
import BackupSettings from '@/components/settings/BackupSettings';
import MobileSettings from '@/components/settings/MobileSettings';
import DeleteAccountModal from '@/components/settings/DeleteAccountModal';

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [plantings, setPlantings] = useState<Planting[]>([]);

  const handleGenerateReport = async (config: ReportConfig) => {
    try {
      const report = await ReportsService.generateAndDownloadReport(plantings, config);
      alert(`Reporte generado exitosamente: ${report.fileName}`);
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('Error al generar el reporte. Por favor intenta nuevamente.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">⚙️ Configuración</h1>
          <p className="text-gray-600">Ajusta la configuración de tu sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Perfil de Usuario</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={user?.name || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <input
                  type="text"
                  value={user?.role || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <button
                onClick={() => setShowEditProfile(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Editar Perfil
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Configuración del Sistema</h2>
            </div>
            <div className="p-6 space-y-4">
              <NotificationSettings />

              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de Uso</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Siembras creadas:</span>
                <span className="font-medium">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Última actividad:</span>
                <span className="font-medium">Hoy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Miembro desde:</span>
                <span className="font-medium">2024</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
            <div className="space-y-2">
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full text-left p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                📊 Exportar datos
              </button>
              <button
                onClick={() => setShowDeleteAccount(true)}
                className="w-full text-left p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 dark:text-red-400 transition-colors"
              >
                🗑️ Eliminar cuenta
              </button>
            </div>
          </div>

          {/* Backup Settings Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <BackupSettings />
          </div>

          {/* Mobile Settings Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <MobileSettings />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-blue-800 dark:text-blue-200 font-semibold mb-2">💡 Consejos</h3>
            <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
              <li>• Instala la app para una mejor experiencia móvil</li>
              <li>• Activa las notificaciones para recordatorios importantes</li>
              <li>• Exporta respaldos regularmente</li>
              <li>• Usa el modo oscuro para ahorrar batería en dispositivos OLED</li>
              <li>• La app funciona offline una vez instalada</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Report Generator Modal */}
      <ReportGeneratorModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        plantings={plantings}
        onGenerate={handleGenerateReport}
      />

      {/* Edit Profile Modal */}
      <EditProfileForm
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
      />
    </div>
  );
}