"""
Script para generar SVG del campo usando mplsoccer (la forma más sencilla).
Requiere: pip install mplsoccer
"""

from mplsoccer import Pitch
import matplotlib.pyplot as plt


def generate_opta_pitch_mplsoccer(
    output_file: str = "campo_mplsoccer.svg",
    figsize: tuple = (12, 8),
    line_color: str = "white",
    pitch_color: str = "#6ec037"
):
    """
    Genera un SVG del campo usando mplsoccer (automático con medidas Opta).
    
    Args:
        output_file: Archivo de salida
        figsize: Tamaño de la figura (ancho, alto) en pulgadas
        line_color: Color de las líneas
        pitch_color: Color del campo
    """
    # Crear el campo con coordenadas Opta (0-100)
    pitch = Pitch(
        pitch_type='opta',  # Sistema de coordenadas Opta
        pitch_color=pitch_color,
        line_color=line_color,
        linewidth=2,
        goal_type='box'
    )
    
    # Dibujar el campo
    fig, ax = pitch.draw(figsize=figsize)
    
    # Guardar como SVG sin borde
    plt.savefig(output_file, format='svg', bbox_inches='tight', 
                pad_inches=0, dpi=150)
    plt.close()
    
    print(f"SVG guardado en: {output_file}")
    print("✓ Coordenadas Opta (0-100) aplicadas automáticamente")


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Genera SVG del campo con mplsoccer'
    )
    parser.add_argument(
        '-o', '--output',
        default='campo_mplsoccer.svg',
        help='Archivo de salida'
    )
    parser.add_argument(
        '--width',
        type=float,
        default=12,
        help='Ancho en pulgadas'
    )
    parser.add_argument(
        '--height',
        type=float,
        default=8,
        help='Alto en pulgadas'
    )
    parser.add_argument(
        '--pitch-color',
        default="#56972b",
        help='Color del campo'
    )
    
    args = parser.parse_args()
    
    generate_opta_pitch_mplsoccer(
        output_file=args.output,
        figsize=(args.width, args.height),
        pitch_color=args.pitch_color
    )
