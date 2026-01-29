from fastapi import APIRouter
from app.controllers import events as events_controller
from app.core.constants import STATIC_FILE

app = APIRouter()


@app.get("/events/")
async def load_match():
    """Carga todos los eventos del partido"""
    return await events_controller.get_all_events(STATIC_FILE)


@app.get("/events/passes")
async def load_passes():
    """Construye la red de pases del partido"""
    return await events_controller.get_pass_network(STATIC_FILE)


@app.get("/events/passes/team/{team_id}")
async def load_passes_by_team(team_id: str):
    """Construye la red de pases para un equipo específico"""
    return await events_controller.get_pass_network(
        STATIC_FILE,
        team_id=team_id
    )


@app.get("/events/type/{event_name}")
async def get_events_by_type(event_name: str):
    """Obtiene eventos por tipo (ej: Pass, Shot, Tackle)"""
    return await events_controller.get_events_by_type(
        STATIC_FILE,
        event_name
    )


@app.get("/events/team/{team_id}")
async def get_team_events(team_id: str):
    """Obtiene todos los eventos de un equipo específico"""
    return await events_controller.get_events_by_team(
        STATIC_FILE,
        team_id
    )


@app.get("/events/player/{player_id}")
async def get_player_events(player_id: str):
    """Obtiene todos los eventos de un jugador específico"""
    return await events_controller.get_events_by_player(
        STATIC_FILE,
        player_id
    )


@app.get("/events/period/{period_id}")
async def get_period_events(period_id: str):
    """Obtiene todos los eventos de un período específico"""
    return await events_controller.get_events_by_period(
        STATIC_FILE,
        period_id
    )


@app.get("/events/passes/successful")
async def get_successful_passes_route():
    """Obtiene todos los pases exitosos del partido"""
    return await events_controller.get_successful_passes(
        STATIC_FILE
    )


@app.get("/events/statistics")
async def get_events_stats():
    """Obtiene estadísticas generales de los eventos del partido"""
    return await events_controller.get_event_statistics(
        STATIC_FILE
    )

