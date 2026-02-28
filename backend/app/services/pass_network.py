"""
Pass Network Service

Construye un grafo de redes de pases a partir de eventos de fútbol.
- Nodos: IDs de jugadores con peso según su frecuencia
- Aristas: Número de pases dirigidos entre jugadores (grafo dirigido)
"""

from typing import Any, Dict, List, Set, Tuple
from dataclasses import dataclass, field
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)

@dataclass
class Player:
    """Representa un nodo (jugador) en la red de pases."""
    
    player_id: str
    player_name: str = ""
    team_id: str = ""
    pass_count: int = 0  # Número total de pases que hace este jugador
    passes_given: int = 0  # Número de pases dados
    passes_received: int = 0  # Número de pases recibidos
    avg_x_given: float = 0.0  # Posición media en X cuando da pases
    avg_y_given: float = 0.0  # Posición media en Y cuando da pases
    avg_x_received: float = 0.0  # Posición media en X cuando recibe pases
    avg_y_received: float = 0.0  # Posición media en Y cuando recibe pases
    avg_x_total: float = 0.0  # Posición media en X total
    avg_y_total: float = 0.0  # Posición media en Y total
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "player_id": self.player_id,
            "player_name": self.player_name,
            "team_id": self.team_id,
            "pass_count": self.pass_count,
            "passes_given": self.passes_given,
            "passes_received": self.passes_received,
            "avg_position_given": {
                "x": round(self.avg_x_given, 2),
                "y": round(self.avg_y_given, 2),
            },
            "avg_position_received": {
                "x": round(self.avg_x_received, 2),
                "y": round(self.avg_y_received, 2),
            },
            "avg_position_total": {
                "x": round(self.avg_x_total, 2),
                "y": round(self.avg_y_total, 2),
            },
        }


@dataclass
class PassEdge:
    """Representa una arista (pase) dirigida entre dos jugadores."""
    
    from_player_id: str
    to_player_id: str
    pass_count: int = 0  # Número de pases de from_player a to_player
    avg_x: float = 0.0  # Posición media en X del que da el pase
    avg_y: float = 0.0  # Posición media en Y del que da el pase
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "from_player_id": self.from_player_id,
            "to_player_id": self.to_player_id,
            "pass_count": self.pass_count,
            "avg_position": {
                "x": round(self.avg_x, 2),
                "y": round(self.avg_y, 2),
            },
        }


