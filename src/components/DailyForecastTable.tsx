"use client";

import { useEffect, useState } from "react";
import WeatherIcon from "./WeatherIcon";

interface ForecastEntry {
  location: string;
  dt: string;
  temp: number;
  description: string;
}

const DailyForecastTable = ({ selectedCity }: { selectedCity: string }) => {
  const [forecastData, setForecastData] = useState<ForecastEntry[]>([]);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/weather/forecast_next_7_days"
        );
        const data = await response.json();

        const cityForecast = data.forecast.filter(
          (entry: ForecastEntry) => entry.location === selectedCity
        );

        setForecastData(cityForecast);
      } catch (error) {
        console.error("Error fetching forecast data:", error);
      }
    };

    fetchForecast();
  }, [selectedCity]);

  return (
    <div className="grid grid-cols-6 gap-1 mt-4">
      {forecastData.map((entry, index) => (
        <div
          key={index}
          className="bg-customGray text-white p-3 rounded-3xl flex flex-col items-center justify-center space-y-2"
        >
          <p className="text-sm">
            {new Intl.DateTimeFormat("en-GB", {
              weekday: "short",
            }).format(new Date(entry.dt))}
          </p>
          <p className="text-xs">{entry.temp.toFixed(1)}°C</p>

          <WeatherIcon description={entry.description} />

          <p className="text-[10px] text-center">
            {entry.description.includes("heavy") &&
            entry.description.includes("rain")
              ? "Heavy Rain"
              : entry.description
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
          </p>
        </div>
      ))}
    </div>
  );
};

export default DailyForecastTable;
