"""Revisa la carpeta data para detectar subcarpetas con f24 y archivos XML.

Uso:
    python scripts/check_f24.py [--data-root <ruta>]

Si no se especifica --data-root se usa ../data relativo al backend.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Verifica f24 en subcarpetas de data")
    parser.add_argument(
        "--data-root",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "data",
        help="Ruta a la carpeta data (por defecto ../data desde backend)",
    )
    return parser.parse_args()


def _is_placeholder_xml(path: Path) -> bool:
    """Detecta XML con respuesta vacía/placeholder del feed."""
    placeholder_snippet = "Error: feed_type, game_id combination not found in the feed repository"
    try:
        content = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return False
    normalized = "".join(content.split())  # quitar espacios/saltos
    return placeholder_snippet.replace(" ", "") in normalized


def _classify_xml(xml_files: list[Path]) -> tuple[list[Path], list[Path]]:
    valid: list[Path] = []
    placeholders: list[Path] = []
    for xml in xml_files:
        if _is_placeholder_xml(xml):
            placeholders.append(xml)
        else:
            valid.append(xml)
    return valid, placeholders


def check_f24(data_root: Path) -> int:
    if not data_root.exists():
        print(f"[ERROR] No existe la carpeta data: {data_root}")
        return 1
    if not data_root.is_dir():
        print(f"[ERROR] La ruta no es un directorio: {data_root}")
        return 1

    found_any = False
    exit_code = 0

    for subdir in sorted(p for p in data_root.iterdir() if p.is_dir()):
        f24_dir = subdir / "f24"
        try:
            if not f24_dir.exists():
                print(f"[WARN] {subdir.name}: falta carpeta f24")
                exit_code = max(exit_code, 0)
                continue
            if not f24_dir.is_dir():
                print(f"[ERROR] {subdir.name}: f24 existe pero no es carpeta")
                exit_code = max(exit_code, 1)
                continue

            xml_files = sorted(f24_dir.glob("*.xml"))
            found_any = True
            if not xml_files:
                print(f"[WARN] {subdir.name}: f24 sin XML")
            else:
                valid, placeholders = _classify_xml(xml_files)
                if valid:
                    print(f"[OK] {subdir.name}: {len(valid)} XML válidos")
                if placeholders:
                    print(
                        f"[WARN] {subdir.name}: {len(placeholders)} XML con respuesta vacía/feed missing"
                    )
                if not valid and placeholders:
                    exit_code = max(exit_code, 0)
        except Exception as exc:  # raros permisos, nombres, etc.
            print(f"[ERROR] {subdir.name}: {exc}")
            exit_code = max(exit_code, 1)

    if not any(p.is_dir() for p in data_root.iterdir()):
        print(f"[WARN] data sin subcarpetas: {data_root}")

    if not found_any:
        print("[INFO] No se encontró ninguna carpeta f24")

    return exit_code


def main() -> None:
    args = parse_args()
    code = check_f24(args.data_root)
    sys.exit(code)


if __name__ == "__main__":
    main()
