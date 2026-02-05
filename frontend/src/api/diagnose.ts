/**
 * 🔍 DIAGNÓSTICO DE WEBSOCKET
 * 
 * Este archivo ayuda a identificar por qué el WebSocket no se conecta
 */

export const diagnoseWebSocket = async () => {
  console.log('%c🔍 DIAGNÓSTICO DE WEBSOCKET', 'color: blue; font-weight: bold; font-size: 14px');
  console.log('═'.repeat(60));

  // 1. Verificar que el navegador soporta WebSocket
  console.log('\n1️⃣ Verificando soporte de WebSocket...');
  if (typeof WebSocket !== 'undefined') {
    console.log('✅ WebSocket soportado en este navegador');
  } else {
    console.error('❌ WebSocket NO está soportado en este navegador');
    return;
  }

  // 2. Verificar conectividad con el servidor backend
  console.log('\n2️⃣ Verificando conectividad con backend...');
  try {
    const response = await fetch('http://localhost:8000', {
      method: 'HEAD',
      mode: 'no-cors'
    });
    console.log('✅ Backend responde en http://localhost:8000');
  } catch (error) {
    console.error('❌ NO se puede alcanzar el backend en http://localhost:8000');
    console.error('   Solución: Asegúrate de que el backend está corriendo:');
    console.error('   $ cd backend && python -m uvicorn app.main:app --reload --port 8000');
  }

  // 3. Verificar disponibilidad de Swagger docs (indica que FastAPI está corriendo)
  console.log('\n3️⃣ Verificando que FastAPI está corriendo...');
  try {
    const response = await fetch('http://localhost:8000/docs');
    if (response.ok) {
      console.log('✅ FastAPI está corriendo y accesible');
    } else {
      console.error('❌ FastAPI no está accesible correctamente');
    }
  } catch (error) {
    console.error('❌ FastAPI no está accesible en http://localhost:8000');
  }

  // 4. Verificar endpoints disponibles
  console.log('\n4️⃣ Verificando endpoints disponibles...');
  try {
    const response = await fetch('http://localhost:8000/openapi.json');
    const data = await response.json();
    if (data.paths) {
      const paths = Object.keys(data.paths);
      console.log('✅ Endpoints encontrados:', paths.length);
      console.log('   Rutas:', paths.slice(0, 5).join(', '));
      
      // Buscar ruta WebSocket
      const wsRoute = paths.find(p => p.includes('ws'));
      if (wsRoute) {
        console.log(`✅ Ruta WebSocket encontrada: ${wsRoute}`);
      } else {
        console.warn('⚠️ No se encontró ruta WebSocket en /ws');
      }
    }
  } catch (error) {
    console.error('❌ No se pudo leer OpenAPI schema');
  }

  // 5. Prueba de WebSocket
  console.log('\n5️⃣ Intentando conectar a WebSocket...');
  try {
    const ws = new WebSocket('ws://localhost:8000/ws/game/2372222');
    
    const timeout = setTimeout(() => {
      ws.close();
      console.error('❌ Timeout: WebSocket no respondió en 5 segundos');
    }, 5000);

    ws.onopen = () => {
      clearTimeout(timeout);
      console.log('✅ WebSocket conectado correctamente');
      ws.close();
    };

    ws.onerror = (error) => {
      clearTimeout(timeout);
      console.error('❌ Error en WebSocket:', error);
      console.error('   Posibles causas:');
      console.error('   - Backend no está corriendo');
      console.error('   - Puerto 8000 no está disponible');
      console.error('   - CORS no está configurado');
      console.error('   - Ruta WebSocket no existe');
    };

    ws.onclose = () => {
      console.log('WebSocket cerrado');
    };
  } catch (error) {
    console.error('❌ Error al crear WebSocket:', error);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('%c✅ Diagnóstico completado', 'color: green; font-weight: bold');
};

/**
 * INSTRUCCIONES DE USO:
 * 
 * 1. Abre la consola del navegador (F12)
 * 2. Copia y pega esto en la consola:
 * 
 *    import { diagnoseWebSocket } from './api/diagnose';
 *    diagnoseWebSocket();
 * 
 * 3. O simplemente ejecuta en la consola:
 * 
 *    await fetch('http://localhost:8000').then(r => console.log('✅ Backend conectado')).catch(e => console.error('❌ Backend no accesible'))
 */

export default diagnoseWebSocket;
