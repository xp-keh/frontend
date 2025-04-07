"use client";
import Map from "../../components/Map";
import { locations } from "../../components/Map";
import { useState } from "react";
import Navbar from "../../components/Navbar";
import useWeatherWebSocket from "../../hooks/useWeatherWebSocket";
import TemperatureChart from "../../components/TemperatureChart";
import HumidityChart from "../../components/HumidityChart";
import WindChart from "../../components/WindChart";
import WindDirectionChart from "../../components/WindDirectionChart";

const WeatherDashboard = () => {
  const { weatherData, error } = useWeatherWebSocket(
    "ws://85.209.163.202:8012/ws"
  );
  const [selectedCity, setSelectedCity] = useState(locations[0].name);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="grid grid-cols-4 grid-rows-3 gap-2 p-3 h-screen">
        <div className="col-span-3 row-span-2 bg-gray-300 rounded-lg flex items-center justify-center">
          <Map onSelectCity={setSelectedCity} />
        </div>

        {selectedCity && weatherData[selectedCity] ? (
          <>
            <div className="bg-chartGray text-white p-2 rounded-lg flex flex-col">
              <h3 className="text-md font-semibold">{selectedCity}</h3>
              <p className="text-sm">
                {(() => {
                  let lat = "";
                  let lon = "";

                  if (selectedCity === "Kretek") {
                    lat = "-7.9923";
                    lon = "110.2973";
                  } else if (selectedCity === "Jogjakarta") {
                    lat = "-7.8021";
                    lon = "110.3628";
                  } else if (selectedCity === "Menggoran") {
                    lat = "-7.9525";
                    lon = "110.4942";
                  } else if (selectedCity === "Bandara_DIY") {
                    lat = "-7.9007";
                    lon = "110.0573";
                  } else if (selectedCity === "Bantul") {
                    lat = "-7.8750";
                    lon = "110.3268";
                  }

                  return `Coord: (${lat}, ${lon})`;
                })()}
              </p>
              <p className="text-sm">
                {weatherData[selectedCity]?.description}
              </p>
            </div>
            <div className="bg-chartGray text-white p-2 rounded-lg flex flex-col">
              <div className="flex justify-between">
                <h3 className="text-md font-semibold">Temperature</h3>
                <p className="text-md">
                  {(
                    (weatherData[selectedCity]?.temp as number) - 273.15
                  ).toFixed(1)}{" "}
                  °C
                </p>
              </div>
              <h3 className="text-sm">Last 2 days</h3>
              <TemperatureChart selectedCity={selectedCity} />
            </div>
            <div className="bg-chartGray text-white p-2 rounded-lg flex flex-col">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold">Humidity</h3>
                <p className="text-2xl">
                  {weatherData[selectedCity].humidity} %
                </p>
              </div>
              <h3 className="text-sm">Last 2 days</h3>
              <HumidityChart selectedCity={selectedCity} />
            </div>
            <div className="bg-chartGray text-white p-2 rounded-lg flex flex-col">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold">Wind</h3>
              </div>
              <div className="flex justify-between">
                <p className="text-lg text-red-600">
                  {weatherData[selectedCity].wind_speed}
                  <span className="text-sm text-white"> km/h</span>
                </p>
                <p className="text-lg text-blue-500">
                  {weatherData[selectedCity].wind_gust}
                  <span className="text-sm text-white"> km/h</span>
                </p>
              </div>
              <div className="flex justify-between">
                <h3 className="text-sm">Wind Speed</h3>
                <h3 className="text-sm">Wind Gust</h3>
              </div>
              <WindChart selectedCity={selectedCity} />
            </div>
            <div className="bg-chartGray text-white p-2 rounded-lg flex flex-col">
              <h3 className="text-lg font-semibold">
                Wind Direction {weatherData[selectedCity].wind_deg}
              </h3>
              <WindDirectionChart
                windDeg={weatherData[selectedCity].wind_deg as number}
              />
            </div>
            <div className="bg-chartGray text-white p-4 rounded-2xl flex flex-col justify-center">
              <h3 className="text-lg font-semibold">Humidity</h3>
              <p className="text-2xl">{weatherData[selectedCity].humidity} %</p>
            </div>
          </>
        ) : (
          <p className="text-gray-700 col-span-3 text-center">
            Waiting for data...
          </p>
        )}
      </div>

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );
};

export default WeatherDashboard;
