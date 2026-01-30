"""
Events Controller

Maneja las operaciones relacionadas con eventos del partido.
"""

from typing import Any, Dict, List
from app.services.xml_reader import read_full_xml_async
from app.services.pass_network import build_pass_network_from_events
import logging

logger = logging.getLogger(__name__)

async def get_all_events(file_path: str) -> List[Dict[str, Any]]:
    """
    Obtiene todos los eventos del partido desde un archivo XML.
    
    Args:
        file_path: Ruta del archivo XML del partido
    
    Returns:
        Lista de eventos del partido
    """
    full_data = await read_full_xml_async(file_path)
    
    if not full_data.get("data", {}).get("game", {}).get("events"):
        logger.warning("No se encontraron eventos en el archivo XML.")
    
    return full_data.get("data", {}).get("game", {}).get("events", [])


async def get_events_by_type(file_path: str, event_name: str) -> List[Dict[str, Any]]:
    """
    Obtiene eventos filtrados por tipo/nombre.
    
    Args:
        file_path: Ruta del archivo XML del partido
        event_name: Nombre del tipo de evento (ej: "Pass", "Shot", "Tackle")
    
    Returns:
        Lista de eventos del tipo especificado
    """
    events = await get_all_events(file_path)
    return [e for e in events if e.get("event_name") == event_name]


async def get_events_by_team(file_path: str, team_id: str) -> List[Dict[str, Any]]:
    """
    Obtiene todos los eventos de un equipo específico.
    
    Args:
        file_path: Ruta del archivo XML del partido
        team_id: ID del equipo
    
    Returns:
        Lista de eventos del equipo especificado
    """
    events = await get_all_events(file_path)
    return [e for e in events if e.get("team_id") == team_id]


async def get_events_by_player(file_path: str, player_id: str) -> List[Dict[str, Any]]:
    """
    Obtiene todos los eventos de un jugador específico.
    
    Args:
        file_path: Ruta del archivo XML del partido
        player_id: ID del jugador
    
    Returns:
        Lista de eventos del jugador especificado
    """
    events = await get_all_events(file_path)
    return [e for e in events if e.get("player_id") == player_id]


async def get_events_by_period(file_path: str, period_id: str) -> List[Dict[str, Any]]:
    """
    Obtiene todos los eventos de un período específico.
    
    Args:
        file_path: Ruta del archivo XML del partido
        period_id: ID del período (ej: "1" para primer tiempo, "2" para segundo)
    
    Returns:
        Lista de eventos del período especificado
    """
    events = await get_all_events(file_path)
    return [e for e in events if e.get("period_id") == period_id]


async def get_pass_network(file_path: str, team_id: str = "", min_pass_count: int = 0) -> Dict[str, Any]:
    """
    Construye la red de pases para el partido.
    
    Args:
        file_path: Ruta del archivo XML del partido
        team_id: ID del equipo para filtrar (vacío = todos los equipos)
        min_pass_count: Filtro mínimo de pases entre dos jugadores
    
    Returns:
        Grafo de la red de pases con nodos, aristas y estadísticas
    """
    events = await get_all_events(file_path)
    network = build_pass_network_from_events(events, team_id, min_pass_count = 5)
    return network.to_dict()


async def get_successful_passes(file_path: str, team_id: str = "") -> List[Dict[str, Any]]:
    """
    Obtiene todos los pases exitosos del partido.
    
    Args:
        file_path: Ruta del archivo XML del partido
        team_id: ID del equipo para filtrar (vacío = todos)
    
    Returns:
        Lista de pases exitosos con información completa
    """
    events = await get_all_events(file_path)
    
    passes = [
        e for e in events 
        if e.get("event_name") == "Pass" and e.get("outcome") == "1"
    ]
    
    if team_id:
        passes = [p for p in passes if p.get("team_id") == team_id]
    
    return passes


async def get_event_statistics(file_path: str) -> Dict[str, Any]:
    """
    Obtiene estadísticas generales de eventos del partido.
    
    Args:
        file_path: Ruta del archivo XML del partido
    
    Returns:
        Diccionario con estadísticas de eventos
    """
    events = await get_all_events(file_path)
    
    # Contar eventos por tipo
    event_types = {}
    for event in events:
        event_name = event.get("event_name", "Unknown")
        event_types[event_name] = event_types.get(event_name, 0) + 1
    
    # Contar eventos por equipo
    event_by_team = {}
    for event in events:
        team_id = event.get("team_id", "Unknown")
        event_by_team[team_id] = event_by_team.get(team_id, 0) + 1
    
    return {
        "total_events": len(events),
        "event_types": event_types,
        "events_by_team": event_by_team,
    }
