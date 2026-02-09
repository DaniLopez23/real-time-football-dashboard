import { create } from 'zustand';
import type { GameState } from '@/types';

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
