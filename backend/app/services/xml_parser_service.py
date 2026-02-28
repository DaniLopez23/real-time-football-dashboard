import json
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any, Dict
import logging

logger = logging.getLogger(__name__)

BASE_PATH = Path(__file__).parent.parent


class XmlParserService:
    """Converts raw XML (string or file) into structured JSON-like dicts.

    Responsibilities:
    - Load mapping JSONs (event/qualifier)
    - Parse XML from string/file
    - Return dict: {"timestamp": str, "game": {...}}
    """

    def __init__(self):
        self.event_mapper = None
        self.qualifier_mapper = None
        self._ensure_mappers_loaded()

    def _load_json_mapper(self, relative_path: str) -> Dict[str, Any]:
        mapper_path = BASE_PATH / relative_path
        with open(mapper_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _ensure_mappers_loaded(self) -> None:
        if self.event_mapper is None:
            self.event_mapper = self._load_json_mapper("utils/event_mapper.json")
        if self.qualifier_mapper is None:
            self.qualifier_mapper = self._load_json_mapper("utils/qualifier_mapper.json")

    def _get_event_info(self, type_id: str) -> Dict[str, Any]:
        event_data = self.event_mapper.get(str(type_id), {})
        return {
            "event_name": event_data.get("event_name", "Unknown Event"),
            "description": event_data.get("description", ""),
        }

    def _get_qualifier_info(self, qualifier_id: str, value: str) -> Dict[str, Any]:
        qualifier_data = self.qualifier_mapper.get(str(qualifier_id))
        if qualifier_data:
            return {
                "qualifier_id": qualifier_id,
                "qualifier_name": qualifier_data.get("qualifier_name", ""),
                "value": value,
            }
        return {"qualifier_id": qualifier_id, "qualifier_name": "Unknown Qualifier", "value": value}

    def _parse_event(self, event_element: ET.Element) -> Dict[str, Any]:
        event_attrs = event_element.attrib
        type_id = event_attrs.get("type_id", "")
        event_info = self._get_event_info(type_id)

        qualifiers = []
        for q in event_element.findall("Q"):
            q_attrs = q.attrib
            qualifier_id = q_attrs.get("qualifier_id", "")
            value = q_attrs.get("value", "")
            qualifiers.append(self._get_qualifier_info(qualifier_id, value))

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

    def _parse_game(self, game_element: ET.Element) -> Dict[str, Any]:
        game_attrs = game_element.attrib
        events = [self._parse_event(e) for e in game_element.findall("Event")]

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

    def parse_from_string(self, raw_xml: str) -> Dict[str, Any]:
        root = ET.fromstring(raw_xml)
        timestamp = root.attrib.get("timestamp", "")
        game_element = root.find("Game")
        if game_element is None:
            raise ValueError("No Game element found in XML")
        game = self._parse_game(game_element)
        return {"timestamp": timestamp, "game": game}

    def parse_from_file(self, xml_file_path: str) -> Dict[str, Any]:
        p = Path(xml_file_path)
        if not p.is_absolute():
            p = BASE_PATH / xml_file_path
        if not p.exists():
            raise FileNotFoundError(f"XML file not found: {p}")
        tree = ET.parse(p)
        root = tree.getroot()
        timestamp = root.attrib.get("timestamp", "")
        game_element = root.find("Game")
        if game_element is None:
            raise ValueError("No Game element found in XML")
        game = self._parse_game(game_element)
        return {"timestamp": timestamp, "game": game}


def main():
    logger.info("XmlParserService ready")


if __name__ == "__main__":
    main()
