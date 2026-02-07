"""
Script para generar SVG del campo usando svgwrite (más limpio que manual).
Requiere: pip install svgwrite
"""

import svgwrite


def generate_opta_pitch_svgwrite(
    width: int = 800,
    height: int = 600,
    field_color: str = "#6ec037",
    output_file: str = "campo_svgwrite.svg"
):
    """
    Genera SVG del campo usando svgwrite (más limpio que strings manuales).
    
    Args:
        width: Ancho del SVG en píxeles
        height: Alto del SVG en píxeles
        field_color: Color del campo
        output_file: Archivo de salida
    """
    # Crear el SVG
    dwg = svgwrite.Drawing(output_file, size=(width, height))
    
    # Escalas Opta (0–100) → px
    def x(val): return (val / 100) * width
    def y(val): return height - (val / 100) * height
    def dim(val): return (val / 100) * width
    
    # Fondo del campo
    dwg.add(dwg.rect(
        (0, 0), (width, height),
        fill=field_color,
        stroke='white',
        stroke_width=2
    ))
    
    # Helper para rectángulos en coordenadas Opta
    def add_rect(x0, y0, w, h):
        dwg.add(dwg.rect(
            (x(x0), y(y0 + h)),
            (dim(w), dim(h)),
            fill='none',
            stroke='white',
            stroke_width=2
        ))
    
    # Helper para líneas
    def add_line(x1, y1, x2, y2):
        dwg.add(dwg.line(
            (x(x1), y(y1)),
            (x(x2), y(y2)),
            stroke='white',
            stroke_width=2
        ))
    
    # Helper para círculos
    def add_circle(cx, cy, r, fill='none'):
        dwg.add(dwg.circle(
            (x(cx), y(cy)),
            dim(r),
            fill=fill,
            stroke='white' if fill == 'none' else 'none',
            stroke_width=2
        ))
    
    # Helper para arcos
    def add_arc(cx, cy, r, side):
        R = dim(r)
        sweep = 1 if side == "left" else 0
        path = dwg.path(
            d=f'M {x(cx)} {y(cy - r)} A {R} {R} 0 0 {sweep} {x(cx)} {y(cy + r)}',
            fill='none',
            stroke='white',
            stroke_width=2
        )
        dwg.add(path)
    
    # === Dibujar el campo ===
    
    # Medio campo
    add_line(50, 0, 50, 100)
    add_circle(50, 50, 9.15)
    add_circle(50, 50, 0.4, 'white')
    
    # Áreas grandes
    add_rect(0, 21.1, 17, 57.8)
    add_rect(83, 21.1, 17, 57.8)
    
    # Áreas pequeñas
    add_rect(0, 36.8, 5.8, 26.4)
    add_rect(94.2, 36.8, 5.8, 26.4)
    
    # Puntos de penalti
    add_circle(11.5, 50, 0.4, 'white')
    add_circle(88.5, 50, 0.4, 'white')
    
    # Arcos
    add_arc(17, 50, 9.15, "right")
    add_arc(83, 50, 9.15, "left")
    
    # Porterías
    add_rect(-2, 44.5, 2, 11)
    add_rect(100, 44.5, 2, 11)
    
    # Guardar
    dwg.save()
    print(f"SVG guardado en: {output_file}")


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Genera SVG del campo con svgwrite'
    )
    parser.add_argument('-w', '--width', type=int, default=800)
    parser.add_argument('-H', '--height', type=int, default=600)
    parser.add_argument('-c', '--color', default='#6ec037')
    parser.add_argument('-o', '--output', default='campo_svgwrite.svg')
    
    args = parser.parse_args()
    
    generate_opta_pitch_svgwrite(
        width=args.width,
        height=args.height,
        field_color=args.color,
        output_file=args.output
    )
