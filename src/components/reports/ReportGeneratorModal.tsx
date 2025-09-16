'use client';

import { useState, useEffect } from 'react';
import { Planting, PlantingStatus } from '@/lib/plantings';
import {
  ReportConfig,
  PlantingsReportConfig,
  AnalyticsReportConfig,
  ReportFormat,
  ReportType,
  DateRangePreset,
  DateRange,
  ReportFilters,
  DEFAULT_PLANTING_COLUMNS,
  DEFAULT_ANALYTICS_SECTIONS,
  PRESET_REPORTS
} from '@/types/reports';
import { ReportsService } from '@/lib/reports';

interface ReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  plantings: Planting[];
  onGenerate: (config: ReportConfig) => void;
}

export default function ReportGeneratorModal({
  isOpen,
  onClose,
  plantings,
  onGenerate
}: ReportGeneratorModalProps) {
  const [activeTab, setActiveTab] = useState<'plantings' | 'analytics' | 'saved'>('plantings');
  const [reportType, setReportType] = useState<ReportType>('plantings');
  const [reportName, setReportName] = useState('');
  const [format, setFormat] = useState<ReportFormat>('csv');

  // Date range state
  const [datePreset, setDatePreset] = useState<DateRangePreset>('last_month');
  const [customDateRange, setCustomDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Filters state
  const [filters, setFilters] = useState<ReportFilters>({
    status: [],
    plantNames: [],
    trays: [],
    quantityRange: {}
  });

  // Columns state (for plantings reports)
  const [columns, setColumns] = useState(DEFAULT_PLANTING_COLUMNS);
  const [sorting, setSorting] = useState([{ field: 'datePlanted', direction: 'desc' as 'asc' | 'desc' }]);

  // Analytics sections state
  const [analyticsSections, setAnalyticsSections] = useState(DEFAULT_ANALYTICS_SECTIONS);

  // Saved reports
  const [savedReports, setSavedReports] = useState<ReportConfig[]>([]);

  // Available options for filters
  const [availableOptions, setAvailableOptions] = useState({
    plantNames: [] as string[],
    trays: [] as string[],
    statuses: ['PLANTED', 'GROWING', 'HARVESTED', 'COMPOSTED'] as string[]
  });

  useEffect(() => {
    if (isOpen) {
      // Extract unique plant names and trays from plantings
      const uniquePlantNames = [...new Set(plantings.map(p => p.plantName).filter(Boolean))] as string[];
      const uniqueTrays = [...new Set(plantings.map(p => p.trayNumber).filter(Boolean))] as string[];

      setAvailableOptions({
        plantNames: uniquePlantNames,
        trays: uniqueTrays,
        statuses: ['PLANTED', 'GROWING', 'HARVESTED', 'COMPOSTED']
      });

      // Load saved reports
      setSavedReports(ReportsService.getSavedReports());

      // Reset form
      setReportName('');
      setFilters({ status: [], plantNames: [], trays: [], quantityRange: {} });
    }
  }, [isOpen, plantings]);

  const getDateRange = (): DateRange => {
    const now = new Date();

    switch (datePreset) {
      case 'last_month':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: now,
          preset: datePreset
        };
      case 'last_3_months':
        return {
          start: new Date(now.getFullYear(), now.getMonth() - 3, 1),
          end: now,
          preset: datePreset
        };
      case 'last_year':
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: now,
          preset: datePreset
        };
      case 'all_time':
        return {
          start: new Date(2020, 0, 1), // Arbitrary old date
          end: now,
          preset: datePreset
        };
      case 'custom':
        return {
          start: new Date(customDateRange.start),
          end: new Date(customDateRange.end),
          preset: datePreset
        };
      default:
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: now,
          preset: 'last_month'
        };
    }
  };

  const handleGenerate = () => {
    const baseConfig = {
      name: reportName || `Reporte ${reportType} - ${new Date().toLocaleDateString('es-ES')}`,
      dateRange: getDateRange(),
      format
    };

    let config: ReportConfig;

    if (reportType === 'plantings') {
      config = {
        ...baseConfig,
        type: 'plantings',
        filters,
        columns: columns.filter(col => col.enabled),
        sorting
      } as PlantingsReportConfig;
    } else {
      config = {
        ...baseConfig,
        type: 'analytics',
        filters,
        sections: analyticsSections.filter(section => section.enabled).sort((a, b) => a.order - b.order)
      } as AnalyticsReportConfig;
    }

    onGenerate(config);
    onClose();
  };

  const handleLoadPreset = (preset: ReportConfig) => {
    setReportType(preset.type);
    setReportName(preset.name);
    setFormat(preset.format);

    if (preset.dateRange.preset) {
      setDatePreset(preset.dateRange.preset);
    } else {
      setDatePreset('custom');
      setCustomDateRange({
        start: preset.dateRange.start.toISOString().split('T')[0],
        end: preset.dateRange.end.toISOString().split('T')[0]
      });
    }

    if (preset.type === 'plantings') {
      const plantingsConfig = preset as PlantingsReportConfig;
      setFilters(plantingsConfig.filters);
      setColumns(plantingsConfig.columns.map(col => ({ ...col, enabled: true })));
      setSorting(plantingsConfig.sorting);
      setActiveTab('plantings');
    } else {
      const analyticsConfig = preset as AnalyticsReportConfig;
      setFilters(analyticsConfig.filters || {});
      setAnalyticsSections(analyticsConfig.sections.map(section => ({ ...section, enabled: true })));
      setActiveTab('analytics');
    }
  };

  const handleSaveReport = () => {
    const config = reportType === 'plantings'
      ? {
          name: reportName || `Reporte guardado - ${new Date().toLocaleDateString('es-ES')}`,
          type: 'plantings' as const,
          dateRange: getDateRange(),
          filters,
          columns: columns.filter(col => col.enabled),
          sorting,
          format,
          isFavorite: false
        }
      : {
          name: reportName || `Análisis guardado - ${new Date().toLocaleDateString('es-ES')}`,
          type: 'analytics' as const,
          dateRange: getDateRange(),
          filters,
          sections: analyticsSections.filter(section => section.enabled),
          format,
          isFavorite: false
        };

    ReportsService.saveReportConfig(config);
    setSavedReports(ReportsService.getSavedReports());
    alert('Reporte guardado exitosamente');
  };

  const toggleColumnEnabled = (index: number) => {
    const updated = [...columns];
    updated[index].enabled = !updated[index].enabled;
    setColumns(updated);
  };

  const toggleSectionEnabled = (index: number) => {
    const updated = [...analyticsSections];
    updated[index].enabled = !updated[index].enabled;
    setAnalyticsSections(updated);
  };

  const toggleFilterValue = (filterType: keyof ReportFilters, value: string) => {
    const currentValues = filters[filterType] as string[] || [];
    const updated = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    setFilters({
      ...filters,
      [filterType]: updated
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">📊 Generador de Reportes</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('plantings')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'plantings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🌱 Datos de Siembras
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'analytics'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📈 Reporte Estadístico
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'saved'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💾 Reportes Guardados
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'saved' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Reportes Predefinidos</h3>
              {PRESET_REPORTS.map((preset, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{preset.name}</h4>
                      <p className="text-sm text-gray-600">
                        Tipo: {preset.type === 'plantings' ? 'Datos de Siembras' : 'Estadístico'} |
                        Formato: {preset.format.toUpperCase()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleLoadPreset(preset)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Usar
                    </button>
                  </div>
                </div>
              ))}

              {savedReports.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mt-6">Reportes Guardados</h3>
                  {savedReports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{report.name}</h4>
                          <p className="text-sm text-gray-600">
                            Tipo: {report.type === 'plantings' ? 'Datos de Siembras' : 'Estadístico'} |
                            Formato: {report.format.toUpperCase()} |
                            Creado: {report.createdAt ? new Date(report.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleLoadPreset(report)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Usar
                          </button>
                          <button
                            onClick={() => {
                              if (report.id) {
                                ReportsService.deleteSavedReport(report.id);
                                setSavedReports(ReportsService.getSavedReports());
                              }
                            }}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Basic Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Reporte
                  </label>
                  <input
                    type="text"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mi reporte personalizado"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formato
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as ReportFormat)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="csv">CSV (Excel)</option>
                    <option value="pdf">PDF</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                  {[
                    { key: 'last_month', label: 'Último Mes' },
                    { key: 'last_3_months', label: '3 Meses' },
                    { key: 'last_year', label: 'Este Año' },
                    { key: 'all_time', label: 'Todo' },
                    { key: 'custom', label: 'Personalizado' }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setDatePreset(option.key as DateRangePreset)}
                      className={`px-3 py-2 text-sm rounded ${
                        datePreset === option.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {datePreset === 'custom' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Desde</label>
                      <input
                        type="date"
                        value={customDateRange.start}
                        onChange={(e) => setCustomDateRange({...customDateRange, start: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Hasta</label>
                      <input
                        type="date"
                        value={customDateRange.end}
                        onChange={(e) => setCustomDateRange({...customDateRange, end: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtros
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Estados</label>
                    <div className="space-y-1">
                      {availableOptions.statuses.map((status) => (
                        <label key={status} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.status?.includes(status as PlantingStatus) || false}
                            onChange={() => toggleFilterValue('status', status)}
                            className="mr-2"
                          />
                          <span className="text-sm">{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Plant Names Filter */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Plantas</label>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {availableOptions.plantNames.map((plant) => (
                        <label key={plant} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.plantNames?.includes(plant) || false}
                            onChange={() => toggleFilterValue('plantNames', plant)}
                            className="mr-2"
                          />
                          <span className="text-sm">{plant}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Trays Filter */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Bandejas</label>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {availableOptions.trays.map((tray) => (
                        <label key={tray} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.trays?.includes(tray) || false}
                            onChange={() => toggleFilterValue('trays', tray)}
                            className="mr-2"
                          />
                          <span className="text-sm">{tray}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Columns (for plantings) or Sections (for analytics) */}
              {activeTab === 'plantings' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Columnas a Incluir
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {columns.map((column, index) => (
                      <label key={column.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={column.enabled}
                          onChange={() => toggleColumnEnabled(index)}
                          className="mr-2"
                        />
                        <span className="text-sm">{column.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secciones del Análisis
                  </label>
                  <div className="space-y-2">
                    {analyticsSections.map((section, index) => (
                      <label key={section.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={section.enabled}
                          onChange={() => toggleSectionEnabled(index)}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium">{section.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab !== 'saved' && (
          <div className="flex justify-between items-center p-6 border-t border-gray-200">
            <button
              onClick={handleSaveReport}
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
            >
              💾 Guardar Configuración
            </button>
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                📊 Generar Reporte
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}