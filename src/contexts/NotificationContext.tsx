'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: Date;
}

export interface NotificationSettings {
  enabled: boolean;
  harvestReminders: boolean;
  statusUpdates: boolean;
  systemAlerts: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderDays: number; // Days before harvest to remind
}

interface NotificationContextType {
  notifications: Notification[];
  settings: NotificationSettings;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  checkHarvestReminders: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  harvestReminders: true,
  statusUpdates: true,
  systemAlerts: true,
  emailNotifications: false,
  pushNotifications: false,
  reminderDays: 3
};

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettingsState] = useState<NotificationSettings>(DEFAULT_SETTINGS);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('microgreens-notification-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettingsState({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Error parsing notification settings:', error);
      }
    }
  }, []);

  // Auto-remove notifications
  useEffect(() => {
    const timers: { [key: string]: NodeJS.Timeout } = {};

    notifications.forEach(notification => {
      if (!notification.persistent && notification.duration !== 0) {
        const duration = notification.duration || 5000;
        timers[notification.id] = setTimeout(() => {
          removeNotification(notification.id);
        }, duration);
      }
    });

    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, [notifications]);

  // Check for harvest reminders every hour
  useEffect(() => {
    if (settings.enabled && settings.harvestReminders) {
      const checkInterval = setInterval(() => {
        checkHarvestReminders();
      }, 60 * 60 * 1000); // Every hour

      // Check immediately on mount
      checkHarvestReminders();

      return () => clearInterval(checkInterval);
    }
  }, [settings.enabled, settings.harvestReminders, settings.reminderDays]);

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>): string => {
    if (!settings.enabled) return '';

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date()
    };

    setNotifications(prev => [newNotification, ...prev]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettingsState(updatedSettings);
    localStorage.setItem('microgreens-notification-settings', JSON.stringify(updatedSettings));
  };

  const checkHarvestReminders = async () => {
    try {
      // This would typically fetch from your plantings API
      // For now, we'll use a mock check
      const plantingsResponse = await fetch('/api/plantings');
      if (!plantingsResponse.ok) return;

      const plantings = await plantingsResponse.json();
      const now = new Date();
      const reminderDate = new Date(now.getTime() + (settings.reminderDays * 24 * 60 * 60 * 1000));

      plantings.forEach((planting: { id: string; status: string; expectedHarvest?: string; plantType: string; plantName?: string }) => {
        if (planting.status === 'GROWING' && planting.expectedHarvest) {
          const harvestDate = new Date(planting.expectedHarvest);

          if (harvestDate <= reminderDate && harvestDate >= now) {
            const daysUntilHarvest = Math.ceil((harvestDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

            // Check if we haven't already sent this reminder today
            const reminderKey = `harvest-reminder-${planting.id}-${harvestDate.toDateString()}`;
            const lastReminder = localStorage.getItem(reminderKey);
            const today = new Date().toDateString();

            if (lastReminder !== today) {
              addNotification({
                type: 'warning',
                title: '🌾 Recordatorio de Cosecha',
                message: `${planting.plantName || planting.plantType} estará listo para cosechar en ${daysUntilHarvest} día(s)`,
                duration: 0, // Persistent
                persistent: true,
                action: {
                  label: 'Ver Planta',
                  onClick: () => {
                    window.location.href = `/siembras`;
                  }
                }
              });

              localStorage.setItem(reminderKey, today);
            }
          }
        }
      });
    } catch (error) {
      console.error('Error checking harvest reminders:', error);
    }
  };

  const value: NotificationContextType = {
    notifications,
    settings,
    addNotification,
    removeNotification,
    clearAllNotifications,
    updateSettings,
    checkHarvestReminders
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Convenience hooks
export function useNotify() {
  const { addNotification } = useNotifications();

  return {
    success: (title: string, message: string, options?: Partial<Notification>) =>
      addNotification({ type: 'success', title, message, ...options }),

    error: (title: string, message: string, options?: Partial<Notification>) =>
      addNotification({ type: 'error', title, message, duration: 0, persistent: true, ...options }),

    warning: (title: string, message: string, options?: Partial<Notification>) =>
      addNotification({ type: 'warning', title, message, ...options }),

    info: (title: string, message: string, options?: Partial<Notification>) =>
      addNotification({ type: 'info', title, message, ...options })
  };
}