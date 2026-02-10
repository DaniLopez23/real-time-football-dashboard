import React, { useMemo, useState } from "react";
import * as d3 from "d3";
import OptaPitch from "./OptaPitch";
import { PassArrow, OutFigure } from "./EventFigures";
import { useEventsStore } from "@/store";
import type { Event } from "@/types";
import { EVENT_TYPES, EVENT_OUTCOMES, EVENT_QUALIFIERS } from "@/constants";
import EventWindowSelector from "./EventWindowSelector";

interface EventPitchProps {
  width?: number;
  height?: number;
}

interface ProcessedEvent {
  type: 'pass' | 'carry' | 'shot' | 'out';
  origin: { x: number; y: number };
  destination?: { x: number; y: number };
  result: 'success' | 'fail' | 'goal';
  source: Event;
}

const EventPitch: React.FC<EventPitchProps> = ({
  width = 800,
  height = 600,
}) => {
  const [windowSize, setWindowSize] = useState(10);
  const events = useEventsStore((state) => state.events);
  
  // Crear escalas para las coordenadas Opta
  const { xScale, yScale } = useMemo(() => {
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);
    return { xScale, yScale };
  }, [width, height]);

  // Obtener eventos del store y procesarlos
  const processedEvents = useMemo(() => {
    
    // Filtrar pases y eventos out
    const filteredEvents = events
      .filter(e => e.type_id === EVENT_TYPES.PASS || e.type_id === EVENT_TYPES.OUT)
      .slice(-windowSize);

    return filteredEvents.map((event: Event): ProcessedEvent => {
      // Extraer coordenadas de inicio
      let originX = parseFloat(event.x);
      let originY = parseFloat(event.y);

      // Si es un pase, extraer coordenadas de fin
      if (event.type_id === EVENT_TYPES.PASS) {
        let endX = originX;
        let endY = originY;
        
        if (event.qualifiers && event.qualifiers.length > 0) {
          const endXQualifier = event.qualifiers.find(q => q.qualifier_id === EVENT_QUALIFIERS.PASS_END_X);
          const endYQualifier = event.qualifiers.find(q => q.qualifier_id === EVENT_QUALIFIERS.PASS_END_Y);
          
          if (endXQualifier) endX = parseFloat(endXQualifier.value);
          if (endYQualifier) endY = parseFloat(endYQualifier.value);
        }

        return {
          type: 'pass',
          origin: { x: originX, y: originY },
          destination: { x: endX, y: endY },
          result: event.outcome === EVENT_OUTCOMES.SUCCESS ? 'success' : 'fail',
          source: event,
        };
      } else {
        // Es un evento Out - ajustar coordenadas para que se vean dentro del campo
        // Si está en el borde o muy cerca, moverlo hacia adentro
        const margin = 3; // Margen para empujar hacia adentro
        
        if (originX <= margin) originX = margin;
        if (originX >= 100 - margin) originX = 100 - margin;
        if (originY <= margin) originY = margin;
        if (originY >= 100 - margin) originY = 100 - margin;
        
        return {
          type: 'out',
          origin: { x: originX, y: originY },
          result: 'fail',
          source: event,
        };
      }
    });
  }, [events, windowSize]);

  return (
    <div className="event-pitch-container h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-white text-sm font-semibold">
          Campograma de eventos
        </h2>
        <EventWindowSelector 
          windowSize={windowSize} 
          onWindowSizeChange={setWindowSize}
        />
      </div>

      <OptaPitch width={width} height={height} showAxes={true}>
        <g className="events-layer">
          {processedEvents.map((event, index) => {
            const isLast = index === processedEvents.length - 1;
            
            if (event.type === 'pass' && event.destination) {
              return (
                <PassArrow
                  key={`${event.source.id}-${index}`}
                  xScale={xScale}
                  yScale={yScale}
                  origin={event.origin}
                  destination={event.destination}
                  result={event.result as 'success' | 'fail'}
                  animated={isLast}
                  sequenceNumber={index + 1}
                />
              );
            } else if (event.type === 'out') {
              return (
                <OutFigure
                  key={`${event.source.id}-${index}`}
                  xScale={xScale}
                  yScale={yScale}
                  position={event.origin}
                  animated={isLast}
                  sequenceNumber={index + 1}
                />
              );
            }
            return null;
          })}
        </g>
      </OptaPitch>

      <div className="event-info mt-4 text-sm text-gray-600">
        Mostrando {processedEvents.length} de {windowSize} eventos seleccionados
      </div>
    </div>
  );
};

export default EventPitch;
