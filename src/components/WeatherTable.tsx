// "use client";
// import useWeatherWebSocket from "../hooks/useWeatherWebSocket";

// const WeatherTable = () => {
//   const { weatherData, error } = useWeatherWebSocket(
//     "ws://85.209.163.202:8012/ws"
//   );

//   return (
//     <div className="p-4 bg-white text-black rounded-lg shadow-md">
//       <h1 className="text-xl font-bold mb-4">Live Weather Data</h1>
//       {error && <p className="text-red-500">{error}</p>}

//       <table className="w-full border-collapse border border-gray-300">
//         <thead>
//           <tr className="bg-gray-200">
//             {["Location", "Temp (°C)", "Timestamp"].map((col) => (
//               <th key={col} className="border border-gray-300 p-2 text-left">
//                 {col}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {weatherData.map((item, index) => (
//             <tr key={index} className="border border-gray-300">
//               <td className="p-2 border border-gray-300">{item.location}</td>
//               <td className="p-2 border border-gray-300">
//                 {item.temp.toFixed(2)}
//               </td>
//               <td className="p-2 border border-gray-300">
//                 {new Date(item.timestamp).toLocaleTimeString()}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default WeatherTable;
