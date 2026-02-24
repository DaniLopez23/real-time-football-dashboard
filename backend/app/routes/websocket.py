import logging
from fastapi import APIRouter, WebSocket
from app.controllers import websocket as websocket_controller

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws/game/{game_id}")
async def websocket_endpoint(websocket: WebSocket, game_id: str):
    """Delegates websocket handling to the websocket controller."""
    await websocket_controller.handle_websocket(websocket, game_id)


@router.get("/ws/stats")
async def websocket_stats():
    """Retorna estadísticas de conexiones WebSocket (delegado al controller)."""
    return await websocket_controller.websocket_stats()
