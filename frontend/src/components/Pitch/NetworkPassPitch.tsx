import React, { useEffect, useState, useRef } from 'react'
import OptaPitch from './OptaPitch'
import * as d3 from 'd3'
import type { PassNetwork } from '@/api/events'
import { getPassNetworkByTeam } from '@/api/events'

interface NetworkPassPitchProps {
  teamId: string
  width?: number
  height?: number
}

const NetworkPassPitch: React.FC<NetworkPassPitchProps> = ({ teamId, width = 600, height = 400 }) => {
  const [data, setData] = useState<PassNetwork | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<any>(null)
  const [hoveredEdge, setHoveredEdge] = useState<any>(null)

  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const fetchPassNetwork = async () => {
      try {
        setLoading(true)
        const networkData = await getPassNetworkByTeam(teamId)
        setData(networkData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchPassNetwork()
  }, [teamId])

  if (loading) {
    return <div className="flex items-center justify-center h-full text-white">Cargando red de pases…</div>
  }

  if (error || !data || data.nodes.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-400">No hay datos disponibles</div>
  }

  const fieldWidth = width
  const fieldHeight = height

  const maxPassCount = d3.max(data.edges, d => d.pass_count) || 1
  const minPassCount = d3.min(data.edges, d => d.pass_count) || 0
  const maxNodePassCount = d3.max(data.nodes, d => d.pass_count) || 1

  const lineWidthScale = d3.scaleSqrt()
    .domain([minPassCount, maxPassCount])
    .range([0.5, 5])

  const opacityScale = d3.scaleLinear()
    .domain([minPassCount, maxPassCount])
    .range([0.2, 1])

  const nodeRadiusScale = d3.scaleSqrt()
    .domain([0, maxNodePassCount])
    .range([3, 15])

  const projectX = (x: number) => (x / 100) * fieldWidth
  const projectY = (y: number) => fieldHeight - (y / 100) * fieldHeight

  return (
    <div className="relative w-full h-full">
      <OptaPitch width={fieldWidth} height={fieldHeight} fieldColor="#1a472a">
        <svg ref={svgRef} width={fieldWidth} height={fieldHeight}>

          {/* === Flecha global === */}
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="12"
              markerHeight="12"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#60a5fa" />
            </marker>
          </defs>

          {/* === ARISTAS === */}
          {data.edges.map((edge, i) => {
            const from = data.nodes.find(n => n.player_id === edge.from_player_id)
            const to = data.nodes.find(n => n.player_id === edge.to_player_id)
            if (!from || !to) return null

            const x1 = projectX(from.avg_position_total.x)
            const y1 = projectY(from.avg_position_total.y)
            const x2 = projectX(to.avg_position_total.x)
            const y2 = projectY(to.avg_position_total.y)

            const dx = x2 - x1
            const dy = y2 - y1
            const dist = Math.hypot(dx, dy)
            const offset = Math.min(dist * 0.15, 30)

            const cx = (x1 + x2) / 2 - dy / dist * offset
            const cy = (y1 + y2) / 2 + dx / dist * offset

            const angle = Math.atan2(y2 - y1, x2 - x1)
            const r = nodeRadiusScale(to.pass_count) + 2

            const x2a = x2 - Math.cos(angle) * r
            const y2a = y2 - Math.sin(angle) * r

            const path = `M ${x1} ${y1} Q ${cx} ${cy} ${x2a} ${y2a}`

            const width = lineWidthScale(edge.pass_count)
            const opacity = opacityScale(edge.pass_count)

            const dimmed =
              hoveredNode &&
              edge.from_player_id !== hoveredNode.player_id &&
              edge.to_player_id !== hoveredNode.player_id

            // Calcular punto medio para el tooltip
            const t = 0.5
            const midX = Math.pow(1 - t, 2) * x1 + 2 * (1 - t) * t * cx + Math.pow(t, 2) * x2a
            const midY = Math.pow(1 - t, 2) * y1 + 2 * (1 - t) * t * cy + Math.pow(t, 2) * y2a

            return (
              <g key={i}>
                {/* hitbox */}
                <path
                  d={path}
                  stroke="transparent"
                  strokeWidth={width + 6}
                  fill="none"
                  onMouseEnter={() => setHoveredEdge({
                    ...edge,
                    x: midX,
                    y: midY,
                  })}
                  onMouseLeave={() => setHoveredEdge(null)}
                />

                <path
                  d={path}
                  stroke="#60a5fa"
                  strokeWidth={hoveredEdge?.from_player_id === edge.from_player_id && hoveredEdge?.to_player_id === edge.to_player_id ? width + 1 : width}
                  opacity={dimmed ? 0.1 : opacity}
                  fill="none"
                  markerEnd="url(#arrow)"
                />
              </g>
            )
          })}

          {/* === NODOS === */}
          {data.nodes.map(node => {
            const cx = projectX(node.avg_position_total.x)
            const cy = projectY(node.avg_position_total.y)
            const r = nodeRadiusScale(node.pass_count)

            return (
              <g
                key={node.player_id}
                onMouseEnter={() =>
                  setHoveredNode({
                    ...node,
                    x: cx,
                    y: cy,
                  })
                }
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={hoveredNode?.player_id === node.player_id ? r + 2 : r}
                  fill="#ffffff"
                  stroke="#1e40af"
                  strokeWidth={hoveredNode?.player_id === node.player_id ? 3 : 2}
                />
                <text
                  x={cx}
                  y={cy + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#1e40af"
                  pointerEvents="none"
                >
                  {node.player_id}
                </text>
              </g>
            )
          })}

          {/* === TOOLTIP NODOS === */}
          {hoveredNode && (
            <g pointerEvents="none">
              {/* Fondo */}
              <rect
                x={hoveredNode.x - 55}
                y={hoveredNode.y - 55}
                rx={6}
                ry={6}
                width={110}
                height={42}
                fill="#0f172a"
                stroke="#334155"
                strokeWidth={1}
                opacity={0.95}
              />

              {/* Texto */}
              <text
                x={hoveredNode.x}
                y={hoveredNode.y - 35}
                textAnchor="middle"
                fill="#e5e7eb"
                fontSize={11}
                fontWeight="bold"
              >
                Jugador {hoveredNode.player_id}
              </text>

              <text
                x={hoveredNode.x}
                y={hoveredNode.y - 20}
                textAnchor="middle"
                fill="#60a5fa"
                fontSize={11}
              >
                Pases: {hoveredNode.pass_count}
              </text>
            </g>
          )}

          {/* === TOOLTIP ARISTAS === */}
          {hoveredEdge && (
            <g pointerEvents="none">
              {/* Fondo */}
              <rect
                x={hoveredEdge.x - 75}
                y={hoveredEdge.y - 60}
                rx={6}
                ry={6}
                width={150}
                height={56}
                fill="#0f172a"
                stroke="#334155"
                strokeWidth={1}
                opacity={0.95}
              />

              {/* Texto */}
              <text
                x={hoveredEdge.x}
                y={hoveredEdge.y - 40}
                textAnchor="middle"
                fill="#e5e7eb"
                fontSize={11}
                fontWeight="bold"
              >
                Pase: {hoveredEdge.from_player_id} → {hoveredEdge.to_player_id}
              </text>

              <text
                x={hoveredEdge.x}
                y={hoveredEdge.y - 25}
                textAnchor="middle"
                fill="#60a5fa"
                fontSize={11}
              >
                Conexiones: {hoveredEdge.pass_count}
              </text>
            </g>
          )}
        </svg>
      </OptaPitch>
    </div>
  )
}

export default NetworkPassPitch
