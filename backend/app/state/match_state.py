# app/state/match_state.py

class MatchState:
    def __init__(self):
        self.events = []
        self.last_event_id = None
        self.metrics = {}

match_state = MatchState()
