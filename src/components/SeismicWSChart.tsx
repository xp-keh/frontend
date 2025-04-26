"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useState, useEffect } from "react";

interface SeismicDataPoint {
  dt: string;
  station: string;
  channel: string;
  data: number;
}

interface SeismicWSChartProps {
  seismicData: SeismicDataPoint[];
  selectedStation: string;
  selectedChannel: string;
}

const SeismicWSChart = ({
  seismicData,
  selectedStation,
  selectedChannel,
}: SeismicWSChartProps) => {
  const [bufferedData, setBufferedData] = useState<SeismicDataPoint[]>([]);

  useEffect(() => {
    if (seismicData.length === 0) return;

    const MAX_DATA_POINTS = 1000;

    const newFiltered = seismicData.filter(
      (d) => d.station === selectedStation && d.channel === selectedChannel
    );

    if (newFiltered.length === 0) return;

    setBufferedData((prev) => {
      const updated = [...prev, ...newFiltered];

      if (updated.length > MAX_DATA_POINTS) {
        return updated.slice(updated.length - MAX_DATA_POINTS);
      }
      return updated;
    });
  }, [seismicData, selectedStation, selectedChannel]);

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={[...bufferedData].sort(
            (a, b) => new Date(a.dt).getTime() - new Date(b.dt).getTime()
          )}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="dt"
            tickFormatter={(tick) => new Date(tick).toLocaleTimeString()}
            minTickGap={20}
            tick={{
              fontSize: 8,
              fill: "white",
            }}
          />
          <YAxis
            tick={{
              fontSize: 10,
              fill: "white",
              dx: -10,
            }}
            domain={["auto", "auto"]}
          />
          <Tooltip
            labelFormatter={(label) => new Date(label).toLocaleString()}
          />
          <Line
            type="monotone"
            dataKey="data"
            dot={false}
            stroke="white"
            strokeWidth={0.5}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SeismicWSChart;
