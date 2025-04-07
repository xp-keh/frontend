"use client";
import { useEffect, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const WindDirectionChart = ({ windDeg }: { windDeg: number }) => {
  const [rotation, setRotation] = useState(windDeg);

  useEffect(() => {
    setRotation(windDeg);
  }, [windDeg]);

  return (
    <div className="relative flex items-center justify-center">
      <p className="absolute top-0 text-white text-sm font-semibold">N</p>
      <p className="absolute bottom-0 text-white text-sm font-semibold">S</p>
      <p className="absolute left-22 text-white text-sm font-semibold">W</p>
      <p className="absolute right-23.5 text-white text-sm font-semibold">E</p>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={[{ value: 1 }]}
            dataKey="value"
            outerRadius={80}
            fill="#444"
          />

          <g transform={`rotate(${rotation}, 100, 100)`}>
            <polygon points="100,40 90,70 110,70" fill="red" />
          </g>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WindDirectionChart;
