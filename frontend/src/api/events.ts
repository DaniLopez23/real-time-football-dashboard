/**
 * Events API
 * 
 * Funciones para obtener eventos del partido
 */

import { apiClient } from './client';

export interface Qualifier {
  qualifier_id: string;
  qualifier_name?: string;
  value: string;
}

export interface Event {
  id: string;
  event_id: string;
  type_id: string;
  event_name: string;
  event_description: string;
  period_id: string;
  min: string;
  sec: string;
  player_id: string;
  player_name?: string;
  team_id: string;
  outcome: string;
  x: string;
  y: string;
  timestamp: string;
  timestamp_utc: string;
  last_modified: string;
  version: string;
  qualifiers: Qualifier[];
  player_receiver_id?: string;
}

export interface PassNetworkNode {
  player_id: string;
  player_name: string;
  team_id: string;
  pass_count: number;
  passes_given: number;
  passes_received: number;
  avg_position_given: { x: number; y: number };
  avg_position_received: { x: number; y: number };
  avg_position_total: { x: number; y: number };
}

export interface PassNetworkEdge {
  from_player_id: string;
  to_player_id: string;
  pass_count: number;
  avg_position: { x: number; y: number };
}

export interface PassNetworkStatistics {
  total_players: number;
  total_connections: number;
  total_passes: number;
  team_id: string;
}

export interface PassNetwork {
  nodes: PassNetworkNode[];
  edges: PassNetworkEdge[];
  statistics: PassNetworkStatistics;
}

export interface EventStatistics {
  total_events: number;
  event_types: Record<string, number>;
  events_by_team: Record<string, number>;
}

/**
 * Obtiene todos los eventos del partido
 */
export const getAllEvents = async (): Promise<Event[]> => {
  const response = await apiClient.get<Event[]>('/events/');
  return response.data;
};

/**
 * Construye la red de pases del partido (todos los equipos)
 */
export const getPassNetwork = async (): Promise<PassNetwork> => {
  const response = await apiClient.get<PassNetwork>('/events/passes');
  return response.data;
};

/**
 * Construye la red de pases para un equipo específico
 */
export const getPassNetworkByTeam = async (teamId: string): Promise<PassNetwork> => {
  const response = await apiClient.get<PassNetwork>(`/events/passes/team/${teamId}`);
  return response.data;
};

/**
 * Obtiene eventos filtrados por tipo
 * @param eventName - Nombre del tipo de evento (ej: "Pass", "Shot", "Tackle")
 */
export const getEventsByType = async (eventName: string): Promise<Event[]> => {
  const response = await apiClient.get<Event[]>(`/events/type/${eventName}`);
  return response.data;
};

/**
 * Obtiene todos los eventos de un equipo específico
 */
export const getEventsByTeam = async (teamId: string): Promise<Event[]> => {
  const response = await apiClient.get<Event[]>(`/events/team/${teamId}`);
  return response.data;
};

/**
 * Obtiene todos los eventos de un jugador específico
 */
export const getEventsByPlayer = async (playerId: string): Promise<Event[]> => {
  const response = await apiClient.get<Event[]>(`/events/player/${playerId}`);
  return response.data;
};

/**
 * Obtiene todos los eventos de un período específico
 * @param periodId - ID del período (ej: "1" para primer tiempo, "2" para segundo)
 */
export const getEventsByPeriod = async (periodId: string): Promise<Event[]> => {
  const response = await apiClient.get<Event[]>(`/events/period/${periodId}`);
  return response.data;
};

/**
 * Obtiene todos los pases exitosos del partido
 */
export const getSuccessfulPasses = async (): Promise<Event[]> => {
  const response = await apiClient.get<Event[]>('/events/passes/successful');
  return response.data;
};

/**
 * Obtiene estadísticas generales de los eventos del partido
 */
export const getEventStatistics = async (): Promise<EventStatistics> => {
  const response = await apiClient.get<EventStatistics>('/events/statistics');
  return response.data;
};
