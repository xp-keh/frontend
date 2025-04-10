"use client";
import React from "react";

interface WindDialProps {
  direction: number;
}

const WindDial: React.FC<WindDialProps> = ({ direction }) => {
  const ticks = Array.from({ length: 180 }, (_, i) => i * 2);
  const center = 100;
  const radius = 90;

  return (
    <div className="flex flex-col items-center text-white p-4 rounded-xl w-48 h-48">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth="2"
          fill="none"
        />

        {ticks.map((angle) => {
          const angleRad = (angle - 90) * (Math.PI / 180);
          const x1 = center + radius * Math.cos(angleRad);
          const y1 = center + radius * Math.sin(angleRad);
          const x2 = center + (radius - 6) * Math.cos(angleRad);
          const y2 = center + (radius - 6) * Math.sin(angleRad);
          return (
            <line
              key={angle}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="white"
              strokeWidth="1"
            />
          );
        })}

        {["N", "E", "S", "W"].map((dir, i) => {
          const angle = i * 90;
          const x =
            center + (radius - 15) * Math.cos((angle - 90) * (Math.PI / 180));
          const y =
            center + (radius - 15) * Math.sin((angle - 90) * (Math.PI / 180));
          return (
            <text
              key={dir}
              x={x}
              y={y + 4}
              textAnchor="middle"
              fill="white"
              fontSize="12"
              fontWeight="bold"
            >
              {dir}
            </text>
          );
        })}

        <g transform={`rotate(${direction} ${center} ${center})`}>
          <line
            x1={center}
            y1={center}
            x2={center}
            y2={center - 60}
            stroke="white"
            strokeWidth="4"
            markerEnd="url(#arrowhead)"
          />
        </g>

        <defs>
          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="6"
            refX="3"
            refY="3"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <polygon points="0 0, 6 3, 0 6" fill="white" />
          </marker>
        </defs>
      </svg>

      <h3 className="text-[10px]">{direction.toFixed(0)}°</h3>
    </div>
  );
};

export default WindDial;
