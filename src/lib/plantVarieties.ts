import {
  PlantVariety,
  PlantVarietyFormData,
  PREDEFINED_VARIETIES,
  PlantCategory,
  DifficultyLevel
} from '@/types/plantVarieties';

// Local storage key for custom varieties
const CUSTOM_VARIETIES_KEY = 'microgreens-custom-varieties';

export class PlantVarietiesService {
  // Get all varieties (predefined + custom)
  static getAllVarieties(): PlantVariety[] {
    const customVarieties = this.getCustomVarieties();
    const predefinedVarieties = this.getPredefinedVarieties();

    return [...predefinedVarieties, ...customVarieties];
  }

  // Get predefined varieties
  static getPredefinedVarieties(): PlantVariety[] {
    return PREDEFINED_VARIETIES.map((variety, index) => ({
      ...variety,
      id: `predefined-${index}`,
      isCustom: false,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    }));
  }

  // Get custom varieties from localStorage
  static getCustomVarieties(): PlantVariety[] {
    try {
      const saved = localStorage.getItem(CUSTOM_VARIETIES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading custom varieties:', error);
      return [];
    }
  }

  // Get variety by ID
  static getVarietyById(id: string): PlantVariety | undefined {
    return this.getAllVarieties().find(variety => variety.id === id);
  }

  // Get varieties by category
  static getVarietiesByCategory(category: PlantCategory): PlantVariety[] {
    return this.getAllVarieties().filter(variety => variety.category === category);
  }

  // Search varieties
  static searchVarieties(query: string): PlantVariety[] {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return this.getAllVarieties();

    return this.getAllVarieties().filter(variety =>
      variety.name.toLowerCase().includes(searchTerm) ||
      variety.description.toLowerCase().includes(searchTerm) ||
      variety.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      variety.characteristics.flavor.toLowerCase().includes(searchTerm)
    );
  }

  // Create new custom variety
  static createCustomVariety(formData: PlantVarietyFormData): PlantVariety {
    const newVariety: PlantVariety = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: formData.name,
      category: formData.category,
      description: formData.description,
      growthDays: formData.growthDays,
      domeDays: formData.domeDays,
      lightDays: formData.lightDays,
      difficulty: formData.difficulty,
      characteristics: {
        color: formData.color,
        height: formData.height,
        texture: formData.texture,
        flavor: formData.flavor,
        appearance: formData.appearance
      },
      growingTips: formData.growingTips.split('\n').filter(tip => tip.trim()),
      nutritionalInfo: {
        vitamins: formData.vitamins.split(',').map(v => v.trim()).filter(v => v),
        minerals: formData.minerals.split(',').map(m => m.trim()).filter(m => m),
        benefits: formData.benefits.split(',').map(b => b.trim()).filter(b => b)
      },
      seeds: {
        soakingTime: formData.soakingTime,
        density: formData.density,
        germination: formData.germination,
        storage: formData.seedStorage
      },
      harvestInfo: {
        indicators: formData.harvestIndicators.split('\n').filter(i => i.trim()),
        method: formData.harvestMethod,
        storage: formData.harvestStorage,
        shelfLife: formData.shelfLife
      },
      tags: formData.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag),
      isCustom: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to localStorage
    const customVarieties = this.getCustomVarieties();
    customVarieties.push(newVariety);
    localStorage.setItem(CUSTOM_VARIETIES_KEY, JSON.stringify(customVarieties));

    return newVariety;
  }

  // Update custom variety
  static updateCustomVariety(id: string, formData: PlantVarietyFormData): PlantVariety {
    const customVarieties = this.getCustomVarieties();
    const index = customVarieties.findIndex(variety => variety.id === id);

    if (index === -1) {
      throw new Error('Variedad no encontrada');
    }

    const existingVariety = customVarieties[index];
    if (!existingVariety.isCustom) {
      throw new Error('No se pueden editar variedades predefinidas');
    }

    const updatedVariety: PlantVariety = {
      ...existingVariety,
      name: formData.name,
      category: formData.category,
      description: formData.description,
      growthDays: formData.growthDays,
      domeDays: formData.domeDays,
      lightDays: formData.lightDays,
      difficulty: formData.difficulty,
      characteristics: {
        color: formData.color,
        height: formData.height,
        texture: formData.texture,
        flavor: formData.flavor,
        appearance: formData.appearance
      },
      growingTips: formData.growingTips.split('\n').filter(tip => tip.trim()),
      nutritionalInfo: {
        vitamins: formData.vitamins.split(',').map(v => v.trim()).filter(v => v),
        minerals: formData.minerals.split(',').map(m => m.trim()).filter(m => m),
        benefits: formData.benefits.split(',').map(b => b.trim()).filter(b => b)
      },
      seeds: {
        soakingTime: formData.soakingTime,
        density: formData.density,
        germination: formData.germination,
        storage: formData.seedStorage
      },
      harvestInfo: {
        indicators: formData.harvestIndicators.split('\n').filter(i => i.trim()),
        method: formData.harvestMethod,
        storage: formData.harvestStorage,
        shelfLife: formData.shelfLife
      },
      tags: formData.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag),
      updatedAt: new Date()
    };

