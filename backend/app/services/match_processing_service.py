import logging
from typing import Any, Dict, List, Tuple
from app.services.compute_player_pass_receiver import add_pass_receiver_info
from app.services.pass_network import PassNetwork
from app.state.match_state import match_state

logger = logging.getLogger(__name__)


class MatchProcessingService:
    """Procesa el objeto parseado y detecta cambios en game/events y calcula redes de pases."""

    def __init__(self):
        pass

    def _game_snapshot(self, game: Dict[str, Any]) -> Dict[str, Any]:
        return {k: v for k, v in game.items() if k not in ("events", "total_events")}

    def _index_events(self, events: List[Dict[str, Any]]) -> Dict[Tuple[str, str], Dict[str, Any]]:
        return {(e.get("team_id"), e.get("event_id")): e for e in events}

    def _process_pass_events_for_network(self, enriched_events: List[Dict[str, Any]], team_id: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        if team_id not in match_state.pass_networks:
            match_state.pass_networks[team_id] = PassNetwork(team_id=team_id)
        network = match_state.pass_networks[team_id]

        # Filter team pass events: type_id=1 outcome=1 and has receiver
        team_pass_events = [
            e for e in enriched_events
            if e.get("type_id") == "1" and e.get("outcome") == "1" and e.get("team_id") == team_id and e.get("player_receiver_id")
        ]

        changed_nodes, changed_edges = network.add_passes_incremental(team_pass_events)
        return changed_nodes, changed_edges

    def process(self, parsed: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process parsed object and return list of updates to send via websocket.

        Also updates the match_state singleton in-place.
        """
        updates: List[Dict[str, Any]] = []

        game = parsed.get("game", {})
        if not game:
            return updates

        # Enrich events with pass receiver info (accumulative)
        events = game.get("events", [])
        enriched_events = add_pass_receiver_info(events)

        game_snapshot = self._game_snapshot(game)
        game_id = game_snapshot.get("game_id", "unknown")

        # Detect new game
        if not match_state.game or match_state.game.get("game_id") != game_id:
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

            # Build initial pass networks using ALL pass events
            initial_pass_events = [
                e for e in enriched_events
                if e.get("type_id") == "1" and e.get("outcome") == "1" and e.get("player_receiver_id")
            ]

            if initial_pass_events:
                teams = set(e.get("team_id") for e in initial_pass_events if e.get("team_id"))
                for team_id in teams:
                    nodes, edges = self._process_pass_events_for_network(initial_pass_events, team_id)
                    if nodes or edges:
                        updates.append({
                            "type": "new_pass_network_elements",
                            "game_id": game_id,
                            "team_id": team_id,
                            "nodes": nodes,
                            "edges": edges,
                            "statistics": match_state.pass_networks[team_id].get_statistics() if team_id in match_state.pass_networks else {},
                        })

            return updates

        # Existing game: detect game attribute changes
        if game_snapshot != match_state.game:
            updates.append({
                "type": "game_updates",
                "game_id": game_id,
                "timestamp": parsed.get("timestamp", ""),
                "game": game_snapshot,
            })
            match_state.game = game_snapshot

        # Index current and existing events
        current_events_by_key = self._index_events(enriched_events)
        existing_events_by_key = self._index_events(match_state.events)

        new_events: List[Dict[str, Any]] = []
        updated_events: List[Dict[str, Any]] = []

        for event_key, event in current_events_by_key.items():
            if event_key not in existing_events_by_key:
                new_events.append(event)
            else:
                existing_event = existing_events_by_key[event_key]
                if event.get("type_id") != existing_event.get("type_id"):
                    updated_events.append(event)

        # Update match state
        match_state.events = enriched_events
        match_state.last_event_id = enriched_events[-1].get("id") if enriched_events else None

        if new_events:
            updates.append({
                "type": "new_events",
                "game_id": game_id,
                "count": len(new_events),
                "events": new_events,
            })

        if updated_events:
            updates.append({
                "type": "events_updates",
                "game_id": game_id,
                "count": len(updated_events),
                "events": updated_events,
            })

        # If there are new or updated events, compute incremental pass network changes
        if new_events or updated_events:
            all_pass_events = [
                e for e in enriched_events
                if e.get("type_id") == "1" and e.get("outcome") == "1" and e.get("player_receiver_id")
            ]
            if all_pass_events:
                teams = set(e.get("team_id") for e in all_pass_events if e.get("team_id"))
                for team_id in teams:
                    nodes, edges = self._process_pass_events_for_network(all_pass_events, team_id)
                    if nodes or edges:
                        updates.append({
                            "type": "new_pass_network_elements" if new_events else "update_pass_network_elements",
                            "game_id": game_id,
                            "team_id": team_id,
                            "nodes": nodes,
                            "edges": edges,
                            "statistics": match_state.pass_networks[team_id].get_statistics() if team_id in match_state.pass_networks else {},
                        })

        return updates


match_processing_service = MatchProcessingService()
