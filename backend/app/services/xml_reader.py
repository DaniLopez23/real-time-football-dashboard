import asyncio
import json
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any, Dict, List
import logging
import time
from app.state.match_state import match_state
from app.services.compute_player_pass_receiver import add_pass_receiver_info
from app.services.pass_network import PassNetwork

# Logger
logger = logging.getLogger(__name__)


# Base paths and cached mappers for fast reuse
BASE_PATH = Path(__file__).parent.parent
EVENT_MAPPER = None
QUALIFIER_MAPPER = None

SIMULATED_DATA_FILE = BASE_PATH.parent.parent / "simulated-real-time-data" / "060226-00.xml"
    

def _load_json_mapper(relative_path: str) -> Dict[str, Any]:
    mapper_path = BASE_PATH / relative_path
    with open(mapper_path, "r", encoding="utf-8") as f:
        return json.load(f)


def _ensure_mappers_loaded() -> None:
    global EVENT_MAPPER, QUALIFIER_MAPPER
    if EVENT_MAPPER is None:
        EVENT_MAPPER = _load_json_mapper("utils/event_mapper.json")
    if QUALIFIER_MAPPER is None:
        QUALIFIER_MAPPER = _load_json_mapper("utils/qualifier_mapper.json")


def _get_event_info(type_id: str) -> Dict[str, Any]:
    event_data = EVENT_MAPPER.get(str(type_id), {})
    return {
        "event_name": event_data.get("event_name", "Unknown Event"),
        "description": event_data.get("description", ""),
    }


def _get_qualifier_info(qualifier_id: str, value: str) -> Dict[str, Any]:
    qualifier_data = QUALIFIER_MAPPER.get(str(qualifier_id))
    
    if qualifier_data:
        return {
            "qualifier_id": qualifier_id,
            "qualifier_name": qualifier_data.get("qualifier_name", ""),
            "value": value,
        }
    else:
        return {
            "qualifier_id": qualifier_id,
            "qualifier_name": "Unknown Qualifier",
            "value": value,
        }


def _parse_event(event_element: ET.Element) -> Dict[str, Any]:
    event_attrs = event_element.attrib
    type_id = event_attrs.get("type_id", "")
    event_info = _get_event_info(type_id)

    qualifiers = []
    for q in event_element.findall("Q"):
        q_attrs = q.attrib
        qualifier_id = q_attrs.get("qualifier_id", "")
        value = q_attrs.get("value", "")
        qualifiers.append(_get_qualifier_info(qualifier_id, value))

    return {
        "id": event_attrs.get("id", ""),
        "event_id": event_attrs.get("event_id", ""),
        "type_id": type_id,
        "event_name": event_info["event_name"],
        "event_description": event_info["description"],
        "period_id": event_attrs.get("period_id", ""),
        "min": event_attrs.get("min", ""),
        "sec": event_attrs.get("sec", ""),
        "player_id": event_attrs.get("player_id", ""),
        "team_id": event_attrs.get("team_id", ""),
        "outcome": event_attrs.get("outcome", ""),
        "x": event_attrs.get("x", ""),
        "y": event_attrs.get("y", ""),
        "timestamp": event_attrs.get("timestamp", ""),
        "timestamp_utc": event_attrs.get("timestamp_utc", ""),
        "last_modified": event_attrs.get("last_modified", ""),
        "version": event_attrs.get("version", ""),
        "qualifiers": qualifiers,
    }


