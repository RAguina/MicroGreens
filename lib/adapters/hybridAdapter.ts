/**
 * 🔄 Hybrid Model Adapter v2.0
 * 
 * Adaptadores para el Modelo Híbrido v2.0 que maneja:
 * - PlantTypes (catálogo de plantas)
 * - Plantings (siembras con estados)
 * - Harvests (múltiples cosechas por siembra)
 * 
 * Mantiene compatibilidad con el frontend legacy.
 */

import { 
  PlantType,
  Planting, 
  PlantingStatus,
  Harvest, 
  HarvestQuality,
  Siembra, 
  SiembraFormData,
  Cosecha,
  CosechaFormData,
  mapQualityToEnum,
  mapEnumToQuality 
} from '../types';
import { MICROGREEN_LABELS } from '../constants';
import { addDays, parseISO, formatISO } from 'date-fns';

// ==============================================
// 🏷️ PLANT TYPES ADAPTERS
// ==============================================

/**
 * Convierte PlantType a etiqueta de microgreen legacy
 */
export const plantTypeToMicrogreenLabel = (plantType: PlantType): string => {
  const normalized = plantType.name.toLowerCase();
  
  // Buscar coincidencias con los tipos conocidos
  for (const [key, label] of Object.entries(MICROGREEN_LABELS)) {
    if (normalized.includes(key.toLowerCase()) || 
        normalized.includes(label.toLowerCase())) {
      return key;
    }
  }
  
  // Fallback: extraer palabra después de "microgreen de"
  const match = normalized.match(/microgreen de (\w+)/);
  if (match) {
    return match[1];
  }
  
  // Fallback final
  return 'rúcula';
};

/**
 * Obtiene PlantType por nombre legacy de microgreen
 */
export const getMicrogreenPlantType = (
  tipoMicrogreen: string, 
  plantTypes: PlantType[]
): PlantType | undefined => {
  const targetLabel = MICROGREEN_LABELS[tipoMicrogreen] || tipoMicrogreen;
  
  return plantTypes.find(pt => {
    const plantNameLower = pt.name.toLowerCase();
    const tipoLower = tipoMicrogreen.toLowerCase();
    
    // Buscar coincidencia exacta por nombre
    if (plantNameLower === tipoLower) {
      return true;
    }
    
    // Buscar por labels hardcodeadas (compatibilidad legacy)
    if (plantNameLower.includes(targetLabel.toLowerCase()) ||
        plantNameLower.includes(`microgreen de ${tipoMicrogreen}`)) {
      return true;
    }
    
    return false;
  });
};

// ==============================================
// 🌱 PLANTING STATUS MAPPERS
// ==============================================

/**
 * Convierte PlantingStatus a estado legacy de Siembra
 */
export const mapPlantingStatusToSiembraEstado = (status: PlantingStatus): Siembra['estado'] => {
  const statusMap: Record<PlantingStatus, Siembra['estado']> = {
    'PLANTED': 'sembrado',
    'GERMINATING': 'sembrado',
    'GROWING': 'creciendo',
    'READY_TO_HARVEST': 'listo',
    'HARVESTED': 'cosechado',
    'FAILED': 'sembrado' // Mapear a sembrado por compatibilidad
  };
  
  return statusMap[status];
};

/**
 * Convierte estado legacy de Siembra a PlantingStatus
 */
export const mapSiembraEstadoToPlantingStatus = (estado: Siembra['estado']): PlantingStatus => {
  const estadoMap: Record<Siembra['estado'], PlantingStatus> = {
    'sembrado': 'PLANTED',
    'creciendo': 'GROWING',
    'listo': 'READY_TO_HARVEST',
    'cosechado': 'HARVESTED'
  };
  
  return estadoMap[estado];
};

/**
 * Determina el estado inteligente basado en fechas y cosechas
 */
