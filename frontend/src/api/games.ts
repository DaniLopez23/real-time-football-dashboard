/**
 * Games API
 * 
 * Funciones para obtener información de partidos
 */

import { apiClient } from './client';
import type { GameData, GameSummary, GameTeams, GameTimeline } from '@/types';

/**
 * Obtiene la información completa del partido
 */
export const getGameData = async (): Promise<GameData> => {
  const response = await apiClient.get<GameData>('/games');
  return response.data;
};

/**
 * Obtiene un resumen del partido
 */
export const getGameSummary = async (): Promise<GameSummary> => {
  const response = await apiClient.get<GameSummary>('/games/summary');
  return response.data;
};

/**
 * Obtiene información de los equipos del partido
 */
export const getGameTeams = async (): Promise<GameTeams> => {
  const response = await apiClient.get<GameTeams>('/games/teams');
  return response.data;
};

/**
 * Obtiene el timeline del partido (fechas y horas clave)
 */
export const getGameTimeline = async (): Promise<GameTimeline> => {
  const response = await apiClient.get<GameTimeline>('/games/timeline');
  return response.data;
};
