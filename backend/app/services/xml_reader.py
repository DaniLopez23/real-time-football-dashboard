import asyncio
import json
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any, Dict, List
import logging
from app.state.match_state import match_state
from app.services.compute_player_pass_receiver import add_pass_receiver_info

# Logger
logger = logging.getLogger(__name__)


# Base paths and cached mappers for fast reuse
BASE_PATH = Path(__file__).parent.parent
EVENT_MAPPER = None
QUALIFIER_MAPPER = None


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


def parse_xml_to_json(xml_file_path: str, output_json_path: str | None = None) -> Dict[str, Any]:
    result = parse_xml_file(xml_file_path)

    if output_json_path:
        output_path = Path(output_json_path)
        if not output_path.is_absolute():
            output_path = BASE_PATH / output_json_path
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
    return result


def read_full_xml(file_path: str) -> Dict[str, Any]:
    """Parse the full XML and update global match_state for HTTP/WS endpoints."""
    parsed = parse_xml_file(file_path)

    # Ahora solo hay un game, no un array
    game = parsed.get("game", {})
    all_events = game.get("events", [])
    
    # Enriquecer eventos con información de receptor de pases
    enriched_events = add_pass_receiver_info(all_events)
    
    # Actualizar el game con eventos enriquecidos
    game["events"] = enriched_events
    parsed["game"] = game

    match_state.events = enriched_events
    match_state.last_event_id = enriched_events[-1]["id"] if enriched_events else None

    return {
        "total_events": len(enriched_events),
        "last_event_id": match_state.last_event_id,
        "data": parsed,
    }


async def read_full_xml_async(file_path: str) -> Dict[str, Any]:
    """Async wrapper to avoid blocking FastAPI/WS event loops."""
    return await asyncio.to_thread(read_full_xml, file_path)


def main() -> Dict[str, Any]:
    """Test function to parse XML and export results."""
    xml_file = "data/events/f24-23-2023-2372222-eventdetails.xml"
    output_file = "output/parsed_game.json"
    
    logger.info(f"Parsing XML: {xml_file}")
    result = read_full_xml(xml_file)
    
    # Export to JSON
    parse_xml_to_json(xml_file, output_file)
    
    total_events = result.get("total_events", 0)
    logger.info(f"✓ Total events: {total_events}")
    logger.info(f"✓ Exported to: {output_file}")
    
    return result


if __name__ == "__main__":
    main()