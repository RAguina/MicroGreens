// Constantes del sistema de microgreens

// Tipos de microgreens disponibles
export const TIPOS_MICROGREENS = [
  'brócoli',
  'rábano', 
  'girasol',
  'guisante',
  'rúcula',
  'amaranto'
] as const;

// Estados de siembra
export const ESTADOS_SIEMBRA = [
  'sembrado',
  'creciendo',
  'listo',
  'cosechado'
] as const;

// Opciones de calidad para cosechas
export const CALIDAD_OPTIONS = [1, 2, 3, 4, 5] as const;

// Labels para los tipos de microgreens
export const MICROGREEN_LABELS: Record<string, string> = {
  brócoli: 'Brócoli',
  rábano: 'Rábano',
  girasol: 'Girasol',
  guisante: 'Guisante',
  rúcula: 'Rúcula',
  amaranto: 'Amaranto',
};

// Labels para los estados
export const ESTADO_LABELS: Record<string, string> = {
  sembrado: 'Sembrado',
  creciendo: 'Creciendo',
  listo: 'Listo para cosechar',
  cosechado: 'Cosechado',
};

// Colores para los estados (compatibles con Tailwind)
export const ESTADO_COLORS: Record<string, string> = {
  sembrado: 'bg-status-sembrado text-white',
  creciendo: 'bg-status-creciendo text-white',
  listo: 'bg-status-listo text-white',
  cosechado: 'bg-status-cosechado text-white',
};

// Tiempos promedio de crecimiento (en días)
export const TIEMPOS_CRECIMIENTO: Record<string, number> = {
  brócoli: 7,
  rábano: 5,
  girasol: 8,
  guisante: 6,
  rúcula: 7,
  amaranto: 9,
};

// Rangos de peso esperado por bandeja (en gramos)
export const PESO_ESPERADO: Record<string, { min: number; max: number }> = {
  brócoli: { min: 80, max: 120 },
  rábano: { min: 60, max: 100 },
  girasol: { min: 100, max: 150 },
  guisante: { min: 90, max: 130 },
  rúcula: { min: 70, max: 110 },
  amaranto: { min: 50, max: 90 },
};

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

// Configuración de validación
export const VALIDATION = {
  MIN_CANTIDAD_SEMBRADA: 1,
  MAX_CANTIDAD_SEMBRADA: 1000,
  MIN_PESO_COSECHADO: 0.1,
  MAX_PESO_COSECHADO: 500,
  MAX_NOTAS_LENGTH: 500,
  UBICACION_PATTERN: /^[A-Z]\d+$/i, // Formato: A1, B2, etc.
} as const;

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Este campo es requerido',
  INVALID_EMAIL: 'Email inválido',
  INVALID_UBICACION: 'Formato de ubicación inválido (ej: A1, B2)',
  MIN_CANTIDAD: `La cantidad mínima es ${VALIDATION.MIN_CANTIDAD_SEMBRADA}g`,
  MAX_CANTIDAD: `La cantidad máxima es ${VALIDATION.MAX_CANTIDAD_SEMBRADA}g`,
  MIN_PESO: `El peso mínimo es ${VALIDATION.MIN_PESO_COSECHADO}g`,
  MAX_PESO: `El peso máximo es ${VALIDATION.MAX_PESO_COSECHADO}g`,
  MAX_NOTAS: `Máximo ${VALIDATION.MAX_NOTAS_LENGTH} caracteres`,
  NETWORK_ERROR: 'Error de conexión. Inténtalo nuevamente.',
  GENERIC_ERROR: 'Ocurrió un error inesperado',
} as const;

// Configuración de notificaciones
export const NOTIFICATIONS = {
  SUCCESS_DURATION: 3000,
  ERROR_DURATION: 5000,
  WARNING_DURATION: 4000,
} as const;