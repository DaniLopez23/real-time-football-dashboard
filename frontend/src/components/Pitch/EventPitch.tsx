import React, { useMemo, useState } from "react";
import * as d3 from "d3";
import OptaPitch from "./OptaPitch";
import { PassArrow } from "./EventFigures";
import { useEventsStore } from "@/store";
import type { Event } from "@/types";
import EventWindowSelector from "./EventWindowSelector";

interface EventPitchProps {
  width?: number;
  height?: number;
}

interface ProcessedEvent {
  type: 'pass' | 'carry' | 'shot';
  origin: { x: number; y: number };
  destination: { x: number; y: number };
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
    
    // Filtrar solo pases (type_id = '1')
    const passEvents = events
      .filter(e => e.type_id === '1')
      .slice(-windowSize);

    return passEvents.map((event: Event): ProcessedEvent => {
      // Extraer coordenadas de inicio
      const originX = parseFloat(event.x);
      const originY = parseFloat(event.y);

      // Extraer coordenadas de fin desde los qualifiers (140=end_x, 141=end_y)
      let endX = originX;
      let endY = originY;
      
      if (event.qualifiers && event.qualifiers.length > 0) {
        const endXQualifier = event.qualifiers.find(q => q.qualifier_id === '140');
        const endYQualifier = event.qualifiers.find(q => q.qualifier_id === '141');
        
        if (endXQualifier) endX = parseFloat(endXQualifier.value);
        if (endYQualifier) endY = parseFloat(endYQualifier.value);
      }

      return {
        type: 'pass',
        origin: { x: originX, y: originY },
        destination: { x: endX, y: endY },
        result: event.outcome === '1' ? 'success' : 'fail',
        source: event,
      };
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
          {processedEvents.map((event, index) => (
            <PassArrow
              key={`${event.source.id}-${index}`}
              xScale={xScale}
              yScale={yScale}
              origin={event.origin}
              destination={event.destination}
              result={event.result as 'success' | 'fail'}
              animated={index === processedEvents.length - 1}
              sequenceNumber={index + 1}
            />
          ))}
        </g>
      </OptaPitch>

      <div className="event-info mt-4 text-sm text-gray-600">
        Mostrando {processedEvents.length} de {windowSize} eventos seleccionados
      </div>
    </div>
  );
};

export default EventPitch;
