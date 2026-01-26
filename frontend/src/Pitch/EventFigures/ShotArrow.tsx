import React from 'react';
import * as d3 from 'd3';

interface ShotArrowProps {
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  origin: { x: number; y: number };
  destination: { x: number; y: number };
  result: 'goal' | 'saved' | 'blocked' | 'miss';
  strokeWidth?: number;
}

const ShotArrow: React.FC<ShotArrowProps> = ({
  xScale,
  yScale,
  origin,
  destination,
  result,
  strokeWidth = 2,
}) => {
  const x1 = xScale(origin.x);
  const y1 = yScale(origin.y);
  const x2 = xScale(destination.x);
  const y2 = yScale(destination.y);

  // Calcular ángulo y posición de la punta de flecha
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowLength = 10;
  const arrowWidth = 7;

  // Puntos de la punta de flecha (más grande para tiros)
  const arrowPoints = [
    [x2, y2],
    [
      x2 - arrowLength * Math.cos(angle) + arrowWidth * Math.sin(angle),
      y2 - arrowLength * Math.sin(angle) - arrowWidth * Math.cos(angle),
    ],
    [
      x2 - arrowLength * Math.cos(angle) - arrowWidth * Math.sin(angle),
      y2 - arrowLength * Math.sin(angle) + arrowWidth * Math.cos(angle),
    ],
  ];

  // Colores según resultado del tiro
  const getColor = () => {
    switch (result) {
      case 'goal':
        return '#4CAF50'; // Verde para gol
      case 'saved':
        return '#FFC107'; // Amarillo para atajado
      case 'blocked':
        return '#FF9800'; // Naranja para bloqueado
      case 'miss':
        return '#F44336'; // Rojo para fallado
      default:
        return '#9E9E9E';
    }
  };

  const color = getColor();

  return (
    <g className="shot-arrow">
      {/* Línea de tiro - punteada (dotted) */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray="2,4"
        strokeLinecap="round"
      />
      
      {/* Punta de flecha */}
      <polygon
        points={arrowPoints.map(p => p.join(',')).join(' ')}
        fill={color}
      />

      {/* Círculo en el origen - más grande para tiros */}
      <circle
        cx={x1}
        cy={y1}
        r={4}
        fill={color}
        opacity={0.8}
      />

      {/* Marcador especial para goles */}
      {result === 'goal' && (
        <circle
          cx={x2}
          cy={y2}
          r={8}
          fill="none"
          stroke={color}
          strokeWidth={2}
          opacity={0.6}
        />
      )}
    </g>
  );
};

export default ShotArrow;
