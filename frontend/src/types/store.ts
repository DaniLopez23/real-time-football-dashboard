/**
 * Tipos relacionados con los stores de Zustand
 * Define las estructuras de estado para cada store de la aplicación
 */

import type { GameData, Event, PassNetworkNode, PassNetworkEdge, PassNetworkStatistics } from './api';

// ============================================================================
// GAME STORE - Tipos del store de información del partido
// ============================================================================

export interface GameState {
  // Información del partido actual
  game: GameData | null;
  
  // Estado de carga
  loading: boolean;
  error: string | null;
  
  // Acciones
  setGame: (game: GameData) => void;
  updateGame: (updates: Partial<GameData>) => void;
  clearGame: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// ============================================================================
// EVENTS STORE - Tipos del store de eventos del partido
// ============================================================================

export interface EventsState {
  // Todos los eventos del partido
  events: Event[];
  
  // Último evento procesado
  lastEventId: string | null;
  
  // Estado de carga
  loading: boolean;
  error: string | null;
  
  // Acciones
  setEvents: (events: Event[]) => void;
  addEvents: (events: Event[]) => void;
  updateEvents: (events: Event[]) => void;
  getEventById: (eventId: string) => Event | undefined;
  getEventsByTeam: (teamId: string) => Event[];
  getEventsByType: (typeId: string) => Event[];
  getEventsByPlayer: (playerId: string) => Event[];
  clearEvents: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// ============================================================================
// PASS NETWORK STORE - Tipos del store de redes de pases
// ============================================================================

/**
 * Red de pases de un equipo
 */
export interface TeamPassNetwork {
  nodes: PassNetworkNode[];
  edges: PassNetworkEdge[];
  statistics: PassNetworkStatistics;
}

/**
 * Estado del store de redes de pases
 */
export interface PassNetworkState {
  // Redes de pases por equipo (key: team_id)
  networks: Record<string, TeamPassNetwork>;
  
  // Acciones
  setNetwork: (teamId: string, network: TeamPassNetwork) => void;
  updateNodes: (teamId: string, nodes: PassNetworkNode[]) => void;
  updateEdges: (teamId: string, edges: PassNetworkEdge[]) => void;
  updateStatistics: (teamId: string, statistics: PassNetworkStatistics) => void;
  updateNetworkElements: (
    teamId: string,
    nodes: PassNetworkNode[],
    edges: PassNetworkEdge[],
    statistics?: PassNetworkStatistics
  ) => void;
  getNetwork: (teamId: string) => TeamPassNetwork | undefined;
  clearNetwork: (teamId: string) => void;
  clearAllNetworks: () => void;
}
