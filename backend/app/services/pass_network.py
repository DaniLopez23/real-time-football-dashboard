"""
Pass Network Service

Construye un grafo de redes de pases a partir de eventos de fútbol.
- Nodos: IDs de jugadores con peso según su frecuencia
- Aristas: Número de pases dirigidos entre jugadores (grafo dirigido)
"""

from typing import Any, Dict, List, Set, Tuple
from dataclasses import dataclass, field
from collections import defaultdict


@dataclass
class Player:
    """Representa un nodo (jugador) en la red de pases."""
    
    player_id: str
    player_name: str = ""
    team_id: str = ""
    pass_count: int = 0  # Número total de pases que hace este jugador
    
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "player_id": self.player_id,
            "player_name": self.player_name,
            "team_id": self.team_id,
            "pass_count": self.pass_count,
        }


@dataclass
class PassEdge:
    """Representa una arista (pase) dirigida entre dos jugadores."""
    
    from_player_id: str
    to_player_id: str
    pass_count: int = 0  # Número de pases de from_player a to_player
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "from_player_id": self.from_player_id,
            "to_player_id": self.to_player_id,
            "pass_count": self.pass_count,
        }


@dataclass
class PassNetwork:
    """
    Grafo de redes de pases.
    
    Attributes:
        players: Diccionario de nodos {player_id: Player}
        edges: Diccionario de aristas {(from_id, to_id): PassEdge}
        team_id: ID del equipo para filtrar (si se especifica)
    """
    
    players: Dict[str, Player] = field(default_factory=dict)
    edges: Dict[Tuple[str, str], PassEdge] = field(default_factory=dict)
    team_id: str = ""
    
    def add_player(self, player_id: str, player_name: str = "", team_id: str = "") -> None:
        """Añade un nodo (jugador) a la red."""
        if player_id not in self.players:
            self.players[player_id] = Player(player_id, player_name, team_id)
    
    def add_pass(self, from_player_id: str, to_player_id: str) -> None:
        """
        Añade una arista dirigida de un jugador a otro.
        
        Args:
            from_player_id: ID del jugador que hace el pase
            to_player_id: ID del jugador que recibe el pase
        """
        # Asegurar que ambos jugadores existen
        self.add_player(from_player_id)
        self.add_player(to_player_id)
        
        # Incrementar el peso del nodo origen (pases realizados)
        self.players[from_player_id].pass_count += 1
        
        # Crear o actualizar la arista dirigida
        edge_key = (from_player_id, to_player_id)
        if edge_key in self.edges:
            self.edges[edge_key].pass_count += 1
        else:
            self.edges[edge_key] = PassEdge(from_player_id, to_player_id, 1)
    
    def get_nodes(self) -> List[Dict[str, Any]]:
        """Retorna lista de nodos con sus propiedades."""
        return [player.to_dict() for player in self.players.values()]
    
    def get_edges(self) -> List[Dict[str, Any]]:
        """Retorna lista de aristas con sus propiedades."""
        return [edge.to_dict() for edge in self.edges.values()]
    
    def get_player_info(self, player_id: str) -> Dict[str, Any]:
        """Obtiene información de un jugador específico."""
        if player_id not in self.players:
            return {}
        
        player = self.players[player_id]
        
        # Pases que recibe
        passes_received = sum(
            edge.pass_count 
            for (_, to_id), edge in self.edges.items() 
            if to_id == player_id
        )
        
        # Pases que hace
        passes_made = player.pass_count
        
        # Conexiones de salida (a quién pasa)
        connections_out = [
            {
                "to_player_id": edge.to_player_id,
                "pass_count": edge.pass_count,
            }
            for (from_id, _), edge in self.edges.items()
            if from_id == player_id
        ]
        
        # Conexiones de entrada (quién le pasa)
        connections_in = [
            {
                "from_player_id": edge.from_player_id,
                "pass_count": edge.pass_count,
            }
            for (_, to_id), edge in self.edges.items()
            if to_id == player_id
        ]
        
        return {
            "player_id": player_id,
            "player_name": player.player_name,
            "team_id": player.team_id,
            "passes_made": passes_made,
            "passes_received": passes_received,
            "total_passes_involved": passes_made + passes_received,
            "connections_out": connections_out,
            "connections_in": connections_in,
        }
    
    def get_statistics(self) -> Dict[str, Any]:
        """Obtiene estadísticas generales de la red."""
        total_passes = sum(edge.pass_count for edge in self.edges.values())
        
        return {
            "total_players": len(self.players),
            "total_connections": len(self.edges),
            "total_passes": total_passes,
            "team_id": self.team_id,
        }
    
    def to_dict(self) -> Dict[str, Any]:
        """Convierte la red a un diccionario."""
        return {
            "nodes": self.get_nodes(),
            "edges": self.get_edges(),
            "statistics": self.get_statistics(),
        }


