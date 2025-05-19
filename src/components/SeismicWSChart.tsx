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

    const MAX_DATA_POINTS = 18000;

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

  const MS_IN_5_MIN = 5 * 60 * 1000;
  const MS_IN_15_MIN = 15 * 60 * 1000;

  const chartData = bufferedData
    .map((d) => ({
      ...d,
      dt: new Date(d.dt.split(".")[0] + "Z").getTime(),
    }))
    .sort((a, b) => a.dt - b.dt);

  if (chartData.length === 0) {
    return <div className="w-full h-96">Loading...</div>;
  }

  // Step 1: Get earliest timestamp
  const minTime = chartData[0].dt;

  // Step 2: Round it UP to nearest 5-min
  const firstTick = Math.ceil(minTime / MS_IN_5_MIN) * MS_IN_5_MIN;

  // Step 3: Generate 3 ticks (spaced 5 mins apart)
  const customTicks = [
    firstTick,
    firstTick + MS_IN_5_MIN,
    firstTick + 2 * MS_IN_5_MIN,
  ];

  // Step 4: Domain = from minTime to minTime + 15 mins
  const domainStart = minTime;
  const domainEnd = minTime + MS_IN_15_MIN;

  const dataValues = chartData.map((d) => d.data);
  const minData = Math.min(...dataValues);
  const maxData = Math.max(...dataValues);

  const padding = (maxData - minData) * 0.2 || 1;

  const floorTo = (value: number, base: number) =>
    Math.floor(value / base) * base;

  const ceilTo = (value: number, base: number) =>
    Math.ceil(value / base) * base;

  const yMin = floorTo(minData - padding, 1000);
  const yMax = ceilTo(maxData + padding, 1000);
  const yDomain = [yMin, yMax];

  const domainThousands = (yMax - yMin) / 1000;

  const yTicks = Array.from(
    { length: domainThousands + 1 },
    (_, i) => yMin + i * 1000
  );

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            vertical={false}
          />
          <XAxis
            dataKey="dt"
            type="number"
            domain={[domainStart, domainEnd]}
            ticks={customTicks}
            tickFormatter={(tick) => {
              const date = new Date(tick);
              const hours = String(date.getUTCHours()).padStart(2, "0");
              const minutes = String(date.getUTCMinutes()).padStart(2, "0");
              return `${hours}:${minutes}`;
            }}
            tick={{ fontSize: 8, fill: "white" }}
            minTickGap={20}
          />
          <YAxis
            domain={yDomain}
            ticks={yTicks}
            tick={{ fontSize: 10, fill: "white", dx: -10 }}
            tickFormatter={(val) => val.toLocaleString()}
            // axisLine={false}
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
