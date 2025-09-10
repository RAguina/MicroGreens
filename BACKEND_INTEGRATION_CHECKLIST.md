# 🔗 Backend Integration Checklist - MicroGreens

> **Estado actual:** Frontend completamente funcional con mock data. Backend API documentado y listo para integración.

## 📋 **Análisis de Preparación para Integración Backend**

### 🎯 **Resumen Ejecutivo**

El frontend tiene **95% de preparación** para backend integration. El sistema actual usa hooks personalizados con mock data, lo que facilita la transición a APIs reales con cambios mínimos.

---

## 🔍 **Mapeo de Datos: Frontend ↔ Backend**

### **Problema Crítico Detectado: Incompatibilidad de Esquemas**

#### **Frontend (Actual)**
```typescript
// lib/types.ts - Sistema actual
interface Siembra {
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

interface Cosecha {
  id: string;
  siembra_id: string;
  fecha_cosecha: string;
  peso_cosechado: number; // gramos
  calidad: 1 | 2 | 3 | 4 | 5; // estrellas
  notas?: string;
  created_at: string;
}
```

#### **Backend (API Documentation)**
```typescript
// API_DOCUMENTATION.md - Backend actual
interface Planting {
  id: string; // UUID
  plantName: string; // "Microgreen de Brócoli"
  datePlanted: string; // ISO8601
  expectedHarvest?: string; // ISO8601
  domeDate?: string; // ISO8601
  lightDate?: string; // ISO8601
  quantity?: number; // cantidad de plantas
  yield?: number; // rendimiento en gramos
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
```

### 🚨 **Incompatibilidades Detectadas**

1. **Campos Faltantes en Backend:**
   - `ubicacion_bandeja` (bandeja/ubicación)
   - `estado` (sembrado/creciendo/listo/cosechado)
   - `tipo_microgreen` (tipo específico de microgreen)
   - `fecha_real_cosecha` (fecha real de cosecha)

2. **Campos Extras en Backend:**
   - `domeDate` (no usado en frontend)
   - `lightDate` (no usado en frontend)
   - `deletedAt` (soft delete)

3. **Diferencias de Naming:**
   - Frontend: `fecha_siembra` → Backend: `datePlanted`
   - Frontend: `cantidad_sembrada` → Backend: `quantity`
   - Frontend: `fecha_esperada_cosecha` → Backend: `expectedHarvest`
   - Frontend: `created_at` → Backend: `createdAt`

4. **Sistema de Cosechas:**
   - **Frontend:** Tabla separada `Cosecha` con `siembra_id`
   - **Backend:** Campo `yield` dentro de `Planting` (sin cosechas separadas)

---

## ✅ **Plan de Acción para Integración**

### **Opción A: Adaptar Frontend al Backend (Recomendado - Menos Cambios)**

#### **1. Crear Adaptador/Transformer Layer**

```typescript
// lib/adapters/backendAdapter.ts
interface BackendPlanting {
  id: string;
  plantName: string;
  datePlanted: string;
  expectedHarvest?: string;
  domeDate?: string;
  lightDate?: string;
  quantity?: number;
  yield?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

interface FrontendSiembra {
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

// Transformadores
export const backendToFrontend = (backendPlanting: BackendPlanting): FrontendSiembra => ({
  id: backendPlanting.id,
  tipo_microgreen: extractMicrogreenType(backendPlanting.plantName), // Extraer de plantName
  fecha_siembra: backendPlanting.datePlanted,
  cantidad_sembrada: backendPlanting.quantity || 0,
  ubicacion_bandeja: extractTrayLocation(backendPlanting.notes), // Extraer de notes temporalmente
  fecha_esperada_cosecha: backendPlanting.expectedHarvest || '',
  fecha_real_cosecha: backendPlanting.yield ? estimateHarvestDate(backendPlanting) : undefined,
  estado: determineStatus(backendPlanting),
  notas: backendPlanting.notes || '',
  created_at: backendPlanting.createdAt,
  updated_at: backendPlanting.updatedAt,
});

export const frontendToBackend = (frontendSiembra: FrontendSiembra): Partial<BackendPlanting> => ({
  plantName: `Microgreen de ${MICROGREEN_LABELS[frontendSiembra.tipo_microgreen]}`,
  datePlanted: frontendSiembra.fecha_siembra,
  expectedHarvest: frontendSiembra.fecha_esperada_cosecha,
  quantity: frontendSiembra.cantidad_sembrada,
  notes: `Bandeja: ${frontendSiembra.ubicacion_bandeja}. ${frontendSiembra.notas || ''}`.trim(),
  yield: frontendSiembra.estado === 'cosechado' ? extractYieldFromNotes(frontendSiembra.notas) : undefined,
});
```

