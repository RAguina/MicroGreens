'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bienvenido al Dashboard
        </h1>
        <p className="text-gray-600">
          ¡Hola {user?.name || user?.email}! Tu sistema de auth está funcionando perfectamente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            🌱 Siembras
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Gestiona tus cultivos de microverdes
          </p>
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
            Ver Siembras
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            📊 Analytics
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Reportes y estadísticas
          </p>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Ver Analytics
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            ⚙️ Configuración
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Ajustes del sistema
          </p>
          <button className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700">
            Configuración
          </button>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-green-800 font-semibold mb-2">✅ Sistema Funcionando</h3>
        <ul className="text-green-700 text-sm space-y-1">
          <li>• Auth JWT real conectado al backend</li>
          <li>• Cookies HttpOnly configuradas</li>
          <li>• Context y AuthGuard funcionando</li>
          <li>• Navegación y redirects correctos</li>
          <li>• Sin mocks, solo API real</li>
        </ul>
      </div>
    </div>
  );
}