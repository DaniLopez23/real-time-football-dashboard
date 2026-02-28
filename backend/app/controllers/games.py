"""
Games Controller

Maneja las operaciones relacionadas con partidos (games).
"""

from typing import Any, Dict, List
from backend.app.services.xml_reader_service import read_full_xml_async
import logging


logger = logging.getLogger(__name__)


async def get_game_data(file_path: str) -> Dict[str, Any]:
    """
    Obtiene la información completa del partido desde un archivo XML.
    
    Args:
        file_path: Ruta del archivo XML del partido
    
    Returns:
        Diccionario con información del partido (game_id, equipos, fechas, etc.)
    """
    full_data = await read_full_xml_async(file_path)
    
    game = full_data.get("data", {}).get("game", {})
    if not game:
        logger.warning("No se encontró información del partido en el archivo XML.")
        return {}
    
    return game


async def get_game_summary(file_path: str) -> Dict[str, Any]:
    """
    Obtiene un resumen del partido con información esencial.
    
    Args:
        file_path: Ruta del archivo XML del partido
    
    Returns:
        Diccionario con resumen: ID, equipos, scores, fecha
    """
    game = await get_game_data(file_path)
    
    if not game:
        return {}
    
    return {
        "game_id": game.get("game_id"),
        "competition": game.get("competition_name"),
        "season": game.get("season_name"),
        "matchday": game.get("matchday"),
        "game_date": game.get("game_date"),
        "home_team": {
            "team_id": game.get("home_team", {}).get("team_id"),
            "team_name": game.get("home_team", {}).get("team_name"),
            "score": game.get("home_team", {}).get("score"),
        },
        "away_team": {
            "team_id": game.get("away_team", {}).get("team_id"),
            "team_name": game.get("away_team", {}).get("team_name"),
            "score": game.get("away_team", {}).get("score"),
        },
    }


async def get_game_teams(file_path: str) -> Dict[str, Any]:
    """
    Obtiene información detallada de ambos equipos del partido.
    
    Args:
        file_path: Ruta del archivo XML del partido
    
    Returns:
        Diccionario con información de ambos equipos
    """
    game = await get_game_data(file_path)
    
    if not game:
        return {}
    
    return {
        "home_team": game.get("home_team", {}),
        "away_team": game.get("away_team", {}),
    }


async def get_match_timeline(file_path: str) -> Dict[str, Any]:
    """
    Obtiene las fechas y horas clave del partido.
    
    Args:
        file_path: Ruta del archivo XML del partido
    
    Returns:
        Diccionario con timeline del partido
    """
    game = await get_game_data(file_path)
    
    if not game:
        return {}
    
    return {
        "game_id": game.get("game_id"),
        "game_date": game.get("game_date"),
        "period_1_start": game.get("period_1_start"),
        "period_2_start": game.get("period_2_start"),
    }
