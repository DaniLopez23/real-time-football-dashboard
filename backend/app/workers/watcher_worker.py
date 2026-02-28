import asyncio
import logging
from pathlib import Path
from typing import Callable, List, Dict, Any

from app.services.xml_reader_service import xml_reader_service, SIMULATED_DATA_FILE
from app.services.xml_parser_service import XmlParserService
from app.services.match_processing_service import match_processing_service

logger = logging.getLogger(__name__)


async def watch_simulated_real_time_data(
    poll_interval: int = 3,
    on_new_data: Callable[[List[Dict[str, Any]]], Any] | None = None,
    simulated_file: str | None = None,
) -> None:
    """Worker que orquesta lectura->parseo->procesado y notifica via callback.

    - Usa `xml_reader_service` para detectar cambios y leer raw
    - Usa `XmlParserService` para parsear raw->obj
    - Usa `match_processing_service` para detectar diffs y construir redes
    - Llama `on_new_data(updates)` con la lista de mensajes a enviar
    """
    parser = XmlParserService()

    if simulated_file:
        file_path = simulated_file
    else:
        file_path = str(SIMULATED_DATA_FILE)

    logger.info(f"Watcher started for {file_path} (interval={poll_interval}s)")

    while True:
        try:
            # If file missing, wait
            p = Path(file_path)
            if not p.exists():
                logger.debug("Simulated file not found, waiting...")
                await asyncio.sleep(poll_interval)
                continue

            # If file changed, process
            try:
                changed = xml_reader_service.has_changed(file_path)
            except Exception as e:
                logger.warning(f"Error checking file change: {e}")
                changed = True

            if not changed:
                await asyncio.sleep(poll_interval)
                continue

            # Read raw bytes and parse
            try:
                raw_bytes = xml_reader_service.read_raw(file_path)
                raw_text = raw_bytes.decode("utf-8", errors="ignore")
                parsed = parser.parse_from_string(raw_text)
            except Exception as e:
                logger.warning(f"Error reading/parsing XML (might be being written): {e}")
                await asyncio.sleep(poll_interval)
                continue

            # Process parsed object to detect changes and compute pass networks
            try:
                updates = match_processing_service.process(parsed)
            except Exception as e:
                logger.error(f"Error processing match data: {e}")
                updates = []

            # Notify via callback
            if updates and on_new_data:
                try:
                    await on_new_data(updates)
                except Exception as e:
                    logger.error(f"Error in on_new_data callback: {e}")

            await asyncio.sleep(poll_interval)

        except asyncio.CancelledError:
            logger.info("Watcher cancelled")
            break
        except Exception as e:
            logger.error(f"Unhandled error in watcher: {e}")
            await asyncio.sleep(poll_interval)
