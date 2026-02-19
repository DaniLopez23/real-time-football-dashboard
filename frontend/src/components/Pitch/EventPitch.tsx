import React, { useMemo, useState } from "react";
import * as d3 from "d3";
import OptaPitch from "./OptaPitch";
import { PassArrow, OutFigure, CarryFigure } from "./EventFigures";
import { useEventsStore, useGameStore } from "@/store";
import type { Event } from "@/types";
import { EVENT_TYPES, EVENT_OUTCOMES, EVENT_QUALIFIERS } from "@/constants";
import EventPitchOptions, { type EventPitchFilters } from "./EventPitchOptions";

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
  sequenceNumber?: number;
}

const EventPitch: React.FC<EventPitchProps> = ({
  width = 800,
  height = 600,
}) => {
  const [filters, setFilters] = useState<EventPitchFilters>({
    windowSize: 5,
    teamFilter: 'both',
  });
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const events = useEventsStore((state) => state.events);
  const game = useGameStore((state) => state.game);
  
  const homeTeamId = game?.home_team?.team_id;
  
  // Crear escalas para las coordenadas Opta
  const { xScale, yScale } = useMemo(() => {
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);
    return { xScale, yScale };
  }, [width, height]);

  // Obtener eventos del store y procesarlos
  const processedEvents = useMemo(() => {
    let filteredEvents = events
      .filter(e => e.type_id === EVENT_TYPES.PASS || e.type_id === EVENT_TYPES.OUT);

    // Filtrar por equipo
    if (filters.teamFilter === 'home') {
      filteredEvents = filteredEvents.filter(e => e.team_id === homeTeamId);
    } else if (filters.teamFilter === 'away') {
      filteredEvents = filteredEvents.filter(e => e.team_id !== homeTeamId);
    }
    
    // Limitar al tamaño de ventana
    filteredEvents = filteredEvents.slice(-filters.windowSize);

    const getPassEnd = (event: Event, originX: number, originY: number) => {
      let endX = originX;
      let endY = originY;

      if (event.qualifiers && event.qualifiers.length > 0) {
        const endXQualifier = event.qualifiers.find(q => q.qualifier_id === EVENT_QUALIFIERS.PASS_END_X);
        const endYQualifier = event.qualifiers.find(q => q.qualifier_id === EVENT_QUALIFIERS.PASS_END_Y);

        if (endXQualifier) endX = parseFloat(endXQualifier.value);
        if (endYQualifier) endY = parseFloat(endYQualifier.value);
      }

      return { endX, endY };
    };

    const processed: ProcessedEvent[] = [];

    for (let i = 0; i < filteredEvents.length; i += 1) {
      const event = filteredEvents[i];
      const sequenceNumber = i + 1;

      let originX = parseFloat(event.x);
      let originY = parseFloat(event.y);

      if (event.type_id === EVENT_TYPES.PASS) {
        const { endX, endY } = getPassEnd(event, originX, originY);
        const passResult = event.outcome === EVENT_OUTCOMES.SUCCESS ? 'success' : 'fail';

        processed.push({
          type: 'pass',
          origin: { x: originX, y: originY },
          destination: { x: endX, y: endY },
          result: passResult,
          source: event,
          sequenceNumber,
        });

        const nextEvent = filteredEvents[i + 1];
        if (
          passResult === 'success' &&
          nextEvent &&
          nextEvent.type_id === EVENT_TYPES.PASS &&
          nextEvent.team_id === event.team_id
        ) {
          const nextOriginX = parseFloat(nextEvent.x);
          const nextOriginY = parseFloat(nextEvent.y);

          processed.push({
            type: 'carry',
            origin: { x: endX, y: endY },
            destination: { x: nextOriginX, y: nextOriginY },
            result: 'success',
            source: event,
          });
        }
      } else {
        const margin = 3;

        if (originX <= margin) originX = margin;
        if (originX >= 100 - margin) originX = 100 - margin;
        if (originY <= margin) originY = margin;
        if (originY >= 100 - margin) originY = 100 - margin;

        processed.push({
          type: 'out',
          origin: { x: originX, y: originY },
          result: 'fail',
          source: event,
          sequenceNumber,
        });
      }
    }

    return processed;
  }, [events, filters, homeTeamId]);

  return (
    <div className="event-pitch-container flex flex-col w-fit">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-white text-sm font-semibold">
          Campograma de eventos
        </h2>
        <EventPitchOptions 
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      <OptaPitch width={width} height={height} showAxes={false}>
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
                  sequenceNumber={event.sequenceNumber}
                  isHomeTeam={event.source.team_id === homeTeamId}
                />
              );
            } else if (event.type === 'carry' && event.destination) {
              return (
                <CarryFigure
                  key={`carry-${event.source.id}-${index}`}
                  xScale={xScale}
                  yScale={yScale}
                  origin={event.origin}
                  destination={event.destination}
                  animated={isLast}
                  isHomeTeam={event.source.team_id === homeTeamId}
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
                  sequenceNumber={event.sequenceNumber}
                  isHomeTeam={event.source.team_id === homeTeamId}
                />
              );
            }
            return null;
          })}
        </g>
      </OptaPitch>

      <div className="event-info mt-4 text-sm text-gray-400">
        Mostrando {processedEvents.length} de {filters.windowSize} eventos
      </div>
    </div>
  );
};

export default EventPitch;
