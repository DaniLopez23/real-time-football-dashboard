import logging
from pathlib import Path
import asyncio
import xml.etree.ElementTree as ET

from app.services.xml_reader_service import parse_xml_raw_file
# Logger
logger = logging.getLogger(__name__)

# Base paths and cached mappers for fast reuse
BASE_PATH = Path(__file__).parent.parent
EVENT_MAPPER = None
QUALIFIER_MAPPER = None

SIMULATED_DATA_FILE = BASE_PATH.parent.parent / "simulated-real-time-data" / "280226-00.xml"
    
# Cosntants for adding time to poll intervals
NO_FILE_FOUND_INTERVAL = 10
EMPTY_FILE_INTERVAL = 5
READ_ERROR_INTERVAL = 5

async def watch_xml_file_changes(
    poll_interval: int = 3,
    on_new_data: callable = None
) -> None:
    """
    Lee el archivo XML cada poll_interval y detecta cambios en Game y Events.
    Mantiene estado acumulativo y calcula redes de pases incrementalmente.
    Envía: new_game, game_updates, new_events, events_updates, new_pass_network_elements, update_pass_network_elements
    """
    logger.info(f"🔄 Iniciando monitoreo de datos simulados")
    logger.info(f"📁 Ruta: {SIMULATED_DATA_FILE}")
    logger.info(f"⏱️ Intervalo: {poll_interval}s\n")
    
    while True:
        try:
            if not SIMULATED_DATA_FILE.exists():
                logger.warning(f"⚠️  Archivo no encontrado: {SIMULATED_DATA_FILE}")
                await asyncio.sleep(NO_FILE_FOUND_INTERVAL)
                continue

            # Verificar que el archivo no esté vacío
            if SIMULATED_DATA_FILE.stat().st_size == 0:
                logger.warning(f"⚠️  Archivo vacío: {SIMULATED_DATA_FILE}")
                await asyncio.sleep(EMPTY_FILE_INTERVAL)
                continue

            # Leer XML completo
            try:
                full_opta_game_xml = parse_xml_raw_file(str(SIMULATED_DATA_FILE))
            except ET.ParseError as e:
                logger.warning(f"⚠️  Error parseando XML (puede estar escribiéndose): {e}")
                await asyncio.sleep(READ_ERROR_INTERVAL)
                continue
            
            game = full_opta_game_xml.get("game", {})
            
            if not game:
                logger.warning("⚠️  No se encontró Game en el XML")
                await asyncio.sleep(READ_ERROR_INTERVAL)
                continue

            # Enriquecer eventos con receptores (acumulativo)
            events = game.get("events", [])
            enriched_events = add_pass_receiver_info(events)
            
            # Separar Game de Events (excluir también total_events ya que es derivado)
            game_snapshot = {k: v for k, v in game.items() if k not in ("events", "total_events")}
            game_id = game_snapshot.get("game_id", "unknown")
            
            updates: List[Dict[str, Any]] = []
            
            # Detectar cambios en Game
            if not match_state.game or match_state.game.get("game_id") != game_id:
                # Nuevo juego - resetear estado
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
                
                # Calcular redes de pases iniciales con TODOS los eventos del juego nuevo
                initial_pass_events = [
                    e for e in enriched_events
                    if e.get("type_id") == "1" 
                    and e.get("outcome") == "1"
                    and e.get("player_receiver_id")  # Solo pases con receptor conocido
                ]
                                
                if initial_pass_events:
                    teams = set(e.get("team_id") for e in initial_pass_events if e.get("team_id"))
                    
                    for team_id in teams:
                        team_pass_events = [e for e in initial_pass_events if e.get("team_id") == team_id]
                        nodes, edges = _process_pass_events_for_network(team_pass_events, team_id)
                        
                        if nodes or edges:
                            updates.append({
                                "type": "new_pass_network_elements",
                                "game_id": game_id,
                                "team_id": team_id,
                                "nodes": nodes,
                                "edges": edges,
                                "statistics": match_state.pass_networks[team_id].get_statistics() if team_id in match_state.pass_networks else {},
                            })
                            logger.info(f"  ✅ Equipo {team_id}: {len(nodes)} nodos, {len(edges)} aristas")
                
            elif game_snapshot != match_state.game:
                # Game existente con cambios
                updates.append({
                    "type": "game_updates",
                    "game_id": game_id,
                    "timestamp": parsed.get("timestamp", ""),
                    "game": game_snapshot,
                })
                match_state.game = game_snapshot
            
            # Crear índice de eventos actuales (clave: team_id, event_id)
            current_events_by_key = {
                (event.get("team_id"), event.get("event_id")): event
                for event in enriched_events
            }
            
            existing_events_by_key = {
                (event.get("team_id"), event.get("event_id")): event
                for event in match_state.events
            }
            
            # Detectar cambios en Events
            new_events: List[Dict[str, Any]] = []
            updated_events: List[Dict[str, Any]] = []
            
            for event_key, event in current_events_by_key.items():
                if event_key not in existing_events_by_key:
                    new_events.append(event)
                else:
                    # Comparar solo type_id para detectar actualizaciones significativas
                    existing_event = existing_events_by_key[event_key]
                    if event.get("type_id") != existing_event.get("type_id"):
                        updated_events.append(event)
            
            # Actualizar estado con todos los eventos
            match_state.events = enriched_events
            match_state.last_event_id = enriched_events[-1].get("id") if enriched_events else None
            
            # Enviar eventos nuevos
            if new_events:
                updates.append({
                    "type": "new_events",
                    "game_id": game_id,
                    "count": len(new_events),
                    "events": new_events,
                })
            
            # Enviar eventos actualizados
            if updated_events:
                updates.append({
                    "type": "events_updates",
                    "game_id": game_id,
                    "count": len(updated_events),
                    "events": updated_events,
                })
            
            # Calcular redes de pases con TODOS los eventos enriquecidos
            # La red de pases rastrea qué eventos ya procesó para evitar duplicados
            if new_events or updated_events:
                # Filtrar todos los eventos de pase exitosos con receptor
                all_pass_events = [
                    e for e in enriched_events
                    if e.get("type_id") == "1" 
                    and e.get("outcome") == "1"
                    and e.get("player_receiver_id")  # Solo pases con receptor conocido
                ]
                
                if all_pass_events:
                    # Agrupar por equipo
                    teams = set(e.get("team_id") for e in all_pass_events if e.get("team_id"))
                    
                    for team_id in teams:
                        # Pasar TODOS los eventos del equipo (la red filtra duplicados internamente)
                        nodes, edges = _process_pass_events_for_network(enriched_events, team_id)
                        
                        if nodes or edges:
                            logger.info(f"🎮 Equipo {team_id}: {len(nodes)} nodos actualizados, {len(edges)} aristas actualizadas")
                            updates.append({
                                "type": "new_pass_network_elements" if new_events else "update_pass_network_elements",
                                "game_id": game_id,
                                "team_id": team_id,
                                "nodes": nodes,
                                "edges": edges,
                                "statistics": match_state.pass_networks[team_id].get_statistics() if team_id in match_state.pass_networks else {},
                            })
            
            # Enviar actualizaciones
            if updates and on_new_data:
                await on_new_data(updates)
            
            await asyncio.sleep(poll_interval)
            
        except Exception as e:
            logger.error(f"❌ Error en monitoreo: {e}", exc_info=True)
            await asyncio.sleep(poll_interval)
