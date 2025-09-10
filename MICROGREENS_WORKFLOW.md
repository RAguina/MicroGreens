# MicroGreens Management System - Workflow & Checklist

## 🎯 Objetivo del Proyecto
Aplicación para **registrar cosechas de microgreens** y generar **estadísticas simples** para optimizar la producción.

## 📋 Funcionalidades Principales

### Core Features
- [ ] **Registro de Siembras**
  - [ ] Tipo de microgreen (brócoli, rábano, girasol, etc.)
  - [ ] Fecha de siembra
  - [ ] Cantidad sembrada
  - [ ] Bandeja/ubicación

- [ ] **Registro de Cosechas**
  - [ ] Vinculado a siembra original
  - [ ] Fecha de cosecha
  - [ ] Peso cosechado
  - [ ] Calidad/notas

- [ ] **Dashboard con Estadísticas**
  - [ ] Resumen general (siembras activas, cosechas del mes)
  - [ ] Rendimiento por tipo de microgreen
  - [ ] Tiempo promedio de crecimiento
  - [ ] Gráficos simples de producción

- [ ] **Historial y Seguimiento**
  - [ ] Lista de siembras activas
  - [ ] Historial de cosechas
  - [ ] Búsqueda y filtros por fecha/tipo

## 🏗️ Arquitectura Técnica

### Frontend
- **Framework**: Next.js 15 + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Estado**: React Context o Zustand
- **Formularios**: React Hook Form + Zod

### Backend (Existente - Mantener)
- **Framework**: Express.js + Node.js
- **Base de Datos**: PostgreSQL (Neon)
- **ORM**: Sequelize
- **Autenticación**: JWT

### Hosting
- **Frontend**: Vercel (gratis)
- **Backend**: Railway/Render ($0 inicial)
- **DB**: Neon PostgreSQL (gratis)

## 📊 Modelo de Datos (Actualizado)

### Tabla: `plantings`
```sql
- id (UUID)
- microgreen_type (string) - brócoli, rábano, girasol, etc.
- date_planted (date)
- quantity_planted (integer) - número de semillas/gramos
- tray_location (string) - identificador de bandeja
- expected_harvest_date (date)
- status (enum) - 'planted', 'growing', 'harvested'
- notes (text)
- created_at, updated_at
```

### Tabla: `harvests`
```sql
- id (UUID)
- planting_id (foreign key)
- harvest_date (date)
- weight_harvested (float) - en gramos
- quality_rating (integer 1-5)
- notes (text)
- created_at, updated_at
```

## ✅ Plan de Desarrollo

### Fase 1: Setup y Base
- [ ] Decidir entre modificar frontend-v2 o crear nuevo
- [ ] Configurar conexión frontend ↔ backend existente
- [ ] Actualizar modelos de base de datos
- [ ] Migrar/actualizar controllers del backend
- [ ] Setup básico de autenticación

### Fase 2: CRUD Básico
- [ ] Formulario de registro de siembras
- [ ] Lista de siembras activas
- [ ] Formulario de registro de cosechas
- [ ] Lista/historial de cosechas

### Fase 3: Dashboard y Estadísticas
- [ ] Dashboard principal con métricas básicas
- [ ] Gráficos simples (total cosechas, rendimiento por tipo)
- [ ] Cálculos automáticos (tiempo promedio de crecimiento)

### Fase 4: UX/UI y Optimización
- [ ] Diseño responsive
- [ ] Validaciones de formularios
- [ ] Loading states y error handling
- [ ] Filtros y búsqueda

### Fase 5: Deploy y Testing
- [ ] Deploy backend en Railway/Render
- [ ] Deploy frontend en Vercel
- [ ] Testing de funcionalidades principales
- [ ] Configuración de dominio (opcional)

## 🚀 Decisiones Pendientes

### Frontend
- [ ] **¿Modificar frontend-v2 o crear nuevo proyecto?**
  - Opción A: Partir de frontend-v2 (ya configurado)
  - Opción B: Crear proyecto limpio desde cero

### Funcionalidades Adicionales (Futuro)
- [ ] Notificaciones de cosechas próximas
- [ ] Exportar datos a CSV/Excel
- [ ] Fotos de siembras/cosechas
- [ ] Múltiples usuarios/granjas
- [ ] App móvil

## 📝 Notas de Implementación
- Mantener backend existente (249 líneas, funcional)
- Aprovechar modelo `Planting` actual como base
- Priorizar simplicidad y funcionalidad core
- MVP para 1 usuario inicialmente

---

**Próximos pasos**: Definir si modificamos frontend-v2 o creamos nuevo, y comenzar con la Fase 1.