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

const SeismicChart = ({
  selectedStation,
  channel,
}: {
  selectedStation: string;
  channel: "BHN" | "BHZ" | "BHE";
}) => {
  const [chartData, setChartData] = useState<any[]>([]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/seismic/fetch_seismic?station=${selectedStation}&axis=${channel}`;
        const response = await fetch(url);
        const rawData = await response.json();
        const dataArray = rawData.bhz || [];
        const formattedData = dataArray.map((entry: any) => ({
          time: new Date(entry.dt).getTime(),
          value: entry.data,
        }));
        console.log("formattedData", formattedData);

        setChartData(formattedData);
      } catch (error) {
        console.error(`Error fetching ${channel} data:`, error);
      }
    };

    fetchData();
  }, [selectedStation, channel]);

  return (
    <ResponsiveContainer width="100%" height="100%">
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
          stroke="white"
          tick={{
            fontSize: 8,
            fill: "white",
          }}
          tickFormatter={(tick) =>
            formatTimestamp(new Date(tick).toISOString())
          }
        />
        <YAxis
          stroke="white"
          tick={{
            fontSize: 10,
            fill: "white",
            dx: -10,
          }}
          domain={["auto", "auto"]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="white"
          strokeWidth={0.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SeismicChart;
