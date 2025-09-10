// Tipos de autenticación
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator';
  avatar: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Tipos de siembras
export interface Siembra {
  id: string;
  tipo_microgreen: 'brócoli' | 'rábano' | 'girasol' | 'guisante' | 'rúcula' | 'amaranto';
  fecha_siembra: string;
  cantidad_sembrada: number; // gramos de semilla
  ubicacion_bandeja: string; // 'A1', 'B2', etc.
  fecha_esperada_cosecha: string;
  fecha_real_cosecha?: string;
  estado: 'sembrado' | 'creciendo' | 'listo' | 'cosechado';
  notas?: string;
  created_at: string;
  updated_at: string;
}

// Tipos de cosechas
export interface Cosecha {
  id: string;
  siembra_id: string;
  fecha_cosecha: string;
  peso_cosechado: number; // gramos
  calidad: 1 | 2 | 3 | 4 | 5; // estrellas
  notas?: string;
  created_at: string;
}

// Tipos de estadísticas
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

// Tipos de formularios
export interface SiembraFormData {
  tipo_microgreen: Siembra['tipo_microgreen'];
  fecha_siembra: string;
  cantidad_sembrada: number;
  ubicacion_bandeja: string;
  notas?: string;
}

export interface CosechaFormData {
  siembra_id: string;
  fecha_cosecha: string;
  peso_cosechado: number;
  calidad: Cosecha['calidad'];
  notas?: string;
}

// Constantes
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