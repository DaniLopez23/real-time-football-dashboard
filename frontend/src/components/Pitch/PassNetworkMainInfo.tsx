import React, { useEffect, useState } from 'react'
import { getPassNetworkByTeam } from '@/api/events'
import type { PassNetwork } from '@/api/events'

interface PassNetworkMainInfoProps {
  teamId: string
}

interface HighlightStat {
  label: string
  playerId: string
  value: number
  metric: string
}

const PassNetworkMainInfo: React.FC<PassNetworkMainInfoProps> = ({ teamId }) => {
  const [data, setData] = useState<PassNetwork | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const networkData = await getPassNetworkByTeam(teamId)
        setData(networkData)
      } catch (err) {
        console.error('Error al cargar datos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [teamId])

  if (loading) {
    return <div className="p-4 text-slate-400 text-sm">Cargando datos...</div>
  }

  if (!data || data.nodes.length === 0) {
    return <div className="p-4 text-slate-400 text-sm">No hay datos disponibles</div>
  }

  // Calcular destacados
  const topPasser = data.nodes.reduce((prev, current) =>
    current.passes_given > prev.passes_given ? current : prev
  )

  const topReceiver = data.nodes.reduce((prev, current) =>
    current.passes_received > prev.passes_received ? current : prev
  )

  const mostInfluential = data.nodes.reduce((prev, current) =>
    current.pass_count > prev.pass_count ? current : prev
  )

  const strongestConnection = data.edges.reduce((prev, current) =>
    current.pass_count > prev.pass_count ? current : prev
  )

  const highlights: HighlightStat[] = [
    // {
    //   label: 'Jugador con más pases dados',
    //   playerId: topPasser.player_id,
    //   value: topPasser.passes_given,
    //   metric: 'pases'
    // },
    // {
    //   label: 'Jugador con más pases recibidos',
    //   playerId: topReceiver.player_id,
    //   value: topReceiver.passes_received,
    //   metric: 'pases'
    // },
    {
      label: 'Jugador más influyente',
      playerId: mostInfluential.player_id,
      value: mostInfluential.pass_count,
      metric: 'pases totales'
    }
  ]

  return (
    <div className="p-4 space-y-3">
      {/* Destacados de jugadores */}
      {highlights.map((highlight, index) => (
        <div
          key={index}
          className="pb-2"
        >
          <div className="text-slate-500 text-[10px] uppercase tracking-wide mb-1">
            {highlight.label}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-white font-semibold text-sm">
              Jugador {highlight.playerId}
            </span>
            <span className="text-blue-400 text-xs">
              {highlight.value} {highlight.metric}
            </span>
          </div>
        </div>
      ))}

      {/* Conexión más fuerte */}
      <div className="pb-2">
        <div className="text-slate-500 text-[10px] uppercase tracking-wide mb-1">
          Conexión más fuerte
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-white font-semibold text-sm">
            {strongestConnection.from_player_id} → {strongestConnection.to_player_id}
          </span>
          <span className="text-blue-400 text-xs">
            {strongestConnection.pass_count} pases
          </span>
        </div>
      </div>
    </div>
  )
}

export default PassNetworkMainInfo
