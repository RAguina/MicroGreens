'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function ConfiguracionPage() {
  const { user } = useAuth();

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
                onClick={() => alert('Funcionalidad próximamente disponible')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Notificaciones</h3>
                  <p className="text-sm text-gray-600">Recibir alertas sobre el estado de las siembras</p>
                </div>
                <button
                  onClick={() => alert('Funcionalidad próximamente disponible')}
                  className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700"
                >
                  Activado
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Recordatorios</h3>
                  <p className="text-sm text-gray-600">Alertas automáticas para fechas de cosecha</p>
                </div>
                <button
                  onClick={() => alert('Funcionalidad próximamente disponible')}
                  className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700"
                >
                  Activado
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Modo Oscuro</h3>
                  <p className="text-sm text-gray-600">Cambiar tema de la aplicación</p>
                </div>
                <button
                  onClick={() => alert('Funcionalidad próximamente disponible')}
                  className="bg-gray-400 text-white px-3 py-1 text-sm rounded hover:bg-gray-500"
                >
                  Desactivado
                </button>
              </div>
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
                onClick={() => alert('Funcionalidad próximamente disponible')}
                className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm"
              >
                📊 Exportar datos
              </button>
              <button
                onClick={() => alert('Funcionalidad próximamente disponible')}
                className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm"
              >
                🔄 Respaldar información
              </button>
              <button
                onClick={() => alert('Funcionalidad próximamente disponible')}
                className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm"
              >
                📱 Configurar móvil
              </button>
              <button
                onClick={() => alert('Funcionalidad próximamente disponible')}
                className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm text-red-600"
              >
                🗑️ Eliminar cuenta
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-blue-800 font-semibold mb-2">💡 Consejos</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Mantén tus datos actualizados</li>
              <li>• Activa las notificaciones</li>
              <li>• Exporta respaldos regularmente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}