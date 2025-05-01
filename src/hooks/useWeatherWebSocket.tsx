import { useEffect, useState } from "react";

interface WeatherData {
  [city: string]: { [key: string]: number | string };
}

const useWeatherWebSocket = (url: string) => {
  const [weatherData, setWeatherData] = useState<WeatherData>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log("✅ WebSocket connected to", url);
    };

    socket.onmessage = (event) => {
      try {
        console.log("📥 Raw message received:", event.data);
        const newData = JSON.parse(event.data);

        const city = newData.location || "Unknown";

        setWeatherData((prevData) => {
          const prevCityData = prevData[city] || {};
          const updatedCityData = {
            temp: newData.temp,
            feels_like: newData.feels_like,
            pressure: newData.pressure,
            humidity: newData.humidity,
            wind_speed: newData.wind_speed,
            wind_deg: newData.wind_deg,
            wind_gust: newData.wind_gust,
            clouds: newData.clouds,
            description: newData.description,
            timestamp: newData.timestamp,
          };

          if (
            JSON.stringify(prevCityData) !== JSON.stringify(updatedCityData)
          ) {
            return {
              ...prevData,
              [city]: updatedCityData,
            };
          }
          return prevData;
        });
      } catch (err) {
        console.error("❌ WebSocket Error:", err);
        setError("Error parsing incoming data");
      }
    };

    socket.onerror = (err) => {
      console.error("⚠️ WebSocket Error:", err);
      setError("Failed to connect to the WebSocket stream");
    };

    socket.onclose = (event) => {
      console.warn(
        `🔌 WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}`
      );
      if (event.code !== 1000) {
        setError(`WebSocket closed unexpectedly: ${event.reason || "Unknown"}`);
      }
    };

    return () => {
      console.log("🧹 Cleaning up WebSocket connection...");
      socket.close();
    };
  }, [url]);

  return { weatherData, error };
};

export default useWeatherWebSocket;
