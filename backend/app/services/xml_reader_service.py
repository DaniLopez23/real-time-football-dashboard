import hashlib
import logging
from pathlib import Path
from typing import Dict, Any, Optional

from app.services.compute_player_pass_receiver import add_pass_receiver_info
from app.services.xml_parser_service import XmlParserService
from app.state.match_state import match_state

logger = logging.getLogger(__name__)


# Base path and simulated file (kept for convenience)
BASE_PATH = Path(__file__).parent.parent
SIMULATED_DATA_FILE = BASE_PATH.parent.parent / "simulated-real-time-data" / "180226-00.xml"


class XmlReaderService:
    """Responsable únicamente de leer contenido XML y detectar cambios."""

    def __init__(self):
        # cache: {file_path: (mtime, size, checksum)}
        self._cache: Dict[str, Dict[str, Any]] = {}

    def _compute_checksum(self, content: bytes) -> str:
        return hashlib.sha256(content).hexdigest()

    def read_raw(self, file_path: str) -> bytes:
        p = Path(file_path)
        if not p.is_absolute():
            p = BASE_PATH / file_path
        if not p.exists():
            raise FileNotFoundError(f"XML file not found: {p}")
        return p.read_bytes()

    def has_changed(self, file_path: str) -> bool:
        """Detecta si el archivo ha cambiado comparando mtime/size/checksum."""
        p = Path(file_path)
        if not p.is_absolute():
            p = BASE_PATH / file_path
        if not p.exists():
            return False

        stat = p.stat()
        key = str(p.resolve())
        checksum = None
        try:
            content = p.read_bytes()
            checksum = self._compute_checksum(content)
        except Exception:
            checksum = None

        cached = self._cache.get(key)
        current = (stat.st_mtime, stat.st_size, checksum)

        if not cached:
            # First time -> consider as changed
            self._cache[key] = {
                "mtime": stat.st_mtime,
                "size": stat.st_size,
                "checksum": checksum,
            }
            return True

        if cached.get("mtime") != stat.st_mtime or cached.get("size") != stat.st_size or cached.get("checksum") != checksum:
            # Update cache
            self._cache[key] = {
                "mtime": stat.st_mtime,
                "size": stat.st_size,
                "checksum": checksum,
            }
            return True

        return False


# Instancia compartida
xml_reader_service = XmlReaderService()


def parse_xml_raw_file(xml_file_path: str) -> Dict[str, Any]:
    """Compatibilidad: parsea un archivo XML y devuelve estructura básica.

    Internamente delega la lógica de parseo a XmlParserService (que convierte raw->json).
    """
    parser = XmlParserService()
    return parser.parse_from_file(xml_file_path)


def read_full_xml(file_path: str) -> Dict[str, Any]:
    """Compat wrapper usado por endpoints HTTP para obtener datos enriquecidos.

    Lee, parsea y enriquece (receptores de pase) para respuestas rápidas.
    """
    parsed = parse_xml_raw_file(file_path)
    game = parsed.get("game", {})
    events = game.get("events", [])

    # Enriquecer con receptores de pase (mutates events)
    enriched_events = add_pass_receiver_info(events)
    game["events"] = enriched_events

    return {
        "total_events": len(enriched_events),
        "last_event_id": enriched_events[-1]["id"] if enriched_events else None,
        "data": parsed,
    }


async def read_full_xml_async(file_path: str) -> Dict[str, Any]:
    import asyncio

    return await asyncio.to_thread(read_full_xml, file_path)