def build_pass_network_from_events(
    events: List[Dict[str, Any]],
    team_id: str = "",
    min_pass_count: int = 0,
) -> PassNetwork:
    """
    Construye una red de pases a partir de una lista de eventos.
    
    Args:
        events: Lista de eventos del partido
        team_id: ID del equipo para filtrar (vacío = todos los equipos)
        min_pass_count: Filtro mínimo de pases entre dos jugadores (opcional)
    
    Returns:
        PassNetwork: Grafo de pases construido
    """
    network = PassNetwork(team_id=team_id)
    
    # Filtrar eventos de pase exitosos
    pass_events = [
        event for event in events
        if event.get("event_name") == "Pass" and event.get("outcome") == "1"
    ]
    
    # Filtrar por equipo si es necesario
    if team_id:
        pass_events = [e for e in pass_events if e.get("team_id") == team_id]
    
    # Procesar cada pase
    for event in pass_events:
        from_player_id = event.get("player_id", "")
        player_name = event.get("player_name", "")
        current_team_id = event.get("team_id", "")
        
        if not from_player_id:
            continue
        
        # Buscar el receptor del pase en los qualifiers
        # El qualifier 72 contiene el player_id del receptor
        to_player_id = None
        qualifiers = event.get("qualifiers", [])
        
        for qualifier in qualifiers:
            if qualifier.get("qualifier_id") == "72":
                to_player_id = qualifier.get("value", "")
                break
        
        if to_player_id:
            # Añadir el pase a la red
            network.add_player(from_player_id, player_name, current_team_id)
            network.add_pass(from_player_id, to_player_id)
    
    # Aplicar filtro de pases mínimos entre jugadores si es necesario
    if min_pass_count > 0:
        network.edges = {
            k: v for k, v in network.edges.items()
            if v.pass_count >= min_pass_count
        }
    
    return network


def get_top_passers(
    network: PassNetwork,
    limit: int = 10,
) -> List[Dict[str, Any]]:
    """
    Obtiene los mejores pasadores según número de pases realizados.
    
    Args:
        network: Red de pases
        limit: Número máximo de jugadores a retornar
    
    Returns:
        Lista de jugadores ordenados por pases realizados
    """
    players_sorted = sorted(
        network.players.values(),
        key=lambda p: p.pass_count,
        reverse=True,
    )
    
    return [
        {
            "player_id": p.player_id,
            "player_name": p.player_name,
            "pass_count": p.pass_count,
        }
        for p in players_sorted[:limit]
    ]


def get_top_partnerships(
    network: PassNetwork,
    limit: int = 10,
) -> List[Dict[str, Any]]:
    """
    Obtiene las mejores asociaciones (mayor número de pases entre dos jugadores).
    
    Args:
        network: Red de pases
        limit: Número máximo de asociaciones a retornar
    
    Returns:
        Lista de asociaciones ordenadas por número de pases
    """
    # Combinar pases bidireccionales para obtener asociaciones totales
    partnerships = defaultdict(int)
    
    for (from_id, to_id), edge in network.edges.items():
        # Crear una clave única ordenada
        key = tuple(sorted([from_id, to_id]))
        partnerships[key] += edge.pass_count
    
    # Ordenar por mayor número de pases
    sorted_partnerships = sorted(
        partnerships.items(),
        key=lambda x: x[1],
        reverse=True,
    )
    
    return [
        {
            "player_1_id": pair[0],
            "player_2_id": pair[1],
            "total_passes": count,
            "player_1_name": network.players[pair[0]].player_name,
            "player_2_name": network.players[pair[1]].player_name,
        }
        for pair, count in sorted_partnerships[:limit]
    ]
