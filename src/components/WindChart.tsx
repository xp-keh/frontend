"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState, useMemo } from "react";

const WindChart = ({ selectedCity }: { selectedCity: string }) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/weather/fetch_weather?type=wind`
        );
        const rawData = await response.json();

        const dataArray = rawData.data || [];

        const now = Date.now();
        const last24Hours = now - 24 * 60 * 60 * 1000;

        const cityData = dataArray
          .filter((entry: any) => entry.location === selectedCity)
          .map((entry: any) => ({
            time: entry.dt * 1000,
            speed: entry.wind_speed,
            gust: entry.wind_gust,
          }))
          .filter((entry: { time: number }) => entry.time >= last24Hours);

        setChartData(cityData);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    fetchData();
  }, [selectedCity]);

  // Generate X-axis labels ONCE when the component mounts
  const staticLabels = useMemo(() => {
    const now = new Date();
    const nowTimestamp = now.getTime();
    const startTimestamp = nowTimestamp - 24 * 60 * 60 * 1000;

    const timestamps = [];
    for (let i = 0; i <= 24; i++) {
      const labelTime = new Date(startTimestamp + i * 60 * 60 * 1000);
      const hour = labelTime.getHours();

      if ([0, 6, 12, 18].includes(hour)) {
        timestamps.push({
          timestamp: labelTime.getTime(),
          label: labelTime.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      }
    }

    return {
      timestamps,
      firstTimestamp: startTimestamp,
      lastTimestamp: nowTimestamp,
    };
  }, []); // Empty dependency array ensures it's calculated only once

  return (
    <ResponsiveContainer width="100%" height="80%">
      <LineChart
        data={chartData}
        margin={{ left: -20, right: 10, top: 20, bottom: 10 }}
      >
        <CartesianGrid
          stroke="rgba(255, 255, 255, 0.05)"
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="time"
          scale="time"
          type="number"
          domain={[staticLabels.firstTimestamp, staticLabels.lastTimestamp]}
          ticks={staticLabels.timestamps.map((label) => label.timestamp)}
          tickFormatter={(tick) => {
            const labelObj = staticLabels.timestamps.find(
              (l) => l.timestamp === tick
            );
            return labelObj ? labelObj.label : "";
          }}
          stroke="white"
          tick={{
            fontSize: 8,
            fill: "white",
            textAnchor: "middle",
            dy: 1,
          }}
        />
        <YAxis
          domain={["auto", "auto"]}
          stroke="white"
          tickFormatter={(tick) => tick.toFixed(1)}
          tick={{
            fontSize: 12,
            fill: "white",
            textAnchor: "middle",
            dy: 0,
            dx: -15,
          }}
          padding={{ top: 0, bottom: 0 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
          }}
          labelFormatter={(label) =>
            new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(label))
          }
        />
        <Line
          type="monotone"
          dataKey="speed"
          stroke="blue"
          strokeWidth={1}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="gust"
          stroke="red"
          strokeWidth={1}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default WindChart;
