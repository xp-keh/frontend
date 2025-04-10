"use client";

import { useEffect, useState } from "react";
import WeatherIcon from "./WeatherIcon";

interface ForecastEntry {
  location: string;
  dt: string;
  temp: number;
  description: string;
}

const HourlyForecastTable = ({ selectedCity }: { selectedCity: string }) => {
  const [forecastData, setForecastData] = useState<ForecastEntry[]>([]);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/weather/forecast_next_5_hours"
        );
        const data = await response.json();
        console.log(data);

        const cityForecast = data.forecast.filter(
          (entry: ForecastEntry) => entry.location === selectedCity
        );

        setForecastData(cityForecast.slice(0, 5));
      } catch (error) {
        console.error("Error fetching forecast data:", error);
      }
    };

    fetchForecast();
  }, [selectedCity]);

  return (
    <div className="grid grid-cols-5 gap-2 mt-2">
      {forecastData.map((entry, index) => (
        <div
          key={index}
          className="bg-gray-900 text-white p-3 rounded-3xl flex flex-col items-center justify-center space-y-1"
        >
          <p className="text-sm font-semibold">{entry.temp.toFixed(1)}°C</p>

          <WeatherIcon description={entry.description} />

          <p className="text-xs text-center">
            {entry.description
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}{" "}
          </p>

          <p className="text-sm">
            {new Intl.DateTimeFormat("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(entry.dt))}
          </p>
        </div>
      ))}
    </div>
  );
};

export default HourlyForecastTable;
