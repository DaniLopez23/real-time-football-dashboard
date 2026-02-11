import React from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

interface PassArrowProps {
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  origin: { x: number; y: number };
  destination: { x: number; y: number };
  result: 'success' | 'fail';
  strokeWidth?: number;
  animated?: boolean;
  sequenceNumber?: number;
  isHomeTeam?: boolean;
}

const PassArrow: React.FC<PassArrowProps> = ({
  xScale,
  yScale,
  origin,
  destination,
  result,
  strokeWidth = 2,
  animated = false,
  sequenceNumber,
  isHomeTeam = true,
}) => {
  const x1 = xScale(origin.x);
  const y1 = yScale(origin.y);
  const x2 = xScale(destination.x);
  const y2 = yScale(destination.y);

  // Calcular ángulo y distancia
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  
  // Punta de flecha mejorada - más afilada y proporcional
  const arrowLength = Math.min(12, distance * 0.7); // Proporcional a la distancia
  const arrowWidth = arrowLength * 0.5; // Relación ideal

  // Acortar la línea para que termine justo antes de la punta
  const lineEndX = x2 - arrowLength * Math.cos(angle) * 0.8;
  const lineEndY = y2 - arrowLength * Math.sin(angle) * 0.8;

  // Puntos del triángulo más afilado
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

  // Color de la flecha según resultado
  const arrowColor = result === 'success' ? '#4CAF50' : '#F44336';
  const arrowShadowColor = result === 'success' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)';
  
  // Color del número según equipo
  const numberColor = isHomeTeam ? '#2196F3' : '#E53935'; // Azul para local, rojo para visitante

  return (
    <g className="pass-arrow">
      {/* Sombra de la línea para mejor contraste */}
      <motion.line
        x1={x1}
        y1={y1}
        x2={lineEndX}
        y2={lineEndY}
        stroke={arrowShadowColor}
        strokeWidth={strokeWidth + 2}
        strokeLinecap="round"
        initial={animated ? { opacity: 0, pathLength: 0 } : false}
        animate={{ opacity: 0.4, pathLength: 1 }}
        transition={animated ? { duration: 0.7, ease: 'easeOut' } : { duration: 0 }}
      />

      {/* Línea del pase principal */}
      <motion.line
        x1={x1}
        y1={y1}
        x2={lineEndX}
        y2={lineEndY}
        stroke={arrowColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animated ? { opacity: 0, pathLength: 0 } : false}
        animate={{ opacity: 1, pathLength: 1 }}
        transition={animated ? { duration: 0.6, ease: 'easeOut', delay: 0.1 } : { duration: 0 }}
      />
      
      {/* Punta de flecha mejorada con sombra */}
      <motion.g
        initial={animated ? { opacity: 0, scale: 0 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={animated ? { duration: 0.4, ease: 'backOut', delay: 0.5 } : { duration: 0 }}
      >
        <polygon
          points={arrowPoints.map(p => p.join(',')).join(' ')}
          fill={arrowShadowColor}
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
        />
        <polygon
          points={arrowPoints.map(p => p.join(',')).join(' ')}
          fill={arrowColor}
          opacity={0.95}
        />
      </motion.g>

      {/* Círculo en el origen con animación */}
      <motion.circle
        cx={x1}
        cy={y1}
        r={2}
        fill={arrowColor}
        opacity={0.7}
        initial={animated ? { opacity: 0, scale: 0 } : false}
        animate={{ 
          opacity: 0.7, 
          scale: 1,
          boxShadow: ['0 0 0 0 rgba(0, 0, 0, 0)', '0 0 0 6px rgba(0, 0, 0, 0)']
        }}
        transition={animated ? { 
          duration: 0.4, 
          ease: 'backOut',
          delay: 0.05
        } : { duration: 0 }}
      />

      {/* Número de secuencia */}
      {sequenceNumber !== undefined && (
        <motion.g
          initial={animated ? { opacity: 0, scale: 0 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={animated ? { 
            duration: 0.3, 
            ease: 'backOut',
            delay: 0.2
          } : { duration: 0 }}
        >
          {/* Fondo blanco del número */}
          <circle
            cx={x1}
            cy={y1}
            r={6}
            fill="white"
            stroke={numberColor}
            strokeWidth={1.5}
            opacity={0.95}
          />
          {/* Texto del número */}
          <text
            x={x1}
            y={y1}
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

export default PassArrow;
