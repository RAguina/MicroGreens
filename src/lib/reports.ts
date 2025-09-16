import { Planting } from './plantings';
import {
  ReportConfig,
  PlantingsReportConfig,
  AnalyticsReportConfig,
  GeneratedReport,
  DateRange,
  ReportFilters,
  SortConfig
} from '@/types/reports';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Local storage key for saved reports
const SAVED_REPORTS_KEY = 'microgreens-saved-reports';

export class ReportsService {
  // Generate plantings report data
  static generatePlantingsReport(
    plantings: Planting[],
    config: PlantingsReportConfig
  ): Record<string, string | number | Date>[] {
    let filteredPlantings = this.applyFilters(plantings, config.filters, config.dateRange);

    // Apply sorting
    if (config.sorting.length > 0) {
      filteredPlantings = this.applySorting(filteredPlantings, config.sorting);
    }

    // Map to enabled columns only
    return filteredPlantings.map(planting => {
      const row: Record<string, string | number | Date> = {};

      config.columns.forEach(col => {
        if (!col.enabled) return;

        switch (col.key) {
          case 'plantName':
            row[col.label] = planting.plantName || 'Sin nombre';
            break;
          case 'datePlanted':
            row[col.label] = new Date(planting.datePlanted).toLocaleDateString('es-ES');
            break;
          case 'status':
            row[col.label] = this.getStatusText(planting.status);
            break;
          case 'daysFromPlanting':
            row[col.label] = this.getDaysFromPlanting(planting.datePlanted);
            break;
          case 'expectedHarvest':
            row[col.label] = planting.expectedHarvest
              ? new Date(planting.expectedHarvest).toLocaleDateString('es-ES')
              : '-';
            break;
          case 'domeDate':
            row[col.label] = planting.domeDate
              ? new Date(planting.domeDate).toLocaleDateString('es-ES')
              : '-';
            break;
          case 'lightDate':
            row[col.label] = planting.lightDate
              ? new Date(planting.lightDate).toLocaleDateString('es-ES')
              : '-';
            break;
          case 'trayNumber':
            row[col.label] = planting.trayNumber || '-';
            break;
          case 'quantity':
            row[col.label] = planting.quantity || '-';
            break;
          case 'notes':
            row[col.label] = planting.notes || '-';
            break;
          case 'efficiency':
            row[col.label] = this.calculateEfficiency(planting);
            break;
          case 'createdAt':
            row[col.label] = new Date(planting.createdAt).toLocaleDateString('es-ES');
            break;
        }
      });

      return row;
    });
  }

  // Generate analytics report data
  static generateAnalyticsReport(
    plantings: Planting[],
    config: AnalyticsReportConfig
  ): Record<string, unknown> {
    const filteredPlantings = this.applyFilters(plantings, config.filters || {}, config.dateRange);
    const analytics: Record<string, unknown> = {};

    config.sections.forEach(section => {
      if (!section.enabled) return;

      switch (section.key) {
        case 'executive_summary':
          analytics.executiveSummary = this.generateExecutiveSummary(filteredPlantings, config.dateRange);
          break;
        case 'status_distribution':
          analytics.statusDistribution = this.generateStatusDistribution(filteredPlantings);
          break;
        case 'top_plants':
          analytics.topPlants = this.generateTopPlants(filteredPlantings);
          break;
        case 'time_averages':
          analytics.timeAverages = this.generateTimeAverages(filteredPlantings);
          break;
        case 'efficiency_rates':
          analytics.efficiencyRates = this.generateEfficiencyRates(filteredPlantings);
          break;
        case 'monthly_trends':
          analytics.monthlyTrends = this.generateMonthlyTrends(filteredPlantings);
          break;
        case 'tray_performance':
          analytics.trayPerformance = this.generateTrayPerformance(filteredPlantings);
          break;
        case 'growth_cycle_analysis':
          analytics.growthCycleAnalysis = this.generateGrowthCycleAnalysis(filteredPlantings);
          break;
        case 'projections':
          analytics.projections = this.generateProjections(filteredPlantings);
          break;
      }
    });

    return analytics;
  }

