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
  
  // Tamaños proporcionales para marcador
  const markerSize = Math.min(12, distance * 0.7);

  // Punta de flecha mejorada - más afilada y proporcional
  const arrowLength = markerSize;
  const arrowWidth = arrowLength * 0.5; // Relación ideal

  const crossSize = Math.min(10, distance * 0.5);
  const crossHalf = crossSize * 0.5;

  // Acortar la línea según el marcador final
  const lineEndX =
    result === 'success'
      ? x2 - arrowLength * Math.cos(angle) * 0.8
      : x2 - crossHalf * Math.cos(angle);
  const lineEndY =
    result === 'success'
      ? y2 - arrowLength * Math.sin(angle) * 0.8
      : y2 - crossHalf * Math.sin(angle);

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

  const crossAngle1 = angle + Math.PI / 4;
  const crossAngle2 = angle - Math.PI / 4;
  const crossLine1 = {
    x1: x2 - crossHalf * Math.cos(crossAngle1),
    y1: y2 - crossHalf * Math.sin(crossAngle1),
    x2: x2 + crossHalf * Math.cos(crossAngle1),
    y2: y2 + crossHalf * Math.sin(crossAngle1),
  };
  const crossLine2 = {
    x1: x2 - crossHalf * Math.cos(crossAngle2),
    y1: y2 - crossHalf * Math.sin(crossAngle2),
    x2: x2 + crossHalf * Math.cos(crossAngle2),
    y2: y2 + crossHalf * Math.sin(crossAngle2),
  };

  // Color del pase según equipo
  const lineColor = isHomeTeam ? '#2196F3' : '#E53935';
  const lineShadowColor = isHomeTeam ? 'rgba(33, 150, 243, 0.3)' : 'rgba(229, 57, 53, 0.3)';
  
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
        stroke={lineShadowColor}
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
        stroke={lineColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animated ? { opacity: 0, pathLength: 0 } : false}
        animate={{ opacity: 1, pathLength: 1 }}
        transition={animated ? { duration: 0.6, ease: 'easeOut', delay: 0.1 } : { duration: 0 }}
      />
      
      {result === 'success' ? (
        <motion.g
          initial={animated ? { opacity: 0, scale: 0 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={animated ? { duration: 0.4, ease: 'backOut', delay: 0.5 } : { duration: 0 }}
        >
          <polygon
            points={arrowPoints.map(p => p.join(',')).join(' ')}
            fill={lineShadowColor}
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
          />
          <polygon
            points={arrowPoints.map(p => p.join(',')).join(' ')}
            fill={lineColor}
            opacity={0.95}
          />
        </motion.g>
      ) : (
        <motion.g
          initial={animated ? { opacity: 0, scale: 0 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={animated ? { duration: 0.4, ease: 'backOut', delay: 0.5 } : { duration: 0 }}
        >
          <line
            x1={crossLine1.x1}
            y1={crossLine1.y1}
            x2={crossLine1.x2}
            y2={crossLine1.y2}
            stroke={lineShadowColor}
            strokeWidth={strokeWidth + 2}
            strokeLinecap="round"
          />
          <line
            x1={crossLine2.x1}
            y1={crossLine2.y1}
            x2={crossLine2.x2}
            y2={crossLine2.y2}
            stroke={lineShadowColor}
            strokeWidth={strokeWidth + 2}
            strokeLinecap="round"
          />
          <line
            x1={crossLine1.x1}
            y1={crossLine1.y1}
            x2={crossLine1.x2}
            y2={crossLine1.y2}
            stroke={lineColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <line
            x1={crossLine2.x1}
            y1={crossLine2.y1}
            x2={crossLine2.x2}
            y2={crossLine2.y2}
            stroke={lineColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </motion.g>
      )}

      {/* Círculo en el origen con animación */}
      <motion.circle
        cx={x1}
        cy={y1}
        r={2}
        fill={lineColor}
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