#### **2. Actualizar API Client**

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include', // Para cookies HttpOnly
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Plantings CRUD
  async getPlantings(page = 1, searchTerm = '') {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: '10' 
    });
    
    if (searchTerm) params.append('plantName', searchTerm);
    
    return this.request<{data: BackendPlanting[], pagination: any}>(`/api/plantings?${params}`);
  }

  async createPlanting(data: Partial<BackendPlanting>) {
    return this.request<BackendPlanting>('/api/plantings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePlanting(id: string, data: Partial<BackendPlanting>) {
    return this.request<BackendPlanting>(`/api/plantings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePlanting(id: string) {
    return this.request(`/api/plantings/${id}`, {
      method: 'DELETE',
    });
  }

  async getPlanting(id: string) {
    return this.request<BackendPlanting>(`/api/plantings/${id}`);
  }
}

export const apiClient = new ApiClient();
```

#### **3. Actualizar Hooks para usar API Real**

```typescript
// hooks/useSiembras.ts - Versión integrada con backend
export function useSiembras(options: UseSiembrasOptions = {}) {
  const { autoload = true, filters } = options;
  
  const [siembras, setSiembras] = useState<Siembra[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSiembras = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getPlantings();
      
      // Transformar datos del backend al frontend
      const transformedSiembras = response.data.map(backendToFrontend);
      
      // Aplicar filtros locales si existen
      let filtered = transformedSiembras;
      if (filters) {
        // ... lógica de filtros
      }
      
      setSiembras(filtered);
    } catch (err) {
      setError('Error al cargar las siembras');
      console.error('Error fetching siembras:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const createSiembra = useCallback(async (data: SiembraFormData): Promise<Siembra> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Transformar datos del frontend al backend
      const backendData = frontendToBackend({
        ...data,
        id: '',
        estado: 'sembrado',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      const response = await apiClient.createPlanting(backendData);
      const newSiembra = backendToFrontend(response);
      
      setSiembras(prev => [newSiembra, ...prev]);
      
      return newSiembra;
    } catch (err) {
      const errorMessage = 'Error al crear la siembra';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ... resto de métodos CRUD
}
```

### **Opción B: Modificar Backend (Más Trabajo)**

Requeriría cambios en el backend para añadir:
- Campo `tray_location` (ubicación de bandeja)
- Campo `status` (estado de la siembra)
- Campo `microgreen_type` (tipo de microgreen)
- Tabla separada para `harvests` (cosechas)

---

## 🛠️ **Archivos que Necesitan Modificación**

### **Alto Impacto - Requeridos**

1. **`lib/api.ts`** ❌ No existe
   - Crear cliente API completo
   - Manejo de errores centralizado
   - Configuración de cookies

2. **`lib/adapters/backendAdapter.ts`** ❌ No existe
   - Transformadores bidireccionales
   - Lógica de mapeo de campos
   - Extracción de datos de strings

3. **`hooks/useSiembras.ts`** ⚠️ Modificar
   - Reemplazar mock data con API calls
   - Mantener interfaz actual
   - Agregar manejo de errores de red

4. **`hooks/useCosechas.ts`** ⚠️ Modificar
   - Adaptar para usar campo `yield` de backend
   - Simular cosechas separadas desde plantings

5. **`lib/types.ts`** ⚠️ Modificar
   - Agregar tipos de backend
   - Mantener tipos actuales del frontend

### **Medio Impacto - Opcionales**

6. **`.env.local`** ❌ Crear
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

7. **`middleware.ts`** ⚠️ Modificar
   - Configurar para cookies del backend
   - Ajustar nombre de cookie si es diferente

8. **`lib/auth.ts`** ⚠️ Modificar
   - Adaptar para autenticación real cuando se implemente
   - Mantener compatibilidad con sistema actual

### **Bajo Impacto - Mantenimiento**

9. **`lib/constants.ts`** ✅ OK
   - Ya preparado para backend

10. **Componentes UI** ✅ OK
    - No requieren cambios

---

## 🧪 **Plan de Testing**

### **Fase 1: Verificación de Conectividad**
```bash
# Test básico de conectividad
curl http://localhost:5000/health

# Test de endpoints principales
curl http://localhost:5000/api/plantings
```

### **Fase 2: Testing de Transformadores**
```typescript
// tests/adapters.test.ts
describe('Backend Adapter', () => {
  test('should transform backend planting to frontend siembra', () => {
    const backendPlanting = {
      id: 'test-id',
      plantName: 'Microgreen de Brócoli',
      datePlanted: '2025-01-10T00:00:00.000Z',
      quantity: 50,
      // ...
    };
    
    const result = backendToFrontend(backendPlanting);
    
    expect(result.tipo_microgreen).toBe('brócoli');
    expect(result.cantidad_sembrada).toBe(50);
    // ...
  });
});
```

### **Fase 3: Testing de Integración**
- Probar CRUD completo con backend real
- Verificar manejo de errores
- Validar transformación de datos

---

## 📅 **Cronograma de Implementación**

### **Semana 1: Preparación**
- [ ] Configurar environment variables
- [ ] Crear `lib/api.ts`
- [ ] Implementar adaptadores básicos

### **Semana 2: Integración Core**
- [ ] Modificar `useSiembras` para usar API
- [ ] Adaptar sistema de cosechas
- [ ] Testing básico de conectividad

### **Semana 3: Refinamiento**
- [ ] Manejo de errores avanzado
- [ ] Optimización de performance
- [ ] Testing exhaustivo

### **Semana 4: Deploy**
- [ ] Configuración de production
- [ ] Monitoring y logs
- [ ] Documentación final

---

## 🎯 **Próximos Pasos Inmediatos**

1. **Crear `lib/api.ts`** - Cliente API base
2. **Implementar adaptadores** - Transformación de datos
3. **Modificar `useSiembras.ts`** - Primer hook con backend
4. **Test de conectividad** - Verificar integración básica

### **Comando de Inicio Rápido**
```bash
# 1. Configurar variables de entorno
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# 2. Verificar backend
curl http://localhost:5000/health

# 3. Test de endpoint principal
curl http://localhost:5000/api/plantings
```

---

## ⚠️ **Riesgos y Consideraciones**

### **Riesgos Técnicos**
- **Incompatibilidad de esquemas:** Resuelta con adaptadores
- **Pérdida de funcionalidad:** Sistema de cosechas necesita adaptación
- **Performance:** Transformaciones agregan overhead mínimo

### **Consideraciones UX**
- **Estados de carga:** Ya implementados
- **Manejo de errores:** Necesita adaptación a errores de red
- **Offline fallback:** No implementado (futuro)

### **Compatibilidad**
- **Versioning:** API no versionada aún
- **Breaking changes:** Adaptadores protegen el frontend

---

## 📊 **Métricas de Éxito**

- ✅ **Conectividad:** Backend responde correctamente
- ✅ **Funcionalidad:** Todas las features actuales siguen funcionando
- ✅ **Performance:** < 2s tiempo de respuesta
- ✅ **Estabilidad:** < 1% error rate
- ✅ **Compatibilidad:** Mantener UX actual

---

**🎯 Estado:** Listo para implementación  
**🚀 Prioridad:** Alta - Backend integration crítica para MVP  
**⏱️ Tiempo estimado:** 2-3 semanas  
**💡 Recomendación:** Usar Opción A (Adaptadores) para integración rápida  

---

*Documento generado automáticamente - Última actualización: 2025-01-10*