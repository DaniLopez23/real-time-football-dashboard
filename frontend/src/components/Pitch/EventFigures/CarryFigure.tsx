import React from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

interface CarryFigureProps {
	xScale: d3.ScaleLinear<number, number>;
	yScale: d3.ScaleLinear<number, number>;
	origin: { x: number; y: number };
	destination: { x: number; y: number };
	strokeWidth?: number;
	animated?: boolean;
	isHomeTeam?: boolean;
}

const CarryFigure: React.FC<CarryFigureProps> = ({
	xScale,
	yScale,
	origin,
	destination,
	strokeWidth = 1,
	animated = false,
	isHomeTeam = true,
}) => {
	const x1 = xScale(origin.x);
	const y1 = yScale(origin.y);
	const x2 = xScale(destination.x);
	const y2 = yScale(destination.y);

	const lineColor = isHomeTeam ? '#2196F3' : '#E53935';

	return (
		<g className="carry-figure">
			<motion.line
				x1={x1}
				y1={y1}
				x2={x2}
				y2={y2}
				stroke={lineColor}
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeDasharray="6 6"
				initial={animated ? { opacity: 0, strokeDashoffset: 12 } : false}
				animate={{ opacity: 0.9, strokeDashoffset: 0 }}
				transition={animated ? { duration: 0.5, ease: 'easeOut' } : { duration: 0 }}
			/>
		</g>
	);
};

export default CarryFigure;
