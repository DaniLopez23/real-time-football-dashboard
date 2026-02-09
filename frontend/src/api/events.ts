/**
 * Events API
 * 
 * Funciones para obtener eventos del partido
 */

import { apiClient } from './client';
import type { Event, PassNetwork, EventStatistics } from '@/types';

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
