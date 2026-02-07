/**
 * Hook para manejar actualizaciones WebSocket y sincronizar stores
 * 
 * Este hook escucha los mensajes del WebSocket y actualiza automáticamente
 * los stores de Game, Events y PassNetwork según el tipo de mensaje.
 */

import { useEffect } from 'react';
import { useGameStore } from './useGameStore';
import { useEventsStore } from './useEventsStore';
import { usePassNetworkStore } from './usePassNetworkStore';
import type {
  WebSocketUpdateMessage,
  NewGameMessage,
  GameUpdatesMessage,
  NewEventsMessage,
  EventsUpdatesMessage,
  PassNetworkMessage,
} from '@/types';

/**
 * Hook para sincronizar stores con mensajes WebSocket
 * 
 * @param message - Mensaje WebSocket recibido del backend
 */
export const useWebSocketSync = (message: WebSocketUpdateMessage | null) => {
  const { setGame, updateGame, clearGame } = useGameStore();
  const { addEvents, updateEvents, clearEvents } = useEventsStore();
  const { updateNetworkElements, clearAllNetworks } = usePassNetworkStore();

  useEffect(() => {
    if (!message) return;

    switch (message.type) {
      case 'new_game': {
        const msg = message as NewGameMessage;
        console.log('🎮 New Game:', msg.game_id);
        
        // Resetear todos los stores
        clearGame();
        clearEvents();
        clearAllNetworks();
        
        // Establecer nuevo juego
        setGame(msg.game);
        break;
      }

      case 'game_updates': {
        const msg = message as GameUpdatesMessage;
        console.log('🔄 Game Updates:', msg.game_id);
        
        // Actualizar información del juego
        updateGame(msg.game);
        break;
      }

      case 'new_events': {
        const msg = message as NewEventsMessage;
        console.log('📝 New Events:', msg.count, 'events');
        
        // Agregar nuevos eventos
        addEvents(msg.events);
        break;
      }

      case 'events_updates': {
        const msg = message as EventsUpdatesMessage;
        console.log('🔄 Events Updates:', msg.count, 'events');
        
        // Actualizar eventos existentes
        updateEvents(msg.events);
        break;
      }

      case 'new_pass_network_elements': {
        const msg = message as PassNetworkMessage;
        console.log('🕸️  New Pass Network Elements:', msg.team_id, '-', msg.nodes.length, 'nodes,', msg.edges.length, 'edges');
        
        // Actualizar red de pases con nuevos elementos
        updateNetworkElements(msg.team_id, msg.nodes, msg.edges, msg.statistics);
        break;
      }

      case 'update_pass_network_elements': {
        const msg = message as PassNetworkMessage;
        console.log('🔄 Update Pass Network Elements:', msg.team_id, '-', msg.nodes.length, 'nodes,', msg.edges.length, 'edges');
        
        // Actualizar elementos existentes de la red de pases
        updateNetworkElements(msg.team_id, msg.nodes, msg.edges, msg.statistics);
        break;
      }

      default:
        console.warn('Unknown message type:', (message as any).type);
    }
  }, [message]);
};

/**
 * Hook para procesar múltiples mensajes WebSocket (batch)
 * 
 * @param messages - Array de mensajes WebSocket recibidos
 */
export const useWebSocketBatchSync = (messages: WebSocketUpdateMessage[] | null) => {
  const { setGame, updateGame, clearGame } = useGameStore();
  const { addEvents, updateEvents, clearEvents } = useEventsStore();
  const { updateNetworkElements, clearAllNetworks } = usePassNetworkStore();

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    console.log('📦 Processing batch:', messages.length, 'messages');

    // Procesar todos los mensajes en orden
    messages.forEach((message) => {
      switch (message.type) {
        case 'new_game': {
          const msg = message as NewGameMessage;
          console.log('  🎮 New Game:', msg.game_id);
          clearGame();
          clearEvents();
          clearAllNetworks();
          setGame(msg.game);
          break;
        }

        case 'game_updates': {
          const msg = message as GameUpdatesMessage;
          console.log('  🔄 Game Updates:', msg.game_id);
          updateGame(msg.game);
          break;
        }

        case 'new_events': {
          const msg = message as NewEventsMessage;
          console.log('  📝 New Events:', msg.count, 'events');
          addEvents(msg.events);
          break;
        }

        case 'events_updates': {
          const msg = message as EventsUpdatesMessage;
          console.log('  🔄 Events Updates:', msg.count, 'events');
          updateEvents(msg.events);
          break;
        }

        case 'new_pass_network_elements': {
          const msg = message as PassNetworkMessage;
          console.log('  🕸️  New Pass Network Elements:', msg.team_id);
          updateNetworkElements(msg.team_id, msg.nodes, msg.edges, msg.statistics);
          break;
        }

        case 'update_pass_network_elements': {
          const msg = message as PassNetworkMessage;
          console.log('  🔄 Update Pass Network Elements:', msg.team_id);
          updateNetworkElements(msg.team_id, msg.nodes, msg.edges, msg.statistics);
          break;
        }
      }
    });
  }, [messages]);
};
