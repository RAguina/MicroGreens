# 🌱 Frontend-Backend API Contract

## 📄 Overview
Este documento especifica exactamente cómo el frontend Next.js envía datos al backend v2.0, después del refactor completo que eliminó toda la complejidad híbrida.

---

## 🏷️ PlantTypes (Catálogo de Plantas)

### Frontend expects to receive:
```typescript
interface PlantType {
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
```

### Frontend sends for creation:
```typescript
interface PlantTypeFormData {
  name: string;
  scientificName?: string;
  category?: string;
  description?: string;
  daysToGerminate?: number;
  daysToHarvest?: number;
  optimalTemp?: number;
  optimalHumidity?: number;
  lightRequirement?: 'Low' | 'Medium' | 'High';
  averageYield?: number;
  marketPrice?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}
```

---

## 🌱 Plantings (Siembras)

### Frontend expects to receive:
```typescript
type PlantingStatus = 
  | 'PLANTED' 
  | 'GERMINATING' 
  | 'GROWING' 
  | 'READY_TO_HARVEST' 
  | 'HARVESTED' 
  | 'FAILED';

interface Planting {
  id: string;
  
  // Relations
  plantTypeId?: string;
  plantType?: PlantType;
  
  // Legacy fallback (if no plantType)
  plantName?: string;
  
  // Core data
  datePlanted: string; // ISO date string
  expectedHarvest?: string; // ISO date string
  domeDate?: string; // ISO date string
  lightDate?: string; // ISO date string
  quantity?: number;
  
  // Status tracking
  status: PlantingStatus;
  
  // Physical location
  trayNumber?: string;
  
  // Legacy field (for backward compatibility)
  yield?: number;
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  userId: string;
  
  // Relations
  harvests?: Harvest[];
  _count?: {
    harvests: number;
  };
}
```

### Frontend sends for creation:
```typescript
interface PlantingFormData {
  plantTypeId?: string;       // Preferred: link to PlantType
  plantName?: string;         // Fallback: custom name
  datePlanted: string;        // Required: ISO date
  expectedHarvest?: string;   // Optional: ISO date
  domeDate?: string;          // Optional: ISO date
  lightDate?: string;         // Optional: ISO date
  quantity?: number;          // Optional: seeds/grams
  status?: PlantingStatus;    // Optional: defaults to 'PLANTED'
  trayNumber?: string;        // Optional: physical location
  notes?: string;             // Optional: user notes
}
```

**Important Notes:**
- Either `plantTypeId` OR `plantName` must be provided (not both)
- If `plantTypeId` is provided, backend should populate `plantType` relation
- If only `plantName` is provided, treat as custom planting
- `status` defaults to `'PLANTED'` if not provided
- All dates should be ISO strings

---

## 🌾 Harvests (Cosechas)

### Frontend expects to receive:
```typescript
type HarvestQuality = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

interface Harvest {
  id: string;
  plantingId: string; // Can be empty string for independent harvests
  
  // Harvest data
  harvestDate: string; // ISO date string
  weight: number;      // in grams
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
```

### Frontend sends for creation:
```typescript
interface HarvestFormData {
  plantingId: string;      // Required, but can be empty "" for independent harvests
  harvestDate: string;     // Required: ISO date
  weight: number;          // Required: grams (0.1 - 1000)
  quality: HarvestQuality; // Required: enum value
  notes?: string;          // Optional: user notes
  pricePerGram?: number;   // Optional: market price
  appearance?: number;     // Optional: 1-10 scale
  taste?: number;          // Optional: 1-10 scale
  freshness?: number;      // Optional: 1-10 scale
}
```

**Important Notes:**
- `plantingId` can be empty string `""` for independent harvests
- If `plantingId` is provided and valid, backend should:
  - Link harvest to planting
  - Auto-update planting status to `'HARVESTED'`
  - Populate `planting` relation in response
