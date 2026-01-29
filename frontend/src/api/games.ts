/**
 * Games API
 * 
 * Funciones para obtener información de partidos
 */

import { apiClient } from './client';

export interface Team {
  team_id: string;
  team_name: string;
  team_official?: string;
  team_short?: string;
  score: string;
}

export interface GameData {
  game_id: string;
  competition_id: string;
  competition_name: string;
  season_id: string;
  season_name: string;
  matchday: string;
  game_date: string;
  home_team: Team;
  away_team: Team;
  period_1_start?: string;
  period_2_start?: string;
}

export interface GameSummary {
  game_id: string;
  competition: string;
  season: string;
  matchday: string;
  game_date: string;
  home_team: {
    team_id: string;
    team_name: string;
    score: string;
  };
  away_team: {
    team_id: string;
    team_name: string;
    score: string;
  };
}

export interface GameTeams {
  home_team: Team;
  away_team: Team;
}

export interface GameTimeline {
  game_id: string;
  game_date: string;
  period_1_start?: string;
  period_2_start?: string;
}

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
