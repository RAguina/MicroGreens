// 🌱 Application Constants - Simple & Clean

// Status display configurations
export const STATUS_LABELS = {
  'PLANTED': 'Plantado',
  'GERMINATING': 'Germinando', 
  'GROWING': 'Creciendo',
  'READY_TO_HARVEST': 'Listo',
  'HARVESTED': 'Cosechado',
  'FAILED': 'Fallido'
} as const;

export const STATUS_COLORS = {
  'PLANTED': 'bg-gray-100 text-gray-800',
  'GERMINATING': 'bg-yellow-100 text-yellow-800',
  'GROWING': 'bg-blue-100 text-blue-800', 
  'READY_TO_HARVEST': 'bg-green-100 text-green-800',
  'HARVESTED': 'bg-gray-100 text-gray-600',
  'FAILED': 'bg-red-100 text-red-800'
} as const;

export const QUALITY_LABELS = {
  'EXCELLENT': 'Excelente',
  'GOOD': 'Buena',
  'FAIR': 'Regular',
  'POOR': 'Mala'
} as const;

export const QUALITY_COLORS = {
  'EXCELLENT': 'text-green-600',
  'GOOD': 'text-blue-600',
  'FAIR': 'text-yellow-600', 
  'POOR': 'text-red-600'
} as const;

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
} as const;

// Formatos de fecha
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  INPUT: 'yyyy-MM-dd',
  TIMESTAMP: 'yyyy-MM-dd HH:mm:ss',
} as const;

// Validation rules
export const VALIDATION = {
  // Planting constraints
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 1000,
  
  // Harvest constraints  
  MIN_WEIGHT: 0.1,
  MAX_WEIGHT: 1000,
  
  // General constraints
  MAX_NOTES_LENGTH: 500,
  MAX_NAME_LENGTH: 100,
  
  // Quality metrics (1-10 scale)
  MIN_QUALITY_SCORE: 1,
  MAX_QUALITY_SCORE: 10,
} as const;

// Common error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Este campo es requerido',
  INVALID_EMAIL: 'Email inválido',
  MIN_QUANTITY: `La cantidad mínima es ${VALIDATION.MIN_QUANTITY}`,
  MAX_QUANTITY: `La cantidad máxima es ${VALIDATION.MAX_QUANTITY}`,
  MIN_WEIGHT: `El peso mínimo es ${VALIDATION.MIN_WEIGHT}g`,
  MAX_WEIGHT: `El peso máximo es ${VALIDATION.MAX_WEIGHT}g`,
  MAX_NOTES: `Máximo ${VALIDATION.MAX_NOTES_LENGTH} caracteres`,
  NETWORK_ERROR: 'Error de conexión. Inténtalo nuevamente.',
  GENERIC_ERROR: 'Ocurrió un error inesperado',
} as const;

// Configuración de notificaciones
export const NOTIFICATIONS = {
  SUCCESS_DURATION: 3000,
  ERROR_DURATION: 5000,
  WARNING_DURATION: 4000,
} as const;