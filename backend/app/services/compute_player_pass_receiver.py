"""Service to compute player pass receivers from event sequences."""
import logging
from typing import Any, Dict, List

logger = logging.getLogger(__name__)


def _is_pass_event(event: Dict[str, Any]) -> bool:
    """Check if event is a pass event (type_id = 1)."""
    return event.get("type_id") == "1"


def _find_next_team_event(
    events: List[Dict[str, Any]], 
    current_index: int, 
    team_id: str
) -> Dict[str, Any] | None:
    """Find the next event from the same team after current index."""
    for i in range(current_index + 1, len(events)):
        event = events[i]
        if event.get("team_id") == team_id:
            return event
    return None


def add_pass_receiver_info(events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Add player_receiver_id to pass events based on the next event of the same team.
    
    Args:
        events: List of event dictionaries from parsed XML
        
    Returns:
        List of events with player_receiver_id added to pass events
    """
    enriched_events = []
    pass_count = 0
    passes_with_receiver = 0
    
    logger.debug(f"Processing {len(events)} events")
    
    for index, event in enumerate(events):
        # Create a copy to avoid modifying original
        enriched_event = event.copy()
        
        # If it's a pass event, find the receiver
        if _is_pass_event(event):
            pass_count += 1
            team_id = event.get("team_id")
            player_id = event.get("player_id")
            event_id = event.get("event_id")
            
            logger.debug(f"Pass event found - Index: {index}, Event ID: {event_id}, Player: {player_id}, Team: {team_id}")
            
            next_team_event = _find_next_team_event(events, index, team_id)
            
            if next_team_event:
                receiver_id = next_team_event.get("player_id")
                enriched_event["player_receiver_id"] = receiver_id
                passes_with_receiver += 1
                logger.debug(f"  -> Receiver found: {receiver_id}")
            else:
                logger.debug(f"  -> No receiver found (no next team event)")
        
        enriched_events.append(enriched_event)
    
    logger.info(f"Processed {pass_count} passes, {passes_with_receiver} with receiver info")
    
    return enriched_events


def main() -> None:
    """Test function for pass receiver detection."""
    # This would typically receive events from the full_xml_reader
    logger.info("Pass receiver computation service ready.")
    logger.info("Use add_pass_receiver_info(events) to enrich pass events with receiver info.")


if __name__ == "__main__":
    main()
