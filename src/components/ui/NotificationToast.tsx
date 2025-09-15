'use client';

import { useNotifications, Notification, NotificationType } from '@/contexts/NotificationContext';

interface NotificationToastProps {
  notification: Notification;
}

function NotificationIcon({ type }: { type: NotificationType }) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return <span className="text-lg">{icons[type]}</span>;
}

function NotificationToast({ notification }: NotificationToastProps) {
  const { removeNotification } = useNotifications();

  const typeStyles = {
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
  };

  const titleStyles = {
    success: 'text-green-800 dark:text-green-200',
    error: 'text-red-800 dark:text-red-200',
    warning: 'text-yellow-800 dark:text-yellow-200',
    info: 'text-blue-800 dark:text-blue-200'
  };

  const messageStyles = {
    success: 'text-green-700 dark:text-green-300',
    error: 'text-red-700 dark:text-red-300',
    warning: 'text-yellow-700 dark:text-yellow-300',
    info: 'text-blue-700 dark:text-blue-300'
  };

  const buttonStyles = {
    success: 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200',
    error: 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200',
    warning: 'text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200',
    info: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200'
  };

  return (
    <div
      className={`
        ${typeStyles[notification.type]}
        border rounded-lg p-4 shadow-sm max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        hover:shadow-md
      `}
    >
      <div className="flex items-start space-x-3">
        <NotificationIcon type={notification.type} />

        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-sm ${titleStyles[notification.type]}`}>
            {notification.title}
          </h4>
          <p className={`text-sm mt-1 ${messageStyles[notification.type]}`}>
            {notification.message}
          </p>

          {notification.action && (
            <button
              onClick={() => {
                notification.action!.onClick();
                removeNotification(notification.id);
              }}
              className={`
                mt-2 text-sm font-medium underline
                ${buttonStyles[notification.type]}
                transition-colors duration-200
              `}
            >
              {notification.action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => removeNotification(notification.id)}
          className={`
            flex-shrink-0 text-lg leading-none
            ${buttonStyles[notification.type]}
            transition-colors duration-200
          `}
          title="Cerrar notificación"
        >
          ×
        </button>
      </div>

      {notification.createdAt && (
        <div className={`text-xs mt-2 opacity-75 ${messageStyles[notification.type]}`}>
          {new Date(notification.createdAt).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )}
    </div>
  );
}

export default function NotificationContainer() {
  const { notifications } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-h-screen overflow-y-auto">
      {notifications.map(notification => (
        <NotificationToast key={notification.id} notification={notification} />
      ))}
    </div>
  );
}

// Alternative: Notification bell icon for navbar
export function NotificationBell() {
  const { notifications, clearAllNotifications } = useNotifications();
  const unreadCount = notifications.length;

  if (unreadCount === 0) {
    return (
      <div className="relative p-2">
        <span className="text-xl text-gray-400 dark:text-gray-600">🔔</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={clearAllNotifications}
        className="relative p-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title={`${unreadCount} notificaciones`}
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}