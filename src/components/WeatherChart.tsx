// "use client";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   ResponsiveContainer,
// } from "recharts";
// import useWeatherWebSocket from "../hooks/useWeatherWebSocket";

// const cities = ["Kretek", "Jogjakarta", "Menggoran", "Bandara_DIY", "Bantul"];

// const WeatherChart = () => {
//   const { weatherData } = useWeatherWebSocket("ws://85.209.163.202:8012/ws");

//   return (
//     <div className="w-full max-w-4xl space-y-8">
//       {cities.map((city) => {
//         const cityData = weatherData.filter((data) => data.location === city);

//         return (
//           <div key={city} className="p-4 bg-black shadow rounded-xl">
//             <h2 className="text-lg font-semibold mb-2">{city} Temperature</h2>
//             <ResponsiveContainer width="100%" height={200}>
//               <LineChart data={cityData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis
//                   dataKey="timestamp"
//                   tickFormatter={(tick) => new Date(tick).toLocaleTimeString()}
//                 />
//                 <YAxis domain={["auto", "auto"]} />
//                 <Tooltip
//                   labelFormatter={(label) =>
//                     new Date(label).toLocaleTimeString()
//                   }
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="temp"
//                   stroke="#8884d8"
//                   strokeWidth={2}
//                   dot={false}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default WeatherChart;
