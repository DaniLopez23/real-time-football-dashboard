import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websockets.connection_manager import connection_manager
from app.state.match_state import match_state

logger = logging.getLogger(__name__)

router = APIRouter()
# Usar la instancia global en lugar de crear una nueva
manager = connection_manager


@router.websocket("/ws/game/{game_id}")
async def websocket_endpoint(websocket: WebSocket, game_id: str):
    """
    WebSocket endpoint para conectarse a un room específico de un juego.
    
    Args:
        websocket: Conexión WebSocket
        game_id: ID del juego (room)
    """
    client_id = await manager.connect(websocket, game_id)
    
    # Enviar mensaje de bienvenida
    await websocket.send_json({
        "type": "connection",
        "status": "connected",
        "client_id": client_id,
        "game_id": game_id,
        "message": f"Conectado al room {game_id}"
    })
    
    logger.info(f"💬 Mensaje de bienvenida enviado a {client_id}")
    
    # Enviar estado actual del partido si existe
    if match_state.game:
        # Preparar información de redes de pases
        pass_networks_data = {}
        for team_id, network in match_state.pass_networks.items():
            pass_networks_data[team_id] = {
                "nodes": network.get_nodes(),
                "edges": network.get_edges(),
                "statistics": network.get_statistics(),
            }
        
        await websocket.send_json({
            "type": "match_state_snapshot",
            "game_id": match_state.game.get("game_id", game_id),
            "game": match_state.game,
            "total_events": len(match_state.events),
            "last_event_id": match_state.last_event_id,
            "events": match_state.events,
            "pass_networks": pass_networks_data,
        })
        
        logger.info(f"📊 Estado del partido enviado a {client_id}: {len(match_state.events)} eventos, {len(pass_networks_data)} redes de pases")
    
    try:
        while True:
            # Recibir mensajes del cliente (heartbeat, etc.)
            data = await websocket.receive_json()
            
            if data.get("type") == "ping":
                await websocket.send_json({
                    "type": "pong",
                    "message": "pong"
                })
                # logger.debug(f"🏓 Pong enviado a {client_id}")
            else:
                # logger.debug(f"📨 Mensaje recibido de {client_id}: {data}")
                pass
    
    except WebSocketDisconnect:
        manager.disconnect(game_id, client_id)
        logger.info(f"🔌 WebSocket cerrado para {client_id}")
    
    except Exception as e:
        logger.error(f"❌ Error en WebSocket {client_id}: {e}")
        manager.disconnect(game_id, client_id)


@router.get("/ws/stats")
async def websocket_stats():
    """
    Endpoint para obtener estadísticas de conexiones WebSocket.
    
    Returns:
        Diccionario con información de conexiones activas
    """
    return manager.get_stats()
