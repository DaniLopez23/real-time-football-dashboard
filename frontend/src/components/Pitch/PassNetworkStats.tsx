import React, { useMemo } from 'react'
import { usePassNetworkStore } from '@/store'

interface PassNetworkStatsProps {
  teamId: string
}

const PassNetworkStats: React.FC<PassNetworkStatsProps> = ({ teamId }) => {
  const network = usePassNetworkStore((state) => state.getNetwork(teamId))

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (!network || network.nodes.length === 0) {
      return {
        mostPasses: null,
        mostReceived: null,
        strongestConnection: null,
      }
    }

    // Jugador con más pases dados
    const mostPasses = network.nodes.reduce((prev, current) =>
      current.passes_given > prev.passes_given ? current : prev
    )

    // Jugador con más pases recibidos
    const mostReceived = network.nodes.reduce((prev, current) =>
      current.passes_received > prev.passes_received ? current : prev
    )

    // Conexión más fuerte (arista con más pases)
    let strongestConnection = null
    if (network.edges.length > 0) {
      const maxEdge = network.edges.reduce((prev, current) =>
        current.pass_count > prev.pass_count ? current : prev
      )
      
      // Encontrar los nombres de los jugadores
      const fromPlayer = network.nodes.find(n => n.player_id === maxEdge.from_player_id)
      const toPlayer = network.nodes.find(n => n.player_id === maxEdge.to_player_id)
      
      strongestConnection = {
        from: maxEdge.from_player_id,
        to: maxEdge.to_player_id,
        passes: maxEdge.pass_count,
      }
    }

    return {
      mostPasses,
      mostReceived,
      strongestConnection,
    }
  }, [network])

  if (!network || network.nodes.length === 0) {
    return <div className="text-xs text-slate-400 p-2">No hay datos</div>
  }

  return (
    <div className="flex flex-col gap-2 p-3 h-full text-xs">
      {/* Jugador con más pases dados */}
      <div className="bg-slate-800 rounded border border-slate-700 p-2">
        <div className="text-slate-400 font-semibold mb-1">📤 Más Dados</div>
        <div className="text-slate-100 font-bold text-sm">{stats.mostPasses?.player_id || '-'}</div>
        <div className="text-blue-400 text-xs">{stats.mostPasses?.passes_given || 0} pases</div>
      </div>



      {/* Conexión más fuerte */}
      <div className="bg-slate-800 rounded border border-slate-700 p-2">
        <div className="text-slate-400 font-semibold mb-1">🔗 Conexión Fuerte</div>
        {stats.strongestConnection ? (
          <>
            <div className="text-slate-100 font-bold text-sm">
              {stats.strongestConnection.from} → {stats.strongestConnection.to}
            </div>
            <div className="text-orange-400 text-xs">{stats.strongestConnection.passes} pases</div>
          </>
        ) : (
          <div className="text-slate-400 text-xs">N/A</div>
        )}
      </div>

    </div>
  )
}

export default PassNetworkStats
