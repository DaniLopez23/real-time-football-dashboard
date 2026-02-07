/**
 * Tipos compartidos para la comunicación WebSocket y datos del dashboard
 */

import type { Event, PassNetworkNode, PassNetworkEdge, PassNetworkStatistics } from '@/api/events';
import type { GameData } from '@/api/games';

/**
 * Estados posibles de la conexión WebSocket
 */
export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Tipos de mensajes WebSocket que llegan del backend
 */
export type WebSocketMessageType = 
  | 'connection'
  | 'new_game'
  | 'game_updates'
  | 'new_events'
  | 'events_updates'
  | 'new_pass_network_elements'
  | 'update_pass_network_elements'
  | 'error'
  | 'pong';

/**
 * Estructura de un mensaje WebSocket del backend
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
 * Union de todos los tipos de mensajes WebSocket
 */
export type WebSocketUpdateMessage = 
  | NewGameMessage
  | GameUpdatesMessage
  | NewEventsMessage
  | EventsUpdatesMessage
  | PassNetworkMessage;
