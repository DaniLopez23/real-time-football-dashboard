from fastapi import APIRouter
from app.controllers import games as games_controller
from app.core.constants import STATIC_FILE

app = APIRouter()



@app.get("/games")
async def get_game():
    """Obtiene información completa del partido"""
    return await games_controller.get_game_data(STATIC_FILE)


@app.get("/games/summary")
async def get_game_summary():
    """Obtiene un resumen del partido"""
    return await games_controller.get_game_summary(STATIC_FILE)


@app.get("/games/teams")
async def get_teams():
    """Obtiene información de los equipos del partido"""
    return await games_controller.get_game_teams(STATIC_FILE)


@app.get("/games/timeline")
async def get_timeline():
    """Obtiene el timeline (fechas y horas clave) del partido"""
    return await games_controller.get_match_timeline(STATIC_FILE)