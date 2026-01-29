import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface OptaPitchProps {
  width?: number;
  height?: number;
  showAxes?: boolean;
  fieldColor?: string;
  children?: React.ReactNode;
}

const OptaPitch: React.FC<OptaPitchProps> = ({
  width = 800,
  height = 600,
  showAxes = false,
  fieldColor = "#2d5f3f",
  children,
}) => {
  const ref = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const g = d3.select(ref.current);
    g.selectAll("*").remove();

    // ===== Escalas Opta (0–100) → px =====
    const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    // ===== Helpers =====
    const rect = (x0: number, y0: number, w: number, h: number) =>
      g
        .append("rect")
        .attr("x", x(x0))
        .attr("y", y(y0 + h))
        .attr("width", x(w) - x(0))
        .attr("height", y(0) - y(h))
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 2);

    const line = (x1: number, y1: number, x2: number, y2: number) =>
      g
        .append("line")
        .attr("x1", x(x1))
        .attr("y1", y(y1))
        .attr("x2", x(x2))
        .attr("y2", y(y2))
        .attr("stroke", "white")
        .attr("stroke-width", 2);

    const circle = (cx: number, cy: number, r: number, fill = "none") =>
      g
        .append("circle")
        .attr("cx", x(cx))
        .attr("cy", y(cy))
        .attr("r", x(r) - x(0))
        .attr("fill", fill)
        .attr("stroke", fill === "none" ? "white" : "none")
        .attr("stroke-width", 2);

    const penaltyArc = (
      cx: number,
      cy: number,
      r: number,
      side: "left" | "right",
    ) => {
      const R = x(r) - x(0);

      const sweep = side === "left" ? 1 : 0;

      g.append("path")
        .attr(
          "d",
          `
        M ${x(cx)} ${y(cy - r)}
        A ${R} ${R} 0 0 ${sweep} ${x(cx)} ${y(cy + r)}
      `,
        )
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 2);
    };

    // ===== Campo =====
    g.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", fieldColor)
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // Medio campo
    line(50, 0, 50, 100);
    circle(50, 50, 9.15);
    circle(50, 50, 0.4, "white");

    // Áreas
    rect(0, 21.1, 16.5, 57.8);
    rect(0, 36.8, 5.5, 26.4);

    rect(83.5, 21.1, 16.5, 57.8);
    rect(94.5, 36.8, 5.5, 26.4);

    // Puntos de penalti
    circle(11, 50, 0.4, "white");
    circle(89, 50, 0.4, "white");

    // Arcos del área (CORRECTOS)
    penaltyArc(16.5, 50, 9.15, "right");
    penaltyArc(83.5, 50, 9.15, "left");
    // Porterías
    rect(-2, 44.5, 2, 11);
    rect(100, 44.5, 2, 11);

    // Ejes (opcional)
    if (showAxes) {
      g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10))
        .attr("color", "white")
        .attr("opacity", 0.4);

      g.append("g")
        .call(d3.axisLeft(y).ticks(10))
        .attr("color", "white")
        .attr("opacity", 0.4);
    }
  }, [width, height, showAxes, fieldColor]);

  return (
    <svg width={width} height={height}>
      <g ref={ref} />
      <g>{children}</g>
    </svg>
  );
};

export default OptaPitch;
