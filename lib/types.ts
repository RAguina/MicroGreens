// =====================================
// 🌱 MicroGreens Types - Modelo Híbrido v2.0
// =====================================

// Tipos de autenticación
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'GROWER' | 'VIEWER';
  createdAt: string;
  updatedAt: string;
  plantingsCount?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// =====================================
// 🏷️ PLANT TYPES (Catálogo de Plantas)
// =====================================

export interface PlantType {
  id: string;
  name: string;
  scientificName?: string;
  category?: string;
  description?: string;
  
  // Growing parameters
  daysToGerminate?: number;
  daysToHarvest?: number;
  optimalTemp?: number;
  optimalHumidity?: number;
  lightRequirement?: 'Low' | 'Medium' | 'High';
  
  // Business data
  averageYield?: number;
  marketPrice?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  
  // Relations count
  _count?: {
    plantings: number;
  };
}

export interface PlantTypeFormData {
  name: string;
  scientificName?: string;
  category?: string;
  description?: string;
  daysToGerminate?: number;
  daysToHarvest?: number;
  optimalTemp?: number;
  optimalHumidity?: number;
  lightRequirement?: PlantType['lightRequirement'];
  averageYield?: number;
  marketPrice?: number;
  difficulty?: PlantType['difficulty'];
}

// =====================================
// 🌱 PLANTINGS (Siembras)
// =====================================

export type PlantingStatus = 
  | 'PLANTED' 
  | 'GERMINATING' 
  | 'GROWING' 
  | 'READY_TO_HARVEST' 
  | 'HARVESTED' 
  | 'FAILED';

export interface Planting {
  id: string;
  
  // Relación con catálogo
  plantTypeId?: string;
  plantType?: PlantType;
  
  // Legacy field (compatible)
  plantName?: string;
  
  // Core data
  datePlanted: string;
  expectedHarvest?: string;
  domeDate?: string;
  lightDate?: string;
  quantity?: number;
  
  // Status tracking
  status: PlantingStatus;
  
  // Ubicación física
  trayNumber?: string;
  
  // Legacy field (deprecado)
  yield?: number;
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  userId: string;
  
  // Relaciones
  harvests?: Harvest[];
  _count?: {
    harvests: number;
  };
}

export interface PlantingFormData {
  plantTypeId?: string;
  plantName?: string; // Legacy fallback
  datePlanted: string;
  expectedHarvest?: string;
  domeDate?: string;
  lightDate?: string;
  quantity?: number;
  status?: PlantingStatus;
  trayNumber?: string;
  notes?: string;
}

// =====================================
// 🌾 HARVESTS (Cosechas)
// =====================================

export type HarvestQuality = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

export interface Harvest {
  id: string;
  plantingId: string;
  
  // Harvest data
  harvestDate: string;
  weight: number;
  quality: HarvestQuality;
  notes?: string;
  
  // Market data
  pricePerGram?: number;
  totalValue?: number;
  
  // Quality metrics (1-10 scale)
  appearance?: number;
  taste?: number;
  freshness?: number;
  
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  
  // Relations
  planting?: Planting;
}

export interface HarvestFormData {
  plantingId: string;
  harvestDate: string;
  weight: number;
  quality: HarvestQuality;
  notes?: string;
  pricePerGram?: number;
  appearance?: number;
  taste?: number;
  freshness?: number;
}

// =====================================
// 🔄 COMPATIBILITY LAYER (Frontend Legacy)
// =====================================