    customVarieties[index] = updatedVariety;
    localStorage.setItem(CUSTOM_VARIETIES_KEY, JSON.stringify(customVarieties));

    return updatedVariety;
  }

  // Delete custom variety
  static deleteCustomVariety(id: string): void {
    const customVarieties = this.getCustomVarieties();
    const variety = customVarieties.find(v => v.id === id);

    if (!variety) {
      throw new Error('Variedad no encontrada');
    }

    if (!variety.isCustom) {
      throw new Error('No se pueden eliminar variedades predefinidas');
    }

    const updatedVarieties = customVarieties.filter(v => v.id !== id);
    localStorage.setItem(CUSTOM_VARIETIES_KEY, JSON.stringify(updatedVarieties));
  }

  // Get statistics
  static getStatistics() {
    const allVarieties = this.getAllVarieties();
    const customCount = allVarieties.filter(v => v.isCustom).length;
    const predefinedCount = allVarieties.filter(v => !v.isCustom).length;

    const categoryCounts = allVarieties.reduce((acc, variety) => {
      acc[variety.category] = (acc[variety.category] || 0) + 1;
      return acc;
    }, {} as Record<PlantCategory, number>);

    const difficultyCounts = allVarieties.reduce((acc, variety) => {
      acc[variety.difficulty] = (acc[variety.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<DifficultyLevel, number>);

    return {
      total: allVarieties.length,
      custom: customCount,
      predefined: predefinedCount,
      byCategory: categoryCounts,
      byDifficulty: difficultyCounts
    };
  }

  // Get variety options for dropdowns
  static getVarietyOptions(): Array<{ value: string; label: string }> {
    return this.getAllVarieties().map(variety => ({
      value: variety.name,
      label: variety.name
    }));
  }

  // Get category options
  static getCategoryOptions(): Array<{ value: PlantCategory; label: string }> {
    return [
      { value: 'brassicas', label: 'Brasicáceas (Brócoli, Rúcula, Col)' },
      { value: 'legumes', label: 'Leguminosas (Guisantes, Lentejas)' },
      { value: 'herbs', label: 'Hierbas (Albahaca, Cilantro)' },
      { value: 'greens', label: 'Hojas Verdes (Espinaca, Acelga)' },
      { value: 'grains', label: 'Granos (Trigo, Cebada)' },
      { value: 'flowers', label: 'Flores (Girasol, Caléndula)' },
      { value: 'other', label: 'Otras' }
    ];
  }

  // Get difficulty options
  static getDifficultyOptions(): Array<{ value: DifficultyLevel; label: string }> {
    return [
      { value: 'easy', label: 'Fácil - Ideal para principiantes' },
      { value: 'medium', label: 'Intermedio - Requiere algo de experiencia' },
      { value: 'hard', label: 'Difícil - Para cultivadores experimentados' }
    ];
  }

  // Export custom varieties
  static exportCustomVarieties(): string {
    const customVarieties = this.getCustomVarieties();
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      varieties: customVarieties
    }, null, 2);
  }

  // Import custom varieties
  static importCustomVarieties(jsonData: string): number {
    try {
      const importData = JSON.parse(jsonData);

      if (!importData.varieties || !Array.isArray(importData.varieties)) {
        throw new Error('Formato de archivo inválido');
      }

      const existingVarieties = this.getCustomVarieties();
      const newVarieties = importData.varieties.filter((newVariety: PlantVariety) =>
        !existingVarieties.some(existing => existing.name === newVariety.name)
      );

      if (newVarieties.length === 0) {
        throw new Error('No se encontraron variedades nuevas para importar');
      }

      const updatedVarieties = [...existingVarieties, ...newVarieties];
      localStorage.setItem(CUSTOM_VARIETIES_KEY, JSON.stringify(updatedVarieties));

      return newVarieties.length;
    } catch (error) {
      throw new Error(`Error al importar variedades: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}