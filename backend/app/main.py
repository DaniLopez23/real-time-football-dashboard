from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import asyncio
from dotenv import load_dotenv
import uvicorn
from app.core.logging import setup_logging
from app.routes import index, events, games, websocket
from app.services.xml_reader import watch_simulated_real_time_data
from app.websockets.connection_manager import connection_manager
from app.websockets.event_broadcaster import broadcast_message

setup_logging()

load_dotenv()

# Usar la instancia global del manager de WebSockets
ws_manager = connection_manager


async def on_new_data_callback(updates):
    """Callback que se ejecuta cuando llegan nuevos datos"""
    for message in updates:
        await broadcast_message(message, ws_manager)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("⚙️ Iniciando servidor...")
    task = asyncio.create_task(
        watch_simulated_real_time_data(
            poll_interval=3,
            on_new_data=on_new_data_callback
        )
    )
    print("✅ Monitoreo de datos simulados iniciado")
    
    yield
    
    # Shutdown
    print("🛑 Servidor apagándose...")
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="Real-Time Football Dashboard API",
    description="API para el dashboard de fútbol en tiempo real",
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternativa
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    index.app,
    prefix="",
    tags=["Index"]
)

app.include_router(
    events.app,
    prefix="",
    tags=["Events"]
)

app.include_router(
    games.app,
    prefix="",
    tags=["Games"]
)

app.include_router(
    websocket.router,
    tags=["WebSocket"]
)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
