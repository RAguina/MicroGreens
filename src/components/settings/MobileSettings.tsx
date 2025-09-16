'use client';

import { useState, useEffect } from 'react';
import { useNotify } from '@/contexts/NotificationContext';

interface PWAInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function MobileSettings() {
  const notify = useNotify();
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if app is already installed/running in standalone mode
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    // Check if app is installed via other means
    setIsInstalled('standalone' in window.navigator || window.matchMedia('(display-mode: standalone)').matches);

    // Check push notification support
    setPushSupported('serviceWorker' in navigator && 'PushManager' in window);

    // Get current notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as PWAInstallPrompt);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      notify.success(
        '📱 App Instalada',
        'MicroGreens se ha instalado correctamente en tu dispositivo'
      );
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [notify]);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        notify.success(
          '📱 Instalando App',
          'MicroGreens se está instalando en tu dispositivo...'
        );
      }

      setDeferredPrompt(null);
    } catch (error) {
      notify.error(
        'Error de Instalación',
        'No se pudo instalar la aplicación. Intenta desde el menú del navegador.'
      );
    }
  };

  const handleRequestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      notify.error(
        'No Soportado',
        'Las notificaciones no están soportadas en este dispositivo'
      );
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        notify.success(
          '🔔 Notificaciones Activadas',
          'Ahora recibirás notificaciones push de MicroGreens'
        );
      } else {
        notify.warning(
          'Notificaciones Denegadas',
          'Puedes activarlas desde la configuración del navegador'
        );
      }
    } catch (error) {
      notify.error(
        'Error',
        'No se pudo solicitar permiso para notificaciones'
      );
    }
  };

  const handleRegisterServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      notify.error(
        'No Soportado',
        'Los service workers no están soportados en este navegador'
      );
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);

      notify.success(
        '⚙️ Service Worker Registrado',
        'La app ahora puede funcionar offline'
      );
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      notify.error(
        'Error de Registro',
        'No se pudo registrar el service worker'
      );
    }
  };

  const getInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return 'En Chrome: Menú (⋮) → "Instalar MicroGreens"';
    } else if (userAgent.includes('firefox')) {
      return 'En Firefox: Barra de direcciones → Icono de instalación';
    } else if (userAgent.includes('safari')) {
      return 'En Safari: Compartir → "Añadir a pantalla de inicio"';
    } else if (userAgent.includes('edg')) {
      return 'En Edge: Menú (⋯) → "Apps" → "Instalar este sitio como app"';
    }

    return 'Busca la opción "Instalar" o "Añadir a pantalla de inicio" en el menú de tu navegador';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          📱 Configuración Móvil
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Configura MicroGreens para una mejor experiencia en dispositivos móviles.
        </p>
      </div>

      {/* App Installation Status */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          📊 Estado de la Aplicación
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${isInstalled ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            <span className="text-blue-700 dark:text-blue-300">
              {isInstalled ? 'App Instalada' : 'App No Instalada'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${isStandalone ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            <span className="text-blue-700 dark:text-blue-300">
              {isStandalone ? 'Modo App' : 'Modo Navegador'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${pushSupported ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            <span className="text-blue-700 dark:text-blue-300">
              {pushSupported ? 'Push Soportado' : 'Push No Soportado'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${
              notificationPermission === 'granted' ? 'bg-green-500' :
              notificationPermission === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></span>
            <span className="text-blue-700 dark:text-blue-300">
              Notificaciones: {
                notificationPermission === 'granted' ? 'Permitidas' :
                notificationPermission === 'denied' ? 'Denegadas' : 'Pendientes'
              }
            </span>
          </div>
        </div>
      </div>

      {/* PWA Installation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Install App Card */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">📲</div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Instalar Aplicación
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {isInstalled
                  ? 'La app ya está instalada en tu dispositivo'
                  : 'Instala MicroGreens como app nativa'
                }
              </p>
              {!isInstalled && (
                <>
                  {deferredPrompt ? (
                    <button
                      onClick={handleInstallApp}
                      className="
                        w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-lg
                        hover:bg-blue-700 transition-colors mb-2
                      "
                    >
                      Instalar Ahora
                    </button>
                  ) : (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {getInstallInstructions()}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">🔔</div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Notificaciones Push
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {notificationPermission === 'granted'
                  ? 'Las notificaciones push están activas'
                  : 'Activa las notificaciones push para recordatorios'
                }
              </p>
              {notificationPermission !== 'granted' && (
                <button
                  onClick={handleRequestNotificationPermission}
                  disabled={!pushSupported}
                  className="
                    w-full px-4 py-2 text-sm bg-green-600 text-white rounded-lg
                    hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  {pushSupported ? 'Activar Notificaciones' : 'No Soportado'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Service Worker */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">⚙️</div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              Funcionalidad Offline
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Permite que la app funcione sin conexión a internet
            </p>
            <button
              onClick={handleRegisterServiceWorker}
              className="
                px-4 py-2 text-sm bg-purple-600 text-white rounded-lg
                hover:bg-purple-700 transition-colors
              "
            >
              Activar Modo Offline
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Optimizations */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          📱 Optimizaciones Móviles Activas
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            <span>Diseño responsive optimizado para pantallas táctiles</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            <span>Gestos de navegación mejorados</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            <span>Carga rápida y optimización de recursos</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            <span>Modo oscuro automático según preferencias del sistema</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            <span>Persistencia offline de configuraciones</span>
          </li>
        </ul>
      </div>

      {/* PWA Features */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
          🚀 Características PWA Disponibles
        </h4>
        <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
          <li>• Instalación nativa en dispositivos móviles y desktop</li>
          <li>• Funcionamiento offline para visualizar datos</li>
          <li>• Notificaciones push para recordatorios de cosecha</li>
          <li>• Atajos de aplicación para acceso rápido</li>
          <li>• Splash screen personalizada</li>
          <li>• Integración con el sistema operativo</li>
        </ul>
      </div>
    </div>
  );
}