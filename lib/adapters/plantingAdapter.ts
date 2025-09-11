/**
 * 🔄 Planting Adapter
 * 
 * Adaptadores para transformar datos entre el formato del backend (Planting)
 * y el formato del frontend (Siembra + Cosecha).
 */

import { BackendPlanting } from '../api';
import { Siembra, SiembraFormData, Cosecha } from '../types';
import { MICROGREEN_LABELS, TIEMPOS_CRECIMIENTO } from '../constants';
import { addDays, parseISO, formatISO } from 'date-fns';

// ==============================================
// 🎯 HELPER FUNCTIONS
// ==============================================

/**
 * Extrae el tipo de microgreen del plantName del backend
 */
const extractMicrogreenType = (plantName: string): string => {
  const normalized = plantName.toLowerCase();
  
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
 * Extrae la ubicación de bandeja de las notas
 */
const extractTrayLocation = (notes?: string): string => {
  if (!notes) return 'A1'; // Default
  
  // Buscar patrón "Bandeja: A1" o similar
  const bandejMatch = notes.match(/bandeja:?\s*([A-Z]\d+)/i);
  if (bandejMatch) {
    return bandejMatch[1].toUpperCase();
  }
  
  // Buscar patrón directo "A1", "B2", etc.
  const directMatch = notes.match(/\b([A-Z]\d+)\b/);
  if (directMatch) {
    return directMatch[1];
  }
  
  return 'A1'; // Default
};

/**
 * Limpia las notas removiendo información de bandeja ya extraída
 */
const cleanNotes = (notes?: string, trayLocation?: string): string => {
  if (!notes) return '';
  
  let cleaned = notes;
  
  // Remover información de bandeja
  if (trayLocation) {
    cleaned = cleaned
      .replace(new RegExp(`bandeja:?\\s*${trayLocation}`, 'gi'), '')
      .replace(new RegExp(`\\b${trayLocation}\\b`, 'g'), '');
  }
  
  // Limpiar espacios y puntos sobrantes
  cleaned = cleaned
    .replace(/^\s*[\.,]\s*/, '') // Punto/coma al inicio
    .replace(/\s*[\.,]\s*$/, '') // Punto/coma al final
    .replace(/\s+/g, ' ') // Múltiples espacios
    .trim();
  
  return cleaned;
};

/**
 * Determina el estado de la siembra basado en los datos del backend
 */
const determineStatus = (planting: BackendPlanting): Siembra['estado'] => {
  const now = new Date();
  
  // Manejar fecha planted como string ISO
  const plantedDateStr = typeof planting.datePlanted === 'string' 
    ? planting.datePlanted.split('T')[0] 
    : planting.datePlanted;
  const datePlanted = parseISO(plantedDateStr);
  
  // Si tiene yield (no null/undefined), está cosechado
  if (planting.yield != null && planting.yield > 0) {
    return 'cosechado';
  }
  
  // Si pasó la fecha esperada de cosecha, está listo
  if (planting.expectedHarvest) {
    const expectedDateStr = typeof planting.expectedHarvest === 'string' 
      ? planting.expectedHarvest.split('T')[0] 
      : planting.expectedHarvest;
    const expectedHarvest = parseISO(expectedDateStr);
    
    if (now >= expectedHarvest) {
      return 'listo';
    }
  }
  
  // Si han pasado más de 3 días desde la siembra, está creciendo
  const daysSincePlanted = Math.floor((now.getTime() - datePlanted.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSincePlanted >= 3) {
    return 'creciendo';
  }
  
  // Recién sembrado
  return 'sembrado';
};

/**
 * Calcula la fecha esperada de cosecha si no está especificada
 */
const calculateExpectedHarvest = (datePlanted: string, microgreenType: string): string => {
  const plantedDate = parseISO(datePlanted);
  const growthDays = TIEMPOS_CRECIMIENTO[microgreenType] || 7;
  const expectedDate = addDays(plantedDate, growthDays);
  return formatISO(expectedDate, { representation: 'date' });
};

/**
 * Estima la fecha de cosecha real basada en cuándo se actualizó el yield
 */
const estimateHarvestDate = (planting: BackendPlanting): string | undefined => {
  if (!planting.yield || planting.yield <= 0) return undefined;
  
  // Si la fecha de actualización es diferente a la de creación, probablemente fue cuando se cosechó
  if (planting.updatedAt !== planting.createdAt) {
    return parseISO(planting.updatedAt).toISOString().split('T')[0];
  }
  
  return undefined;
};

// ==============================================
// 🔄 MAIN ADAPTERS
// ==============================================

/**
 * Convierte un Planting del backend a una Siembra del frontend
 */
export const backendToFrontendSiembra = (planting: BackendPlanting): Siembra => {
  const microgreenType = extractMicrogreenType(planting.plantName);
  const trayLocation = extractTrayLocation(planting.notes);
  const cleanedNotes = cleanNotes(planting.notes, trayLocation);
  
  // Manejar fechas como string ISO (ya convertidas por la API)
  const fechaSiembra = typeof planting.datePlanted === 'string' 
    ? planting.datePlanted.split('T')[0] // Extraer solo la fecha
    : planting.datePlanted;
  
  return {
    id: planting.id,
    tipo_microgreen: microgreenType as any,
    fecha_siembra: fechaSiembra,
    cantidad_sembrada: planting.quantity ?? 0, // Manejar null/undefined
    ubicacion_bandeja: trayLocation,
    fecha_esperada_cosecha: planting.expectedHarvest 
      ? (typeof planting.expectedHarvest === 'string' 
          ? planting.expectedHarvest.split('T')[0] 
          : planting.expectedHarvest)
      : calculateExpectedHarvest(fechaSiembra, microgreenType),
    fecha_real_cosecha: estimateHarvestDate(planting),
    estado: determineStatus(planting),
    notas: cleanedNotes,
    created_at: planting.createdAt,
    updated_at: planting.updatedAt,
  };
};

/**
 * Convierte una SiembraFormData del frontend a formato backend
 */
export const frontendToBackendPlanting = (siembraData: SiembraFormData, userId?: string): {
  plantName: string;
  datePlanted: string;
  expectedHarvest?: string;
  quantity?: number;
  notes?: string;
  userId?: string; // Requerido en Prisma, pero opcional hasta implementar auth
} => {
  const plantName = `Microgreen de ${MICROGREEN_LABELS[siembraData.tipo_microgreen]}`;
  const expectedHarvest = siembraData.fecha_esperada_cosecha || 
                         calculateExpectedHarvest(siembraData.fecha_siembra, siembraData.tipo_microgreen);
  
  // Construir notas con información de bandeja
  const notesArray = [];
  if (siembraData.ubicacion_bandeja) {
    notesArray.push(`Bandeja: ${siembraData.ubicacion_bandeja}`);
  }
  if (siembraData.notas && siembraData.notas.trim()) {
    notesArray.push(siembraData.notas.trim());
  }
  
  return {
    plantName,
    datePlanted: siembraData.fecha_siembra,
    expectedHarvest,
    quantity: siembraData.cantidad_sembrada,
    notes: notesArray.length > 0 ? notesArray.join('. ') : undefined,
    userId, // Se pasará cuando tengamos autenticación real
  };
};

/**
 * Actualiza un Planting existente con datos de Siembra del frontend
 */
export const updateBackendPlanting = (
  existingPlanting: BackendPlanting,
  updates: Partial<SiembraFormData>
): Partial<BackendPlanting> => {
  const result: Partial<BackendPlanting> = {};
  
  if (updates.tipo_microgreen) {
    result.plantName = `Microgreen de ${MICROGREEN_LABELS[updates.tipo_microgreen]}`;
  }
  
  if (updates.fecha_siembra) {
    result.datePlanted = updates.fecha_siembra;
  }
  
  if (updates.cantidad_sembrada !== undefined) {
    result.quantity = updates.cantidad_sembrada;
  }
  
  if (updates.ubicacion_bandeja || updates.notas !== undefined) {
    const trayLocation = updates.ubicacion_bandeja || extractTrayLocation(existingPlanting.notes);
    const notesArray = [];
    
    if (trayLocation) {
      notesArray.push(`Bandeja: ${trayLocation}`);
    }
    
    if (updates.notas !== undefined && updates.notas.trim()) {
      notesArray.push(updates.notas.trim());
    }
    
    result.notes = notesArray.join('. ');
  }
  
  // Recalcular fecha esperada si cambió el tipo o fecha de siembra
  if (updates.tipo_microgreen || updates.fecha_siembra) {
    const microgreenType = updates.tipo_microgreen || extractMicrogreenType(existingPlanting.plantName);
    const datePlanted = updates.fecha_siembra || existingPlanting.datePlanted;
    result.expectedHarvest = calculateExpectedHarvest(datePlanted, microgreenType);
  }
  
  return result;
};

// ==============================================
// 🌾 COSECHA ADAPTERS
// ==============================================

/**
 * Convierte un Planting cosechado a una Cosecha del frontend
 */
export const backendToFrontendCosecha = (
  planting: BackendPlanting,
  customId?: string
): Cosecha | null => {
  // Solo convertir si tiene yield (fue cosechado)
  if (!planting.yield || planting.yield <= 0) {
    return null;
  }
  
  const harvestDate = estimateHarvestDate(planting) || 
                     parseISO(planting.updatedAt).toISOString().split('T')[0];
  
  // Estimar calidad basada en el rendimiento vs esperado
  const microgreenType = extractMicrogreenType(planting.plantName);
  const expectedYield = (planting.quantity || 50) * 0.8; // Asumimos 80% de conversión
  const yieldRatio = planting.yield / expectedYield;
  
  let calidad: Cosecha['calidad'];
  if (yieldRatio >= 1.2) calidad = 5;
  else if (yieldRatio >= 1.0) calidad = 4;
  else if (yieldRatio >= 0.8) calidad = 3;
  else if (yieldRatio >= 0.6) calidad = 2;
  else calidad = 1;
  
  return {
    id: customId || `${planting.id}-harvest`,
    siembra_id: planting.id,
    fecha_cosecha: harvestDate,
    peso_cosechado: planting.yield,
    calidad,
    notas: `Cosecha automática. Rendimiento: ${Math.round(yieldRatio * 100)}%`,
    created_at: planting.updatedAt,
  };
};

/**
 * Actualiza un Planting con datos de cosecha
 */
export const updatePlantingWithHarvest = (
  plantingId: string,
  cosechaData: {
    fecha_cosecha: string;
    peso_cosechado: number;
    calidad: number;
    notas?: string;
  }
): Partial<BackendPlanting> => {
  const notesArray = [];
  
  // Agregar información de cosecha a las notas
  notesArray.push(`Cosechado: ${cosechaData.peso_cosechado}g`);
  notesArray.push(`Calidad: ${cosechaData.calidad}/5 estrellas`);
  
  if (cosechaData.notas && cosechaData.notas.trim()) {
    notesArray.push(cosechaData.notas.trim());
  }
  
  return {
    yield: cosechaData.peso_cosechado,
    notes: notesArray.join('. '),
  };
};

// ==============================================
// 🧪 UTILITY FUNCTIONS
// ==============================================

/**
 * Convierte un array de Plantings a Siembras
 */
export const convertPlantingsToSiembras = (plantings: BackendPlanting[]): Siembra[] => {
  return plantings.map(backendToFrontendSiembra);
};

/**
 * Convierte un array de Plantings cosechados a Cosechas
 */
export const convertPlantingsToCosechas = (plantings: BackendPlanting[]): Cosecha[] => {
  return plantings
    .map(planting => backendToFrontendCosecha(planting))
    .filter((cosecha): cosecha is Cosecha => cosecha !== null);
};

/**
 * Valida que un Planting tenga los campos mínimos para ser convertido
 */
export const isValidPlanting = (planting: any): planting is BackendPlanting => {
  return (
    planting &&
    typeof planting.id === 'string' &&
    typeof planting.plantName === 'string' &&
    typeof planting.datePlanted === 'string' &&
    typeof planting.createdAt === 'string' &&
    typeof planting.updatedAt === 'string'
  );
};

/**
 * Debug: Muestra la transformación de un Planting
 */
export const debugPlantingTransformation = (planting: BackendPlanting) => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔄 Planting Transformation Debug');
    console.log('Backend Planting:', planting);
    console.log('Frontend Siembra:', backendToFrontendSiembra(planting));
    
    const cosecha = backendToFrontendCosecha(planting);
    if (cosecha) {
      console.log('Frontend Cosecha:', cosecha);
    } else {
      console.log('No harvest data (yield not set)');
    }
    console.groupEnd();
  }
};