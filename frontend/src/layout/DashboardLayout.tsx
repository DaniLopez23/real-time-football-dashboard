import React, { useState } from "react";
import NetworkPassPitch from "@/components/Pitch/PassNetworkPitch";
import PassNetworkStats from "@/components/Pitch/PassNetworkStats";
import PassNetworkFilters, {
  type PassNetworkFilters as PassNetworkFiltersState,
} from "@/components/Pitch/PassNetworkFilters";
import MatchStatusPanel from "@/components/MatchStatusPanel";
import { useWebSocket, type WebSocketStatus } from "@/hooks/useWebSocket";
import EventPitch from "@/components/Pitch/EventPitch";
import { useGameStore } from "@/store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

const INITIAL_GAME_ID = "2372222";
const PASS_NETWORK_MAX_MINUTE = 90;
const PASS_NETWORK_DEFAULT_FILTERS: PassNetworkFiltersState = {
  minPasses: 3,
  showFullNetwork: true,
  minute: 0,
};

const DashboardLayout: React.FC = () => {
  const [wsStatus, setWsStatus] = useState<WebSocketStatus>("disconnected");
  const [homePassFilters, setHomePassFilters] = useState<PassNetworkFiltersState>(
    PASS_NETWORK_DEFAULT_FILTERS
  );
  const [awayPassFilters, setAwayPassFilters] = useState<PassNetworkFiltersState>(
    PASS_NETWORK_DEFAULT_FILTERS
  );
  const selectedGame = useGameStore((state) => state.game);
  console.log("Partido seleccionado en DashboardLayout:", selectedGame);
  // Configurar WebSocket
  useWebSocket({
    url: "ws://localhost:8000",
    gameId: INITIAL_GAME_ID,
    onStatusChange: setWsStatus,
    onMessage: (data) => {
      // Solo loguear mensajes relevantes para evitar ruido
      console.log("Mensaje WebSocket recibido:", data);
    },
  });

  return (
    <div className="h-screen w-full bg-slate-950">
      {/* Grid Container */}
      <div className="h-full flex flex-col p-2 gap-2 overflow-auto">
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

        {/* Fila 2: 2 columnas - proporción adaptable */}
        <div className="grid grid-cols-[auto_1fr] gap-2 min-h-[55vh]">
          {/* Columna 1 - Se ajusta al contenido */}
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-2 flex flex-col">
            <EventPitch width={550} height={400} />
          </div>

          {/* Columna 2 - Toma el espacio restante */}
          <div className="grid grid-rows-2 gap-2">
            {/* Subfila 1 - Equipo A (Local) */}
            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden p-2 flex flex-col min-h-0">
              {/* Fila 1: Título */}
              <div className="text-white text-xs font-semibold mb-2">
                Red de pases - {selectedGame?.home_team.team_name}
              </div>

              {/* Fila 2: 3 columnas responsivas (stats | pitch | filtros)*/}
              <div className="grid grid-cols-1 md:grid-cols-[minmax(48px,1fr)_minmax(240px,3fr)_minmax(48px,160px)] gap-4 md:gap-6 flex-1 min-h-0 items-start">

                {/* Columna 1: Estadísticas (pueden crecer/encoger; no cortar verticalmente) */}
                <div className="w-full">
                  <PassNetworkStats teamId="1564" />
                </div>

                {/* Columna 2: Red de pases (flexible, ocupa espacio restante) */}
                <div className="flex items-center justify-center w-full">
                  <div className="w-full max-w-[320px] md:max-w-none flex justify-center">
                    <NetworkPassPitch teamId="1564" width={300} height={200} isHomeTeam={true} />
                  </div>
                </div>

                {/* Columna 3: Filtros (full en md+, icon-popover en sm) */}
                <div className="flex items-start justify-end w-full">
                  <div className="hidden md:block w-full max-w-[260px]">
                    <PassNetworkFilters maxMinute={PASS_NETWORK_MAX_MINUTE} filters={homePassFilters} onFiltersChange={setHomePassFilters} />
                  </div>

                  <div className="md:hidden flex items-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-1 bg-slate-700/50 hover:bg-slate-600/50 border-slate-600 text-slate-200">
                          <SlidersHorizontal className="h-4 w-4 text-slate-300" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="center" className="w-72">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-semibold mb-2">Estadísticas</h3>
                            <PassNetworkStats teamId="1564" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold mb-2">Red de pases</h3>
                            <div className="flex justify-center">
                              <NetworkPassPitch teamId="1564" width={300} height={220} isHomeTeam={true} />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold mb-2">Filtros</h3>
                            <PassNetworkFilters maxMinute={PASS_NETWORK_MAX_MINUTE} filters={homePassFilters} onFiltersChange={setHomePassFilters} />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>

            {/* Subfila 2 - Equipo B (Visitante) */}
            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden p-2 flex flex-col min-h-0">
              {/* Fila 1: Título */}
              <div className="text-white text-xs font-semibold mb-2">
                Red de pases - {selectedGame?.away_team.team_name}
              </div>

              {/* Fila 2: 3 columnas responsivas (stats | pitch | filtros) - visitante */}
              <div className="grid grid-cols-1 md:grid-cols-[minmax(48px,1fr)_minmax(240px,3fr)_minmax(48px,160px)] gap-4 md:gap-6 flex-1 min-h-0 items-start"> 

                {/* Columna 1: Estadísticas (pueden crecer/encoger; no cortar verticalmente) */}
                <div className="w-full">
                  <PassNetworkStats teamId="184" />
                </div>

                {/* Columna 2: Red de pases (flexible) */}
                <div className="flex items-center justify-center w-full">
                  <div className="w-full max-w-[320px] md:max-w-none flex justify-center">
                    <NetworkPassPitch teamId="184" width={300} height={200} isHomeTeam={false} />
                  </div>
                </div>

                {/* Columna 3: Filtros (full en md+, icon-popover en sm) */}
                <div className="flex items-start justify-end w-full">
                  <div className="hidden md:block w-full max-w-[260px]">
                    <PassNetworkFilters maxMinute={PASS_NETWORK_MAX_MINUTE} filters={awayPassFilters} onFiltersChange={setAwayPassFilters} />
                  </div>

                  <div className="md:hidden flex items-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-1 bg-slate-700/50 hover:bg-slate-600/50 border-slate-600 text-slate-200">
                          <SlidersHorizontal className="h-4 w-4 text-slate-300" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="center" className="w-72">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-semibold mb-2">Estadísticas</h3>
                            <PassNetworkStats teamId="184" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold mb-2">Red de pases</h3>
                            <div className="flex justify-center">
                              <NetworkPassPitch teamId="184" width={300} height={220} isHomeTeam={false} />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold mb-2">Filtros</h3>
                            <PassNetworkFilters maxMinute={PASS_NETWORK_MAX_MINUTE} filters={awayPassFilters} onFiltersChange={setAwayPassFilters} />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
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
