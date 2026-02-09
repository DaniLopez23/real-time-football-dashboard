import { create } from 'zustand';
import type { PassNetworkState } from '@/types';

/**
 * Store de Zustand para gestionar las redes de pases de equipos
 */
export const usePassNetworkStore = create<PassNetworkState>((set, get) => ({
  networks: {},

  setNetwork: (teamId, network) => {
    set((state) => ({
      networks: {
        ...state.networks,
        [teamId]: network,
      },
    }));
  },

  updateNodes: (teamId, nodes) => {
    set((state) => {
      const existingNetwork = state.networks[teamId];
      if (!existingNetwork) {
        // Si no existe la red, crear una nueva
        return {
          networks: {
            ...state.networks,
            [teamId]: {
              nodes,
              edges: [],
              statistics: {
                total_players: nodes.length,
                total_connections: 0,
                total_passes: 0,
                team_id: teamId,
              },
            },
          },
        };
      }

      // Actualizar nodos existentes y agregar nuevos
      const nodeMap = new Map(
        existingNetwork.nodes.map((node) => [node.player_id, node])
      );

      nodes.forEach((node) => {
        nodeMap.set(node.player_id, node);
      });

      return {
        networks: {
          ...state.networks,
          [teamId]: {
            ...existingNetwork,
            nodes: Array.from(nodeMap.values()),
          },
        },
      };
    });
  },

  updateEdges: (teamId, edges) => {
    set((state) => {
      const existingNetwork = state.networks[teamId];
      if (!existingNetwork) {
        // Si no existe la red, crear una nueva
        return {
          networks: {
            ...state.networks,
            [teamId]: {
              nodes: [],
              edges,
              statistics: {
                total_players: 0,
                total_connections: edges.length,
                total_passes: edges.reduce((sum, e) => sum + e.pass_count, 0),
                team_id: teamId,
              },
            },
          },
        };
      }

      // Actualizar aristas existentes y agregar nuevas
      const edgeMap = new Map(
        existingNetwork.edges.map((edge) => [
          `${edge.from_player_id}-${edge.to_player_id}`,
          edge,
        ])
      );

      edges.forEach((edge) => {
        edgeMap.set(`${edge.from_player_id}-${edge.to_player_id}`, edge);
      });

      return {
        networks: {
          ...state.networks,
          [teamId]: {
            ...existingNetwork,
            edges: Array.from(edgeMap.values()),
          },
        },
      };
    });
  },

  updateStatistics: (teamId, statistics) => {
    set((state) => {
      const existingNetwork = state.networks[teamId];
      if (!existingNetwork) return state;

      return {
        networks: {
          ...state.networks,
          [teamId]: {
            ...existingNetwork,
            statistics,
          },
        },
      };
    });
  },

  updateNetworkElements: (teamId, nodes, edges, statistics) => {
    set((state) => {
      const existingNetwork = state.networks[teamId];
      
      if (!existingNetwork) {
        // Si no existe la red, crear una nueva con los elementos proporcionados
        return {
          networks: {
            ...state.networks,
            [teamId]: {
              nodes,
              edges,
              statistics: statistics || {
                total_players: nodes.length,
                total_connections: edges.length,
                total_passes: edges.reduce((sum, e) => sum + e.pass_count, 0),
                team_id: teamId,
              },
            },
          },
        };
      }

      // Actualizar nodos
      const nodeMap = new Map(
        existingNetwork.nodes.map((node) => [node.player_id, node])
      );
      nodes.forEach((node) => {
        nodeMap.set(node.player_id, node);
      });

      // Actualizar aristas
      const edgeMap = new Map(
        existingNetwork.edges.map((edge) => [
          `${edge.from_player_id}-${edge.to_player_id}`,
          edge,
        ])
      );
      edges.forEach((edge) => {
        edgeMap.set(`${edge.from_player_id}-${edge.to_player_id}`, edge);
      });

      return {
        networks: {
          ...state.networks,
          [teamId]: {
            nodes: Array.from(nodeMap.values()),
            edges: Array.from(edgeMap.values()),
            statistics: statistics || existingNetwork.statistics,
          },
        },
      };
    });
  },

  getNetwork: (teamId) => {
    return get().networks[teamId];
  },

  clearNetwork: (teamId) => {
    set((state) => {
      const { [teamId]: _, ...rest } = state.networks;
      return { networks: rest };
    });
  },

  clearAllNetworks: () => {
    set({ networks: {} });
  },
}));