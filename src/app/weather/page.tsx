"use client";
import Map from "../../components/Map";
import { locations } from "../../components/Map";
import { useState } from "react";
import Navbar from "../../components/Navbar";
import useWeatherWebSocket from "../../hooks/useWeatherWebSocket";
import TempLineChart from "../../components/TemperatureChart";

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
            <div className="bg-customBlue text-white p-2 rounded-lg flex flex-col">
              <div className="flex justify-between">
                <h3 className="text-md font-semibold">Temperature</h3>
                <p className="text-md">
                  {(
                    (weatherData[selectedCity]?.temp as number) - 273.15
                  ).toFixed(2)}{" "}
                  °C
                </p>
              </div>
            </div>
            <div className="bg-customBlue text-white p-0.5 pl-0 rounded-lg">
              <TempLineChart selectedCity={selectedCity} />
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
              <h3 className="text-lg font-semibold">Humidity</h3>
              <p className="text-2xl">{weatherData[selectedCity].humidity} %</p>
            </div>
            <div className="bg-customBlue text-white p-4 rounded-2xl flex flex-col justify-center">
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