def _parse_game(game_element: ET.Element) -> Dict[str, Any]:
    game_attrs = game_element.attrib

    events = []
    for event in game_element.findall("Event"):
        events.append(_parse_event(event))

    return {
        "game_id": game_attrs.get("id", ""),
        "competition_id": game_attrs.get("competition_id", ""),
        "competition_name": game_attrs.get("competition_name", ""),
        "season_id": game_attrs.get("season_id", ""),
        "season_name": game_attrs.get("season_name", ""),
        "matchday": game_attrs.get("matchday", ""),
        "game_date": game_attrs.get("game_date", ""),
        "home_team": {
            "team_id": game_attrs.get("home_team_id", ""),
            "team_name": game_attrs.get("home_team_name", ""),
            "team_official": game_attrs.get("home_team_official", ""),
            "team_short": game_attrs.get("home_team_short", ""),
            "score": game_attrs.get("home_score", ""),
        },
        "away_team": {
            "team_id": game_attrs.get("away_team_id", ""),
            "team_name": game_attrs.get("away_team_name", ""),
            "team_official": game_attrs.get("away_team_official", ""),
            "team_short": game_attrs.get("away_team_short", ""),
            "score": game_attrs.get("away_score", ""),
        },
        "period_1_start": game_attrs.get("period_1_start", ""),
        "period_2_start": game_attrs.get("period_2_start", ""),
        "events": events,
        "total_events": len(events),
    }


def parse_xml_file(xml_file_path: str) -> Dict[str, Any]:
    _ensure_mappers_loaded()

    xml_path = Path(xml_file_path)
    if not xml_path.is_absolute():
        xml_path = BASE_PATH / xml_file_path

    if not xml_path.exists():
        raise FileNotFoundError(f"XML file not found: {xml_path}")

    tree = ET.parse(xml_path)
    root = tree.getroot()

    timestamp = root.attrib.get("timestamp", "")
    
    # Solo hay un game, así que lo tomamos directamente
    game_element = root.find("Game")
    if game_element is None:
        raise ValueError("No Game element found in XML")
    
    game = _parse_game(game_element)

    return {
        "timestamp": timestamp,
        "game": game,
    }


def read_full_xml(file_path: str) -> Dict[str, Any]:
    """Parse the full XML for HTTP/WS endpoints."""
    parsed = parse_xml_file(file_path)
    game = parsed.get("game", {})
    events = game.get("events", [])
    enriched_events = add_pass_receiver_info(events)
    
    game["events"] = enriched_events
    match_state.events = enriched_events
    match_state.last_event_id = enriched_events[-1]["id"] if enriched_events else None

    logger.info(f"✓ Parsed {len(enriched_events)} events. Last event ID: {match_state.last_event_id}")
   
    return {
        "total_events": len(enriched_events),
        "last_event_id": match_state.last_event_id,
        "data": parsed,
    }


async def read_full_xml_async(file_path: str) -> Dict[str, Any]:
    """Async wrapper to avoid blocking FastAPI/WS event loops."""
    return await asyncio.to_thread(read_full_xml, file_path)


