import { create } from 'zustand';
import type { GameData } from '@/api/games';

/**
 * Estado del store de información del partido
 */
interface GameState {
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

/**
 * Store de Zustand para gestionar la información del partido
 */
export const useGameStore = create<GameState>((set) => ({
  game: null,
  loading: false,
  error: null,

  setGame: (game) => {
    set({ game, error: null, loading: false });
  },

  updateGame: (updates) => {
    set((state) => ({
      game: state.game ? { ...state.game, ...updates } : null,
    }));
  },

  clearGame: () => {
    set({ game: null, error: null, loading: false });
  },

  setLoading: (loading) => {
    set({ loading });
  },

  setError: (error) => {
    set({ error, loading: false });
  },
}));
