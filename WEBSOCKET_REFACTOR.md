# WebSocket Refactoring - Desacoplamiento de Listeners

## Descripción General

Se ha realizado un refactoring significativo del sistema de WebSockets para desacoplar los listeners de **game updates** y **events** en componentes separados e independientes. Esto mejora:

- ✅ **Separación de responsabilidades**: Cada listener maneja solo su tipo de datos
- ✅ **Mejor rendimiento**: Menos procesamiento innecesario
- ✅ **Facilita debugging**: Logs más claros y diferenciados
- ✅ **Escalabilidad**: Fácil agregar nuevos canales

---

## Cambios Frontend

### Nuevos Hooks

#### 1. `useWebSocketBase.ts` - Hook Base Genérico
Hook de bajo nivel que maneja la conexión WebSocket con:
- Reconexión automática con exponential backoff
- Heartbeat automático
- Gestión de estado
- Manejo de errores

```typescript
import { useWebSocketBase } from '@/hooks';

const ws = useWebSocketBase({
  url: 'ws://localhost:8000/ws/channel',
  onMessage: (data) => console.log(data),
  onStatusChange: (status) => console.log(status),
});
```

#### 2. `useGameWebSocket.ts` - Hook para Actualizaciones del Juego
Especializado en cambios de estado del juego:

```typescript
import { useGameWebSocket, type GameUpdate } from '@/hooks';

const gameWs = useGameWebSocket({
  gameId: '2372222',
  baseUrl: 'ws://localhost:8000',
  onGameUpdate: (data: GameUpdate) => {
    console.log('Game period:', data.period);
    console.log('Home team:', data.home_team);
    console.log('Away team:', data.away_team);
  },
});
```

**Datos que recibe:**
```typescript
{
  type: 'game_update',
  game_id: string,
  timestamp: string,
  home_team: { name, score, ... },
  away_team: { name, score, ... },
  period: number,
  status: 'active' | 'finished' | 'paused',
}
```

#### 3. `useEventsWebSocket.ts` - Hook para Eventos del Partido
Especializado en eventos individuales:

```typescript
import { useEventsWebSocket, type GameEvent } from '@/hooks';

const eventsWs = useEventsWebSocket({
  gameId: '2372222',
  baseUrl: 'ws://localhost:8000',
  onNewEvent: (event: GameEvent) => {
    console.log('Event type:', event.type);
    console.log('Team:', event.team);
    console.log('Minute:', event.minute);
  },
  onEventsBatch: (events: GameEvent[]) => {
    console.log('Received batch of', events.length, 'events');
  },
});

// Solicitar eventos
eventsWs.requestEventsSince('event_123');
eventsWs.requestEventsByType('Pass');
```

**Datos que recibe:**
```typescript
{
  type: 'new_event' | 'events_batch',
  game_id: string,
  event?: GameEvent,        // Para 'new_event'
  events?: GameEvent[],     // Para 'events_batch'
  total_events?: number,
  timestamp?: string,
}
```

### Actualización de Componentes Existentes

#### `DashboardLayout.tsx`
Ahora usa ambos hooks simultáneamente:

```typescript
// Game updates
const gameWs = useGameWebSocket({
  gameId: selectedGame.id,
  onGameUpdate: handleGameUpdate,
  onStatusChange: setWsGameStatus,
});

// Events
const eventsWs = useEventsWebSocket({
  gameId: selectedGame.id,
  onNewEvent: handleNewEvent,
  onEventsBatch: handleEventsBatch,
  onStatusChange: setWsEventsStatus,
});
```

#### `ConnectionStatusBar.tsx`
Actualizado para importar `WebSocketStatus` desde el base:

```typescript
import { type WebSocketStatus } from '@/hooks/useWebSocketBase';
```

### Archivo Índice

Nuevo `hooks/index.ts` para centralizar exportaciones:

```typescript
export { useWebSocketBase, type WebSocketStatus } from './useWebSocketBase';
export { useGameWebSocket, type GameUpdate } from './useGameWebSocket';
export { useEventsWebSocket, type GameEvent } from './useEventsWebSocket';
```

---

## Cambios Backend

### Nuevos Archivos

#### 1. `connection_manager_v2.py` - Manager Mejorado
Estructura multi-canal:

```python
{
  "games": {
    "2372222": { client_1, client_2, ... }
  },
  "events": {
    "2372222": { client_3, client_4, ... }
  }
}
```

**Nuevos métodos:**
- `connect(websocket, channel, game_id)` - Conectar con canal
- `broadcast_to_channel(channel, game_id, message)` - Enviar a canal específico
- `broadcast_to_all_channels(game_id, message)` - Enviar a todos los canales

#### 2. `event_broadcaster_v2.py` - Broadcast Separado

```python
from app.websockets.event_broadcaster_v2 import (
    broadcast_game_update,
    broadcast_new_event,
    broadcast_events_batch,
    CHANNEL_GAMES,
    CHANNEL_EVENTS,
)

# Enviar actualización del juego
await broadcast_game_update(result, manager)

# Enviar nuevo evento
await broadcast_new_event(event, game_id, manager)

# Enviar lote de eventos
await broadcast_events_batch(events, game_id, total_events, manager)
```

#### 3. `websocket_v2.py` - Rutas Nuevas

```python
# GET /ws/game/{game_id} - Canal de actualizaciones del juego
# GET /ws/events/{game_id} - Canal de eventos del partido
# GET /ws/stats - Estadísticas de todas las conexiones
# GET /ws/stats/{game_id} - Estadísticas de un juego específico
```

---

## Mapeo de Canales

| Canal | Endpoint | Datos | Uso |
|-------|----------|-------|-----|
| `games` | `/ws/game/{gameId}` | `GameUpdate` | Estado del juego |
| `events` | `/ws/events/{gameId}` | `GameEvent` | Eventos del partido |
| `stats` | Nuevo | Estadísticas | Monitoreo |

---

## Migración de Código Existente

### Antes (Hook Genérico)
```typescript
const { status } = useWebSocket({
  url: 'ws://localhost:8000',
  gameId: selectedGame.id,
  onMessage: (data) => {
    // Mezcla de games y events
    if (data.type === 'game_update') { ... }
    if (data.type === 'new_event') { ... }
  },
});
```

### Después (Hooks Separados)
```typescript
// Games
const gameWs = useGameWebSocket({
  gameId: selectedGame.id,
  onGameUpdate: (data) => { ... },
});

// Events
const eventsWs = useEventsWebSocket({
  gameId: selectedGame.id,
  onNewEvent: (event) => { ... },
  onEventsBatch: (events) => { ... },
});
```

---

## Archivos De Ejemplo

- `src/components/WebSocketExample.tsx` - Ejemplo completo de uso

---

## Compatibilidad

- ✅ Hook legacy `useWebSocket` mantiene compatibilidad
- ✅ Los endpoints antiguos siguen funcionando
- ⚠️ Se recomienda migrar gradualmente a los nuevos hooks

---

## Ventajas

1. **Debugging Mejorado**: Logs claros por canal
2. **Performance**: Menos datos innecesarios
3. **Type Safety**: Tipos específicos por hook
4. **Flexibilidad**: Usar solo lo que necesites
5. **Escalabilidad**: Fácil agregar nuevos canales
6. **Separación**: Games y Events completamente desacoplados

---

## Próximos Pasos (Opcionales)

- [ ] Agregar canal para cambios de lesiones
- [ ] Agregar canal para estadísticas en tiempo real
- [ ] Implementar subscribción selectiva a tipos de eventos
- [ ] Agregar caché de eventos
- [ ] Rate limiting por cliente

