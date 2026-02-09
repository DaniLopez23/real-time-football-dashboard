import React, { useEffect, useState, useRef } from 'react'
import OptaPitch from './OptaPitch'
import cytoscape, { type Core } from 'cytoscape'
import { usePassNetworkStore } from '@/store'

interface NetworkPassPitchProps {
  teamId: string
  width?: number
  height?: number
}

const NetworkPassPitch: React.FC<NetworkPassPitchProps> = ({ teamId, width = 800, height = 600 }) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: React.ReactNode } | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)

  // Obtener red de pases del store en tiempo real
  const network = usePassNetworkStore((state) => state.getNetwork(teamId))

  // Inicializar y actualizar Cytoscape cuando el store cambia
  useEffect(() => {
    if (!network || !containerRef.current || network.nodes.length === 0) {
      return
    }

    // Limpiar instancia anterior
    if (cyRef.current) {
      cyRef.current.destroy()
    }

    // Calcular escalas para ancho y opacidad de aristas
    const maxPassCount = Math.max(...network.edges.map(e => e.pass_count), 1)
    const maxNodePassCount = Math.max(...network.nodes.map(n => n.pass_count), 1)

    // Convertir coordenadas Opta (0-100) a píxeles del contenedor
    // OptaPitch usa escalas lineales directas: domain [0, 100] -> range [0, width] y [height, 0]
    const projectX = (x: number) => (x / 100) * width
    const projectY = (y: number) => height - (y / 100) * height // Invertir Y

    // Preparar nodos
    const nodes = network.nodes.map(node => {
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
    const edges = network.edges.map((edge, i) => ({
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
      // Renderizar a mayor resolución para evitar pixelación
      pixelRatio: 2, // o 'auto' para usar el pixelRatio del dispositivo
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#ffffff',
            'border-color': '#1e40af',
            'border-width': 1.5,
            'width': (ele: cytoscape.NodeSingular) => {
              const passCount = ele.data('passCount')
              return Math.sqrt(passCount / maxNodePassCount) * 10 + 8
            },
            'height': (ele: cytoscape.NodeSingular) => {
              const passCount = ele.data('passCount')
              return Math.sqrt(passCount / maxNodePassCount) * 10 + 8
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
            'width': (ele: cytoscape.EdgeSingular) => {
              const passCount = ele.data('passCount')
              return Math.sqrt(passCount / maxPassCount) * 5 + 0.3
            },
            'line-color': '#60a5fa',
            'target-arrow-color': '#60a5fa',
            'target-arrow-shape': 'triangle',
            'curve-style': 'unbundled-bezier',
            'control-point-distances': 15,
            'control-point-weights': 0.5,
            'opacity': (ele: cytoscape.EdgeSingular) => {
              const passCount = ele.data('passCount')
              return 0.15 + (passCount / maxPassCount) * 0.85
            },
            'arrow-scale': 0.85
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#3b82f6',
            'target-arrow-color': '#3b82f6',
            'width': (ele: cytoscape.EdgeSingular) => {
              const passCount = ele.data('passCount')
              return Math.sqrt(passCount / maxPassCount) * 3 + 2
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
      userZoomingEnabled: false,  // Permitir zoom con rueda del ratón
      userPanningEnabled: false,  // Permitir pan arrastrando
      boxSelectionEnabled: false,
      autoungrabify: true,
      // Configurar el zoom y pan para que coincida exactamente con el área del canvas
      zoom: 1,
      pan: { x: 0, y: 0 },
      minZoom: 0.5,  // Permitir zoom out
      maxZoom: 3     // Permitir zoom in
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
  }, [network, width, height])

  if (!network || network.nodes.length === 0) {
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
            transform: 'translate(50%, 0)',
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  )
}

export default NetworkPassPitch
