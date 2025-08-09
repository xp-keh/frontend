"use client";
import LeafMap from "../../components/LeafMap";
import { locations } from "../../components/LeafMap";
import { useState } from "react";
import Navbar from "../../components/Navbar";
import useWeatherWebSocket from "../../hooks/useWeatherWebSocket";
import TemperatureChart from "../../components/TemperatureChart";
import HumidityChart from "../../components/HumidityChart";
import WindChart from "../../components/WindChart";
import WindDirectionChart from "../../components/WindDirectionChart";
import WeatherIcon from "../../components/WeatherIcon";
import HourlyForecastTable from "../../components/HourlyForecastTable";
import DailyForecastTable from "../../components/DailyForecastTable";

const WeatherDashboard = () => {
  const { weatherData, error } = useWeatherWebSocket(
    "ws://85.209.163.202:8012/ws"
  );
  const [selectedStation, setSelectedStation] = useState(locations[0].name);

  const getStationCoordinates = (cityName: string) => {
    const station = locations.find((loc) => loc.name === cityName);
    return station
      ? {
          city: station.city,
          province: station.province,
          lat: station.lat,
          lon: station.lon,
        }
      : { city: "", province: "", lat: "", lon: "" };
  };

  const { city, province, lat, lon } = getStationCoordinates(selectedStation);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="grid grid-cols-4 grid-rows-3 gap-2 p-3 h-screen">
        <div className="col-span-3 row-span-2 bg-gray-300 rounded-lg flex items-center justify-center">
          <LeafMap onSelectStation={setSelectedStation} />
        </div>
        {selectedStation && weatherData[selectedStation] ? (
          <>
            <div className="bg-chartGray text-white p-4 py-1 rounded-lg flex flex-col">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="text-xl font-semibold">{city}</h3>
                  <span className="text-sm font-semibold">{province}</span>
                </div>

                <span className="text-sm justify-center">
                  {lat && lon ? `(${lat},${lon})` : "Coordinates not found"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <WeatherIcon
                  description={String(
                    weatherData[selectedStation]?.description || ""
                  )}
                />
                <p className="text-lg justify-baseline">
                  {String(weatherData[selectedStation]?.description || "")
                    .split(" ")
                    .map(
                      (word: string) =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                    )
                    .join(" ")}
                </p>
              </div>
              <HourlyForecastTable
                selectedCity={selectedStation}
              ></HourlyForecastTable>
            </div>
            <div className="bg-chartGray text-white p-4 rounded-lg flex flex-col">
              <h3 className="text-2xl font-semibold">7 Days Forecast</h3>

              <DailyForecastTable
                selectedCity={selectedStation}
              ></DailyForecastTable>
            </div>
            <div className="bg-chartGray text-white p-2 rounded-lg flex flex-col">
              <div className="flex justify-between">
                <h3 className="text-md font-semibold">Temperature</h3>
                <p className="text-md">
                  {(
                    (weatherData[selectedStation]?.temp as number) - 273.15
                  ).toFixed(1)}{" "}
                  °C
                </p>
              </div>
              <h3 className="text-sm">Last 24 hours</h3>
              <TemperatureChart selectedCity={selectedStation} />
            </div>
            <div className="bg-chartGray text-white p-2 rounded-lg flex flex-col">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold">Humidity</h3>
                <p className="text-md">
                  {weatherData[selectedStation].humidity} %
                </p>
              </div>
              <h3 className="text-sm">Last 24 hours</h3>
              <HumidityChart selectedCity={selectedStation} />
            </div>
            <div className="bg-chartGray text-white p-2 rounded-lg flex flex-col">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold">Wind</h3>
              </div>
              <div className="flex justify-between">
                <p className="text-lg text-blue-500">
                  {weatherData[selectedStation].wind_speed}
                  <span className="text-sm text-white"> km/h</span>
                </p>
                <p className="text-lg text-red-500">
                  {weatherData[selectedStation].wind_gust}
                  <span className="text-sm text-white"> km/h</span>
                </p>
              </div>
              <div className="flex justify-between">
                <h3 className="text-sm">Wind Speed</h3>
                <h3 className="text-sm">Wind Gust</h3>
              </div>
              <WindChart selectedCity={selectedStation} />
            </div>
            <div className="bg-chartGray text-white p-2 rounded-lg flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-2 self-start">
                Wind Direction
              </h3>
              <WindDirectionChart
                direction={Number(weatherData[selectedStation]?.wind_deg) || 0}
              ></WindDirectionChart>
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
