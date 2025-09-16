export interface PlantVariety {
  id: string;
  name: string;
  category: PlantCategory;
  description: string;
  growthDays: number; // Días promedio hasta cosecha
  domeDays?: number; // Días bajo cúpula
  lightDays?: number; // Días bajo luz
  difficulty: DifficultyLevel;
  characteristics: PlantCharacteristics;
  growingTips: string[];
  nutritionalInfo?: NutritionalInfo;
  seeds: SeedInfo;
  harvestInfo: HarvestInfo;
  tags: string[];
  isCustom: boolean; // Si es creada por el usuario o viene predefinida
  createdAt: Date;
  updatedAt: Date;
}

export type PlantCategory =
  | 'brassicas' // Brócoli, col rizada, rúcula
  | 'legumes' // Guisantes, lentejas
  | 'herbs' // Albahaca, cilantro
  | 'greens' // Espinaca, acelga
  | 'grains' // Trigo, cebada
  | 'flowers' // Girasol, calendula
  | 'other';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface PlantCharacteristics {
  color: string;
  height: string; // ej: "2-5 cm"
  texture: string;
  flavor: string;
  appearance: string;
}

export interface NutritionalInfo {
  vitamins: string[];
  minerals: string[];
  benefits: string[];
  caloriesPer100g?: number;
}

export interface SeedInfo {
  soakingTime?: number; // horas
  density: string; // ej: "2-3 cucharadas por bandeja"
  germination: string; // ej: "1-3 días"
  storage: string;
}

export interface HarvestInfo {
  indicators: string[]; // Señales de que está listo
  method: string;
  storage: string;
  shelfLife: string;
}

export interface PlantVarietyFormData {
  name: string;
  category: PlantCategory;
  description: string;
  growthDays: number;
  domeDays?: number;
  lightDays?: number;
  difficulty: DifficultyLevel;
  color: string;
  height: string;
  texture: string;
  flavor: string;
  appearance: string;
  vitamins: string;
  minerals: string;
  benefits: string;
  soakingTime?: number;
  density: string;
  germination: string;
  seedStorage: string;
  harvestIndicators: string;
  harvestMethod: string;
  harvestStorage: string;
  shelfLife: string;
  growingTips: string;
  tags: string;
}

// Predefined plant varieties
export const PREDEFINED_VARIETIES: Omit<PlantVariety, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: "Brócoli",
    category: "brassicas",
    description: "Microverdes de brócoli con sabor suave y textura crujiente. Ricos en vitaminas y antioxidantes.",
    growthDays: 8,
    domeDays: 3,
    lightDays: 5,
    difficulty: "easy",
    characteristics: {
      color: "Verde oscuro",
      height: "2-4 cm",
      texture: "Crujiente",
      flavor: "Suave, ligeramente picante",
      appearance: "Hojas pequeñas redondeadas"
    },
    growingTips: [
      "Mantén el sustrato húmedo pero no encharcado",
      "Proporciona luz indirecta después de la germinación",
      "Cosecha cuando las primeras hojas verdaderas aparezcan"
    ],
    nutritionalInfo: {
      vitamins: ["Vitamina C", "Vitamina K", "Folato"],
      minerals: ["Hierro", "Calcio", "Potasio"],
      benefits: ["Antioxidante", "Antiinflamatorio", "Detoxificante"]
    },
    seeds: {
      soakingTime: 8,
      density: "2 cucharadas por bandeja 10x20",
      germination: "1-2 días",
      storage: "Lugar fresco y seco, hasta 3 años"
    },
    harvestInfo: {
      indicators: ["Cotiledones completamente abiertos", "Primeras hojas verdaderas visibles"],
      method: "Cortar con tijeras limpias",
      storage: "Refrigerador en contenedor hermético",
      shelfLife: "5-7 días"
    },
    tags: ["fácil", "nutritivo", "popular"]
  },
  {
    name: "Rúcula",
    category: "brassicas",
    description: "Microverdes de rúcula con sabor picante distintivo. Excelente para ensaladas y platos gourmet.",
    growthDays: 7,
    domeDays: 2,
    lightDays: 5,
    difficulty: "easy",
    characteristics: {
      color: "Verde brillante",
      height: "3-5 cm",
      texture: "Tierna",
      flavor: "Picante, nuez",
      appearance: "Hojas alargadas y dentadas"
    },
    growingTips: [
      "Crece muy rápido, vigilar para no dejar pasar el punto",
      "Prefiere temperaturas frescas",
      "Regar con spray fino para evitar hongos"
    ],
    nutritionalInfo: {
      vitamins: ["Vitamina A", "Vitamina C", "Vitamina K"],
      minerals: ["Calcio", "Hierro", "Magnesio"],
      benefits: ["Digestivo", "Antioxidante", "Estimulante"]
    },
    seeds: {
      soakingTime: 4,
      density: "1.5 cucharadas por bandeja 10x20",
      germination: "1-2 días",
      storage: "Lugar fresco y seco, hasta 4 años"
    },
    harvestInfo: {
      indicators: ["Cotiledones bien desarrollados", "Altura de 3-4 cm"],
      method: "Cortar justo sobre el sustrato",
      storage: "Refrigerador, envuelto en papel húmedo",
      shelfLife: "4-6 días"
    },
    tags: ["picante", "gourmet", "rápido"]
  },
  {
    name: "Guisantes",
    category: "legumes",
    description: "Microverdes de guisantes dulces y crujientes. Perfectos para agregar frescura a cualquier plato.",
    growthDays: 12,
    domeDays: 4,
    lightDays: 8,
    difficulty: "medium",
    characteristics: {
      color: "Verde claro",
      height: "5-8 cm",
      texture: "Crujiente y jugosa",
      flavor: "Dulce, sabor a guisante fresco",
      appearance: "Hojas redondeadas con zarcillos"
    },
    growingTips: [
      "Remojar semillas 12-24 horas antes de sembrar",
      "Requieren más espacio entre semillas",
      "Crecen en altura, asegurar suficiente luz"
    ],
    nutritionalInfo: {
      vitamins: ["Vitamina A", "Vitamina C", "Tiamina"],
      minerals: ["Hierro", "Fósforo", "Potasio"],
      benefits: ["Energético", "Proteína vegetal", "Fibra"]
    },
    seeds: {
      soakingTime: 12,
      density: "3 cucharadas por bandeja 10x20",
      germination: "2-4 días",
      storage: "Lugar fresco y seco, hasta 2 años"
    },
    harvestInfo: {
      indicators: ["Aparición de zarcillos", "Altura de 6-8 cm"],
      method: "Cortar con tijeras, incluir tallos tiernos",
      storage: "Refrigerador en bolsa perforada",
      shelfLife: "3-5 días"
    },
    tags: ["dulce", "crujiente", "alto"]
  }
];