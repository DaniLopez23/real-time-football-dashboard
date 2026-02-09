/**
 * Punto de entrada central para todos los tipos de TypeScript
 * Re-exporta tipos desde módulos organizados por dominio
 */

// ============================================================================
// API TYPES - Tipos de datos de la API
// ============================================================================
export type {
  // Game types
  Team,
  GameData,
  GameSummary,
  GameTeams,
  GameTimeline,
  // Event types
  Qualifier,
  Event,
  EventStatistics,
  // Pass Network types
  PassNetworkNode,
  PassNetworkEdge,
  PassNetworkStatistics,
  PassNetwork,
} from './api';

// ============================================================================
// WEBSOCKET TYPES - Tipos de comunicación WebSocket
// ============================================================================
export type {
  WebSocketStatus,
  WebSocketMessageType,
  WebSocketMessage,
  NewGameMessage,
  GameUpdatesMessage,
  NewEventsMessage,
  EventsUpdatesMessage,
  PassNetworkMessage,
  MatchStateSnapshotMessage,
  WebSocketUpdateMessage,
} from './websocket';

// ============================================================================
// STORE TYPES - Tipos de estados de Zustand
// ============================================================================
export type {
  GameState,
  EventsState,
  TeamPassNetwork,
  PassNetworkState,
} from './store';
