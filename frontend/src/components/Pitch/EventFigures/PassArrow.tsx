import React from 'react';
import * as d3 from 'd3';

interface PassArrowProps {
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  origin: { x: number; y: number };
  destination: { x: number; y: number };
  result: 'success' | 'fail';
  strokeWidth?: number;
}

const PassArrow: React.FC<PassArrowProps> = ({
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
  const arrowLength = 8;
  const arrowWidth = 6;

  // Puntos de la punta de flecha
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

  const color = result === 'success' ? '#4CAF50' : '#F44336';

  return (
    <g className="pass-arrow">
      {/* Línea del pase - sólida */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      
      {/* Punta de flecha */}
      <polygon
        points={arrowPoints.map(p => p.join(',')).join(' ')}
        fill={color}
      />

      {/* Círculo en el origen */}
      <circle
        cx={x1}
        cy={y1}
        r={3}
        fill={color}
        opacity={0.7}
      />
    </g>
  );
};

export default PassArrow;
