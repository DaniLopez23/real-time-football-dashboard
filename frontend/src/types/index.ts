/**
 * Tipos compartidos para la comunicación WebSocket y datos del dashboard
 */

/**
 * Estados posibles de la conexión WebSocket
 */
export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Información de un partido
 */
export interface GameInfo {
  id: string;
  name: string;
  homeTeam: string;
  awayTeam: string;
  date?: string;
  status?: string;
}

/**
 * Estructura de un mensaje WebSocket del backend
 */
export interface WebSocketMessage {
  type: 'connection' | 'event' | 'error' | 'pong';
  status?: string;
  client_id?: string;
  game_id?: string;
  message?: string;
  data?: any;
}

/**
 * Eventos del partido en tiempo real
 */
export interface GameEvent {
  id: string;
  timestamp: number;
  type: string;
  teamId: string;
  playerId: string;
  x?: number;
  y?: number;
  [key: string]: any;
}

/**
 * Estado compartido del dashboard
 */
export interface DashboardState {
  selectedGame: GameInfo | null;
  wsStatus: WebSocketStatus;
  events: GameEvent[];
  loading: boolean;
  error: string | null;
}
