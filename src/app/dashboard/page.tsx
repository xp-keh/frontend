"use client";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import useWeatherWebSocket from "../../hooks/useWeatherWebSocket";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import "../globals.css";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

let L: any;
if (typeof window !== "undefined") {
  L = require("leaflet");
}

const locations = [
  { name: "Kretek", lat: -7.9923, lon: 110.2973 },
  { name: "Jogjakarta", lat: -7.8021, lon: 110.3628 },
  { name: "Menggoran", lat: -7.9525, lon: 110.4942 },
  { name: "Bandara_DIY", lat: -7.9007, lon: 110.0573 },
  { name: "Bantul", lat: -7.875, lon: 110.3268 },
];

const Dashboard = () => {
  const { weatherData, error } = useWeatherWebSocket(
    "ws://85.209.163.202:8012/ws"
  );
  const [selectedCity, setSelectedCity] = useState(locations[0].name);

  const [locationIcon, setLocationIcon] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLocationIcon(
        L.icon({
          iconUrl: "/location-pin.png",
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -30],
        })
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="grid grid-cols-3 grid-rows-3 gap-10 p-8 h-screen">
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
            <div className="bg-chartGray text-white p-4 rounded-lg">
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
            <div className="bg-chartGray text-white p-4 rounded-2xl flex flex-col justify-center">
              <h3 className="text-lg font-semibold">Humidity</h3>
              <p className="text-2xl">{weatherData[selectedCity].humidity} %</p>
            </div>
            <div className="bg-chartGray text-white p-4 rounded-2xl flex flex-col justify-center">
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
            <div className="bg-chartGray text-white p-4 rounded-2xl flex flex-col justify-center">
              <h3 className="text-lg font-semibold">Clouds</h3>
              <p className="text-2xl">
                {weatherData[selectedCity].clouds} oktas
              </p>
            </div>
            <div className="bg-chartGray text-white p-4 rounded-2xl flex flex-col justify-center">
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
