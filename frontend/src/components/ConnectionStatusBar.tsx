import React from 'react';
import type { WebSocketStatus, GameData } from '@/types';
import { AlertCircle, CheckCircle2, CircleDot, WifiOff } from 'lucide-react';

interface ConnectionStatusBarProps {
  status: WebSocketStatus;
  selectedGame?: GameData | null;
}

const ConnectionStatusBar: React.FC<ConnectionStatusBarProps> = ({ status, selectedGame }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'connected':
        return 'bg-emerald-900/50 border-emerald-600 text-emerald-200';
      case 'connecting':
        return 'bg-yellow-900/50 border-yellow-600 text-yellow-200';
      case 'error':
        return 'bg-red-900/50 border-red-600 text-red-200';
      case 'disconnected':
      default:
        return 'bg-slate-800/70 border-slate-700 text-slate-300';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'connecting':
        return <CircleDot className="h-4 w-4 animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'disconnected':
      default:
        return <WifiOff className="h-4 w-4" />;
    }
  };

  return (
    <div className="border border-slate-800 rounded-lg p-3 bg-slate-900/60">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          {selectedGame ? (
            <div className="text-white font-semibold text-base flex items-center gap-2">
              <span>{selectedGame.home_team.team_name}</span>
              <span className="text-emerald-300">
                {selectedGame.home_team.score ?? '0'}
              </span>
              <span className="text-slate-400">:</span>
              <span className="text-emerald-300">
                {selectedGame.away_team.score ?? '0'}
              </span>
              <span>{selectedGame.away_team.team_name}</span>
            </div>
          ) : (
            <div className="text-slate-400 text-sm italic">
              No hay partido seleccionado
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold tracking-wide text-red-100 bg-red-600 rounded-md">
              LIVE
            </span>
          </div>
        </div>

        <div
          className={`h-10 w-10 rounded-full border flex items-center justify-center ${getStatusStyle()}`}
          aria-label="Estado de conexion"
          title={status}
        >
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatusBar;
