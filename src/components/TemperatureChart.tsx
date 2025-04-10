// "use client";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import { useEffect, useState } from "react";

// const TemperatureChart = ({ selectedCity }: { selectedCity: string }) => {
//   const [chartData, setChartData] = useState<any[]>([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(
//           "http://localhost:8080/weather/fetch_last_2_days"
//         );
//         const rawData = await response.json();

//         const dataArray = rawData.weather_data || [];

//         const cityData = dataArray
//           .filter((entry: any) => entry.location === selectedCity)
//           .map((entry: any) => ({
//             time: entry.dt * 1000,
//             temperature: (entry.temp - 273.15).toFixed(1),
//           }));

//         setChartData(cityData);
//       } catch (error) {
//         console.error("Error fetching weather data:", error);
//       }
//     };

//     fetchData();
//   }, [selectedCity]);

//   const generateDynamicLabels = () => {
//     const now = new Date();
//     const nowTimestamp = now.getTime();

//     const startTimestamp = nowTimestamp - 24 * 60 * 60 * 1000;

//     const timestamps = [];
//     for (let i = 0; i <= 24; i++) {
//       const labelTime = new Date(startTimestamp + i * 60 * 60 * 1000);
//       const hour = labelTime.getHours();

//       // Only push timestamps that will actually have a label
//       if ([0, 6, 12, 18].includes(hour)) {
//         timestamps.push({
//           timestamp: labelTime.getTime(),
//           label: labelTime.toLocaleTimeString("en-GB", {
//             hour: "2-digit",
//             minute: "2-digit",
//           }),
//         });
//       }
//     }

//     return {
//       timestamps,
//       firstTimestamp: startTimestamp,
//       lastTimestamp: nowTimestamp,
//     };
//   };

//   const dynamicLabels = generateDynamicLabels();

//   return (
//     <ResponsiveContainer width="100%" height="100%">
//       <LineChart
//         data={chartData}
//         margin={{ left: -20, right: 10, top: 20, bottom: 10 }}
//       >
//         <CartesianGrid
//           stroke="rgba(255, 255, 255, 0.05)"
//           strokeDasharray="3 3"
//         />
//         <XAxis
//           dataKey="time"
//           scale="time"
//           type="number"
//           domain={[dynamicLabels.firstTimestamp, dynamicLabels.lastTimestamp]}
//           ticks={dynamicLabels.timestamps.map((label) => label.timestamp)}
//           tickFormatter={(tick) => {
//             const label = dynamicLabels.timestamps.find(
//               (l) => l.timestamp === tick
//             );
//             return label ? label.label : "";
//           }}
//           stroke="white"
//           tick={{
//             fontSize: 8,
//             fill: "white",
//             textAnchor: "middle",
//             dy: 1,
//           }}
//         />
//         <YAxis
//           domain={["auto", "auto"]}
//           stroke="white"
//           tickFormatter={(tick) => tick.toFixed(1)}
//           tick={{
//             fontSize: 12,
//             fill: "white",
//             textAnchor: "middle",
//             dy: 0,
//             dx: -15,
//           }}
//           padding={{ top: 0, bottom: 0 }}
//         />
//         <Tooltip
//           contentStyle={{
//             backgroundColor: "rgba(0,0,0,0.7)",
//             color: "white",
//           }}
//           labelFormatter={(label) =>
//             new Intl.DateTimeFormat("en-GB", {
//               day: "2-digit",
//               month: "2-digit",
//               year: "2-digit",
//               hour: "2-digit",
//               minute: "2-digit",
//             }).format(new Date(label))
//           }
//         />
//         <Line
//           type="monotone"
//           dataKey="temperature"
//           stroke="white"
//           strokeWidth={0.5}
//           dot={false}
//         />
//       </LineChart>
//     </ResponsiveContainer>
//   );
// };

// export default TemperatureChart;

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

const TemperatureChart = ({ selectedCity }: { selectedCity: string }) => {
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
            temperature: (entry.temp - 273.15).toFixed(1),
          }));

        setChartData(cityData);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    fetchData();
  }, [selectedCity]);

  // Generate labels ONCE when the component mounts
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
  }, []); // Empty dependency array ensures it runs once

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
