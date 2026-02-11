import React, { useState } from "react";
import NetworkPassPitch from "@/components/Pitch/PassNetworkPitch";
import PassNetworkStats from "@/components/Pitch/PassNetworkStats";
import MatchStatusPanel from "@/components/MatchStatusPanel";
import { useWebSocket, type WebSocketStatus } from "@/hooks/useWebSocket";
import EventPitch from "@/components/Pitch/EventPitch";
import { useGameStore } from "@/store";


const INITIAL_GAME_ID = "2372222";

const DashboardLayout: React.FC = () => {
  const [wsStatus, setWsStatus] = useState<WebSocketStatus>('disconnected');
  const selectedGame = useGameStore((state) => state.game);
  console.log('Partido seleccionado en DashboardLayout:', selectedGame);
  // Configurar WebSocket
  useWebSocket({
    url: 'ws://localhost:8000',
    gameId: INITIAL_GAME_ID,
    onStatusChange: setWsStatus,
    onMessage: (data) => {
        // Solo loguear mensajes relevantes para evitar ruido
        console.log('Mensaje WebSocket recibido:', data); 
    }
  });

  return (
    <div className="h-screen w-full bg-slate-950">
      {/* Grid Container */}
      <div className="h-full flex flex-col p-4 gap-2 overflow-auto">
        {/* Fila 1: 3 columnas - 40% de altura */}
        <div className="grid grid-cols-12 gap-2 min-h-[40vh]">
          {/* Columna 1 - Grande */}
          <div className="col-span-4 bg-slate-900 rounded-lg border border-slate-800 p-4">
            <h2 className="text-white text-lg font-semibold mb-2">Panel 1</h2>
            <p className="text-slate-400">Contenido de la primera columna</p>
          </div>

          {/* Columna 2 - Pequeña */}
          <div className="col-span-4 bg-slate-900 rounded-lg border border-slate-800 p-4">
            <MatchStatusPanel status={wsStatus} selectedGame={selectedGame} />
          </div>

          {/* Columna 3 - Grande */}
          <div className="col-span-4 bg-slate-900 rounded-lg border border-slate-800 p-4">
            <h2 className="text-white text-lg font-semibold mb-2">Panel 3</h2>
            <p className="text-slate-400">Contenido de la tercera columna</p>
          </div>
        </div>

        {/* Fila 2: 2 columnas (mitad y mitad) - 60% de altura */}
        <div className="grid grid-cols-2 gap-2 min-h-[55vh]">
          {/* Columna 1 - Mitad */}
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 flex flex-col">
            <EventPitch width={550} height={400} />
          </div>

          {/* Columna 2 - Mitad con 2 filas internas */}
          <div className="grid grid-rows-2 gap-2">
            {/* Subfila 1 - Equipo A */}
            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex min-h-0">
              <div className="flex flex-1 min-w-0">
                {/* Red de pases */}
                <div className="flex-1 flex flex-col p-3">
                  <div className="text-white text-xs font-semibold mb-1">Red de pases.{selectedGame?.home_team.team_name}</div>
                  <div className="flex-1 flex items-center justify-center min-h-0">
                    <NetworkPassPitch teamId="1564" width={300} height={170} />
                  </div>
                </div>
                {/* Estadísticas */}
                <div className="w-48 overflow-y-auto">
                  <PassNetworkStats teamId="1564" />
                </div>
              </div>
            </div>

            {/* Subfila 2 - Equipo B */}
            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex min-h-0">
              <div className="flex flex-1 min-w-0">
                {/* Red de pases */}
                <div className="flex-1 flex flex-col p-3 ">
                  <div className="text-white text-xs font-semibold mb-1">Red de pases. {selectedGame?.away_team.team_name}</div>
                  <div className="flex-1 flex items-center justify-center min-h-0">
                    <NetworkPassPitch teamId="184" width={300} height={170} />
                  </div>
                </div>
                {/* Estadísticas */}
                <div className="w-48 overflow-y-auto">
                  <PassNetworkStats teamId="184" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
