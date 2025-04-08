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
import { useEffect, useState } from "react";

const HumidityChart = ({ selectedCity }: { selectedCity: string }) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/weather/fetch_last_2_days"
        );
        const rawData = await response.json();

        const dataArray = rawData.weather_data || [];

        const cityData = dataArray
          .filter((entry: any) => entry.location === selectedCity)
          .map((entry: any) => ({
            time: entry.dt * 1000,
            hum: entry.humidity,
          }));

        setChartData(cityData);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    fetchData();
  }, [selectedCity]);

  const generateDynamicLabels = () => {
    const now = new Date();
    const last24HoursStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const baseHours = [0, 6, 12, 18];
    let firstLabelHour = baseHours.find(
      (h) => h >= last24HoursStart.getHours()
    );
    if (firstLabelHour === undefined) firstLabelHour = 0;

    const timestamps = [];
    for (let i = 0; i < 5; i++) {
      const labelTime = new Date(last24HoursStart);
      labelTime.setHours(firstLabelHour + i * 6, 0, 0, 0);
      timestamps.push({
        timestamp: labelTime.getTime(),
        label: labelTime.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }
    return timestamps;
  };

  const dynamicLabels = generateDynamicLabels();

  return (
    <ResponsiveContainer width="100%" height="85%">
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
          domain={["dataMin", "dataMax"]}
          ticks={dynamicLabels.map((label) => label.timestamp)}
          tickFormatter={(tick) => {
            const label = dynamicLabels.find((l) => l.timestamp === tick);
            return label ? label.label : "";
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
          dataKey="hum"
          stroke="white"
          strokeWidth={0.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HumidityChart;
