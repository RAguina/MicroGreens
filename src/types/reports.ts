// Report system types and interfaces
import { PlantingStatus } from '@/lib/plantings';

export type ReportFormat = 'csv' | 'pdf' | 'json';
export type ReportType = 'plantings' | 'analytics';
export type DateRangePreset = 'last_month' | 'last_3_months' | 'last_year' | 'all_time' | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
  preset?: DateRangePreset;
}

export interface ReportFilters {
  status?: PlantingStatus[];
  plantNames?: string[];
  trays?: string[];
  quantityRange?: {
    min?: number;
    max?: number;
  };
}

export interface ReportColumn {
  key: string;
  label: string;
  enabled: boolean;
  sortable: boolean;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PlantingsReportConfig {
  id?: string;
  name: string;
  type: 'plantings';
  dateRange: DateRange;
  filters: ReportFilters;
  columns: ReportColumn[];
  sorting: SortConfig[];
  format: ReportFormat;
  createdAt?: Date;
  isFavorite?: boolean;
}

export interface AnalyticsReportConfig {
  id?: string;
  name: string;
  type: 'analytics';
  dateRange: DateRange;
  filters?: ReportFilters; // Optional filters for analytics
  sections: AnalyticsSection[];
  format: ReportFormat;
  createdAt?: Date;
  isFavorite?: boolean;
}

export interface AnalyticsSection {
  key: string;
  label: string;
  enabled: boolean;
  order: number;
}

export type ReportConfig = PlantingsReportConfig | AnalyticsReportConfig;

// Default columns for plantings report
export const DEFAULT_PLANTING_COLUMNS: ReportColumn[] = [
  { key: 'plantName', label: 'Nombre de Planta', enabled: true, sortable: true },
  { key: 'datePlanted', label: 'Fecha Siembra', enabled: true, sortable: true },
  { key: 'status', label: 'Estado', enabled: true, sortable: true },
  { key: 'daysFromPlanting', label: 'Días Transcurridos', enabled: true, sortable: true },
  { key: 'expectedHarvest', label: 'Cosecha Esperada', enabled: true, sortable: true },
  { key: 'domeDate', label: 'Fecha Cúpula', enabled: false, sortable: true },
  { key: 'lightDate', label: 'Fecha Luz', enabled: false, sortable: true },
  { key: 'trayNumber', label: 'Bandeja', enabled: true, sortable: true },
  { key: 'quantity', label: 'Cantidad', enabled: true, sortable: true },
  { key: 'notes', label: 'Notas', enabled: false, sortable: false },
  { key: 'efficiency', label: 'Eficiencia %', enabled: false, sortable: true },
  { key: 'createdAt', label: 'Fecha Creación', enabled: false, sortable: true },
];

// Default sections for analytics report
export const DEFAULT_ANALYTICS_SECTIONS: AnalyticsSection[] = [
  { key: 'executive_summary', label: 'Resumen Ejecutivo', enabled: true, order: 1 },
  { key: 'status_distribution', label: 'Distribución por Estados', enabled: true, order: 2 },
  { key: 'top_plants', label: 'Plantas Más Exitosas', enabled: true, order: 3 },
  { key: 'time_averages', label: 'Promedios de Tiempo', enabled: true, order: 4 },
  { key: 'efficiency_rates', label: 'Tasas de Eficiencia', enabled: true, order: 5 },
  { key: 'monthly_trends', label: 'Tendencias Mensuales', enabled: true, order: 6 },
  { key: 'tray_performance', label: 'Rendimiento por Bandeja', enabled: false, order: 7 },
  { key: 'growth_cycle_analysis', label: 'Análisis de Ciclos', enabled: false, order: 8 },
  { key: 'projections', label: 'Proyecciones', enabled: false, order: 9 },
];

// Preset report configurations
export const PRESET_REPORTS: ReportConfig[] = [
  {
    name: 'Reporte Mensual Estándar',
    type: 'plantings',
    dateRange: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      end: new Date(),
      preset: 'last_month'
    },
    filters: {},
    columns: DEFAULT_PLANTING_COLUMNS.filter(col => col.enabled),
    sorting: [{ field: 'datePlanted', direction: 'desc' }],
    format: 'pdf',
    isFavorite: true
  },
  {
    name: 'Análisis Trimestral',
    type: 'analytics',
    dateRange: {
      start: new Date(new Date().setMonth(new Date().getMonth() - 3)),
      end: new Date(),
      preset: 'last_3_months'
    },
    sections: DEFAULT_ANALYTICS_SECTIONS.filter(section => section.enabled),
    format: 'pdf',
    isFavorite: true
  },
  {
    name: 'Export Completo CSV',
    type: 'plantings',
    dateRange: {
      start: new Date(new Date().getFullYear(), 0, 1),
      end: new Date(),
      preset: 'all_time'
    },
    filters: {},
    columns: DEFAULT_PLANTING_COLUMNS,
    sorting: [{ field: 'datePlanted', direction: 'desc' }],
    format: 'csv',
    isFavorite: true
  }
];

export interface GeneratedReport {
  config: ReportConfig;
  data: Record<string, unknown>[] | Record<string, unknown>;
  generatedAt: Date;
  fileName: string;
  fileSize?: number;
}