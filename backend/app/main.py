from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import uvicorn
from app.core.logging import setup_logging
from app.routes import index, events, games

setup_logging()

load_dotenv()

app = FastAPI(
    title="Real-Time Football Dashboard API",
    description="API para el dashboard de fútbol en tiempo real",
    version="1.0.0"
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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