  // Apply filters to plantings
  private static applyFilters(
    plantings: Planting[],
    filters: ReportFilters,
    dateRange: DateRange
  ): Planting[] {
    return plantings.filter(planting => {
      // Date range filter
      const plantedDate = new Date(planting.datePlanted);
      if (plantedDate < dateRange.start || plantedDate > dateRange.end) {
        return false;
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(planting.status)) {
          return false;
        }
      }

      // Plant names filter
      if (filters.plantNames && filters.plantNames.length > 0) {
        if (!filters.plantNames.includes(planting.plantName || '')) {
          return false;
        }
      }

      // Trays filter
      if (filters.trays && filters.trays.length > 0) {
        if (!filters.trays.includes(planting.trayNumber || '')) {
          return false;
        }
      }

      // Quantity range filter
      if (filters.quantityRange) {
        const quantity = planting.quantity || 0;
        if (filters.quantityRange.min && quantity < filters.quantityRange.min) {
          return false;
        }
        if (filters.quantityRange.max && quantity > filters.quantityRange.max) {
          return false;
        }
      }

      return true;
    });
  }

  // Apply sorting to plantings
  private static applySorting(plantings: Planting[], sorting: SortConfig[]): Planting[] {
    return plantings.sort((a, b) => {
      for (const sort of sorting) {
        let aVal: string | number | Date;
        let bVal: string | number | Date;

        switch (sort.field) {
          case 'plantName':
            aVal = a.plantName || '';
            bVal = b.plantName || '';
            break;
          case 'datePlanted':
            aVal = new Date(a.datePlanted);
            bVal = new Date(b.datePlanted);
            break;
          case 'status':
            aVal = a.status;
            bVal = b.status;
            break;
          case 'daysFromPlanting':
            aVal = this.getDaysFromPlanting(a.datePlanted);
            bVal = this.getDaysFromPlanting(b.datePlanted);
            break;
          case 'quantity':
            aVal = a.quantity || 0;
            bVal = b.quantity || 0;
            break;
          default:
            continue;
        }

        if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Helper methods for analytics calculations
  private static generateExecutiveSummary(plantings: Planting[], dateRange: DateRange) {
    const total = plantings.length;
    const harvested = plantings.filter(p => p.status === 'HARVESTED').length;
    const growing = plantings.filter(p => p.status === 'GROWING').length;
    const efficiency = total > 0 ? Math.round((harvested / total) * 100) : 0;

    return {
      period: `${dateRange.start.toLocaleDateString('es-ES')} - ${dateRange.end.toLocaleDateString('es-ES')}`,
      totalPlantings: total,
      harvestedCount: harvested,
      activeCount: growing,
      efficiencyRate: efficiency,
      avgDaysToHarvest: this.calculateAverageHarvestTime(plantings.filter(p => p.status === 'HARVESTED'))
    };
  }

  private static generateStatusDistribution(plantings: Planting[]) {
    const distribution = {
      PLANTED: 0,
      GROWING: 0,
      HARVESTED: 0,
      COMPOSTED: 0
    };

    plantings.forEach(p => {
      distribution[p.status]++;
    });

    return distribution;
  }

  private static generateTopPlants(plantings: Planting[]) {
    const plantCounts: { [key: string]: { total: number; harvested: number } } = {};

    plantings.forEach(p => {
      const name = p.plantName || 'Sin nombre';
      if (!plantCounts[name]) {
        plantCounts[name] = { total: 0, harvested: 0 };
      }
      plantCounts[name].total++;
      if (p.status === 'HARVESTED') {
        plantCounts[name].harvested++;
      }
    });

    return Object.entries(plantCounts)
      .map(([name, counts]) => ({
        plantName: name,
        totalCount: counts.total,
        harvestedCount: counts.harvested,
        successRate: counts.total > 0 ? Math.round((counts.harvested / counts.total) * 100) : 0
      }))
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 10);
  }

  private static generateTimeAverages(plantings: Planting[]) {
    const harvestedPlantings = plantings.filter(p => p.status === 'HARVESTED');

    return {
      avgHarvestTime: this.calculateAverageHarvestTime(harvestedPlantings),
      avgDomeTime: this.calculateAverageDomeTime(plantings),
      avgLightTime: this.calculateAverageLightTime(plantings)
    };
  }

  private static generateEfficiencyRates(plantings: Planting[]) {
    const total = plantings.length;
    const harvested = plantings.filter(p => p.status === 'HARVESTED').length;
    const composted = plantings.filter(p => p.status === 'COMPOSTED').length;

    return {
      overallEfficiency: total > 0 ? Math.round((harvested / total) * 100) : 0,
      lossRate: total > 0 ? Math.round((composted / total) * 100) : 0,
      activeRate: total > 0 ? Math.round(((total - harvested - composted) / total) * 100) : 0
    };
  }

  private static generateMonthlyTrends(plantings: Planting[]) {
    const monthsData: { [key: string]: { planted: number; harvested: number } } = {};

    plantings.forEach(p => {
      const plantedMonth = new Date(p.datePlanted).toISOString().slice(0, 7); // YYYY-MM
      if (!monthsData[plantedMonth]) {
        monthsData[plantedMonth] = { planted: 0, harvested: 0 };
      }
      monthsData[plantedMonth].planted++;

      if (p.status === 'HARVESTED') {
        monthsData[plantedMonth].harvested++;
      }
    });

    return Object.entries(monthsData)
      .map(([month, data]) => ({
        month,
        planted: data.planted,
        harvested: data.harvested,
        efficiency: data.planted > 0 ? Math.round((data.harvested / data.planted) * 100) : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private static generateTrayPerformance(plantings: Planting[]) {
    const trayData: { [key: string]: { total: number; harvested: number } } = {};

    plantings.forEach(p => {
      const tray = p.trayNumber || 'Sin bandeja';
      if (!trayData[tray]) {
        trayData[tray] = { total: 0, harvested: 0 };
      }
      trayData[tray].total++;
      if (p.status === 'HARVESTED') {
        trayData[tray].harvested++;
      }
    });

    return Object.entries(trayData)
      .map(([tray, data]) => ({
        trayNumber: tray,
        totalPlantings: data.total,
        harvestedPlantings: data.harvested,
        efficiency: data.total > 0 ? Math.round((data.harvested / data.total) * 100) : 0
      }))
      .sort((a, b) => b.efficiency - a.efficiency);
  }

  private static generateGrowthCycleAnalysis(plantings: Planting[]) {
    // Analysis of growth cycles, patterns, seasonal effects
    return {
      averageCycleLength: this.calculateAverageHarvestTime(plantings.filter(p => p.status === 'HARVESTED')),
      seasonalPatterns: this.analyzeSeasonalPatterns(),
      cyclePredictability: this.analyzeCyclePredictability()
    };
  }

  private static generateProjections(plantings: Planting[]) {
    // const activeCount = plantings.filter(p => p.status === 'GROWING' || p.status === 'PLANTED').length;
    // const avgHarvestTime = this.calculateAverageHarvestTime(plantings.filter(p => p.status === 'HARVESTED'));

    return {
      expectedHarvests30Days: this.projectHarvests(plantings, 30),
      expectedHarvests60Days: this.projectHarvests(plantings, 60),
      expectedHarvests90Days: this.projectHarvests(plantings, 90),
      recommendedPlantingSchedule: this.generatePlantingSchedule()
    };
  }

  // Utility methods
  private static getDaysFromPlanting(datePlanted: string): number {
    const planted = new Date(datePlanted);
    const now = new Date();
    return Math.ceil((now.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24));
  }

  private static getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PLANTED': 'Plantado',
      'GROWING': 'Creciendo',
      'HARVESTED': 'Cosechado',
      'COMPOSTED': 'Compostado'
    };
    return statusMap[status] || status;
  }

  private static calculateEfficiency(planting: Planting): string {
    if (planting.status !== 'HARVESTED') return '-';
    // Could implement more sophisticated efficiency calculation
    return '100%'; // Simplified for now
  }

  private static calculateAverageHarvestTime(harvestedPlantings: Planting[]): number {
    if (harvestedPlantings.length === 0) return 0;

    const totalDays = harvestedPlantings.reduce((sum, p) => {
      return sum + this.getDaysFromPlanting(p.datePlanted);
    }, 0);

    return Math.round(totalDays / harvestedPlantings.length);
  }

  private static calculateAverageDomeTime(plantings: Planting[]): number {
    const withDome = plantings.filter(p => p.domeDate);
    if (withDome.length === 0) return 0;

    const totalDays = withDome.reduce((sum, p) => {
      const planted = new Date(p.datePlanted);
      const dome = new Date(p.domeDate!);
      return sum + Math.ceil((dome.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);

    return Math.round(totalDays / withDome.length);
  }

  private static calculateAverageLightTime(plantings: Planting[]): number {
    const withLight = plantings.filter(p => p.lightDate);
    if (withLight.length === 0) return 0;

    const totalDays = withLight.reduce((sum, p) => {
      const planted = new Date(p.datePlanted);
      const light = new Date(p.lightDate!);
      return sum + Math.ceil((light.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);

    return Math.round(totalDays / withLight.length);
  }

  private static analyzeSeasonalPatterns() {
    // Placeholder for seasonal analysis
    return {
      bestPerformingSeasons: ['Primavera', 'Otoño'],
      seasonalEfficiency: {
        spring: 85,
        summer: 75,
        fall: 90,
        winter: 70
      }
    };
  }

  private static analyzeCyclePredictability() {
    // Placeholder for cycle predictability analysis
    return {
      predictabilityScore: 78,
      consistencyRating: 'Buena',
      recommendations: [
        'Mantener condiciones de luz constantes',
        'Optimizar riego en verano'
      ]
    };
  }

  private static projectHarvests(plantings: Planting[], days: number) {
    const activePlantings = plantings.filter(p => p.status === 'GROWING' || p.status === 'PLANTED');
    const avgHarvestTime = this.calculateAverageHarvestTime(plantings.filter(p => p.status === 'HARVESTED'));

    return activePlantings.filter(p => {
      const daysSincePlanted = this.getDaysFromPlanting(p.datePlanted);
      const estimatedHarvestDays = avgHarvestTime - daysSincePlanted;
      return estimatedHarvestDays <= days && estimatedHarvestDays > 0;
    }).length;
  }

  private static generatePlantingSchedule() {
    // Placeholder for intelligent planting schedule recommendations
    return [
      'Plantar 5-7 bandejas por semana para mantener producción constante',
      'Enfocar en plantas de alto rendimiento: Rúcula, Brócoli',
      'Reducir plantado de variedades con baja eficiencia en invierno'
    ];
  }

  // Save/load report configurations
  static saveReportConfig(config: ReportConfig): void {
    const saved = this.getSavedReports();
    const configWithId = {
      ...config,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    saved.push(configWithId);
    localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(saved));
  }

  static getSavedReports(): ReportConfig[] {
    const saved = localStorage.getItem(SAVED_REPORTS_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  static deleteSavedReport(id: string): void {
    const saved = this.getSavedReports();
    const updated = saved.filter(report => report.id !== id);
    localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(updated));
  }

  static toggleFavorite(id: string): void {
    const saved = this.getSavedReports();
    const updated = saved.map(report =>
      report.id === id
        ? { ...report, isFavorite: !report.isFavorite }
        : report
    );
    localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(updated));
  }

  // Generate and download files
  static async generateAndDownloadReport(
    plantings: Planting[],
    config: ReportConfig
  ): Promise<GeneratedReport> {
    const fileName = this.generateFileName(config);
    let data: Record<string, unknown>[] | Record<string, unknown>;

    if (config.type === 'plantings') {
      data = this.generatePlantingsReport(plantings, config as PlantingsReportConfig);
    } else {
      data = this.generateAnalyticsReport(plantings, config as AnalyticsReportConfig);
    }

    if (config.format === 'csv') {
      this.downloadCSV(data, fileName, config.type);
    } else if (config.format === 'pdf') {
      this.downloadPDF(data, fileName, config);
    } else if (config.format === 'json') {
      this.downloadJSON(data, fileName);
    }

    return {
      config,
      data,
      generatedAt: new Date(),
      fileName: `${fileName}.${config.format}`
    };
  }

  private static generateFileName(config: ReportConfig): string {
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const safeName = config.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    return `${safeName}_${date}`;
  }

  private static downloadCSV(data: Record<string, unknown>[] | Record<string, unknown>, fileName: string, reportType: string): void {
    if (reportType === 'analytics') {
      // For analytics, convert the object structure to CSV format
      const csvContent = this.convertAnalyticsToCSV(data as Record<string, unknown>);
      this.triggerDownload(csvContent, `${fileName}.csv`, 'text/csv');
      return;
    }

    if (data.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Get headers from the first row
    const headers = Object.keys((data as Record<string, unknown>[])[0]);
    const csvContent = [
      headers.join(','), // Header row
      ...(data as Record<string, unknown>[]).map(row =>
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    this.triggerDownload(csvContent, `${fileName}.csv`, 'text/csv');
  }

  private static convertAnalyticsToCSV(analytics: Record<string, unknown>): string {
    const rows: string[] = [];

    // Add executive summary
    if (analytics.executiveSummary) {
      const summary = analytics.executiveSummary as Record<string, unknown>;
      rows.push('RESUMEN EJECUTIVO');
      rows.push(`Período,${summary.period || 'N/A'}`);
      rows.push(`Total Siembras,${summary.totalPlantings || 0}`);
      rows.push(`Cosechadas,${summary.harvestedCount || 0}`);
      rows.push(`Activas,${summary.activeCount || 0}`);
      rows.push(`Eficiencia,${summary.efficiencyRate || 0}%`);
      rows.push(`Promedio Días Cosecha,${summary.avgDaysToHarvest || 0}`);
      rows.push('');
    }

    // Add status distribution
    if (analytics.statusDistribution) {
      rows.push('DISTRIBUCIÓN POR ESTADO');
      rows.push('Estado,Cantidad');
      Object.entries(analytics.statusDistribution).forEach(([status, count]) => {
        rows.push(`${status},${count}`);
      });
      rows.push('');
    }

    // Add top plants
    if (analytics.topPlants) {
      rows.push('PLANTAS MÁS EXITOSAS');
      rows.push('Planta,Total,Cosechadas,Tasa Éxito %');
      (analytics.topPlants as Array<{ plantName: string; totalCount: number; harvestedCount: number; successRate: number }>).forEach((plant) => {
        rows.push(`${plant.plantName},${plant.totalCount},${plant.harvestedCount},${plant.successRate}`);
      });
      rows.push('');
    }

    // Add monthly trends
    if (analytics.monthlyTrends) {
      rows.push('TENDENCIAS MENSUALES');
      rows.push('Mes,Plantadas,Cosechadas,Eficiencia %');
      (analytics.monthlyTrends as Array<{ month: string; planted: number; harvested: number; efficiency: number }>).forEach((trend) => {
        rows.push(`${trend.month},${trend.planted},${trend.harvested},${trend.efficiency}`);
      });
    }

    return rows.join('\n');
  }

  private static downloadPDF(data: Record<string, unknown>[] | Record<string, unknown>, fileName: string, config: ReportConfig): void {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text(config.name, 20, 30);

    // Add generation date
    doc.setFontSize(12);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 20, 45);

    if (config.type === 'plantings') {
      this.generatePlantingsPDF(doc, data as Record<string, unknown>[]);
    } else {
      this.generateAnalyticsPDF(doc, data as Record<string, unknown>);
    }

    doc.save(`${fileName}.pdf`);
  }

  private static generatePlantingsPDF(doc: jsPDF, data: Record<string, unknown>[]): void {
    if (data.length === 0) {
      doc.text('No hay datos para mostrar', 20, 70);
      return;
    }

    // Prepare table data
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(header => String(row[header] || '-')));

    // Add table using autoTable
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 60,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [34, 197, 94], // Green color
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251] // Light gray
      },
      columnStyles: {
        // Adjust column widths based on content
        0: { cellWidth: 'auto' },
      },
      margin: { top: 60, left: 20, right: 20 },
      didDrawPage: () => {
        // Add page numbers
        const pageNumber = (doc as jsPDF & { internal: { getCurrentPageInfo(): { pageNumber: number } } }).internal.getCurrentPageInfo().pageNumber;
        const pageCount = (doc as jsPDF & { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(
          `Página ${pageNumber} de ${pageCount}`,
          (doc as jsPDF & { internal: { pageSize: { width: number; height: number } } }).internal.pageSize.width - 50,
          (doc as jsPDF & { internal: { pageSize: { width: number; height: number } } }).internal.pageSize.height - 10
        );
      }
    });

    // Add summary at the end
    const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 100;
    doc.setFontSize(12);
    doc.text(`Total de registros: ${data.length}`, 20, finalY + 20);
  }

  private static generateAnalyticsPDF(doc: jsPDF, analytics: Record<string, unknown>): void {
    let currentY = 60;

    // Executive Summary
    if (analytics.executiveSummary) {
      doc.setFontSize(16);
      doc.text('Resumen Ejecutivo', 20, currentY);
      currentY += 15;

      doc.setFontSize(11);
      const summary = analytics.executiveSummary as Record<string, unknown>;
      doc.text(`Período: ${summary.period || 'N/A'}`, 25, currentY);
      doc.text(`Total Siembras: ${summary.totalPlantings || 0}`, 25, currentY + 8);
      doc.text(`Cosechadas: ${summary.harvestedCount || 0}`, 25, currentY + 16);
      doc.text(`Activas: ${summary.activeCount || 0}`, 25, currentY + 24);
      doc.text(`Eficiencia: ${summary.efficiencyRate || 0}%`, 25, currentY + 32);
      doc.text(`Promedio días cosecha: ${summary.avgDaysToHarvest || 0}`, 25, currentY + 40);
      currentY += 55;
    }

    // Status Distribution
    if (analytics.statusDistribution) {
      doc.setFontSize(16);
      doc.text('Distribución por Estado', 20, currentY);
      currentY += 10;

      autoTable(doc, {
        head: [['Estado', 'Cantidad']],
        body: Object.entries(analytics.statusDistribution).map(([status, count]) => [status, count]),
        startY: currentY,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [34, 197, 94] },
        margin: { left: 25, right: 20 }
      });

      currentY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || currentY + 20;
    }

    // Top Plants
    if (analytics.topPlants && Array.isArray(analytics.topPlants) && analytics.topPlants.length > 0) {
      doc.setFontSize(16);
      doc.text('Plantas Más Exitosas', 20, currentY);
      currentY += 10;

      autoTable(doc, {
        head: [['Planta', 'Total', 'Cosechadas', 'Éxito %']],
        body: (analytics.topPlants as Array<{ plantName: string; totalCount: number; harvestedCount: number; successRate: number }>).map(plant => [
          plant.plantName,
          plant.totalCount,
          plant.harvestedCount,
          `${plant.successRate}%`
        ]),
        startY: currentY,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [34, 197, 94] },
        margin: { left: 25, right: 20 }
      });

      currentY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || currentY + 20;
    }

    // Monthly Trends
    if (analytics.monthlyTrends && Array.isArray(analytics.monthlyTrends) && analytics.monthlyTrends.length > 0) {
      // Add new page if needed
      if (currentY > doc.internal.pageSize.height - 80) {
        doc.addPage();
        currentY = 30;
      }

      doc.setFontSize(16);
      doc.text('Tendencias Mensuales', 20, currentY);
      currentY += 10;

      autoTable(doc, {
        head: [['Mes', 'Plantadas', 'Cosechadas', 'Eficiencia %']],
        body: (analytics.monthlyTrends as Array<{ month: string; planted: number; harvested: number; efficiency: number }>).map(trend => [
          trend.month,
          trend.planted,
          trend.harvested,
          `${trend.efficiency}%`
        ]),
        startY: currentY,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [34, 197, 94] },
        margin: { left: 25, right: 20 }
      });
    }

    // Add page numbers
    const pageCount = (doc as jsPDF & { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Página ${i} de ${pageCount}`,
        (doc as jsPDF & { internal: { pageSize: { width: number; height: number } } }).internal.pageSize.width - 50,
        (doc as jsPDF & { internal: { pageSize: { width: number; height: number } } }).internal.pageSize.height - 10
      );
    }
  }

  private static downloadJSON(data: Record<string, unknown>[] | Record<string, unknown>, fileName: string): void {
    const jsonContent = JSON.stringify(data, null, 2);
    this.triggerDownload(jsonContent, `${fileName}.json`, 'application/json');
  }

  private static triggerDownload(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}