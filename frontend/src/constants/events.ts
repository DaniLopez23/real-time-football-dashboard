/**
 * Constantes centralizadas para mapeo de tipos de eventos
 * Facilita el mantenimiento: si los IDs cambian, cambiar solo aquí
 */

// ============================================================================
// EVENT TYPES - Mapeo de IDs de tipos de eventos (Opta)
// ============================================================================
export const EVENT_TYPES = {
  PASS: '1',
  OFFSIDE_PASS: '2',
  FOUL_COMMITTED: '3',
  OUT: '5',
  CORNER_AWARDED: '5',
  TACKLE: '7',
  INTERCEPTION: '8',
  TURNOVER: '9',
  SAVE: '10',
  CLAIM: '11',
  CLEARANCE: '12',
  MISS: '13',
  POST: '14',
  ATTEMPT_SAVED: '15',
  GOAL: '16',
  CARD: '17',
  PLAYER_ON: '18',
  PLAYER_OFF: '19',
  PLAYER_RETIRED: '20',
  PLAYER_RETURNS: '21',
  PLAYER_BECOMES_GOALKEEPER: '22',
  GOALKEEPER_BECOMES_PLAYER: '23',
  CONDITION_CHANGE: '24',
  OFFICIAL_CHANGE: '25',
  // Puedes agregar más tipos según necesites
} as const;

// ============================================================================
// EVENT OUTCOMES - Mapeo de resultados de eventos
// ============================================================================
export const EVENT_OUTCOMES = {
  SUCCESS: '1',
  INCOMPLETE: '0',
  // Algunos eventos pueden tener otros valores
} as const;

// ============================================================================
// EVENT QUALIFIERS - Mapeo de IDs de cualificadores de eventos (Opta)
// Estos especifican propiedades adicionales de un evento
// ============================================================================
export const EVENT_QUALIFIERS = {
  PASS_RECIPIENT_ID: '4',
  PASS_RECIPIENT_PLAYER_ID: '7',
  PASS_END_X: '140',
  PASS_END_Y: '141',
  // Agrega más cualificadores según sea necesario
} as const;

// ============================================================================
// EVENT TYPE NAMES - Nombres legibles de los tipos de eventos
// ============================================================================
export const EVENT_TYPE_NAMES: Record<string, string> = {
  [EVENT_TYPES.PASS]: 'Pase',
  [EVENT_TYPES.OFFSIDE_PASS]: 'Pase en fuera de juego',
  [EVENT_TYPES.FOUL_COMMITTED]: 'Falta cometida',
  [EVENT_TYPES.OUT]: 'Balón fuera',
  [EVENT_TYPES.CORNER_AWARDED]: 'Córner concedido',
  [EVENT_TYPES.TACKLE]: 'Entrada',
  [EVENT_TYPES.INTERCEPTION]: 'Intercepción',
  [EVENT_TYPES.TURNOVER]: 'Pérdida de balón',
  [EVENT_TYPES.SAVE]: 'Parada',
  [EVENT_TYPES.CLAIM]: 'Retirar',
  [EVENT_TYPES.CLEARANCE]: 'Despeje',
  [EVENT_TYPES.MISS]: 'Fallo',
  [EVENT_TYPES.POST]: 'Poste',
  [EVENT_TYPES.ATTEMPT_SAVED]: 'Intento parado',
  [EVENT_TYPES.GOAL]: 'Gol',
  [EVENT_TYPES.CARD]: 'Tarjeta',
  [EVENT_TYPES.PLAYER_ON]: 'Jugador entra',
  [EVENT_TYPES.PLAYER_OFF]: 'Jugador sale',
  [EVENT_TYPES.PLAYER_RETIRED]: 'Jugador se retira',
  [EVENT_TYPES.PLAYER_RETURNS]: 'Jugador regresa',
  [EVENT_TYPES.PLAYER_BECOMES_GOALKEEPER]: 'Jugador se convierte en portero',
  [EVENT_TYPES.GOALKEEPER_BECOMES_PLAYER]: 'Portero se convierte en jugador',
  [EVENT_TYPES.CONDITION_CHANGE]: 'Cambio de condición',
  [EVENT_TYPES.OFFICIAL_CHANGE]: 'Cambio de árbitro',
};
