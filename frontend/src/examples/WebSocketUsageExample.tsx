/**
 * Ejemplo de uso del hook useWebSocket con sincronización automática de stores
 * 
 * Este componente demuestra cómo usar el hook actualizado que sincroniza
 * automáticamente los stores de Zustand con los mensajes del WebSocket.
 */

import { useWebSocket } from '@/hooks/useWebSocket';
import { useGameStore, useEventsStore, usePassNetworkStore } from '@/store';

export function DashboardWithWebSocket() {
  // 1. Conectar al WebSocket
  // La sincronización de stores se hace AUTOMÁTICAMENTE dentro del hook
  const { status, lastMessage, send } = useWebSocket({
    url: 'ws://localhost:8000',
    gameId: 'game-123', // Opcional: ID del partido específico
    onMessage: (data) => {
      // Opcional: callback para procesamiento adicional
      console.log('Mensaje recibido:', data);
    },
    onStatusChange: (newStatus) => {
      console.log('Estado WebSocket:', newStatus);
    }
  });

  // 2. Acceder a los datos sincronizados desde los stores
  const game = useGameStore(state => state.game);
  const events = useEventsStore(state => state.events);
  const homeNetwork = usePassNetworkStore(state => state.getNetwork('1564'));
  const awayNetwork = usePassNetworkStore(state => state.getNetwork('184'));

  // 3. Renderizar la UI con los datos en tiempo real
  return (
    <div>
      <h1>Dashboard en Tiempo Real</h1>
      
      {/* Estado de conexión */}
      <div>
        Estado WebSocket: {status}
        {status === 'connected' && ' ✅'}
        {status === 'connecting' && ' ⏳'}
        {status === 'disconnected' && ' ⭕'}
        {status === 'error' && ' ❌'}
      </div>

      {/* Información del partido */}
      {game && (
        <div>
          <h2>
            {game.home_team.team_name} {game.home_team.score} - {game.away_team.score} {game.away_team.team_name}
          </h2>
          <p>{game.competition_name} - {game.season_name}</p>
        </div>
      )}

      {/* Eventos del partido */}
      <div>
        <h3>Eventos del Partido ({events.length})</h3>
        <ul>
          {events.slice(-10).reverse().map(event => (
            <li key={event.id}>
              <strong>{event.min}:{event.sec}</strong> - {event.event_name}
            </li>
          ))}
        </ul>
      </div>

      {/* Redes de pases */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Equipo Local */}
        <div>
          <h3>{game?.home_team.team_name} - Red de Pases</h3>
          {homeNetwork && (
            <>
              <p>Jugadores: {homeNetwork.statistics.total_players}</p>
              <p>Conexiones: {homeNetwork.statistics.total_connections}</p>
              <p>Pases totales: {homeNetwork.statistics.total_passes}</p>
              <ul>
                {homeNetwork.nodes.slice(0, 5).map(node => (
                  <li key={node.player_id}>
                    {node.player_name || node.player_id} - {node.pass_count} pases
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Equipo Visitante */}
        <div>
          <h3>{game?.away_team.team_name} - Red de Pases</h3>
          {awayNetwork && (
            <>
              <p>Jugadores: {awayNetwork.statistics.total_players}</p>
              <p>Conexiones: {awayNetwork.statistics.total_connections}</p>
              <p>Pases totales: {awayNetwork.statistics.total_passes}</p>
              <ul>
                {awayNetwork.nodes.slice(0, 5).map(node => (
                  <li key={node.player_id}>
                    {node.player_name || node.player_id} - {node.pass_count} pases
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Último mensaje (para debug) */}
      {lastMessage && (
        <details>
          <summary>Último mensaje WebSocket</summary>
          <pre>{JSON.stringify(lastMessage, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}

/**
 * Ejemplo 2: Solo conectar y los stores se actualizan automáticamente
 */
export function SimpleConnection() {
  // Solo necesitas conectar - los stores se actualizan solos
  const { status } = useWebSocket({
    url: 'ws://localhost:8000',
  });

  // Acceder a los datos desde cualquier componente hijo
  return (
    <div>
      <ConnectionStatus status={status} />
      <GameInfo />
      <EventsList />
      <PassNetworkViz />
    </div>
  );
}

// Componentes hijos pueden acceder a los stores
function GameInfo() {
  const game = useGameStore(state => state.game);
  if (!game) return <p>Esperando información del partido...</p>;
  
  return (
    <div>
      <h2>{game.home_team.team_name} vs {game.away_team.team_name}</h2>
    </div>
  );
}

function EventsList() {
  const events = useEventsStore(state => state.events);
  return (
    <div>
      <h3>Eventos: {events.length}</h3>
    </div>
  );
}

function PassNetworkViz() {
  const getNetwork = usePassNetworkStore(state => state.getNetwork);
  const homeNetwork = getNetwork('1564');
  
  return (
    <div>
      <h3>Red de Pases</h3>
      {homeNetwork && (
        <p>Jugadores: {homeNetwork.statistics.total_players}</p>
      )}
    </div>
  );
}

function ConnectionStatus({ status }: { status: string }) {
  return <div>Estado: {status}</div>;
}
