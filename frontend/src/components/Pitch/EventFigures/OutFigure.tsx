import React from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

interface OutFigureProps {
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  position: { x: number; y: number };
  size?: number;
  animated?: boolean;
  sequenceNumber?: number;
  isHomeTeam?: boolean;
}

const OutFigure: React.FC<OutFigureProps> = ({
  xScale,
  yScale,
  position,
  animated = false,
  sequenceNumber,
  isHomeTeam = true,
}) => {
  const x = xScale(position.x);
  const y = yScale(position.y);

  // Color del número según equipo
  const numberColor = isHomeTeam ? '#2196F3' : '#E53935'; // Azul para local, rojo para visitante
  
  // Color de la flecha según equipo
  const color = isHomeTeam ? '#2196F3' : '#E53935'; // Azul para local, rojo para visitante
  const shadowColor = isHomeTeam ? 'rgba(33, 150, 243, 0.4)' : 'rgba(229, 57, 53, 0.4)';

  // Determinar hacia qué borde está más cerca el evento
  const distanceToLeft = position.x;
  const distanceToRight = 100 - position.x;
  const distanceToTop = 100 - position.y; // Invertido porque yScale va de height a 0
  const distanceToBottom = position.y;

  const minDistance = Math.min(distanceToLeft, distanceToRight, distanceToTop, distanceToBottom);
  
  let lineStart = { x: x, y: y };
  let lineEnd = { x: x, y: y };
  let arrowStart = { x: x, y: y };
  let arrowEnd = { x: x, y: y };
  let numberPos = { x: x, y: y };

  const lineLength = 12;
  const arrowLength = 10;
  const numberOffset = 6;

  // Configurar según el borde más cercano
  // Número en inicio, flecha hacia fuera, barra al final
  if (minDistance === distanceToLeft) {
    // Borde izquierdo - flecha hacia la izquierda, barra vertical al final
    numberPos = { x: x + numberOffset, y: y };
    arrowStart = { x: x, y: y };
    arrowEnd = { x: x - arrowLength, y: y };
    lineStart = { x: x - arrowLength, y: y - lineLength / 2 };
    lineEnd = { x: x - arrowLength, y: y + lineLength / 2 };
  } else if (minDistance === distanceToRight) {
    // Borde derecho - flecha hacia la derecha, barra vertical al final
    numberPos = { x: x - numberOffset, y: y };
    arrowStart = { x: x, y: y };
    arrowEnd = { x: x + arrowLength, y: y };
    lineStart = { x: x + arrowLength, y: y - lineLength / 2 };
    lineEnd = { x: x + arrowLength, y: y + lineLength / 2 };
  } else if (minDistance === distanceToTop) {
    // Borde superior - flecha hacia arriba, barra horizontal al final
    numberPos = { x: x, y: y + numberOffset };
    arrowStart = { x: x, y: y };
    arrowEnd = { x: x, y: y - arrowLength };
    lineStart = { x: x - lineLength / 2, y: y - arrowLength };
    lineEnd = { x: x + lineLength / 2, y: y - arrowLength };
  } else {
    // Borde inferior - flecha hacia abajo, barra horizontal al final
    numberPos = { x: x, y: y - numberOffset };
    arrowStart = { x: x, y: y };
    arrowEnd = { x: x, y: y + arrowLength };
    lineStart = { x: x - lineLength / 2, y: y + arrowLength };
    lineEnd = { x: x + lineLength / 2, y: y + arrowLength };
  }

  // Calcular ángulo para la punta de la flecha
  const angle = Math.atan2(arrowEnd.y - arrowStart.y, arrowEnd.x - arrowStart.x);
  const arrowHeadLength = 5;
  const arrowHeadWidth = 4;

  const arrowPoints = [
    [arrowEnd.x, arrowEnd.y],
    [
      arrowEnd.x - arrowHeadLength * Math.cos(angle) + arrowHeadWidth * Math.sin(angle),
      arrowEnd.y - arrowHeadLength * Math.sin(angle) - arrowHeadWidth * Math.cos(angle),
    ],
    [
      arrowEnd.x - arrowHeadLength * Math.cos(angle) - arrowHeadWidth * Math.sin(angle),
      arrowEnd.y - arrowHeadLength * Math.sin(angle) + arrowHeadWidth * Math.cos(angle),
    ],
  ];

  return (
    <g className="out-figure">
      {/* Flecha apuntando hacia fuera */}
      <motion.line
        x1={arrowStart.x}
        y1={arrowStart.y}
        x2={arrowEnd.x}
        y2={arrowEnd.y}
        stroke={shadowColor}
        strokeWidth={3}
        strokeLinecap="round"
        initial={animated ? { opacity: 0, pathLength: 0 } : false}
        animate={{ opacity: 0.5, pathLength: 1 }}
        transition={animated ? { duration: 0.4, ease: 'easeOut', delay: 0.15 } : { duration: 0 }}
      />
      <motion.line
        x1={arrowStart.x}
        y1={arrowStart.y}
        x2={arrowEnd.x}
        y2={arrowEnd.y}
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        initial={animated ? { opacity: 0, pathLength: 0 } : false}
        animate={{ opacity: 1, pathLength: 1 }}
        transition={animated ? { duration: 0.4, ease: 'easeOut', delay: 0.2 } : { duration: 0 }}
      />

      {/* Punta de la flecha */}
      <motion.g
        initial={animated ? { opacity: 0, scale: 0 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={animated ? { duration: 0.3, ease: 'backOut', delay: 0.4 } : { duration: 0 }}
      >
        <polygon
          points={arrowPoints.map(p => p.join(',')).join(' ')}
          fill={shadowColor}
        />
        <polygon
          points={arrowPoints.map(p => p.join(',')).join(' ')}
          fill={color}
          opacity={0.95}
        />
      </motion.g>

      {/* Barra al final de la flecha */}
      <motion.line
        x1={lineStart.x}
        y1={lineStart.y}
        x2={lineEnd.x}
        y2={lineEnd.y}
        stroke={shadowColor}
        strokeWidth={2}
        strokeLinecap="round"
        initial={animated ? { opacity: 0, scale: 0 } : false}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={animated ? { duration: 0.3, ease: 'backOut', delay: 0.5 } : { duration: 0 }}
      />
      <motion.line
        x1={lineStart.x}
        y1={lineStart.y}
        x2={lineEnd.x}
        y2={lineEnd.y}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        initial={animated ? { opacity: 0, scale: 0 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={animated ? { duration: 0.3, ease: 'backOut', delay: 0.55 } : { duration: 0 }}
      />

      {/* Número de secuencia (renderizado al final para estar por encima) */}
      {sequenceNumber !== undefined && (
        <motion.g
          initial={animated ? { opacity: 0, scale: 0 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={animated ? { 
            duration: 0.3, 
            ease: 'backOut',
            delay: 0.6
          } : { duration: 0 }}
        >
          {/* Fondo blanco del número */}
          <circle
            cx={numberPos.x}
            cy={numberPos.y}
            r={6}
            fill="white"
            stroke={numberColor}
            strokeWidth={1.5}
            opacity={0.95}
          />
          {/* Texto del número */}
          <text
            x={numberPos.x}
            y={numberPos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={numberColor}
            fontSize="10"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            {sequenceNumber}
          </text>
        </motion.g>
      )}
    </g>
  );
};

export default OutFigure;
