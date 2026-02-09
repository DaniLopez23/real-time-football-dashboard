/**
 * Tipos relacionados con la comunicación WebSocket
 * Centraliza todos los tipos de mensajes y estados de WebSocket
 */

import type { Event, PassNetworkNode, PassNetworkEdge, PassNetworkStatistics } from './api';
import type { GameData } from './api';

// ============================================================================
// WEBSOCKET STATUS - Estados de conexión
// ============================================================================

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// ============================================================================
// WEBSOCKET MESSAGE TYPES - Tipos de mensajes
// ============================================================================

export type WebSocketMessageType = 
  | 'connection'
  | 'new_game'
  | 'game_updates'
  | 'new_events'
  | 'events_updates'
  | 'new_pass_network_elements'
  | 'update_pass_network_elements'
  | 'match_state_snapshot'
  | 'error'
  | 'pong';

// ============================================================================
// WEBSOCKET MESSAGES - Estructuras de mensajes específicos
// ============================================================================

/**
 * Estructura base de un mensaje WebSocket del backend
 */
export interface WebSocketMessage {
  type: WebSocketMessageType;
  status?: string;
  client_id?: string;
  game_id?: string;
  message?: string;
  data?: any;
}

/**
 * Mensaje de nuevo juego
 */
export interface NewGameMessage {
  type: 'new_game';
  game_id: string;
  timestamp: string;
  game: GameData;
}

/**
 * Mensaje de actualización de juego
 */
export interface GameUpdatesMessage {
  type: 'game_updates';
  game_id: string;
  timestamp: string;
  game: GameData;
}

/**
 * Mensaje de nuevos eventos
 */
export interface NewEventsMessage {
  type: 'new_events';
  game_id: string;
  count: number;
  events: Event[];
}

/**
 * Mensaje de actualización de eventos
 */
export interface EventsUpdatesMessage {
  type: 'events_updates';
  game_id: string;
  count: number;
  events: Event[];
}

/**
 * Mensaje de red de pases (nuevos elementos o actualizaciones)
 */
export interface PassNetworkMessage {
  type: 'new_pass_network_elements' | 'update_pass_network_elements';
  game_id: string;
  team_id: string;
  nodes: PassNetworkNode[];
  edges: PassNetworkEdge[];
  statistics: PassNetworkStatistics;
}

/**
 * Snapshot completo del estado del partido
 * Enviado cuando un cliente se conecta o se reinicia el partido
 */
export interface MatchStateSnapshotMessage {
  type: 'match_state_snapshot';
  game_id: string;
  game: GameData;
  total_events: number;
  last_event_id: string | null;
  events: Event[];
  pass_networks: Record<string, {
    nodes: PassNetworkNode[];
    edges: PassNetworkEdge[];
    statistics: PassNetworkStatistics;
  }>;
}

/**
 * Union de todos los tipos de mensajes WebSocket de actualización
 */
export type WebSocketUpdateMessage = 
  | NewGameMessage
  | GameUpdatesMessage
  | NewEventsMessage
  | EventsUpdatesMessage
  | PassNetworkMessage
  | MatchStateSnapshotMessage;