def _process_pass_events_for_network(
    events: List[Dict[str, Any]], 
    team_id: str
) -> tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Procesa eventos de pase para una red específica y retorna nodos y aristas afectados.
    
    Args:
        events: Lista de eventos de pase (type_id='1') con player_receiver_id
        team_id: ID del equipo
    
    Returns:
        Tuple de (nodos_afectados, aristas_afectadas)
    """
    if team_id not in match_state.pass_networks:
        match_state.pass_networks[team_id] = PassNetwork(team_id=team_id)
    
    network = match_state.pass_networks[team_id]
    affected_players = set()
    affected_edges = set()
    
    processed_count = 0
    
    for event in events:
        # Solo procesar pases exitosos del equipo especificado
        if event.get("type_id") != "1" or event.get("outcome") != "1":
            continue
        if event.get("team_id") != team_id:
            continue
            
        from_player_id = event.get("player_id", "")
        to_player_id = event.get("player_receiver_id", "")
        
        if not from_player_id or not to_player_id:
            continue
        
        x = float(event.get("x", 0.0))
        y = float(event.get("y", 0.0))
        
        # Extraer end_x, end_y de qualifiers
        end_x, end_y = 0.0, 0.0
        for qualifier in event.get("qualifiers", []):
            if qualifier.get("qualifier_id") == "140":
                end_x = float(qualifier.get("value", 0.0))
            elif qualifier.get("qualifier_id") == "141":
                end_y = float(qualifier.get("value", 0.0))
        
        # Añadir a la red
        network.add_pass(from_player_id, to_player_id, x, y, end_x, end_y)
        processed_count += 1
        
        # Registrar elementos afectados
        affected_players.add(from_player_id)
        affected_players.add(to_player_id)
        affected_edges.add((from_player_id, to_player_id))
    
    if processed_count > 0:
        logger.debug(f"  ✅ Equipo {team_id}: {processed_count} pases, {len(affected_players)} jugadores, {len(affected_edges)} conexiones")
    
    # Extraer nodos y aristas afectados
    nodes = [
        network.players[player_id].to_dict() 
        for player_id in affected_players 
        if player_id in network.players
    ]
    
    edges = [
        network.edges[edge_key].to_dict() 
        for edge_key in affected_edges 
        if edge_key in network.edges
    ]
    
    return nodes, edges


async def watch_simulated_real_time_data(
    poll_interval: int = 3,
    on_new_data: callable = None
) -> None:
    """
    Lee el archivo XML cada poll_interval y detecta cambios en Game y Events.
    Mantiene estado acumulativo y calcula redes de pases incrementalmente.
    Envía: new_game, game_updates, new_events, events_updates, new_pass_network_elements, update_pass_network_elements
    """
    logger.info(f"🔄 Iniciando monitoreo de datos simulados")
    logger.info(f"📁 Ruta: {SIMULATED_DATA_FILE}")
    logger.info(f"⏱️  Intervalo: {poll_interval}s\n")
    
    
    while True:
        try:
            if not SIMULATED_DATA_FILE.exists():
                logger.warning(f"⚠️  Archivo no encontrado: {SIMULATED_DATA_FILE}")
                await asyncio.sleep(poll_interval)
                continue

            # Verificar que el archivo no esté vacío
            if SIMULATED_DATA_FILE.stat().st_size == 0:
                logger.warning(f"⚠️  Archivo vacío: {SIMULATED_DATA_FILE}")
                await asyncio.sleep(poll_interval)
                continue

            # Leer XML completo
            try:
                parsed = parse_xml_file(str(SIMULATED_DATA_FILE))
            except ET.ParseError as e:
                logger.warning(f"⚠️  Error parseando XML (puede estar escribiéndose): {e}")
                await asyncio.sleep(poll_interval)
                continue
            game = parsed.get("game", {})
            if not game:
                logger.warning("⚠️  No se encontró Game en el XML")
                await asyncio.sleep(poll_interval)
                continue

            # Enriquecer eventos con receptores
            events = game.get("events", [])
            enriched_events = add_pass_receiver_info(events)
            
            # Separar Game de Events (excluir también total_events ya que es derivado)
            game_snapshot = {k: v for k, v in game.items() if k not in ("events", "total_events")}
            game_id = game_snapshot.get("game_id", "unknown")
            
            updates: List[Dict[str, Any]] = []
            
            # Detectar cambios en Game
            if not match_state.game or match_state.game.get("game_id") != game_id:
                # Nuevo juego - resetear estado
                match_state.reset()
                match_state.game = game_snapshot
                match_state.events = enriched_events
                match_state.last_event_id = enriched_events[-1].get("id") if enriched_events else None
                
                updates.append({
                    "type": "new_game",
                    "game_id": game_id,
                    "timestamp": parsed.get("timestamp", ""),
                    "game": game_snapshot,
                })
                
                # Calcular redes de pases iniciales con TODOS los eventos del juego nuevo
                initial_pass_events = [
                    e for e in enriched_events
                    if e.get("type_id") == "1" 
                    and e.get("outcome") == "1"
                    and e.get("player_receiver_id")  # Solo pases con receptor conocido
                ]
                
                logger.info(f"🎮 Nuevo juego detectado: calculando redes iniciales con {len(initial_pass_events)} pases")
                
                if initial_pass_events:
                    teams = set(e.get("team_id") for e in initial_pass_events if e.get("team_id"))
                    
                    for team_id in teams:
                        team_pass_events = [e for e in initial_pass_events if e.get("team_id") == team_id]
                        nodes, edges = _process_pass_events_for_network(team_pass_events, team_id)
                        
                        if nodes or edges:
                            updates.append({
                                "type": "new_pass_network_elements",
                                "game_id": game_id,
                                "team_id": team_id,
                                "nodes": nodes,
                                "edges": edges,
                                "statistics": match_state.pass_networks[team_id].get_statistics() if team_id in match_state.pass_networks else {},
                            })
                            logger.info(f"  ✅ Equipo {team_id}: {len(nodes)} nodos, {len(edges)} aristas")
                
            elif game_snapshot != match_state.game:
                # Game existente con cambios
                updates.append({
                    "type": "game_updates",
                    "game_id": game_id,
                    "timestamp": parsed.get("timestamp", ""),
                    "game": game_snapshot,
                })
                match_state.game = game_snapshot
            
            # Crear índice de eventos actuales (clave: team_id, event_id)
            current_events_by_key = {
                (event.get("team_id"), event.get("event_id")): event
                for event in enriched_events
            }
            
            existing_events_by_key = {
                (event.get("team_id"), event.get("event_id")): event
                for event in match_state.events
            }
            
            # Detectar cambios en Events
            new_events: List[Dict[str, Any]] = []
            updated_events: List[Dict[str, Any]] = []
            
            for event_key, event in current_events_by_key.items():
                if event_key not in existing_events_by_key:
                    new_events.append(event)
                else:
                    # Comparar solo type_id para detectar actualizaciones significativas
                    existing_event = existing_events_by_key[event_key]
                    if event.get("type_id") != existing_event.get("type_id"):
                        updated_events.append(event)
            
            # Actualizar estado con todos los eventos
            match_state.events = enriched_events
            match_state.last_event_id = enriched_events[-1].get("id") if enriched_events else None
            
            # Enviar eventos nuevos
            if new_events:
                updates.append({
                    "type": "new_events",
                    "game_id": game_id,
                    "count": len(new_events),
                    "events": new_events,
                })
            
            # Enviar eventos actualizados
            if updated_events:
                updates.append({
                    "type": "events_updates",
                    "game_id": game_id,
                    "count": len(updated_events),
                    "events": updated_events,
                })
            
            # Calcular redes de pases para eventos nuevos/actualizados de tipo pase
            pass_events = [
                e for e in (new_events + updated_events)
                if e.get("type_id") == "1" 
                and e.get("outcome") == "1"
                and e.get("player_receiver_id")  # Solo pases con receptor conocido
            ]
            
            if pass_events:
                # Agrupar por equipo
                teams = set(e.get("team_id") for e in pass_events if e.get("team_id"))
                
                for team_id in teams:
                    team_pass_events = [e for e in pass_events if e.get("team_id") == team_id]
                    nodes, edges = _process_pass_events_for_network(team_pass_events, team_id)
                    logger.debug(f"🎮 Procesados {len(team_pass_events)} eventos de pase para equipo {team_id}: {len(nodes)} nodos, {len(edges)} aristas")
                    if nodes or edges:
                        updates.append({
                            "type": "new_pass_network_elements" if any(e in new_events for e in team_pass_events) else "update_pass_network_elements",
                            "game_id": game_id,
                            "team_id": team_id,
                            "nodes": nodes,
                            "edges": edges,
                            "statistics": match_state.pass_networks[team_id].get_statistics() if team_id in match_state.pass_networks else {},
                        })
            
            # Enviar actualizaciones
            if updates and on_new_data:
                await on_new_data(updates)
            
            await asyncio.sleep(poll_interval)
            
        except Exception as e:
            logger.error(f"❌ Error en monitoreo: {e}", exc_info=True)
            await asyncio.sleep(poll_interval)


def main() -> Dict[str, Any]:
    """Test function to parse XML."""
    xml_file = "data/events/f24-23-2023-2372222-eventdetails.xml"
    logger.info(f"Parsing XML: {xml_file}")
    result = read_full_xml(xml_file)
    logger.info(f"✓ Total events: {result.get('total_events', 0)}")
    return result


if __name__ == "__main__":
    main()