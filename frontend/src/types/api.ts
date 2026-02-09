/**
 * Tipos relacionados con las APIs del backend
 * Centraliza todos los tipos de datos de juegos, eventos y pass networks
 */

// ============================================================================
// GAME TYPES - Tipos relacionados con partidos
// ============================================================================

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

// ============================================================================
// EVENT TYPES - Tipos relacionados con eventos del partido
// ============================================================================

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

export interface EventStatistics {
  total_events: number;
  event_types: Record<string, number>;
  events_by_team: Record<string, number>;
}

// ============================================================================
// PASS NETWORK TYPES - Tipos relacionados con redes de pases
// ============================================================================

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
