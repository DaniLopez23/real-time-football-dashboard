import os
import xml.etree.ElementTree as ET
import json

FILES_PATH = "data/events/"
EVENT_MAPPER_PATH = "utils/event_mapper.json"


def load_event_mapper():
    """Load the event mapper from JSON file."""
    with open(EVENT_MAPPER_PATH, 'r') as file:
        return json.load(file)


def get_match_info(match_id):
    """
    Retrieve match information based on the given match ID.
    
    Args:
        match_id (int): The unique identifier for the match.
    
    Returns:
        dict: A dictionary containing match details.
    """
    # Find XML file matching the match ID
    xml_files = [f for f in os.listdir(FILES_PATH) if f.endswith('.xml')]
    matching_file = None
    
    for file in xml_files:
        if str(match_id) in file:
            matching_file = file
            break
    
    if not matching_file:
        raise FileNotFoundError(f"No data found for match ID {match_id}")
    
    file_path = os.path.join(FILES_PATH, matching_file)
    tree = ET.parse(file_path)
    root = tree.getroot()
    
    # Extract Game (match) information
    game = root.find('Game')
    if game is None:
        raise ValueError("No Game element found in XML")
    
    match_data = {
        'id': game.get('id'),
        'home_team': {
            'id': game.get('home_team_id'),
            'name': game.get('home_team_name'),
            'short_name': game.get('home_team_short'),
            'score': game.get('home_score')
        },
        'away_team': {
            'id': game.get('away_team_id'),
            'name': game.get('away_team_name'),
            'short_name': game.get('away_team_short'),
            'score': game.get('away_score')
        },
        'competition': {
            'id': game.get('competition_id'),
            'name': game.get('competition_name')
        },
        'season': {
            'id': game.get('season_id'),
            'name': game.get('season_name')
        },
        'matchday': game.get('matchday'),
        'game_date': game.get('game_date'),
        'period_1_start': game.get('period_1_start'),
        'period_2_start': game.get('period_2_start')
    }
    
    return match_data, file_path


def process_events(file_path, event_mapper):
    """
    Process all events from an XML file.
    
    Args:
        file_path (str): Path to the XML file.
        event_mapper (dict): Event mapper dictionary from event_mapper.json.
    
    Returns:
        list: List of processed events with classification.
    """
    tree = ET.parse(file_path)
    root = tree.getroot()
    
    game = root.find('Game')
    events = game.findall('Event')
    
    processed_events = []
    
    for event in events:
        type_id = event.get('type_id')
        event_type_name = event_mapper['eventTypes'].get(type_id, 'Unknown')
        
        # Classify event
        classification = classify_event(type_id, event_type_name, event_mapper)
        
        event_data = {
            'event_id': event.get('event_id'),
            'type_id': type_id,
            'type_name': event_type_name,
            'classification': classification,
            'period_id': event.get('period_id'),
            'time': {
                'min': event.get('min'),
                'sec': event.get('sec')
            },
            'player_id': event.get('player_id'),
            'team_id': event.get('team_id'),
            'outcome': event.get('outcome'),
            'position': {
                'x': event.get('x'),
                'y': event.get('y')
            },
            'timestamp': event.get('timestamp'),
            'qualifiers': []
        }
        
        # Extract qualifiers (Q elements)
        qualifiers = event.findall('Q')
        for q in qualifiers:
            event_data['qualifiers'].append({
                'qualifier_id': q.get('qualifier_id'),
                'value': q.get('value')
            })
        
        processed_events.append(event_data)
    
    return processed_events


def classify_event(type_id, type_name, event_mapper):
    """
    Classify event into categories (Pass, Shot, etc.).
    
    Args:
        type_id (str): The event type ID.
        type_name (str): The event type name.
        event_mapper (dict): Event mapper dictionary.
    
    Returns:
        str: Classification of the event.
    """
    if type_id in event_mapper['passes']:
        return 'Pass'
    elif type_id in event_mapper['shots']:
        return f"Shot - {event_mapper['shots'][type_id]['result']}"
    else:
        return 'Other'


def main():
    print("Welcome to the Match Simulator!")
    match_id = 2372222
    
    try:
        # Load event mapper
        event_mapper = load_event_mapper()
        
        # Get match information
        match_info, file_path = get_match_info(match_id)
        
        print("\n" + "="*60)
        print("MATCH INFORMATION")
        print("="*60)
        print(f"Match ID: {match_info['id']}")
        print(f"Date: {match_info['game_date']}")
        print(f"Competition: {match_info['competition']['name']}")
        print(f"Matchday: {match_info['matchday']}")
        print(f"\nTeams:")
        print(f"  Home: {match_info['home_team']['name']} ({match_info['home_team']['short_name']}) - {match_info['home_team']['score']}")
        print(f"  Away: {match_info['away_team']['name']} ({match_info['away_team']['short_name']}) - {match_info['away_team']['score']}")
        
        # Process events
        print("\n" + "="*60)
        print("PROCESSING EVENTS")
        print("="*60)
        events = process_events(file_path, event_mapper)
        
        print(f"\nTotal events processed: {len(events)}")
        
        # Show summary by classification
        classifications = {}
        for event in events:
            classification = event['classification']
            classifications[classification] = classifications.get(classification, 0) + 1
        
        print("\nEvent Summary:")
        for classification, count in sorted(classifications.items()):
            print(f"  {classification}: {count}")
        
        # Show first 10 events
        print("\n" + "="*60)
        print("FIRST 10 EVENTS")
        print("="*60)
        for i, event in enumerate(events[:10]):
            print(f"\nEvent {i+1}:")
            print(f"  ID: {event['event_id']}")
            print(f"  Type: {event['type_name']} (ID: {event['type_id']})")
            print(f"  Classification: {event['classification']}")
            print(f"  Time: {event['time']['min']}:{event['time']['sec']}")
            print(f"  Team ID: {event['team_id']}")
            print(f"  Position: ({event['position']['x']}, {event['position']['y']})")
            print(f"  Outcome: {event['outcome']}")
        
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()