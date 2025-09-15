import { Planting } from './plantings';
import { ReportConfig } from '@/types/reports';
import { NotificationSettings } from '@/contexts/NotificationContext';

export interface BackupData {
  version: string;
  exportDate: string;
  userData: {
    name: string;
    email: string;
    role: string;
  };
  plantings: Planting[];
  reportConfigs: ReportConfig[];
  notificationSettings: NotificationSettings;
  appSettings: {
    theme: string;
  };
}

export interface BackupStats {
  totalPlantings: number;
  totalReports: number;
  dataSize: string;
  exportDate: string;
}

export class BackupService {
  private static readonly BACKUP_VERSION = '1.0.0';

  // Create full backup of user data
  static async createBackup(): Promise<BackupData> {
    try {
      console.log('Creating backup...');

      // Collect all user data
      const plantings = await this.getPlantingsData();
      const reportConfigs = this.getSavedReports();
      const notificationSettings = this.getNotificationSettings();
      const appSettings = this.getAppSettings();
      const userData = this.getUserData();

      const backup: BackupData = {
        version: this.BACKUP_VERSION,
        exportDate: new Date().toISOString(),
        userData,
        plantings,
        reportConfigs,
        notificationSettings,
        appSettings
      };

      console.log('Backup created successfully');
      return backup;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error('Error al crear el respaldo: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  // Download backup as JSON file
  static async downloadBackup(): Promise<BackupStats> {
    const backup = await this.createBackup();

    const fileName = `microgreens_backup_${new Date().toISOString().split('T')[0]}.json`;
    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Calculate file size
    const sizeInBytes = blob.size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    const dataSize = sizeInBytes > 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`;

    // Trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      totalPlantings: backup.plantings.length,
      totalReports: backup.reportConfigs.length,
      dataSize,
      exportDate: backup.exportDate
    };
  }

  // Restore backup from uploaded file
  static async restoreBackup(file: File): Promise<void> {
    try {
      console.log('Restoring backup from file:', file.name);

      const fileContent = await this.readFileAsText(file);
      const backup: BackupData = JSON.parse(fileContent);

      // Validate backup format
      this.validateBackup(backup);

      // Restore data with user confirmation for each section
      const confirmRestore = window.confirm(
        `¿Estás seguro de que quieres restaurar este respaldo?\n\n` +
        `Fecha: ${new Date(backup.exportDate).toLocaleDateString('es-ES')}\n` +
        `Siembras: ${backup.plantings.length}\n` +
        `Reportes guardados: ${backup.reportConfigs.length}\n\n` +
        `ADVERTENCIA: Esto sobrescribirá tus datos actuales.`
      );

      if (!confirmRestore) {
        throw new Error('Restauración cancelada por el usuario');
      }

      // Restore plantings (would require API call in real app)
      console.log('Restoring plantings:', backup.plantings.length);
      // await this.restorePlantings(backup.plantings);

      // Restore saved reports
      if (backup.reportConfigs.length > 0) {
        localStorage.setItem('microgreens-saved-reports', JSON.stringify(backup.reportConfigs));
        console.log('Restored saved reports:', backup.reportConfigs.length);
      }

      // Restore notification settings
      if (backup.notificationSettings) {
        localStorage.setItem('microgreens-notification-settings', JSON.stringify(backup.notificationSettings));
        console.log('Restored notification settings');
      }

      // Restore app settings (theme)
      if (backup.appSettings?.theme) {
        localStorage.setItem('microgreens-theme', backup.appSettings.theme);
        console.log('Restored theme setting:', backup.appSettings.theme);
      }

      console.log('Backup restored successfully');
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw new Error('Error al restaurar el respaldo: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  // Get current backup statistics
  static async getBackupStats(): Promise<BackupStats> {
    const plantings = await this.getPlantingsData();
    const reportConfigs = this.getSavedReports();

    const estimatedSize = JSON.stringify({
      plantings,
      reportConfigs,
      notificationSettings: this.getNotificationSettings(),
      appSettings: this.getAppSettings()
    }).length;

    const sizeInKB = (estimatedSize / 1024).toFixed(2);
    const dataSize = estimatedSize > 1024 ? `${sizeInKB} KB` : `${estimatedSize} bytes`;

    return {
      totalPlantings: plantings.length,
      totalReports: reportConfigs.length,
      dataSize,
      exportDate: new Date().toISOString()
    };
  }

  // Private helper methods
  private static async getPlantingsData(): Promise<Planting[]> {
    try {
      // In a real app, this would fetch from your API
      const response = await fetch('/api/plantings');
      if (!response.ok) {
        console.warn('Could not fetch plantings data, using empty array');
        return [];
      }
      return await response.json();
    } catch (error) {
      console.warn('Could not fetch plantings data:', error);
      return [];
    }
  }

  private static getSavedReports(): ReportConfig[] {
    try {
      const saved = localStorage.getItem('microgreens-saved-reports');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Could not get saved reports:', error);
      return [];
    }
  }

  private static getNotificationSettings(): NotificationSettings {
    try {
      const saved = localStorage.getItem('microgreens-notification-settings');
      return saved ? JSON.parse(saved) : {
        enabled: true,
        harvestReminders: true,
        statusUpdates: true,
        systemAlerts: true,
        emailNotifications: false,
        pushNotifications: false,
        reminderDays: 3
      };
    } catch (error) {
      console.warn('Could not get notification settings:', error);
      return {
        enabled: true,
        harvestReminders: true,
        statusUpdates: true,
        systemAlerts: true,
        emailNotifications: false,
        pushNotifications: false,
        reminderDays: 3
      };
    }
  }

  private static getAppSettings() {
    return {
      theme: localStorage.getItem('microgreens-theme') || 'light'
    };
  }

  private static getUserData() {
    // In a real app, this would come from the auth context
    return {
      name: 'Usuario Demo',
      email: 'usuario@ejemplo.com',
      role: 'user'
    };
  }

  private static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('No se pudo leer el archivo'));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file);
    });
  }

  private static validateBackup(backup: unknown): asserts backup is BackupData {
    if (!backup || typeof backup !== 'object') {
      throw new Error('Formato de respaldo inválido');
    }

    const b = backup as Partial<BackupData>;

    if (!b.version) {
      throw new Error('Respaldo no contiene información de versión');
    }

    if (!b.exportDate) {
      throw new Error('Respaldo no contiene fecha de exportación');
    }

    if (!Array.isArray(b.plantings)) {
      throw new Error('Datos de siembras inválidos en el respaldo');
    }

    console.log('Backup validation passed');
  }

  // Utility method to clear all data (for testing)
  static clearAllData(): void {
    const confirmClear = window.confirm(
      'ADVERTENCIA: Esto eliminará TODOS tus datos locales.\n\n' +
      '• Configuraciones guardadas\n' +
      '• Reportes guardados\n' +
      '• Preferencias de notificaciones\n' +
      '• Configuración de tema\n\n' +
      '¿Estás seguro de continuar?'
    );

    if (!confirmClear) return;

    const secondConfirm = window.confirm('¿Estás COMPLETAMENTE seguro? Esta acción NO se puede deshacer.');

    if (!secondConfirm) return;

    localStorage.removeItem('microgreens-saved-reports');
    localStorage.removeItem('microgreens-notification-settings');
    localStorage.removeItem('microgreens-theme');

    console.log('All local data cleared');

    // Reload page to reset application state
    window.location.reload();
  }
}