@dataclass
class PassNetwork:
    """
    Grafo de redes de pases.
    
    Attributes:
        players: Diccionario de nodos {player_id: Player}
        edges: Diccionario de aristas {(from_id, to_id): PassEdge}
        team_id: ID del equipo para filtrar (si se especifica)
        changed_players: Conjunto de player_ids que han cambiado en la última operación incremental
        changed_edges: Conjunto de edge_keys que han cambiado en la última operación incremental
        processed_event_ids: Conjunto de event_ids ya procesados para evitar duplicados
    """
    
    players: Dict[str, Player] = field(default_factory=dict)
    edges: Dict[Tuple[str, str], PassEdge] = field(default_factory=dict)
    team_id: int = 0
    changed_players: Set[str] = field(default_factory=set)
    changed_edges: Set[Tuple[str, str]] = field(default_factory=set)
    processed_event_ids: Set[str] = field(default_factory=set)
    
    def add_player(self, player_id: str, player_name: str = "", team_id: int = 0) -> None:
        """Añade un nodo (jugador) a la red y rastrea cambios."""
        if player_id not in self.players:
            self.players[player_id] = Player(player_id, player_name, team_id)
            self.changed_players.add(player_id)
        else:
            # Actualizar nombre si se proporciona y es diferente
            if player_name and self.players[player_id].player_name != player_name:
                self.players[player_id].player_name = player_name
                self.changed_players.add(player_id)
    
    def add_pass(self, from_player_id: str, to_player_id: str, x: float = 0.0, y: float = 0.0, end_x: float = 0.0, end_y: float = 0.0) -> None:
        """
        Añade una arista dirigida de un jugador a otro y rastrea cambios.
        
        Args:
            from_player_id: ID del jugador que hace el pase
            to_player_id: ID del jugador que recibe el pase
            x: Posición en X donde se inicia el pase
            y: Posición en Y donde se inicia el pase
            end_x: Posición en X donde termina el pase (recepción)
            end_y: Posición en Y donde termina el pase (recepción)
            
        Returns:
            Tuple of (players_affected, edges_affected) - the changes made
        """
        # Asegurar que ambos jugadores existen
        self.add_player(from_player_id)
        self.add_player(to_player_id)
        
        from_player = self.players[from_player_id]
        to_player = self.players[to_player_id]
        
        # Track if this is a new pass count change (for edges)
        from_player_old_pass_count = from_player.pass_count
        to_player_old_received_count = to_player.passes_received
        
        # Actualizar pases dados y recibidos
        from_player.passes_given += 1
        to_player.passes_received += 1
        
        # Incrementar el peso del nodo origen (pases realizados)
        from_player.pass_count += 1
        
        # Actualizar posiciones medias del jugador que da el pase (usa x, y)
        from_player.avg_x_given = (
            (from_player.avg_x_given * (from_player.passes_given - 1) + x) / from_player.passes_given
        )
        from_player.avg_y_given = (
            (from_player.avg_y_given * (from_player.passes_given - 1) + y) / from_player.passes_given
        )
        
        # Actualizar posiciones medias del jugador que recibe el pase (usa end_x, end_y)
        to_player.avg_x_received = (
            (to_player.avg_x_received * (to_player.passes_received - 1) + end_x) / to_player.passes_received
        )
        to_player.avg_y_received = (
            (to_player.avg_y_received * (to_player.passes_received - 1) + end_y) / to_player.passes_received
        )
        
        # Actualizar posición media total del jugador que da (usa x, y)
        total_passes_involved = from_player.passes_given + from_player.passes_received
        from_player.avg_x_total = (
            (from_player.avg_x_total * (total_passes_involved - 1) + x) / total_passes_involved
        )
        from_player.avg_y_total = (
            (from_player.avg_y_total * (total_passes_involved - 1) + y) / total_passes_involved
        )
        
        # Actualizar posición media total del jugador que recibe (usa end_x, end_y)
        total_passes_involved_to = to_player.passes_given + to_player.passes_received
        to_player.avg_x_total = (
            (to_player.avg_x_total * (total_passes_involved_to - 1) + end_x) / total_passes_involved_to
        )
        to_player.avg_y_total = (
            (to_player.avg_y_total * (total_passes_involved_to - 1) + end_y) / total_passes_involved_to
        )
        
        # Rastrar cambios en jugadores
        self.changed_players.add(from_player_id)
        self.changed_players.add(to_player_id)
        
        # Crear o actualizar la arista dirigida (usa x, y - posición de origen)
        edge_key = (from_player_id, to_player_id)
        if edge_key in self.edges:
            edge = self.edges[edge_key]
            edge.avg_x = (edge.avg_x * (edge.pass_count) + x) / (edge.pass_count + 1)
            edge.avg_y = (edge.avg_y * (edge.pass_count) + y) / (edge.pass_count + 1)
            edge.pass_count += 1
        else:
            self.edges[edge_key] = PassEdge(from_player_id, to_player_id, 1, x, y)
        
        # Rastrar cambios en aristas
        self.changed_edges.add(edge_key)
    
    def get_nodes(self) -> List[Dict[str, Any]]:
        """Retorna lista de nodos con sus propiedades."""
        return [player.to_dict() for player in self.players.values()]
    
    def get_edges(self) -> List[Dict[str, Any]]:
        """Retorna lista de aristas con sus propiedades."""
        return [edge.to_dict() for edge in self.edges.values()]
    
    def get_changed_nodes(self) -> List[Dict[str, Any]]:
        """Retorna solo los nodos que han cambiado desde la última actualización."""
        return [
            self.players[player_id].to_dict()
            for player_id in self.changed_players
            if player_id in self.players
        ]
    
    def get_changed_edges(self) -> List[Dict[str, Any]]:
        """Retorna solo las aristas que han cambiado desde la última actualización."""
        return [
            self.edges[edge_key].to_dict()
            for edge_key in self.changed_edges
            if edge_key in self.edges
        ]
    
    def clear_changes(self) -> None:
        """Limpia el registro de cambios incrementales."""
        self.changed_players.clear()
        self.changed_edges.clear()
    
    def get_player_info(self, player_id: str) -> Dict[str, Any]:
        """Obtiene información detallada de un jugador específico."""
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
            "passes_given": player.passes_given,
            "passes_received_stat": player.passes_received,
            "avg_position_given": {
                "x": round(player.avg_x_given, 2),
                "y": round(player.avg_y_given, 2),
            },
            "avg_position_received": {
                "x": round(player.avg_x_received, 2),
                "y": round(player.avg_y_received, 2),
            },
            "avg_position_total": {
                "x": round(player.avg_x_total, 2),
                "y": round(player.avg_y_total, 2),
            },
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
    
    def add_passes_incremental(self, events: List[Dict[str, Any]]) -> tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Procesa eventos de pase y devuelve solo los nodos y aristas que han cambiado.
        
        Rastrea qué eventos ya fueron procesados para evitar duplicados.
        
        Args:
            events: Lista de eventos de pase (deben tener type_id='1', outcome='1' y player_receiver_id)
        
        Returns:
            Tuple de (changed_nodes, changed_edges) - solo los que han cambiado en esta operación
        """
        # Limpiar cambios previos
        self.clear_changes()
        
        passes_processed = 0
        passes_skipped = 0
        passes_with_receiver = 0
        
        for event in events:
            # Solo procesar pases exitosos con receptor conocido
            if event.get("type_id") != "1" or event.get("outcome") != "1":
                continue
            if not event.get("player_receiver_id"):
                continue
            
            # Verificar si este evento ya fue procesado
            event_id = event.get("event_id", "")
            if event_id in self.processed_event_ids:
                passes_skipped += 1
                continue
            
            from_player_id = event.get("player_id", "")
            if not from_player_id:
                continue
            
            to_player_id = event.get("player_receiver_id", "")
            if not to_player_id:
                continue
            
            passes_processed += 1
            passes_with_receiver += 1
            
            x = float(event.get("x", 0.0))
            y = float(event.get("y", 0.0))
            
            # Extraer end_x, end_y de qualifiers
            end_x, end_y = 0.0, 0.0
            for qualifier in event.get("qualifiers", []):
                if qualifier.get("qualifier_id") == "140":
                    end_x = float(qualifier.get("value", 0.0))
                elif qualifier.get("qualifier_id") == "141":
                    end_y = float(qualifier.get("value", 0.0))
            
            # Añadir el pase a la red
            self.add_pass(from_player_id, to_player_id, x, y, end_x, end_y)
            
            # Marcar evento como procesado
            self.processed_event_ids.add(event_id)
        
        if passes_processed > 0 or passes_skipped > 0:
            # logger.debug(f"Procesados {passes_processed} eventos de pase nuevos, {passes_skipped} ya existentes")
            pass
        # Retornar solo los cambios
        return self.get_changed_nodes(), self.get_changed_edges()


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
    logger.info(f"Construyendo la red de pases con args: team_id={team_id}, events_count={len(events)}, min_pass_count={min_pass_count}")
    
    network = PassNetwork(team_id=team_id)
    
    # Filtrar eventos de pase exitosos
    pass_events = [
        event for event in events
        if event.get("event_name") == "Pass" and event.get("outcome") == "1"
    ]
    
    logger.info(f"Pases exitosos encontrados: {len(pass_events)}")
    
    # Filtrar por equipo si es necesario
    if team_id:
        pass_events = [e for e in pass_events if e.get("team_id") == team_id]
        logger.info(f"Pases filtrados por equipo {team_id}: {len(pass_events)}")
    
    # Procesar cada pase
    passes_processed = 0
    passes_with_receiver = 0
    
    for event in pass_events:
        from_player_id = event.get("player_id", "")
        player_name = event.get("player_name", "")
        current_team_id = event.get("team_id", "")
        x = float(event.get("x", 0.0))
        y = float(event.get("y", 0.0))
        
        if not from_player_id:
            continue
        
        passes_processed += 1
        
        # Buscar el receptor del pase en player_receiver_id
        to_player_id = event.get("player_receiver_id", "")
        
        # Extraer end_x (qualifier 140) y end_y (qualifier 141) de los qualifiers
        end_x = 0.0
        end_y = 0.0
        qualifiers = event.get("qualifiers", [])
        
        for qualifier in qualifiers:
            if qualifier.get("qualifier_id") == "140":
                end_x = float(qualifier.get("value", 0.0))
            elif qualifier.get("qualifier_id") == "141":
                end_y = float(qualifier.get("value", 0.0))
        
        if to_player_id:
            passes_with_receiver += 1
            # Añadir el pase a la red con posiciones de origen y destino
            network.add_player(from_player_id, player_name, current_team_id)
            network.add_pass(from_player_id, to_player_id, x, y, end_x, end_y)
    
    
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
