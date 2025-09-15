'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotify } from '@/contexts/NotificationContext';

interface ProfileFormData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface EditProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileForm({ isOpen, onClose }: EditProfileFormProps) {
  const { user, updateUser } = useAuth();
  const notify = useNotify();

  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate password fields if changing password
      if (showPasswordFields) {
        if (!formData.currentPassword) {
          throw new Error('La contraseña actual es requerida');
        }
        if (formData.newPassword.length < 6) {
          throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('Las contraseñas no coinciden');
        }
      }

      // Prepare update data
      const updateData: {
        name: string;
        email: string;
        currentPassword?: string;
        newPassword?: string;
      } = {
        name: formData.name,
        email: formData.email
      };

      if (showPasswordFields && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      // Mock API call - in real app, this would call your actual API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate updating user context
      await updateUser({
        ...user!,
        name: formData.name,
        email: formData.email
      });

      notify.success(
        '✅ Perfil Actualizado',
        'Tus datos han sido actualizados correctamente'
      );

      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setShowPasswordFields(false);

      onClose();
    } catch (error) {
      notify.error(
        'Error al Actualizar',
        error instanceof Error ? error.message : 'Error desconocido'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Editar Perfil
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="
                w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
              "
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="
                w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
              "
              required
            />
          </div>

          {/* Role Field (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rol
            </label>
            <input
              type="text"
              value={user?.role || 'Usuario'}
              readOnly
              className="
                w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400
                cursor-not-allowed
              "
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              El rol no puede ser modificado por el usuario
            </p>
          </div>

          {/* Change Password Toggle */}
          <div className="border-t pt-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPasswordFields}
                onChange={(e) => setShowPasswordFields(e.target.checked)}
                className="rounded text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Cambiar Contraseña
              </span>
            </label>
          </div>

          {/* Password Fields */}
          {showPasswordFields && (
            <div className="space-y-4 border-l-2 border-green-200 dark:border-green-700 pl-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => handleChange('currentPassword', e.target.value)}
                  className="
                    w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                  "
                  required={showPasswordFields}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleChange('newPassword', e.target.value)}
                  className="
                    w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                  "
                  minLength={6}
                  required={showPasswordFields}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Mínimo 6 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="
                    w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                  "
                  required={showPasswordFields}
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="
                flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600
                text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700
                transition-colors
              "
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="
                flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded-md
                hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
              "
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}