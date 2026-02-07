import { create } from 'zustand';
import type { Event } from '@/api/events';

/**
 * Estado del store de eventos del partido
 */
interface EventsState {
  // Todos los eventos del partido
  events: Event[];
  
  // Último evento procesado
  lastEventId: string | null;
  
  // Estado de carga
  loading: boolean;
  error: string | null;
  
  // Acciones
  setEvents: (events: Event[]) => void;
  addEvents: (events: Event[]) => void;
  updateEvents: (events: Event[]) => void;
  getEventById: (eventId: string) => Event | undefined;
  getEventsByTeam: (teamId: string) => Event[];
  getEventsByType: (typeId: string) => Event[];
  getEventsByPlayer: (playerId: string) => Event[];
  clearEvents: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Store de Zustand para gestionar los eventos del partido
 */
export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  lastEventId: null,
  loading: false,
  error: null,

  setEvents: (events) => {
    const lastEventId = events.length > 0 ? events[events.length - 1].id : null;
    set({ events, lastEventId, error: null, loading: false });
  },

  addEvents: (newEvents) => {
    set((state) => {
      // Crear un mapa de eventos existentes por event_id y team_id
      const eventMap = new Map(
        state.events.map((event) => [`${event.team_id}-${event.event_id}`, event])
      );

      // Agregar nuevos eventos (evitar duplicados)
      newEvents.forEach((event) => {
        const key = `${event.team_id}-${event.event_id}`;
        if (!eventMap.has(key)) {
          eventMap.set(key, event);
        }
      });

      const allEvents = Array.from(eventMap.values());
      
      // Ordenar por id (orden cronológico)
      allEvents.sort((a, b) => parseInt(a.id) - parseInt(b.id));

      const lastEventId = allEvents.length > 0 ? allEvents[allEvents.length - 1].id : null;

      return {
        events: allEvents,
        lastEventId,
      };
    });
  },

  updateEvents: (updatedEvents) => {
    set((state) => {
      // Crear un mapa de eventos existentes
      const eventMap = new Map(
        state.events.map((event) => [`${event.team_id}-${event.event_id}`, event])
      );

      // Actualizar eventos existentes
      updatedEvents.forEach((event) => {
        const key = `${event.team_id}-${event.event_id}`;
        eventMap.set(key, event);
      });

      const allEvents = Array.from(eventMap.values());
      
      // Ordenar por id (orden cronológico)
      allEvents.sort((a, b) => parseInt(a.id) - parseInt(b.id));

      const lastEventId = allEvents.length > 0 ? allEvents[allEvents.length - 1].id : null;

      return {
        events: allEvents,
        lastEventId,
      };
    });
  },

  getEventById: (eventId) => {
    return get().events.find((event) => event.event_id === eventId);
  },

  getEventsByTeam: (teamId) => {
    return get().events.filter((event) => event.team_id === teamId);
  },

  getEventsByType: (typeId) => {
    return get().events.filter((event) => event.type_id === typeId);
  },

  getEventsByPlayer: (playerId) => {
    return get().events.filter((event) => event.player_id === playerId);
  },

  clearEvents: () => {
    set({ events: [], lastEventId: null, error: null, loading: false });
  },

  setLoading: (loading) => {
    set({ loading });
  },

  setError: (error) => {
    set({ error, loading: false });
  },
}));