- If `plantingId` is empty, treat as independent harvest
- `totalValue` should be auto-calculated: `weight * pricePerGram`
- Quality metrics are optional but recommended for analytics

---

## 🔍 API Endpoints Expected by Frontend

### PlantTypes:
- `GET /api/plant-types?page=1&limit=100` → `PaginatedResponse<PlantType>`
- `POST /api/plant-types` (body: `PlantTypeFormData`) → `PlantType`
- `GET /api/plant-types/:id` → `PlantType`
- `PUT /api/plant-types/:id` (body: `Partial<PlantTypeFormData>`) → `PlantType`
- `DELETE /api/plant-types/:id` → `{ success: boolean }`

### Plantings:
- `GET /api/plantings?page=1&limit=100&status=GROWING` → `PaginatedResponse<Planting>`
- `POST /api/plantings` (body: `PlantingFormData`) → `Planting`
- `GET /api/plantings/:id` → `Planting`
- `PUT /api/plantings/:id` (body: `Partial<PlantingFormData>`) → `Planting`
- `DELETE /api/plantings/:id` → `{ success: boolean }`

### Harvests:
- `GET /api/harvests?page=1&limit=100&quality=EXCELLENT` → `PaginatedResponse<Harvest>`
- `POST /api/harvests` (body: `HarvestFormData`) → `Harvest`
- `GET /api/harvests/:id` → `Harvest`
- `PUT /api/harvests/:id` (body: `Partial<HarvestFormData>`) → `Harvest`
- `DELETE /api/harvests/:id` → `{ success: boolean }`
- `GET /api/plantings/:id/harvests` → `Harvest[]`

### Utility:
- `GET /api/health` → `{ status: 'ok', timestamp: string }`

---

## 📊 Pagination Response Format

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

## 🚨 Error Response Format

```typescript
interface ApiError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
    value: any;
  }>;
}
```

---

## 🔐 Authentication

All requests include:
- `credentials: 'include'` for cookies
- `Content-Type: 'application/json'`
- JWT token should be in HttpOnly cookie

---

## 🎯 Key Changes After Refactor

### ❌ Eliminated Complexity:
- No more `Siembra` ↔ `Planting` transformations
- No more `Cosecha` ↔ `Harvest` mappings
- No more legacy field mappings
- No more hybrid adapter layer

### ✅ Direct Communication:
- Frontend uses exact same types as backend
- No data transformations needed
- Clean, predictable API calls
- TypeScript safety end-to-end

### 🔄 Smart Features:
- **Independent Harvests**: `plantingId: ""` for harvests not linked to plantings
- **Flexible Planting**: Either `plantTypeId` (catalog) or `plantName` (custom)
- **Auto-calculations**: Backend auto-calculates `totalValue`, status updates, etc.

---

## 📝 Example API Calls

### Create Planting (with PlantType):
```javascript
POST /api/plantings
{
  "plantTypeId": "uuid-123",
  "datePlanted": "2025-01-15",
  "quantity": 50,
  "trayNumber": "A1",
  "notes": "Primera siembra de brócoli"
}
```

### Create Planting (custom):
```javascript
POST /api/plantings
{
  "plantName": "Microgreen de espinaca",
  "datePlanted": "2025-01-15",
  "expectedHarvest": "2025-01-22",
  "quantity": 40
}
```

### Create Harvest (linked):
```javascript
POST /api/harvests
{
  "plantingId": "planting-uuid-456",
  "harvestDate": "2025-01-22",
  "weight": 85.5,
  "quality": "GOOD",
  "pricePerGram": 0.75,
  "appearance": 8,
  "taste": 9,
  "freshness": 8
}
```

### Create Harvest (independent):
```javascript
POST /api/harvests
{
  "plantingId": "",
  "harvestDate": "2025-01-22",
  "weight": 45.0,
  "quality": "EXCELLENT",
  "notes": "Cosecha de emergencia"
}
```