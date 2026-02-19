import React from "react";
import type { GameData, WebSocketStatus } from "@/types";
import { Wifi } from "lucide-react";

interface MatchStatusPanelProps {
  status: WebSocketStatus;
  selectedGame?: GameData | null;
}

const MatchStatusPanel: React.FC<MatchStatusPanelProps> = ({
  status,
  selectedGame,
}) => {
  const getStatusStyle = () => {
    switch (status) {
      case "connected":
        return "bg-emerald-500/15 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)]";
      case "connecting":
        return "bg-amber-500/15 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]";
      case "error":
        return "bg-rose-500/15 border-rose-400 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.35)]";
      case "disconnected":
      default:
        return "bg-slate-500/10 border-slate-500 text-slate-300";
    }
  };

  const getStatusIcon = () => {
    return (
      <Wifi
        className={`h-4 w-4 ${status === "connecting" ? "animate-pulse" : ""}`}
      />
    );
  };

  return (
    <div className="h-full w-full flex flex-col justify-top gap-3">
      {selectedGame ? (
        <>
          <div className="grid grid-cols-3 items-center text-center">
            <div className="text-slate-200 text-lg font-semibold ">
              {selectedGame.home_team.team_name}
            </div>
            <div className="text-white text-3xl font-extrabold">
              <span className="text-emerald-300">
                {selectedGame.home_team.score ?? "0"}
              </span>{" "}
              <span className="text-slate-400">:</span>{" "}
              <span className="text-emerald-300">
                {selectedGame.away_team.score ?? "0"}
              </span>
            </div>
            <div className="text-slate-200 text-lg font-semibold ">
              {selectedGame.away_team.team_name}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="inline-flex items-center rounded-sm bg-gradient-to-r from-red-600 to-rose-500 px-3 py-1 text-xs font-semibold text-red-50 uppercase tracking-wider shadow-[0_0_10px_rgba(239,68,68,0.45)]">
              LIVE
            </span>
            <div
              className={`h-8 w-8 rounded-full border flex items-center justify-center ${getStatusStyle()}`}
              aria-label="Estado de conexion"
              title={status}
            >
              {getStatusIcon()}
            </div>
          </div>
        </>
      ) : (
        <div className="text-slate-400 text-sm italic flex items-center justify-center h-full">
          No hay partido seleccionado
        </div>
      )}
    </div>
  );
};

export default MatchStatusPanel;
