/**
 * 🧪 Script de Prueba de Integración Frontend-Backend-DB
 * 
 * Ejecuta desde browser console para probar la conexión completa.
 * Asegúrate de que el backend esté corriendo en puerto 5001.
 */

console.log('🌱 Iniciando pruebas de integración MicroGreens...');

// Configurar API URL
const API_URL = 'http://localhost:5001';

/**
 * Helper para hacer requests con manejo de errores
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(`❌ Error ${response.status}:`, data);
      return { error: true, status: response.status, data };
    }

    console.log(`✅ ${endpoint}:`, data);
    return { error: false, data };
  } catch (error) {
    console.error(`🔌 Error de conexión en ${endpoint}:`, error.message);
    return { error: true, message: error.message };
  }
}

/**
 * 1. Verificar salud del backend
 */
async function testHealth() {
  console.log('\n📊 1. Verificando salud del backend...');
  return await apiRequest('/health');
}

/**
 * 2. Probar CRUD de plantings
 */
async function testPlantingsCRUD() {
  console.log('\n🌱 2. Probando CRUD de plantings...');
  
  // GET - Obtener plantings existentes
  console.log('📋 GET /api/plantings');
  const getResult = await apiRequest('/api/plantings?page=1&limit=10');
  
  if (getResult.error) {
    return false;
  }

  // POST - Crear nuevo planting
  console.log('➕ POST /api/plantings');
  const newPlanting = {
    plantName: "Microgreen de Rúcula",
    datePlanted: "2025-01-10",
    expectedHarvest: "2025-01-17",
    quantity: 50,
    notes: "Bandeja: A1. Prueba de integración frontend-backend",
    userId: "temp-user-id" // Temporal hasta implementar auth real
  };

  const createResult = await apiRequest('/api/plantings', {
    method: 'POST',
    body: JSON.stringify(newPlanting)
  });

  if (createResult.error) {
    return false;
  }

  const createdId = createResult.data.id;
  console.log(`📝 Planting creado con ID: ${createdId}`);

  // PUT - Actualizar planting
  console.log('✏️ PUT /api/plantings/:id');
  const updateData = {
    yield: 35.5,
    notes: "Bandeja: A1. Cosechado exitosamente. Prueba completada."
  };

  const updateResult = await apiRequest(`/api/plantings/${createdId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });

  if (updateResult.error) {
    return false;
  }

  // GET - Verificar el planting actualizado
  console.log('🔍 GET /api/plantings/:id');
  const getOneResult = await apiRequest(`/api/plantings/${createdId}`);
  
  if (getOneResult.error) {
    return false;
  }

  // DELETE - Eliminar planting de prueba
  console.log('🗑️ DELETE /api/plantings/:id');
  const deleteResult = await apiRequest(`/api/plantings/${createdId}`, {
    method: 'DELETE'
  });

  return !deleteResult.error;
}

/**
 * 3. Probar adaptadores de datos
 */
async function testDataAdapters() {
  console.log('\n🔄 3. Probando adaptadores de datos...');
  
  // Simular un planting del backend
  const mockBackendPlanting = {
    id: "test-123",
    plantName: "Microgreen de Brócoli", 
    datePlanted: "2025-01-10T00:00:00.000Z",
    expectedHarvest: "2025-01-17T00:00:00.000Z",
    quantity: 60,
    yield: null,
    notes: "Bandeja: B2. Semillas orgánicas",
    createdAt: "2025-01-10T10:30:00.000Z",
    updatedAt: "2025-01-10T10:30:00.000Z",
    userId: "test-user"
  };

  console.log('📥 Backend Planting:', mockBackendPlanting);

  // Test adapter: Backend → Frontend
  if (window.microGreensAPI && window.microGreensAPI.backendToFrontendSiembra) {
    try {
      const frontendSiembra = window.microGreensAPI.backendToFrontendSiembra(mockBackendPlanting);
      console.log('📤 Frontend Siembra:', frontendSiembra);
      
      // Verificar campos críticos
      const checks = {
        'ID preservado': frontendSiembra.id === mockBackendPlanting.id,
        'Tipo extraído': frontendSiembra.tipo_microgreen === 'brócoli',
        'Fecha convertida': frontendSiembra.fecha_siembra === '2025-01-10',
        'Bandeja extraída': frontendSiembra.ubicacion_bandeja === 'B2',
        'Estado calculado': ['sembrado', 'creciendo'].includes(frontendSiembra.estado),
        'Cantidad manejada': frontendSiembra.cantidad_sembrada === 60
      };

      console.log('✅ Verificaciones del adaptador:', checks);
      
      const allPassed = Object.values(checks).every(Boolean);
      if (allPassed) {
        console.log('🎉 Todos los adaptadores funcionan correctamente');
      } else {
        console.warn('⚠️ Algunos adaptadores necesitan ajustes');
      }
      
      return allPassed;
    } catch (error) {
      console.error('❌ Error en adaptadores:', error);
      return false;
    }
  } else {
    console.warn('⚠️ Adaptadores no disponibles en window.microGreensAPI');
    return false;
  }
}

/**
 * Ejecutar todas las pruebas
 */
async function runAllTests() {
  console.log('🚀 Ejecutando suite completa de pruebas...\n');
  
  const results = {
    health: await testHealth(),
    crud: await testPlantingsCRUD(), 
    adapters: await testDataAdapters()
  };

  console.log('\n📊 RESUMEN DE RESULTADOS:');
  console.log('=========================');
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result?.error === false ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test.toUpperCase()}`);
  });

  const allPassed = Object.values(results).every(r => r?.error === false || r === true);
  
  if (allPassed) {
    console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON!');
    console.log('✅ Frontend-Backend-DB integración funcionando correctamente');
    console.log('🚀 Listo para producción');
  } else {
    console.log('\n⚠️ ALGUNAS PRUEBAS FALLARON');
    console.log('🔧 Revisa los errores arriba y ajusta la configuración');
  }

  return allPassed;
}

/**
 * Instrucciones de uso
 */
console.log(`
📖 INSTRUCCIONES DE USO:
========================

1. Asegúrate de que el backend esté corriendo en puerto 5001
2. Abre las Developer Tools (F12)
3. Ve a la pestaña Console
4. Ejecuta: runAllTests()

🔧 Comandos disponibles:
- testHealth() - Solo verificar backend
- testPlantingsCRUD() - Solo probar API CRUD  
- testDataAdapters() - Solo probar adaptadores
- runAllTests() - Ejecutar todo

🌱 ¡Comienza con runAllTests() para verificar todo!
`);

// Exponer funciones globalmente
window.testHealth = testHealth;
window.testPlantingsCRUD = testPlantingsCRUD; 
window.testDataAdapters = testDataAdapters;
window.runAllTests = runAllTests;