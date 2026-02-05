export interface Game {
  id: string;
  name: string;
  homeTeam: string;
  awayTeam: string;
  date?: string;
  status?: string;
}

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

// URL base del backend
const API_BASE_URL = 'http://localhost:8000';

// Obtener lista de partidos
export const fetchGames = async (): Promise<Game[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/games`);
    if (!response.ok) throw new Error('Error al obtener partidos');
    return await response.json();
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
};

// Obtener detalles de un partido específico
export const fetchGameDetails = async (gameId: string): Promise<Game | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}`);
    if (!response.ok) throw new Error('Error al obtener detalles del partido');
    return await response.json();
  } catch (error) {
    console.error('Error fetching game details:', error);
    return null;
  }
};

// Obtener eventos de un partido
export const fetchGameEvents = async (gameId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/events?game_id=${gameId}`);
    if (!response.ok) throw new Error('Error al obtener eventos');
    return await response.json();
  } catch (error) {
    console.error('Error fetching game events:', error);
    return [];
  }
};
