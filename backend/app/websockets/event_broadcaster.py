import logging
from typing import Dict, Any
from app.websockets import ConnectionManager

logger = logging.getLogger(__name__)


async def broadcast_game_events(result: Dict[str, Any], manager: ConnectionManager):
    """
    Envía eventos nuevos a través de WebSocket a los clientes del room correspondiente.
    
    Args:
        result: Resultado parseado del XML con los eventos
        manager: Instancia del ConnectionManager
    """
    try:
        game_data = result.get("data", {}).get("game", {})
        game_id = game_data.get("game_id", "unknown")
        events = game_data.get("events", [])
        total_events = result.get("total_events", 0)
        last_event_id = result.get("last_event_id", None)
        
        if not events:
            logger.warning("⚠️  No hay eventos para enviar")
            return
        
        # Mensaje con información general
        message = {
            "type": "game_update",
            "game_id": game_id,
            "total_events": total_events,
            "last_event_id": last_event_id,
            "timestamp": game_data.get("period_1_start", ""),
            "home_team": game_data.get("home_team", {}),
            "away_team": game_data.get("away_team", {}),
            "events": events  # Todos los eventos
        }
        
        # Enviar a todos los clientes del room
        await manager.broadcast_to_room(game_id, message)
        
        logger.info(f"📡 {total_events} eventos enviados al room {game_id}")
        
    except Exception as e:
        logger.error(f"❌ Error broadcasting eventos: {e}")


async def broadcast_event_incremental(event: Dict[str, Any], game_id: str, manager: ConnectionManager):
    """
    Envía un evento individual a los clientes de un room.
    Útil si quieres actualizar en tiempo real evento por evento.
    
    Args:
        event: Evento individual
        game_id: ID del juego
        manager: Instancia del ConnectionManager
    """
    try:
        message = {
            "type": "new_event",
            "game_id": game_id,
            "event": event
        }
        
        await manager.broadcast_to_room(game_id, message)
        logger.debug(f"📤 Evento {event.get('event_id')} enviado al room {game_id}")
        
    except Exception as e:
        logger.error(f"❌ Error broadcasting evento: {e}")
