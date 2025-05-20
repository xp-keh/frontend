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
import { getTemperatureData } from "@/actions/weather";

const TemperatureChart = ({ temp }: { temp: { timestamp: string; value: number }[] }) => {
  const chartData = useMemo(() => {
    return temp.map((entry) => ({
      time: new Date(entry.timestamp).getTime(),
      temperature: +(entry.value - 273.15).toFixed(1),
    }));
  }, [temp]);

  const staticLabels = useMemo(() => {
    // const now = new Date();
    // const nowTimestamp = now.getTime();
    // const startTimestamp = nowTimestamp - 24 * 60 * 60 * 1000;

    const nowTimestamp = new Date();
    nowTimestamp.setMinutes(0, 0, 0);
    const alignedNow = nowTimestamp.getTime();
    const startTimestamp = alignedNow - 24 * 60 * 60 * 1000;

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
      lastTimestamp: alignedNow,
    };
  }, []);

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
        <XAxis dataKey="time" hide />
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
          dataKey="temperature"
          stroke="white"
          strokeWidth={0.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TemperatureChart;