// Mantener compatibilidad con frontend actual
export interface Siembra {
  id: string;
  tipo_microgreen: string;
  fecha_siembra: string;
  cantidad_sembrada: number;
  ubicacion_bandeja: string;
  fecha_esperada_cosecha: string;
  fecha_real_cosecha?: string;
  estado: 'sembrado' | 'creciendo' | 'listo' | 'cosechado';
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface Cosecha {
  id: string;
  siembra_id: string;
  fecha_cosecha: string;
  peso_cosechado: number;
  calidad: 1 | 2 | 3 | 4 | 5;
  notas?: string;
  created_at: string;
}

export interface SiembraFormData {
  tipo_microgreen: string;
  fecha_siembra: string;
  cantidad_sembrada: number;
  ubicacion_bandeja: string;
  fecha_esperada_cosecha?: string;
  notas?: string;
}

export interface CosechaFormData {
  siembra_id: string;
  fecha_cosecha: string;
  peso_cosechado: number;
  calidad: Cosecha['calidad'];
  notas?: string;
}

// =====================================
// 📊 ESTADÍSTICAS Y ANALYTICS
// =====================================

export interface EstadisticasDashboard {
  siembras_activas: number;
  cosechas_mes: number;
  peso_total_mes: number;
  rendimiento_promedio: number;
  proximas_cosechas: Siembra[];
  produccion_por_tipo: {
    tipo: string;
    cantidad: number;
    peso_total: number;
  }[];
}

export interface AnalyticsData {
  totalPlantings: number;
  totalHarvests: number;
  totalWeight: number;
  averageYield: number;
  successRate: number;
  
  // Por período
  thisMonth: {
    plantings: number;
    harvests: number;
    weight: number;
  };
  
  // Por tipo de planta
  byPlantType: {
    plantType: PlantType;
    totalPlantings: number;
    totalHarvests: number;
    averageWeight: number;
    averageQuality: number;
  }[];
  
  // Tendencias
  trends: {
    period: string;
    plantings: number;
    harvests: number;
    weight: number;
  }[];
}

// =====================================
// 🔧 API RESPONSES
// =====================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
    value: any;
  }>;
}

// =====================================
// 📝 CONSTANTES
// =====================================

export const PLANT_CATEGORIES = [
  'Microgreens',
  'Herbs',
  'Vegetables',
  'Flowers'
] as const;

export const DIFFICULTY_LEVELS = [
  'Easy',
  'Medium',
  'Hard'
] as const;

export const LIGHT_REQUIREMENTS = [
  'Low',
  'Medium', 
  'High'
] as const;

export const PLANTING_STATUSES = [
  'PLANTED',
  'GERMINATING', 
  'GROWING',
  'READY_TO_HARVEST',
  'HARVESTED',
  'FAILED'
] as const;

export const HARVEST_QUALITIES = [
  'EXCELLENT',
  'GOOD',
  'FAIR', 
  'POOR'
] as const;

// Legacy constants (mantener compatibilidad)
export const TIPOS_MICROGREENS = [
  'brócoli',
  'rábano', 
  'girasol',
  'guisante',
  'rúcula',
  'amaranto'
] as const;

export const ESTADOS_SIEMBRA = [
  'sembrado',
  'creciendo',
  'listo',
  'cosechado'
] as const;

export const CALIDAD_OPTIONS = [1, 2, 3, 4, 5] as const;

// =====================================
// 🔄 TYPE GUARDS Y HELPERS
// =====================================

export const isPlantingStatus = (status: string): status is PlantingStatus => {
  return PLANTING_STATUSES.includes(status as PlantingStatus);
};

export const isHarvestQuality = (quality: string): quality is HarvestQuality => {
  return HARVEST_QUALITIES.includes(quality as HarvestQuality);
};

export const isPlantCategory = (category: string): category is typeof PLANT_CATEGORIES[number] => {
  return PLANT_CATEGORIES.includes(category as any);
};

// Convertir quality numérica a enum
export const mapQualityToEnum = (quality: 1 | 2 | 3 | 4 | 5): HarvestQuality => {
  const qualityMap = {
    5: 'EXCELLENT',
    4: 'GOOD', 
    3: 'FAIR',
    2: 'POOR',
    1: 'POOR'
  } as const;
  
  return qualityMap[quality];
};

// Convertir enum a quality numérica
export const mapEnumToQuality = (quality: HarvestQuality): 1 | 2 | 3 | 4 | 5 => {
  const enumMap = {
    'EXCELLENT': 5,
    'GOOD': 4,
    'FAIR': 3,
    'POOR': 2
  } as const;
  
  return enumMap[quality];
};