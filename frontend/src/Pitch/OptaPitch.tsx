import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface OptaPitchProps {
  width?: number;
  height?: number;
  showAxes?: boolean;
  children?: React.ReactNode;
}

const OptaPitch: React.FC<OptaPitchProps> = ({ 
  width = 800, 
  height = 600,
  children,
  showAxes = false 
}) => {
  const pitchGroupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!pitchGroupRef.current) return;

    // Limpiar solo el grupo del campo, no todo el SVG
    d3.select(pitchGroupRef.current).selectAll('*').remove();

    const g = d3.select(pitchGroupRef.current);
    
    // Sin márgenes - el campo ocupa todo el espacio
    const pitchWidth = width;
    const pitchHeight = height;

    // Escalas para convertir coordenadas Opta (0-100) a píxeles
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, pitchWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([pitchHeight, 0]); // Invertido para que 0 esté abajo

    // Fondo verde del campo
    g.append('rect')
      .attr('width', pitchWidth)
      .attr('height', pitchHeight)
      .attr('fill', '#2d5f3f')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Línea del medio
    g.append('line')
      .attr('x1', xScale(50))
      .attr('y1', yScale(0))
      .attr('x2', xScale(50))
      .attr('y2', yScale(100))
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Círculo central
    g.append('circle')
      .attr('cx', xScale(50))
      .attr('cy', yScale(50))
      .attr('r', xScale(9.15) - xScale(0)) // Radio de 9.15m
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Punto central
    g.append('circle')
      .attr('cx', xScale(50))
      .attr('cy', yScale(50))
      .attr('r', 2)
      .attr('fill', 'white');

    // Área grande izquierda
    g.append('rect')
      .attr('x', xScale(0))
      .attr('y', yScale(78.9))
      .attr('width', xScale(16.5) - xScale(0))
      .attr('height', yScale(21.1) - yScale(78.9))
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Área pequeña izquierda
    g.append('rect')
      .attr('x', xScale(0))
      .attr('y', yScale(63.2))
      .attr('width', xScale(5.5) - xScale(0))
      .attr('height', yScale(36.8) - yScale(63.2))
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Área grande derecha
    g.append('rect')
      .attr('x', xScale(83.5))
      .attr('y', yScale(78.9))
      .attr('width', xScale(100) - xScale(83.5))
      .attr('height', yScale(21.1) - yScale(78.9))
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Área pequeña derecha
    g.append('rect')
      .attr('x', xScale(94.5))
      .attr('y', yScale(63.2))
      .attr('width', xScale(100) - xScale(94.5))
      .attr('height', yScale(36.8) - yScale(63.2))
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Semicírculo del área izquierda (arco hacia la derecha)
    const leftArc = d3.arc()
      .innerRadius(xScale(9.15) - xScale(0))
      .outerRadius(xScale(9.15) - xScale(0))
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    g.append('path')
      .attr('d', leftArc)
      .attr('transform', `translate(${xScale(11)},${yScale(50)}) rotate(90)`)
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Semicírculo del área derecha (arco hacia la izquierda)
    const rightArc = d3.arc()
      .innerRadius(xScale(9.15) - xScale(0))
      .outerRadius(xScale(9.15) - xScale(0))
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    g.append('path')
      .attr('d', rightArc)
      .attr('transform', `translate(${xScale(89)},${yScale(50)}) rotate(-90)`)
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Punto de penalti izquierdo
    g.append('circle')
      .attr('cx', xScale(11))
      .attr('cy', yScale(50))
      .attr('r', 2)
      .attr('fill', 'white');

    // Punto de penalti derecho
    g.append('circle')
      .attr('cx', xScale(89))
      .attr('cy', yScale(50))
      .attr('r', 2)
      .attr('fill', 'white');

    // Portería izquierda
    g.append('rect')
      .attr('x', xScale(0) - 4)
      .attr('y', yScale(55.5))
      .attr('width', 4)
      .attr('height', yScale(44.5) - yScale(55.5))
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Portería derecha
    g.append('rect')
      .attr('x', xScale(100))
      .attr('y', yScale(55.5))
      .attr('width', 4)
      .attr('height', yScale(44.5) - yScale(55.5))
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Ejes de coordenadas (opcional, para referencia)
    if (showAxes) {
      const xAxis = d3.axisBottom(xScale).ticks(10);
      const yAxis = d3.axisLeft(yScale).ticks(10);

      g.append('g')
        .attr('transform', `translate(0,${pitchHeight})`)
        .call(xAxis)
        .attr('color', 'white')
        .attr('opacity', 0.5);

      g.append('g')
        .call(yAxis)
        .attr('color', 'white')
        .attr('opacity', 0.5);
    }

  }, [width, height, showAxes]);

  return (
    <svg
      width={width}
      height={height}
    >
      <g ref={pitchGroupRef} className="pitch-layer" />
      <g className="events-layer">{children}</g>
    </svg>
  );
};

export default OptaPitch;
