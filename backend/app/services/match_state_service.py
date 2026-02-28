from typing import Any, Dict, List
import logging
from app.state.match_state import match_state

logger = logging.getLogger(__name__)


class MatchStateService:
    """Service wrapper to keep and update MatchState singleton."""

    def get_state(self) -> dict:
        return {
            "game": match_state.game,
            "events": match_state.events,
            "last_event_id": match_state.last_event_id,
            "pass_networks": match_state.pass_networks,
        }

    def reset(self) -> None:
        match_state.reset()

    def set_game(self, game: Dict[str, Any]) -> None:
        match_state.game = game

    def set_events(self, events: List[Dict[str, Any]]) -> None:
        match_state.events = events

    def set_last_event_id(self, event_id: str | None) -> None:
        match_state.last_event_id = event_id

    def get_pass_networks(self):
        return match_state.pass_networks

    def ensure_pass_network(self, team_id: str):
        if team_id not in match_state.pass_networks:
            match_state.pass_networks[team_id] = match_state.pass_networks.get(team_id) or {}


match_state_service = MatchStateService()
