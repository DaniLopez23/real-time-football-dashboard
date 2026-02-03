import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websockets import ConnectionManager

logger = logging.getLogger(__name__)

router = APIRouter()
manager = ConnectionManager()


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
    
    try:
        while True:
            # Recibir mensajes del cliente (heartbeat, etc.)
            data = await websocket.receive_json()
            
            if data.get("type") == "ping":
                await websocket.send_json({
                    "type": "pong",
                    "message": "pong"
                })
            else:
                logger.debug(f"📨 Mensaje recibido de {client_id}: {data}")
    
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