export const determineIntelligentStatus = (planting: Planting): PlantingStatus => {
  const now = new Date();
  const datePlanted = parseISO(planting.datePlanted);
  const expectedHarvest = planting.expectedHarvest ? parseISO(planting.expectedHarvest) : null;
  
  // Si tiene cosechas, está cosechado
  if (planting.harvests && planting.harvests.length > 0) {
    return 'HARVESTED';
  }
  
  // Si tiene yield legacy, también está cosechado
  if (planting.yield && planting.yield > 0) {
    return 'HARVESTED';
  }
  
  // Si pasó la fecha esperada de cosecha, está listo
  if (expectedHarvest && now >= expectedHarvest) {
    return 'READY_TO_HARVEST';
  }
  
  // Si han pasado más de 3 días desde la siembra, está creciendo
  const daysSincePlanted = Math.floor((now.getTime() - datePlanted.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSincePlanted >= 3) {
    return 'GROWING';
  }
  
  // Si han pasado 1-2 días, está germinando
  if (daysSincePlanted >= 1) {
    return 'GERMINATING';
  }
  
  // Recién plantado
  return 'PLANTED';
};

// ==============================================
// 🔄 MAIN ADAPTERS: PLANTING ↔ SIEMBRA
// ==============================================

/**
 * Convierte Planting (v2.0) a Siembra (legacy) para compatibilidad frontend
 */
export const plantingToSiembra = (planting: Planting, plantTypes?: PlantType[]): Siembra => {
  // Determinar tipo de microgreen
  let tipoMicrogreen = 'rúcula'; // default
  
  if (planting.plantType) {
    tipoMicrogreen = plantTypeToMicrogreenLabel(planting.plantType);
  } else if (planting.plantName) {
    // Extraer de plantName legacy
    const match = planting.plantName.toLowerCase().match(/microgreen de (\w+)/);
    if (match) {
      tipoMicrogreen = match[1];
    }
  }
  
  // Extraer ubicación de bandeja (de trayNumber o notes)
  let ubicacionBandeja = planting.trayNumber || 'A1';
  if (!planting.trayNumber && planting.notes) {
    const bandejMatch = planting.notes.match(/bandeja:?\s*([A-Z]\d+)/i);
    if (bandejMatch) {
      ubicacionBandeja = bandejMatch[1].toUpperCase();
    }
  }
  
  // Limpiar notas quitando información de bandeja
  let notasLimpias = planting.notes || '';
  if (planting.trayNumber) {
    notasLimpias = notasLimpias
      .replace(new RegExp(`bandeja:?\\s*${planting.trayNumber}`, 'gi'), '')
      .replace(new RegExp(`\\b${planting.trayNumber}\\b`, 'g'), '')
      .replace(/^[\s\.,]+|[\s\.,]+$/g, '') // Limpiar espacios y puntos
      .trim();
  }
  
  // Determinar fecha real de cosecha desde harvests
  let fechaRealCosecha: string | undefined;
  if (planting.harvests && planting.harvests.length > 0) {
    // Usar la fecha de la primera cosecha
    fechaRealCosecha = planting.harvests[0].harvestDate.split('T')[0];
  }
  
  // Manejar fechas como strings ISO
  const fechaSiembra = typeof planting.datePlanted === 'string' 
    ? planting.datePlanted.split('T')[0] 
    : planting.datePlanted;
    
  const fechaEsperadaCosecha = planting.expectedHarvest
    ? (typeof planting.expectedHarvest === 'string' 
        ? planting.expectedHarvest.split('T')[0] 
        : planting.expectedHarvest)
    : fechaSiembra; // fallback
  
  return {
    id: planting.id,
    tipo_microgreen: tipoMicrogreen,
    fecha_siembra: fechaSiembra,
    cantidad_sembrada: planting.quantity ?? 0,
    ubicacion_bandeja: ubicacionBandeja,
    fecha_esperada_cosecha: fechaEsperadaCosecha,
    fecha_real_cosecha: fechaRealCosecha,
    estado: mapPlantingStatusToSiembraEstado(planting.status),
    notas: notasLimpias,
    created_at: planting.createdAt,
    updated_at: planting.updatedAt,
  };
};

/**
 * Convierte SiembraFormData (legacy) a PlantingFormData (v2.0)
 */
export const siembraFormDataToPlantingFormData = (
  siembraData: SiembraFormData,
  plantTypes?: PlantType[],
  userId?: string
): { plantingData: any; shouldCreatePlantType?: PlantType } => {
  console.log('🔄 [hybridAdapter] Convirtiendo datos:', {
    tipo_microgreen: siembraData.tipo_microgreen,
    plantTypesCount: plantTypes?.length || 0,
    plantTypesNames: plantTypes?.map(pt => pt.name) || []
  });
  
  // Buscar PlantType existente
  const plantType = plantTypes ? getMicrogreenPlantType(siembraData.tipo_microgreen, plantTypes) : undefined;
  
  console.log('🔍 [hybridAdapter] PlantType encontrado:', plantType ? {
    id: plantType.id,
    name: plantType.name,
    daysToHarvest: plantType.daysToHarvest
  } : 'NO ENCONTRADO');
  
  let plantingData: any = {
    datePlanted: siembraData.fecha_siembra,
    quantity: siembraData.cantidad_sembrada,
    trayNumber: siembraData.ubicacion_bandeja,
    status: 'PLANTED' as PlantingStatus,
    userId
  };
  
  if (plantType) {
    // Usar PlantType existente
    plantingData.plantTypeId = plantType.id;
    
    // Auto-calcular expectedHarvest si no se proporciona
    if (!siembraData.fecha_esperada_cosecha && plantType.daysToHarvest) {
      const plantedDate = parseISO(siembraData.fecha_siembra);
      const expectedDate = addDays(plantedDate, plantType.daysToHarvest);
      plantingData.expectedHarvest = formatISO(expectedDate, { representation: 'date' });
    } else if (siembraData.fecha_esperada_cosecha) {
      plantingData.expectedHarvest = siembraData.fecha_esperada_cosecha;
    }
  } else {
    // Fallback: usar plantName legacy
    plantingData.plantName = `Microgreen de ${MICROGREEN_LABELS[siembraData.tipo_microgreen] || siembraData.tipo_microgreen}`;
    plantingData.expectedHarvest = siembraData.fecha_esperada_cosecha || 
      formatISO(addDays(parseISO(siembraData.fecha_siembra), 7), { representation: 'date' });
    
    // Crear PlantType sugerido para admin
    const suggestedPlantType: PlantType = {
      id: '',
      name: `Microgreen de ${MICROGREEN_LABELS[siembraData.tipo_microgreen] || siembraData.tipo_microgreen}`,
      category: 'Microgreens',
      daysToHarvest: 7,
      difficulty: 'Easy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return { 
      plantingData, 
      shouldCreatePlantType: suggestedPlantType 
    };
  }
  
  // Agregar notas con información de bandeja si es necesario
  const notesArray = [];
  if (siembraData.notas && siembraData.notas.trim()) {
    notesArray.push(siembraData.notas.trim());
  }
  
  plantingData.notes = notesArray.length > 0 ? notesArray.join('. ') : undefined;
  
  return { plantingData };
};

// ==============================================
// 🌾 HARVEST ↔ COSECHA ADAPTERS
// ==============================================

/**
 * Convierte Harvest (v2.0) a Cosecha (legacy)
 */
export const harvestToCosecha = (harvest: Harvest): Cosecha => {
  return {
    id: harvest.id,
    siembra_id: harvest.plantingId,
    fecha_cosecha: harvest.harvestDate.split('T')[0],
    peso_cosechado: harvest.weight,
    calidad: mapEnumToQuality(harvest.quality),
    notas: harvest.notes || '',
    created_at: harvest.createdAt,
  };
};

/**
 * Convierte CosechaFormData (legacy) a HarvestFormData (v2.0)
 */
export const cosechaFormDataToHarvestFormData = (cosechaData: CosechaFormData): any => {
  return {
    plantingId: cosechaData.siembra_id,
    harvestDate: cosechaData.fecha_cosecha,
    weight: cosechaData.peso_cosechado,
    quality: mapQualityToEnum(cosechaData.calidad),
    notes: cosechaData.notas,
    // Valores por defecto para métricas de calidad
    appearance: Math.min(10, cosechaData.calidad * 2),
    taste: Math.min(10, cosechaData.calidad * 2),
    freshness: Math.min(10, cosechaData.calidad * 2),
  };
};

/**
 * Convierte array de Harvests a Cosechas
 */
export const harvestsToCosechas = (harvests: Harvest[]): Cosecha[] => {
  return harvests.map(harvestToCosecha);
};

/**
 * Convierte array de Plantings a Siembras
 */
export const plantingsToSiembras = (plantings: Planting[], plantTypes?: PlantType[]): Siembra[] => {
  return plantings.map(planting => plantingToSiembra(planting, plantTypes));
};

// ==============================================
// 🧪 UTILITY FUNCTIONS
// ==============================================

/**
 * Calcula estadísticas agregadas desde Plantings y Harvests
 */
export const calculateAggregatedStats = (plantings: Planting[], harvests: Harvest[]) => {
  const totalPlantings = plantings.length;
  const harvestedPlantings = plantings.filter(p => p.status === 'HARVESTED').length;
  const totalHarvests = harvests.length;
  const totalWeight = harvests.reduce((sum, h) => sum + h.weight, 0);
  
  return {
    totalPlantings,
    harvestedPlantings,
    totalHarvests,
    totalWeight: Math.round(totalWeight * 10) / 10,
    successRate: totalPlantings > 0 ? Math.round((harvestedPlantings / totalPlantings) * 100) : 0,
    averageWeight: totalHarvests > 0 ? Math.round((totalWeight / totalHarvests) * 10) / 10 : 0,
  };
};

/**
 * Agrupa harvests por planting para crear relaciones
 */
export const groupHarvestsByPlanting = (harvests: Harvest[]): Record<string, Harvest[]> => {
  return harvests.reduce((acc, harvest) => {
    if (!acc[harvest.plantingId]) {
      acc[harvest.plantingId] = [];
    }
    acc[harvest.plantingId].push(harvest);
    return acc;
  }, {} as Record<string, Harvest[]>);
};

/**
 * Debug: Muestra la transformación de un Planting
 */
export const debugPlantingTransformation = (planting: Planting, plantTypes?: PlantType[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔄 Hybrid Model Transformation Debug');
    console.log('Backend Planting (v2.0):', planting);
    console.log('Frontend Siembra (legacy):', plantingToSiembra(planting, plantTypes));
    
    if (planting.harvests && planting.harvests.length > 0) {
      console.log('Harvests (v2.0):', planting.harvests);
      console.log('Cosechas (legacy):', harvestsToCosechas(planting.harvests));
    }
    console.groupEnd();
  }
};