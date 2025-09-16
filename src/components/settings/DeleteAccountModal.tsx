'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNotify } from '@/contexts/NotificationContext';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const { logout } = useAuth();
  const notify = useNotify();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [keepData, setKeepData] = useState(false);

  const requiredConfirmText = 'ELIMINAR MI CUENTA';

  const handleDeleteAccount = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    try {
      setLoading(true);

      // Validate confirmation text
      if (confirmText !== requiredConfirmText) {
        notify.error(
          'Confirmación Incorrecta',
          `Debes escribir exactamente: &quot;${requiredConfirmText}&quot;`
        );
        return;
      }

      // Validate password (in real app)
      if (!password) {
        notify.error(
          'Contraseña Requerida',
          'Ingresa tu contraseña para confirmar la eliminación'
        );
        return;
      }

      // Mock API call for account deletion
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create backup before deletion if requested
      if (keepData) {
        // This would trigger a backup download
        notify.info(
          '💾 Creando Respaldo',
          'Descargando tus datos antes de eliminar la cuenta...'
        );
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Log the deletion reason (in real app)
      console.log('Account deletion reason:', reason);

      notify.success(
        '✅ Cuenta Eliminada',
        'Tu cuenta ha sido eliminada exitosamente. Serás redirigido al inicio de sesión.',
        { duration: 5000 }
      );

      // Wait a moment then logout
      setTimeout(async () => {
        await logout();
        router.push('/login');
      }, 2000);

    } catch (error) {
      notify.error(
        'Error en Eliminación',
        error instanceof Error ? error.message : 'Error al eliminar la cuenta'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setConfirmText('');
    setPassword('');
    setReason('');
    setKeepData(false);
    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      resetModal();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
            Eliminar Cuenta
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Step 1: Warning and Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
                ⚠️ ADVERTENCIA IMPORTANTE
              </h3>
              <p className="text-red-700 dark:text-red-300 text-sm">
                Esta acción eliminará permanentemente tu cuenta y todos los datos asociados.
                Esta operación <strong>NO SE PUEDE DESHACER</strong>.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Se eliminarán los siguientes datos:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Todas tus siembras y registros</li>
                <li>• Configuraciones y preferencias</li>
                <li>• Reportes guardados</li>
                <li>• Historial de actividades</li>
                <li>• Información de perfil</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Antes de continuar, considera:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Exportar un respaldo de tus datos</li>
                <li>• Finalizar cualquier proceso pendiente</li>
                <li>• Informar a otros usuarios si es necesario</li>
              </ul>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Reason and Backup Options */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ¿Por qué eliminas tu cuenta? (opcional)
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Selecciona una razón</option>
                <option value="no-longer-needed">Ya no necesito la aplicación</option>
                <option value="found-alternative">Encontré una alternativa mejor</option>
                <option value="privacy-concerns">Preocupaciones de privacidad</option>
                <option value="too-complex">La aplicación es demasiado compleja</option>
                <option value="technical-issues">Problemas técnicos persistentes</option>
                <option value="other">Otra razón</option>
              </select>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepData}
                  onChange={(e) => setKeepData(e.target.checked)}
                  className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-blue-800 dark:text-blue-200 font-medium text-sm">
                    Descargar mis datos antes de eliminar
                  </span>
                  <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                    Recibirás un archivo con todos tus datos antes de que se elimine la cuenta
                  </p>
                </div>
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Final Confirmation */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
                🚨 CONFIRMACIÓN FINAL
              </h3>
              <p className="text-red-700 dark:text-red-300 text-sm">
                Esta es tu última oportunidad para cancelar. Una vez confirmado, tu cuenta será eliminada permanentemente.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Escribe &quot;{requiredConfirmText}&quot; para confirmar:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={requiredConfirmText}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirma tu contraseña:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña actual"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setStep(2)}
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading || confirmText !== requiredConfirmText || !password}
                className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Eliminando...' : 'ELIMINAR CUENTA'}
              </button>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="mt-6 flex items-center justify-center space-x-2">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`w-2 h-2 rounded-full ${
                num <= step ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}