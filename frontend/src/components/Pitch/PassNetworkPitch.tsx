import React, { useEffect, useState, useRef } from 'react'
import OptaPitch from './OptaPitch'
import cytoscape from 'cytoscape'
import type { PassNetwork } from '@/api/events'
import { getPassNetworkByTeam } from '@/api/events'

interface NetworkPassPitchProps {
  teamId: string
  width?: number
  height?: number
}

const NetworkPassPitch: React.FC<NetworkPassPitchProps> = ({ teamId, width = 800, height = 600 }) => {
  const [data, setData] = useState<PassNetwork | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: React.ReactNode } | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)

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

  // Inicializar Cytoscape cuando tengamos datos
  useEffect(() => {
    if (!data || !containerRef.current || data.nodes.length === 0) return

    // Limpiar instancia anterior
    if (cyRef.current) {
      cyRef.current.destroy()
    }

    // Calcular escalas para ancho y opacidad de aristas
    const maxPassCount = Math.max(...data.edges.map(e => e.pass_count), 1)
    const minPassCount = Math.min(...data.edges.map(e => e.pass_count), 0)
    const maxNodePassCount = Math.max(...data.nodes.map(n => n.pass_count), 1)

    // Convertir coordenadas Opta (0-100) a píxeles del contenedor
    // OptaPitch usa escalas lineales directas: domain [0, 100] -> range [0, width] y [height, 0]
    const projectX = (x: number) => (x / 100) * width
    const projectY = (y: number) => height - (y / 100) * height // Invertir Y

    // Preparar nodos
    const nodes = data.nodes.map(node => {
      const pixelX = projectX(node.avg_position_total.x)
      const pixelY = projectY(node.avg_position_total.y)
      
      // console.log(`Player ${node.player_id}: Opta(${node.avg_position_total.x}, ${node.avg_position_total.y}) -> Pixel(${pixelX}, ${pixelY})`)
      
      return {
        data: {
          id: node.player_id,
          label: node.player_id,
          passCount: node.pass_count,
          x: node.avg_position_total.x,
          y: node.avg_position_total.y
        },
        position: {
          x: pixelX,
          y: pixelY
        }
      }
    })

    // Preparar aristas
    const edges = data.edges.map((edge, i) => ({
      data: {
        id: `edge-${i}`,
        source: edge.from_player_id,
        target: edge.to_player_id,
        passCount: edge.pass_count,
        weight: edge.pass_count
      }
    }))

    // Crear instancia de Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: [...nodes, ...edges],
      layout: {
        name: 'preset' // Usar posiciones predefinidas
      },
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#ffffff',
            'border-color': '#1e40af',
            'border-width': 1.5,
            'width': (ele) => {
              const passCount = ele.data('passCount')
              return Math.sqrt(passCount / maxNodePassCount) * 15 + 8
            },
            'height': (ele) => {
              const passCount = ele.data('passCount')
              return Math.sqrt(passCount / maxNodePassCount) * 15 + 8
            },
            'label': 'data(label)',
            'font-size': '9px',
            'font-weight': 'bold',
            'color': '#1e40af',
            'text-valign': 'center',
            'text-halign': 'center'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 3,
            'border-color': '#60a5fa'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': (ele) => {
              const passCount = ele.data('passCount')
              return Math.sqrt(passCount / maxPassCount) * 5 + 0.3
            },
            'line-color': '#60a5fa',
            'target-arrow-color': '#60a5fa',
            'target-arrow-shape': 'triangle',
            'curve-style': 'unbundled-bezier',
            'control-point-distances': 15,
            'control-point-weights': 0.5,
            'opacity': (ele) => {
              const passCount = ele.data('passCount')
              return 0.15 + (passCount / maxPassCount) * 0.85
            },
            'arrow-scale': 1
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#3b82f6',
            'target-arrow-color': '#3b82f6',
            'width': (ele) => {
              const passCount = ele.data('passCount')
              return Math.sqrt(passCount / maxPassCount) * 5 + 2
            }
          }
        },
        {
          selector: '.dimmed',
          style: {
            'opacity': 0.2
          }
        }
      ],
      userZoomingEnabled: false,
      userPanningEnabled: false,
      boxSelectionEnabled: false,
      autoungrabify: true,
      // Configurar el zoom y pan para que coincida exactamente con el área del canvas
      zoom: 1,
      pan: { x: 0, y: 0 },
      minZoom: 1,
      maxZoom: 1
    })

    // Establecer el viewport explícitamente
    cy.viewport({
      zoom: 1,
      pan: { x: 0, y: 0 }
    })

    // console.log('Cytoscape viewport:', cy.pan(), 'zoom:', cy.zoom())
    // console.log('Container dimensions:', width, 'x', height)
    // console.log('Extent:', cy.extent())

    // Tooltips con eventos para nodos
    cy.on('mouseover', 'node', (event) => {
      const node = event.target
      node.style('border-width', '3')
      
      // Resaltar aristas conectadas
      const connectedEdges = node.connectedEdges()
      cy.elements().not(connectedEdges).not(node).addClass('dimmed')
      
      // Mostrar tooltip
      const renderedPosition = node.renderedPosition()
      const nodeData = node.data()
      setTooltip({
        x: renderedPosition.x,
        y: renderedPosition.y - 40,
        content: (
          <div className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 shadow-xl">
            <div className="text-slate-200 text-xs font-semibold whitespace-nowrap">
              Jugador {nodeData.id}
            </div>
            <div className="text-blue-400 text-xs whitespace-nowrap">
              Pases: {nodeData.passCount}
            </div>
          </div>
        )
      })
    })

    cy.on('mouseout', 'node', (event) => {
      const node = event.target
      node.style('border-width', '1.5')
      cy.elements().removeClass('dimmed')
      setTooltip(null)
    })

    // Tooltips con eventos para aristas
    cy.on('mouseover', 'edge', (event) => {
      const edge = event.target
      const edgeData = edge.data()
      
      // Calcular punto medio de la arista
      const sourceNode = cy.$('#' + edgeData.source)
      const targetNode = cy.$('#' + edgeData.target)
      const sourcePos = sourceNode.renderedPosition()
      const targetPos = targetNode.renderedPosition()
      const midX = (sourcePos.x + targetPos.x) / 2
      const midY = (sourcePos.y + targetPos.y) / 2
      
      setTooltip({
        x: midX,
        y: midY - 40,
        content: (
          <div className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 shadow-xl">
            <div className="text-slate-200 text-xs font-semibold whitespace-nowrap">
              {edgeData.source} → {edgeData.target}
            </div>
            <div className="text-blue-400 text-xs whitespace-nowrap">
              Conexiones: {edgeData.passCount}
            </div>
          </div>
        )
      })
    })

    cy.on('mouseout', 'edge', () => {
      setTooltip(null)
    })

    cyRef.current = cy

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy()
      }
    }
  }, [data, width, height])

  if (loading) {
    return <div className="flex items-center justify-center h-full text-white">Cargando red de pases…</div>
  }

  if (error || !data || data.nodes.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-400">No hay datos disponibles</div>
  }

  return (
    <div className="relative" style={{ width, height }}>
      {/* Campo de fondo usando OptaPitch */}
      <div className="absolute inset-0">
        <OptaPitch width={width} height={height} fieldColor="#2d5f3f" />
      </div>
      
      {/* Contenedor de Cytoscape encima del campo */}
      <div 
        ref={containerRef} 
        className="absolute inset-0"
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          pointerEvents: 'auto'
        }}
      />
      
      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-50"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, 0)',
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  )
}

export default NetworkPassPitch
