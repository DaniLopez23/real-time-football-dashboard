"""
Script para generar un SVG de un campo de fútbol con coordenadas Opta (0-100).
"""

import math


def generate_opta_pitch_svg(
    width: int = 800,
    height: int = 600,
    field_color: str = "#6ec037",
    show_axes: bool = True,
    output_file: str = "campo.svg"
) -> str:
    """
    Genera un SVG de un campo de fútbol con coordenadas Opta.
    
    Args:
        width: Ancho del SVG en píxeles
        height: Alto del SVG en píxeles
        field_color: Color del campo
        show_axes: Mostrar ejes de coordenadas
        output_file: Ruta para guardar el SVG (opcional)
    
    Returns:
        String con el contenido del SVG
    """
    
    # Escalas Opta (0–100) → px
    def scale_x(x_opta: float) -> float:
        return (x_opta / 100) * width
    
    def scale_y(y_opta: float) -> float:
        return height - (y_opta / 100) * height
    
    def scale_dimension(dim_opta: float) -> float:
        return (dim_opta / 100) * width
    
    # Helpers para generar elementos SVG
    def rect(x0: float, y0: float, w: float, h: float) -> str:
        return (
            f'<rect x="{scale_x(x0)}" y="{scale_y(y0 + h)}" '
            f'width="{scale_dimension(w)}" height="{scale_dimension(h)}" '
            f'fill="none" stroke="white" stroke-width="2"/>'
        )
    
    def line(x1: float, y1: float, x2: float, y2: float) -> str:
        return (
            f'<line x1="{scale_x(x1)}" y1="{scale_y(y1)}" '
            f'x2="{scale_x(x2)}" y2="{scale_y(y2)}" '
            f'stroke="white" stroke-width="2"/>'
        )
    
    def circle(cx: float, cy: float, r: float, fill: str = "none") -> str:
        stroke = 'stroke="white" stroke-width="2"' if fill == "none" else 'stroke="none"'
        return (
            f'<circle cx="{scale_x(cx)}" cy="{scale_y(cy)}" '
            f'r="{scale_dimension(r)}" fill="{fill}" {stroke}/>'
        )
    
    def penalty_arc(cx: float, cy: float, r: float, side: str) -> str:
        """
        Genera el arco del área de penalti.
        side: 'left' o 'right'
        """
        R = scale_dimension(r)
        sweep = 1 if side == "left" else 0
        
        path_d = (
            f'M {scale_x(cx)} {scale_y(cy - r)} '
            f'A {R} {R} 0 0 {sweep} {scale_x(cx)} {scale_y(cy + r)}'
        )
        
        return (
            f'<path d="{path_d}" fill="none" stroke="white" stroke-width="2"/>'
        )
    
    # Construir el SVG
    svg_elements = []
    
    # SVG header
    svg_elements.append(
        f'<svg width="{width}" height="{height}" '
        f'xmlns="http://www.w3.org/2000/svg">'
    )
    
    # Campo base
    svg_elements.append(
        f'<rect width="{width}" height="{height}" '
        f'fill="{field_color}" stroke="white" stroke-width="2"/>'
    )
    
    # Medio campo
    svg_elements.append(line(50, 0, 50, 100))
    svg_elements.append(circle(50, 50, 9.15))
    svg_elements.append(circle(50, 50, 0.4, "white"))
    
    # Áreas grandes (18 yardas)
    svg_elements.append(rect(0, 21.1, 17, 57.8))
    svg_elements.append(rect(83, 21.1, 17, 57.8))
    
    # Áreas pequeñas (6 yardas)
    svg_elements.append(rect(0, 36.8, 5.8, 26.4))
    svg_elements.append(rect(94.2, 36.8, 5.8, 26.4))
    
    # Puntos de penalti
    svg_elements.append(circle(11.5, 50, 0.4, "white"))
    svg_elements.append(circle(88.5, 50, 0.4, "white"))
    
    # Arcos del área de penalti
    svg_elements.append(penalty_arc(17, 50, 9.15, "right"))
    svg_elements.append(penalty_arc(83, 50, 9.15, "left"))
    
    # Porterías
    svg_elements.append(rect(-2, 44.5, 2, 11))
    svg_elements.append(rect(100, 44.5, 2, 11))
    
    # Ejes opcionales
    if show_axes:
        # Eje X
        for i in range(0, 101, 10):
            x_pos = scale_x(i)
            svg_elements.append(
                f'<line x1="{x_pos}" y1="{height}" x2="{x_pos}" y2="{height - 5}" '
                f'stroke="white" stroke-width="1" opacity="0.4"/>'
            )
            svg_elements.append(
                f'<text x="{x_pos}" y="{height - 10}" '
                f'fill="white" font-size="10" text-anchor="middle" opacity="0.4">{i}</text>'
            )
        
        # Eje Y
        for i in range(0, 101, 10):
            y_pos = scale_y(i)
            svg_elements.append(
                f'<line x1="0" y1="{y_pos}" x2="5" y2="{y_pos}" '
                f'stroke="white" stroke-width="1" opacity="0.4"/>'
            )
            svg_elements.append(
                f'<text x="10" y="{y_pos + 3}" '
                f'fill="white" font-size="10" opacity="0.4">{i}</text>'
            )
    
    # Cerrar SVG
    svg_elements.append('</svg>')
    
    svg_content = '\n'.join(svg_elements)
    
    # Guardar si se especifica un archivo
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(svg_content)
        print(f"SVG guardado en: {output_file}")
    
    return svg_content


def main():
    """Función principal para ejecutar el script desde línea de comandos."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Genera un SVG de un campo de fútbol con coordenadas Opta'
    )
    parser.add_argument(
        '-w', '--width',
        type=int,
        default=800,
        help='Ancho del SVG en píxeles (default: 800)'
    )
    parser.add_argument(
        '-H', '--height',
        type=int,
        default=600,
        help='Alto del SVG en píxeles (default: 600)'
    )
    parser.add_argument(
        '-c', '--color',
        type=str,
        default='#2d5016',
        help='Color del campo (default: #2d5016)'
    )
    parser.add_argument(
        '-a', '--axes',
        action='store_true',
        help='Mostrar ejes de coordenadas'
    )
    parser.add_argument(
        '-o', '--output',
        type=str,
        default='opta_pitch.svg',
        help='Archivo de salida (default: opta_pitch.svg)'
    )
    
    args = parser.parse_args()
    
    svg_content = generate_opta_pitch_svg(
        width=args.width,
        height=args.height,
        field_color=args.color,
        show_axes=args.axes,
        output_file=args.output
    )
    
    print(f"SVG generado con dimensiones {args.width}x{args.height}")


if __name__ == '__main__':
    main()
