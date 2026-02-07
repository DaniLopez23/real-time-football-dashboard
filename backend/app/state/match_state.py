# app/state/match_state.py
from typing import Any, Dict, List
from app.services.pass_network import PassNetwork

class MatchState:
    def __init__(self):
        self.game: Dict[str, Any] = {}
        self.events: List[Dict[str, Any]] = []
        self.last_event_id = None
        self.metrics = {}
        self.pass_networks: Dict[str, PassNetwork] = {}  # {team_id: PassNetwork}
    
    def reset(self):
        """Reset state for new game."""
        self.game = {}
        self.events = []
        self.last_event_id = None
        self.pass_networks = {}

match_state = MatchState()
