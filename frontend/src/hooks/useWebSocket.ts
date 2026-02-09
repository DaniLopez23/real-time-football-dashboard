/**
 * Hook useWebSocket con sincronización automática de stores
 * 
 * Este hook gestiona la conexión WebSocket al backend y automáticamente sincroniza
 * los stores de Zustand (Game, Events, PassNetwork) cuando llegan mensajes.
 * 
 * Características:
 * - ✅ Sincronización automática de stores (no necesitas hacer nada más)
 * - ✅ Reconexión automática con backoff exponencial
 * - ✅ Heartbeat cada 30 segundos para mantener la conexión
 * - ✅ Manejo de estados: connecting, connected, disconnected, error
 * - ✅ Callbacks opcionales para procesamiento adicional
 * 
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useWebSocketSync } from '@/store/useWebSocketSync';
import type { WebSocketUpdateMessage, WebSocketStatus } from '@/types';

interface UseWebSocketOptions {
  url: string;
  gameId?: string;
  onMessage?: (data: any) => void;
  onStatusChange?: (status: WebSocketStatus) => void;
}

interface WebSocketWithHeartbeat extends WebSocket {
  heartbeatInterval?: number;
}

export const useWebSocket = ({ url, gameId, onMessage, onStatusChange }: UseWebSocketOptions) => {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketUpdateMessage | null>(null);
  const wsRef = useRef<WebSocketWithHeartbeat | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isManuallyClosedRef = useRef(false);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 segundos

  // Sincronizar stores automáticamente cuando llegan mensajes
  useWebSocketSync(lastMessage);

  // Actualizar estado
  const updateStatus = useCallback((newStatus: WebSocketStatus) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  // Conectar al WebSocket
  const connect = useCallback(() => {
    // No reconectar si fue cerrado manualmente
    if (isManuallyClosedRef.current) {
      console.log('⚪ WebSocket cerrado manualmente, no se reconecta');
      return;
    }

    // No reconectar si ya estamos conectados o intentando
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    // Si ya alcanzamos máximo de intentos, no continuar
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error('❌ Máximo número de intentos de reconexión alcanzado');
      updateStatus('error');
      return;
    }

    try {
      updateStatus('connecting');
      const fullUrl = gameId ? `${url}/ws/game/${gameId}` : url;
      console.log(`🔗 Intentando conectar a ${fullUrl}...`);
      const ws = new WebSocket(fullUrl);

      ws.onopen = () => {
        console.log('✅ WebSocket conectado');
        updateStatus('connected');
        reconnectAttemptsRef.current = 0;
        isManuallyClosedRef.current = false;

        // Enviar heartbeat cada 30 segundos
        const heartbeatInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);

        (ws as WebSocketWithHeartbeat).heartbeatInterval = heartbeatInterval as unknown as number;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Actualizar el último mensaje para sincronizar stores
          // Solo procesar mensajes del backend (ignorar pongs, conexiones, etc.)
          const validTypes = [
            'new_game',
            'game_updates',
            'new_events',
            'events_updates',
            'new_pass_network_elements',
            'update_pass_network_elements',
            "match_state_snapshot"
          ];
          
          if (validTypes.includes(data.type)) {
            setLastMessage(data as WebSocketUpdateMessage);
          }
          
          // Mantener compatibilidad con el callback onMessage
          onMessage?.(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Error en WebSocket:', error);
        updateStatus('error');
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket desconectado');
        updateStatus('disconnected');

        // Limpiar heartbeat
        if ((ws as WebSocketWithHeartbeat).heartbeatInterval) {
          clearInterval((ws as WebSocketWithHeartbeat).heartbeatInterval!);
        }

        // Intentar reconectar solo si no fue cerrado manualmente
        if (!isManuallyClosedRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = reconnectDelay * reconnectAttemptsRef.current; // Exponential backoff
          console.log(`🔄 Intentando reconectar en ${delay}ms (intento ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          reconnectTimeoutRef.current = window.setTimeout(() => {
            if (!isManuallyClosedRef.current) {
              connect();
            }
          }, delay) as unknown as number;
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts && !isManuallyClosedRef.current) {
          console.error('❌ Máximo número de intentos de reconexión alcanzado');
          updateStatus('error');
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error conectando WebSocket:', error);
      updateStatus('error');
    }
  }, [url, gameId, updateStatus, onMessage]);

  // Desconectar
  const disconnect = useCallback(() => {
    isManuallyClosedRef.current = true;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      if ((wsRef.current as WebSocketWithHeartbeat).heartbeatInterval) {
        clearInterval((wsRef.current as WebSocketWithHeartbeat).heartbeatInterval!);
      }
      wsRef.current.close();
      wsRef.current = null;
    }

    // Limpiar el último mensaje
    setLastMessage(null);
    updateStatus('disconnected');
  }, [updateStatus]);

  // Enviar mensaje
  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket no está conectado');
    }
  }, []);

  // Conectar al montar y desconectar al desmontar
  useEffect(() => {
    isManuallyClosedRef.current = false;
    reconnectAttemptsRef.current = 0;
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    status,
    lastMessage,
    send,
    connect,
    disconnect,
  };
};
