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

//         const cityData = dataArray.filter(
//           (entry: any) => entry.location === selectedCity
//         );

//         const formattedData = cityData.map((entry: any) => ({
//           time: new Intl.DateTimeFormat("en-GB", {
//             day: "2-digit",
//             month: "2-digit",
//             year: "2-digit",
//             hour: "2-digit",
//             minute: "2-digit",
//           }).format(new Date(entry.dt * 1000)), // time: entry.dt,
//           temperature: (entry.temp - 273.15).toFixed(2),
//         }));

//         console.log("Formatted chart data:", formattedData);
//         setChartData(formattedData);
//       } catch (error) {
//         console.error("Error fetching weather data:", error);
//       }
//     };

//     fetchData();
//   }, [selectedCity]);

//   return (
//     <div className="bg-customBlue p-4 rounded-lg shadow-md w-full h-64">
//       <h3 className="text-lg font-semibold text-white mb-2">
//         Temperature Trend for {selectedCity}
//       </h3>
//       <ResponsiveContainer width="100%" height="100%">
//         <LineChart data={chartData}>
//           <CartesianGrid
//             stroke="rgba(255, 255, 255, 0.3)"
//             strokeDasharray="3 3"
//           />
//           <XAxis dataKey="time" stroke="white" />
//           <YAxis domain={["auto", "auto"]} stroke="white" />
//           <Tooltip
//             contentStyle={{
//               backgroundColor: "rgba(0,0,0,0.7)",
//               color: "white",
//             }}
//           />
//           <Line
//             type="monotone"
//             dataKey="temperature"
//             stroke="white"
//             strokeWidth={1}
//             dot={false}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
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
import { useEffect, useState } from "react";

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
            temperature: (entry.temp - 273.15).toFixed(2),
          }));

        console.log("Formatted chart data:", cityData);
        setChartData(cityData);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    fetchData();
  }, [selectedCity]);

  const generateFixedLabels = () => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const fixedTimes = [
      "00:00",
      "06:00",
      "12:00",
      "18:00",
      "00:00",
      "06:00",
      "12:00",
      "18:00",
    ];
    const fixedTimestamps = fixedTimes.map((time, index) => {
      const isYesterday = index < 4;
      const dateStr = isYesterday ? yesterdayStr : todayStr;
      return {
        timestamp: new Date(`${dateStr}T${time}:00`).getTime(),
        label: `${isYesterday ? "" : ""}\n${time}`,
      };
    });

    return fixedTimestamps;
  };

  const fixedLabels = generateFixedLabels();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid
          stroke="rgba(255, 255, 255, 0.3)"
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="time"
          scale="time"
          type="number"
          domain={["dataMin", "dataMax"]}
          ticks={fixedLabels.map((label) => label.timestamp)}
          tickFormatter={(tick) => {
            const label = fixedLabels.find((l) => l.timestamp === tick);
            return label ? label.label : "";
          }}
          stroke="white"
          tick={{
            fontSize: 8,
            fill: "white",
            textAnchor: "middle",
            dy: 1,
          }}
          // padding={{ left: 0, right: 10 }} // Remove left padding
        />
        <YAxis domain={["auto", "auto"]} stroke="white" />
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
