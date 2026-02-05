import React from 'react';
import { type WebSocketStatus } from '@/hooks/useWebSocket';
import { CheckCircle2, CircleDot, AlertCircle, Circle } from 'lucide-react';

interface ConnectionStatusBarProps {
  status: WebSocketStatus;
  selectedGame?: {
    id: string;
    name: string;
    homeTeam: string;
    awayTeam: string;
  };
}

const ConnectionStatusBar: React.FC<ConnectionStatusBarProps> = ({ status, selectedGame }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-900 border-green-700';
      case 'connecting':
        return 'bg-yellow-900 border-yellow-700';
      case 'error':
        return 'bg-red-900 border-red-700';
      case 'disconnected':
      default:
        return 'bg-slate-800 border-slate-700';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Conectando...';
      case 'error':
        return 'Error de conexión';
      case 'disconnected':
      default:
        return '○ Desconectado';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="w-6 h-6 text-green-400" />;
      case 'connecting':
        return <CircleDot className="w-6 h-6 text-yellow-400 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-400" />;
      case 'disconnected':
      default:
        return <Circle className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <div className={`border border-slate-700 rounded-lg p-3 ${getStatusColor()} transition-colors duration-300`}>
      <div className="flex items-center justify-between gap-4">
        {/* Lado izquierdo - Información del partido */}
        <div className="flex-1 flex items-center gap-4">
          {selectedGame ? (
            <div className="flex items-center gap-3">
              <div className="text-white font-semibold text-sm">
                <div className="text-xs text-slate-300 mb-1">Partido seleccionado</div>
                <div className="flex items-center gap-2">
                  <span>{selectedGame.homeTeam}</span>
                  <span className="text-slate-400">vs</span>
                  <span>{selectedGame.awayTeam}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-sm italic">
              No hay partido seleccionado
            </div>
          )}
        </div>

        {/* Lado derecho - Estado de conexión */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {getStatusIcon()}
          <div className="text-right">
            <div className={`text-sm font-medium ${
              status === 'connected' ? 'text-green-300' :
              status === 'connecting' ? 'text-yellow-300' :
              status === 'error' ? 'text-red-300' :
              'text-slate-400'
            }`}>
              {getStatusText()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatusBar;
