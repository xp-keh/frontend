// "use client";
// import { useState } from "react";
// import Navbar from "../../components/Navbar";
// import useWeatherWebSocket from "../../hooks/useWeatherWebSocket";
// import "../globals.css";

// const Dashboard = () => {
//   const { weatherData, error } = useWeatherWebSocket(
//     "ws://85.209.163.202:8012/ws"
//   );
//   const cities = Object.keys(weatherData);
//   const [selectedCity, setSelectedCity] = useState(cities[0] || "");

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <Navbar />
//       <div className="p-4 flex justify-center">
//         {cities.length > 0 && (
//           <select
//             className="p-2 border rounded-lg bg-white shadow-md text-black"
//             value={selectedCity}
//             onChange={(e) => setSelectedCity(e.target.value)}
//           >
//             {cities.map((city) => (
//               <option key={city} value={city}>
//                 {city}
//               </option>
//             ))}
//           </select>
//         )}
//       </div>

//       <div className="grid grid-cols-3 grid-rows-3 gap-10 p-8 h-screen rounded">
//         <div className="col-span-2 row-span-2 bg-gray-300 rounded-lg flex items-center justify-center">
//           <p className="text-gray-700">[ Map Placeholder ]</p>
//         </div>

//         {selectedCity && weatherData[selectedCity] ? (
//           <>
//             <div className="bg-customBlue text-white p-4 rounded-lg">
//               <h3 className="text-lg font-semibold">Temperature</h3>
//               <p className="text-2xl">
//                 {((weatherData[selectedCity]?.temp as number) - 273.15).toFixed(
//                   2
//                 )}{" "}
//                 °C
//               </p>
//             </div>
//             <div className="bg-customBlue text-white p-4 rounded-2xl flex flex-col justify-center">
//               <h3 className="text-lg font-semibold">Humidity</h3>
//               <p className="text-2xl">{weatherData[selectedCity].humidity} %</p>
//             </div>
//             <div className="bg-customBlue text-white p-4 rounded-2xl flex flex-col justify-center">
//               <h3 className="text-lg font-semibold">Wind Speed</h3>
//               <p className="text-2xl">
//                 {weatherData[selectedCity].wind_speed} m/s
//               </p>
//             </div>
//             <div className="bg-customBlue text-white p-4 rounded-2xl flex flex-col justify-center">
//               <h3 className="text-lg font-semibold">Clouds</h3>
//               <p className="text-2xl">
//                 {weatherData[selectedCity].clouds} oktas
//               </p>
//             </div>
//             <div className="bg-customBlue text-white p-4 rounded-2xl flex flex-col justify-center">
//               <h3 className="text-lg font-semibold">Description</h3>
//               <p className="text-2xl capitalize">
//                 {weatherData[selectedCity].description}
//               </p>
//             </div>
//           </>
//         ) : (
//           <p className="text-gray-700 col-span-3 text-center">
//             Waiting for data...
//           </p>
//         )}
//       </div>

//       {error && <p className="text-red-500 text-center mt-4">{error}</p>}
//     </div>
//   );
// };

// export default Dashboard;

"use client";
import { useState } from "react";
import Navbar from "../../components/Navbar";
import useWeatherWebSocket from "../../hooks/useWeatherWebSocket";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../globals.css";

const locations = [
  { name: "Kretek", lat: -7.9923, lon: 110.2973 },
  { name: "Jogjakarta", lat: -7.8021, lon: 110.3628 },
  { name: "Menggoran", lat: -7.9525, lon: 110.4942 },
  { name: "Bandara_DIY", lat: -7.9007, lon: 110.0573 },
  { name: "Bantul", lat: -7.875, lon: 110.3268 },
];

const locationIcon = L.icon({
  iconUrl: "/location-pin.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const Dashboard = () => {
  const { weatherData, error } = useWeatherWebSocket(
    "ws://85.209.163.202:8012/ws"
  );
  const [selectedCity, setSelectedCity] = useState(locations[0].name);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="grid grid-cols-3 grid-rows-3 gap-4 p-8 h-screen">
        <div className="col-span-2 row-span-2 bg-gray-300 rounded-lg flex items-center justify-center">
          <MapContainer
            center={[-7.9, 110.3]}
            zoom={10}
            className="w-full h-full rounded-lg"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {locations.map((loc) => (
              <Marker
                key={loc.name}
                position={[loc.lat, loc.lon]}
                icon={locationIcon}
                eventHandlers={{ click: () => setSelectedCity(loc.name) }}
              >
                <Popup>{loc.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {selectedCity && weatherData[selectedCity] ? (
          <>
            <div className="bg-customBlue text-white p-4 rounded-2xl flex flex-col justify-center">
              <h3 className="text-lg font-semibold">
                {selectedCity} - Temperature
              </h3>
              <p className="text-2xl">
                {((weatherData[selectedCity]?.temp as number) - 273.15).toFixed(
                  2
                )}{" "}
                °C
              </p>
            </div>
            <div className="bg-customBlue text-white p-4 rounded-2xl flex flex-col justify-center">
              <h3 className="text-lg font-semibold">Humidity</h3>
              <p className="text-2xl">{weatherData[selectedCity].humidity} %</p>
            </div>
            <div className="bg-customBlue text-white p-4 rounded-2xl flex flex-col justify-center">
              <h3 className="text-lg font-semibold">Wind Speed</h3>
              <p className="text-2xl">
                {weatherData[selectedCity].wind_speed} m/s
              </p>
              <br />
              <h3 className="text-lg font-semibold">Wind Degree</h3>
              <p className="text-2xl">
                {weatherData[selectedCity].wind_deg}&#176;
              </p>
              <br />
              <h3 className="text-lg font-semibold">Wind Gust</h3>
              <p className="text-2xl">
                {weatherData[selectedCity].wind_gust} m/s
              </p>
            </div>
            <div className="bg-customBlue text-white p-4 rounded-2xl flex flex-col justify-center">
              <h3 className="text-lg font-semibold">Clouds</h3>
              <p className="text-2xl">
                {weatherData[selectedCity].clouds} oktas
              </p>
            </div>
            <div className="bg-customBlue text-white p-4 rounded-2xl flex flex-col justify-center">
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-2xl capitalize">
                {weatherData[selectedCity].description}
              </p>
            </div>
          </>
        ) : (
          <p className="text-gray-700 col-span-3 text-center">
            Waiting for data...
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );
};

export default Dashboard;
