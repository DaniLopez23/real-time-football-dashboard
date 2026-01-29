import React, { useMemo } from 'react';
import { Card, Typography } from 'antd';
import * as d3 from 'd3';
import OptaPitch from './OptaPitch';
import { PassArrow, CarryArrow, ShotArrow } from './EventFigures';

const { Title } = Typography;

interface EventPitchProps {
  width?: number;
  height?: number;
}

const EventPitch: React.FC<EventPitchProps> = ({ width = 800, height = 600 }) => {
  // Crear escalas para las coordenadas Opta
  const { xScale, yScale } = useMemo(() => {
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    return { xScale, yScale };
  }, [width, height]);

  // Ejemplo de cadena de pases y tiro
  const exampleEvents = [
    // Pase 1: desde la defensa
    {
      type: 'pass' as const,
      origin: { x: 25, y: 50 },
      destination: { x: 45, y: 60 },
      result: 'success' as const,
    },
    // Pase 2: construcción en mediocampo
    {
      type: 'pass' as const,
      origin: { x: 45, y: 60 },
      destination: { x: 60, y: 45 },
      result: 'success' as const,
    },
    // Conducción: avance con el balón
    {
      type: 'carry' as const,
      origin: { x: 60, y: 45 },
      destination: { x: 75, y: 55 },
      result: 'success' as const,
    },
    // Pase 3: filtración al área
    {
      type: 'pass' as const,
      origin: { x: 75, y: 55 },
      destination: { x: 88, y: 52 },
      result: 'success' as const,
    },
    // Tiro a gol
    {
      type: 'shot' as const,
      origin: { x: 88, y: 52 },
      destination: { x: 100, y: 50 },
      result: 'goal' as const,
    },
  ];

  return (
    <Card 
      style={{ backgroundColor: '#1a1a1a', padding: 0 }}
    >
      <div style={{ padding: '16px 16px 0 16px' }}>
        <Title level={3} style={{ color: 'white', marginBottom: 0 }}>
          Campograma de Eventos
        </Title>
      </div>
      <div style={{ padding: '16px' }}>
        <OptaPitch width={width} height={height} showAxes={true}>
          <g className="events-layer">
            {exampleEvents.map((event, index) => {
              if (event.type === 'pass') {
                return (
                  <PassArrow
                    key={index}
                    xScale={xScale}
                    yScale={yScale}
                    origin={event.origin}
                    destination={event.destination}
                    result={event.result}
                  />
                );
              } else if (event.type === 'carry') {
                return (
                  <CarryArrow
                    key={index}
                    xScale={xScale}
                    yScale={yScale}
                    origin={event.origin}
                    destination={event.destination}
                    result={event.result}
                  />
                );
              } else if (event.type === 'shot') {
                return (
                  <ShotArrow
                    key={index}
                    xScale={xScale}
                    yScale={yScale}
                    origin={event.origin}
                    destination={event.destination}
                    result={event.result}
                  />
                );
              }
              return null;
            })}
          </g>
        </OptaPitch>
      </div>
    </Card>
  );
};

export default EventPitch;